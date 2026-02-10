import * as readline from "node:readline/promises";

export async function askUserConfirmation(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await rl.question(`${message} (y/n): `);
  rl.close();
  return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
}

export async function readGuideline(
  guidelineType: "COMPONENT" | "API" | "TESTING"
) {
  const content = await Bun.file(
    `./agent_files/${guidelineType}_GUIDELINES.md`
  ).text();
  return content;
}

// Create custom fetch that logs requests
export const loggingFetch = async (
  input: Request | string | URL,
  init?: RequestInit
): Promise<Response> => {
  const url = input instanceof Request ? input.url : input.toString();
  console.log("\n🌐 === API REQUEST ===");
  console.log("URL:", url);
  console.log("Method:", init?.method);
  console.log("Headers:", JSON.stringify(init?.headers, null, 2));

  if (init?.body) {
    console.log("Body:", init.body);
  }

  const response = await fetch(input, init);

  // Clone response to read it without consuming the stream
  const clonedResponse = response.clone();
  const responseData = await clonedResponse.text();

  console.log("\n📨 === API RESPONSE ===");
  console.log("Status:", response.status);
  console.log("Body preview:", responseData.slice(0, 500));

  return response;
};
