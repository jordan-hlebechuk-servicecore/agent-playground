import { streamText } from "ai";
import * as readline from "node:readline/promises";
import { calculatorTools } from "./calculatorTools";
import { anthropic } from "@ai-sdk/anthropic";

export async function runCalculatorAgent() {
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const userPrompt = await terminal.question("Prompt to agent: ");

  console.log("Assistant: ");

  try {
    const result = streamText({
      model: anthropic("claude-haiku-4-5"),
      prompt: userPrompt,
      tools: calculatorTools,
    });

    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }

    console.log("\n");
  } catch (error) {
    console.error("Error:", error);
  }
}
