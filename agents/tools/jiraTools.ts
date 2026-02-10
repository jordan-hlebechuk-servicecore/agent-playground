import { tool } from "ai";
import { z } from "zod";

const JIRA_BASE_URL = process.env.JIRA_BASE_URL || "";
const JIRA_USER_EMAIL = process.env.JIRA_USER_EMAIL || "";
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || "";

function jiraHeaders() {
  return {
    Authorization: `Basic ${btoa(`${JIRA_USER_EMAIL}:${JIRA_API_TOKEN}`)}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export const jiraTools = {
  getJiraTicket: tool<{ ticketKey: string }, string>({
    description: "Fetch a JIRA ticket by its key (e.g., PROJ-123). Returns the ticket summary, description, status, type, and assignee.",
    inputSchema: z.object({
      ticketKey: z.string().describe("The JIRA ticket key (e.g., PROJ-123)"),
    }),
    execute: async ({ ticketKey }: { ticketKey: string }) => {
      try {
        const response = await fetch(
          `${JIRA_BASE_URL}/rest/api/3/issue/${ticketKey}`,
          { headers: jiraHeaders() }
        );

        if (!response.ok) {
          return `Failed to fetch ticket: ${response.status} ${response.statusText}`;
        }

        const data = await response.json() as {
          key: string;
          fields: {
            summary?: string;
            description?: unknown;
            status?: { name?: string };
            issuetype?: { name?: string };
            assignee?: { displayName?: string };
            priority?: { name?: string };
          };
        };

        return JSON.stringify({
          key: data.key,
          summary: data.fields.summary,
          description: data.fields.description,
          status: data.fields.status?.name,
          type: data.fields.issuetype?.name,
          assignee: data.fields.assignee?.displayName,
          priority: data.fields.priority?.name,
        }, null, 2);
      } catch (error) {
        return `Error fetching ticket: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  }),

  addJiraComment: tool<{ ticketKey: string; comment: string }, string>({
    description: "Add a comment to a JIRA ticket.",
    inputSchema: z.object({
      ticketKey: z.string().describe("The JIRA ticket key"),
      comment: z.string().describe("Comment text to add"),
    }),
    execute: async ({ ticketKey, comment }: { ticketKey: string; comment: string }) => {
      try {
        const response = await fetch(
          `${JIRA_BASE_URL}/rest/api/3/issue/${ticketKey}/comment`,
          {
            method: "POST",
            headers: jiraHeaders(),
            body: JSON.stringify({
              body: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: comment }],
                  },
                ],
              },
            }),
          }
        );

        if (!response.ok) {
          return `Failed to add comment: ${response.status} ${response.statusText}`;
        }

        return `Comment added to ${ticketKey}`;
      } catch (error) {
        return `Error adding comment: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  }),

  transitionJiraTicket: tool<{ ticketKey: string; transitionName: string }, string>({
    description: "Transition a JIRA ticket to a new status (e.g., 'In Progress', 'Done').",
    inputSchema: z.object({
      ticketKey: z.string().describe("The JIRA ticket key"),
      transitionName: z.string().describe("Target status name (e.g., 'In Progress')"),
    }),
    execute: async ({ ticketKey, transitionName }: { ticketKey: string; transitionName: string }) => {
      try {
        const transitionsRes = await fetch(
          `${JIRA_BASE_URL}/rest/api/3/issue/${ticketKey}/transitions`,
          { headers: jiraHeaders() }
        );

        if (!transitionsRes.ok) {
          return `Failed to fetch transitions: ${transitionsRes.status}`;
        }

        const transitionsData = await transitionsRes.json() as {
          transitions: Array<{ id: string; name: string }>;
        };

        const transition = transitionsData.transitions.find(
          (t) => t.name.toLowerCase() === transitionName.toLowerCase()
        );

        if (!transition) {
          const available = transitionsData.transitions.map((t) => t.name).join(", ");
          return `Transition "${transitionName}" not found. Available: ${available}`;
        }

        const response = await fetch(
          `${JIRA_BASE_URL}/rest/api/3/issue/${ticketKey}/transitions`,
          {
            method: "POST",
            headers: jiraHeaders(),
            body: JSON.stringify({ transition: { id: transition.id } }),
          }
        );

        if (!response.ok) {
          return `Failed to transition: ${response.status} ${response.statusText}`;
        }

        return `Transitioned ${ticketKey} to "${transitionName}"`;
      } catch (error) {
        return `Error transitioning ticket: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  }),
};
