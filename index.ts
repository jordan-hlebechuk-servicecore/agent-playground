import * as readline from "node:readline/promises";
import { streamText, stepCountIs } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { codingTools, fileTools } from "./tools";
import { calculatorTools } from "./agents/calculatorAgent/calculatorTools";
import type { ToolSet } from "ai";
import { loggingFetch } from "./utils";

interface CreateTextStreamProps {
  tools: ToolSet;
  system: string;
}

interface RunAgentProps {
  agent: AgentName;
  debug?: boolean;
}

type AgentName = "coding" | "calculator";

async function runAgent({ agent, debug = false }: RunAgentProps) {
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const userPrompt = await terminal.question("Prompt to agent: ");

  const anthropicProvider = createAnthropic({
    fetch: loggingFetch as typeof globalThis.fetch,
  });

  const createTextStream = ({ tools, system }: CreateTextStreamProps) => {
    return streamText({
      model: anthropicProvider("claude-haiku-4-5"),
      prompt: userPrompt,
      tools: tools,
      system: system,
      stopWhen: stepCountIs(10),
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
          "You are a coding agent. You are responsible for coding the project including writing, deleting, moving and refactoring files and code as requested by the user.",
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
          process.stdout.write(chunk.text);
          break;
        case "tool-call":
          console.log(`\n🔧 Calling: ${chunk.toolName}`, chunk.input);
          break;
        case "tool-result":
          console.log(`✅ Result:`, chunk.output);
          break;
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    console.log("\n🏁 Agent finished");
    process.exit(0);
  }
}

runAgent({ agent: "calculator", debug: true });
