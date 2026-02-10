import * as readline from "node:readline/promises";
import { streamText, stepCountIs } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { codingTools, fileTools, calculatorTools } from "./tools";
import type { ToolSet } from "ai";
import { loggingFetch } from "./utils";

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
  debug?: boolean;
  onChunk?: (chunk: AgentStreamChunk) => void;
}

type AgentName = "coding" | "calculator";

export async function runAgent({
  agent,
  userInput,
  debug = false,
  onChunk,
}: RunAgentProps): Promise<void> {
  const userPrompt = userInput;

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
        tools: { ...codingTools, ...fileTools },
        system:
          "You are a coding agent. You are responsible for coding the project including writing, deleting, moving and refactoring files and code as requested by the user. Make use of available tools to help you with your tasks.",
      });
      break;
    case "calculator":
      textStream = createTextStream({
        tools: calculatorTools,
        system:
          "You are a calculator agent. You are responsible for solving equations provided by the user. You need to pick up on the user's intent for the given equation and recognize mathematical operations and symbols, whether written as text or symbols.",
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
