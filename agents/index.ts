import { streamText, stepCountIs } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import {
  codingTools,
  fileTools,
  calculatorTools,
  jiraTools,
  gitTools,
  bitbucketTools,
} from "./tools";
import type { ToolSet } from "ai";
import { loggingFetch } from "./utils";
import { buildSystemPrompt } from "./context";
import type { AgentName } from "./context";

interface CreateTextStreamProps {
  tools: ToolSet;
  system: string;
}

interface AgentStreamChunk {
  type: "text-delta" | "tool-call" | "tool-result" | "finish";
  text?: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
}

interface RunAgentProps {
  agent: AgentName;
  userInput: string;
  projectPath?: string;
  systemContext?: string;
  debug?: boolean;
  onChunk?: (chunk: AgentStreamChunk) => void;
}

export type { AgentName };

export async function runAgent({
  agent,
  userInput,
  projectPath,
  systemContext,
  debug = false,
  onChunk,
}: RunAgentProps): Promise<void> {
  const userPrompt = userInput;

  const { systemPrompt, loadedFiles, errors } = await buildSystemPrompt(
    agent,
    projectPath
  );

  if (debug) {
    console.log("Loaded context files:", loadedFiles);
    if (errors.length > 0) {
      console.warn("Context loading errors:", errors);
    }
  }

  let finalSystemPrompt = systemPrompt;
  if (systemContext) {
    finalSystemPrompt += "\n\n# Additional Context\n\n" + systemContext;
  }

  const anthropicProvider = debug
    ? createAnthropic({
        fetch: loggingFetch as typeof globalThis.fetch,
      })
    : createAnthropic();

  const createTextStream = ({ tools, system }: CreateTextStreamProps) => {
    return streamText({
      model: anthropicProvider("claude-haiku-4-5"),
      prompt: userPrompt,
      tools: tools,
      system: system,
      stopWhen: stepCountIs(50),
      onStepFinish: (step) => {
        if (debug) {
          console.log(`Step: ${step.toolCalls.length} tool calls`);
        }
      },
    });
  };

  let textStream = undefined;

  switch (agent) {
    case "coding":
      textStream = createTextStream({
        tools: {
          ...codingTools,
          ...fileTools,
          ...bitbucketTools,
          ...jiraTools,
        },
        system: finalSystemPrompt,
      });
      break;
    case "coding_practice_agent":
      textStream = createTextStream({
        tools: {
          ...codingTools,
          ...fileTools,
        },
        system: finalSystemPrompt,
      });
      break;
    case "calculator":
      textStream = createTextStream({
        tools: calculatorTools,
        system: finalSystemPrompt,
      });
      break;
    case "bugfix":
      textStream = createTextStream({
        tools: { ...fileTools, ...gitTools, ...jiraTools, ...bitbucketTools },
        system: finalSystemPrompt,
      });
      break;
  }

  try {
    for await (const chunk of textStream!.fullStream) {
      switch (chunk.type) {
        case "text-delta":
          if (onChunk) {
            onChunk({ type: "text-delta", text: chunk.text });
          } else {
            process.stdout.write(chunk.text);
          }
          break;
        case "tool-call":
          if (onChunk) {
            onChunk({
              type: "tool-call",
              toolName: chunk.toolName,
              input: chunk.input,
            });
          } else {
            console.log(`\n🔧 Calling: ${chunk.toolName}`, chunk.input);
          }
          break;
        case "tool-result":
          if (onChunk) {
            onChunk({ type: "tool-result", output: chunk.output });
          } else {
            console.log(`✅ Result:`, chunk.output);
          }
          break;
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    if (onChunk) {
      onChunk({ type: "finish" });
    } else {
      console.log("\n🏁 Agent finished");
      process.exit(0);
    }
  }
}
