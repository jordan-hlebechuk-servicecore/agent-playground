import { tool } from "ai";
import { z } from "zod";

export const calculatorTools = {
  add: tool<{ a: number; b: number }, number>({
    description: "Add two numbers together",
    inputSchema: z.object({
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    }),
    execute: async ({ a, b }) => {
      const result = a + b;
      console.log(`\n[Tool: add] ${a} + ${b} = ${result}`);
      return result;
    },
  }),

  subtract: tool<{ a: number; b: number }, number>({
    description: "Subtract the second number from the first",
    inputSchema: z.object({
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    }),
    execute: async ({ a, b }) => {
      const result = a - b;
      console.log(`\n[Tool: subtract] ${a} - ${b} = ${result}`);
      return result;
    },
  }),

  multiply: tool<{ a: number; b: number }, number>({
    description: "Multiply two numbers",
    inputSchema: z.object({
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    }),
    execute: async ({ a, b }) => {
      const result = a * b;
      console.log(`\n[Tool: multiply] ${a} × ${b} = ${result}`);
      return result;
    },
  }),

  divide: tool<{ a: number; b: number }, number>({
    description: "Divide the first number by the second",
    inputSchema: z.object({
      a: z.number().describe("Numerator"),
      b: z.number().describe("Denominator (cannot be zero)"),
    }),
    execute: async ({ a, b }) => {
      if (b === 0) {
        throw new Error("Cannot divide by zero");
      }
      const result = a / b;
      console.log(`\n[Tool: divide] ${a} ÷ ${b} = ${result}`);
      return result;
    },
  }),
};
