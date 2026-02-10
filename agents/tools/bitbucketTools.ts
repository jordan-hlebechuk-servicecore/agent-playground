import { tool } from "ai";
import { z } from "zod";

const BITBUCKET_BASE_URL = process.env.BITBUCKET_BASE_URL || "https://api.bitbucket.org/2.0";
const BITBUCKET_USERNAME = process.env.BITBUCKET_USERNAME || "";
const BITBUCKET_APP_PASSWORD = process.env.BITBUCKET_APP_PASSWORD || "";
const BITBUCKET_WORKSPACE = process.env.BITBUCKET_WORKSPACE || "";

function bitbucketHeaders() {
  return {
    Authorization: `Basic ${btoa(`${BITBUCKET_USERNAME}:${BITBUCKET_APP_PASSWORD}`)}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export const bitbucketTools = {
  createPullRequest: tool<
    { repoSlug: string; title: string; description: string; sourceBranch: string; destinationBranch?: string },
    string
  >({
    description: "Create a pull request on Bitbucket for a repository.",
    inputSchema: z.object({
      repoSlug: z.string().describe("Repository slug (name)"),
      title: z.string().describe("PR title"),
      description: z.string().describe("PR description"),
      sourceBranch: z.string().describe("Source branch name"),
      destinationBranch: z.string().optional().default("main").describe("Destination branch (defaults to main)"),
    }),
    execute: async ({
      repoSlug,
      title,
      description,
      sourceBranch,
      destinationBranch = "main",
    }: {
      repoSlug: string;
      title: string;
      description: string;
      sourceBranch: string;
      destinationBranch?: string;
    }) => {
      try {
        const response = await fetch(
          `${BITBUCKET_BASE_URL}/repositories/${BITBUCKET_WORKSPACE}/${repoSlug}/pullrequests`,
          {
            method: "POST",
            headers: bitbucketHeaders(),
            body: JSON.stringify({
              title,
              description,
              source: { branch: { name: sourceBranch } },
              destination: { branch: { name: destinationBranch } },
              close_source_branch: true,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          return `Failed to create PR: ${response.status} - ${errorText}`;
        }

        const data = await response.json() as {
          id: number;
          links?: { html?: { href?: string } };
        };

        return `Pull request #${data.id} created: ${data.links?.html?.href || "URL not available"}`;
      } catch (error) {
        return `Error creating PR: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  }),

  listRepos: tool<{ query?: string }, string>({
    description: "List repositories in the Bitbucket workspace. Optionally filter by name.",
    inputSchema: z.object({
      query: z.string().optional().describe("Filter repos by name (partial match)"),
    }),
    execute: async ({ query }: { query?: string }) => {
      try {
        let url = `${BITBUCKET_BASE_URL}/repositories/${BITBUCKET_WORKSPACE}?pagelen=50`;
        if (query) {
          url += `&q=name~"${query}"`;
        }

        const response = await fetch(url, { headers: bitbucketHeaders() });

        if (!response.ok) {
          return `Failed to list repos: ${response.status} ${response.statusText}`;
        }

        const data = await response.json() as {
          values: Array<{
            slug: string;
            name: string;
            links?: { clone?: Array<{ href: string; name: string }> };
          }>;
        };

        const repos = data.values.map((repo) => {
          const cloneUrl = repo.links?.clone?.find((l) => l.name === "https")?.href || "";
          return `${repo.name} (${repo.slug}) - ${cloneUrl}`;
        });

        return repos.length > 0 ? repos.join("\n") : "No repositories found";
      } catch (error) {
        return `Error listing repos: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  }),

  readRemoteFile: tool<{ repoSlug: string; filePath: string; branch?: string }, string>({
    description: "Read a file from a Bitbucket repository without cloning it.",
    inputSchema: z.object({
      repoSlug: z.string().describe("Repository slug"),
      filePath: z.string().describe("Path to the file in the repository"),
      branch: z.string().optional().default("main").describe("Branch to read from"),
    }),
    execute: async ({ repoSlug, filePath, branch = "main" }: { repoSlug: string; filePath: string; branch?: string }) => {
      try {
        const response = await fetch(
          `${BITBUCKET_BASE_URL}/repositories/${BITBUCKET_WORKSPACE}/${repoSlug}/src/${branch}/${filePath}`,
          { headers: bitbucketHeaders() }
        );

        if (!response.ok) {
          return `Failed to read file: ${response.status} ${response.statusText}`;
        }

        const content = await response.text();
        return content.slice(0, 50000);
      } catch (error) {
        return `Error reading file: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  }),
};
