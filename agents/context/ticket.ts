import type { TicketInfo } from "./types";

function renderDescription(description: unknown): string {
  if (!description) return "";
  if (typeof description === "string") return description;

  try {
    const doc = description as {
      content?: Array<{
        type: string;
        content?: Array<{ type: string; text?: string }>;
      }>;
    };

    if (doc.content) {
      return doc.content
        .map((block) => {
          if (block.content) {
            return block.content.map((inline) => inline.text || "").join("");
          }
          return "";
        })
        .filter(Boolean)
        .join("\n\n");
    }
  } catch {
    // fall through
  }

  return JSON.stringify(description, null, 2);
}

export async function fetchTicketInfo(
  ticketKey: string
): Promise<TicketInfo | null> {
  const jiraBaseUrl = process.env.JIRA_BASE_URL?.replace(/['"]/g, "").replace(
    /\/+$/,
    ""
  );
  const atlassianEmail = process.env.ATLASSIAN_USER_EMAIL?.replace(/['"]/g, "");
  const atlassianToken = process.env.ATLASSIAN_API_TOKEN?.replace(/['"]/g, "");

  if (!jiraBaseUrl || !atlassianEmail || !atlassianToken) {
    return null;
  }

  try {
    const authToken = Buffer.from(
      `${atlassianEmail}:${atlassianToken}`,
      "utf8"
    ).toString("base64");
    const fields =
      "summary,description,status,issuetype,priority,assignee,created,updated";
    const url = `${jiraBaseUrl}/rest/api/3/issue/${ticketKey}?fields=${fields}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${authToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) return null;

    const issue = (await response.json()) as {
      key: string;
      fields: {
        summary: string;
        description: unknown;
        status: { name: string };
        issuetype: { name: string };
        priority: { name: string };
        assignee: { displayName: string } | null;
        created: string;
        updated: string;
      };
    };

    return {
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status?.name ?? "",
      priority: issue.fields.priority?.name ?? "",
      type: issue.fields.issuetype?.name ?? "",
      description: renderDescription(issue.fields.description),
      url: `${jiraBaseUrl}/browse/${issue.key}`,
    };
  } catch {
    return null;
  }
}

export function formatTicketContext(ticket: TicketInfo, repoSlugs?: string[]): string {
  const repoLine =
    repoSlugs && repoSlugs.length > 0
      ? `\nTarget Repositories: ${repoSlugs.join(", ")}`
      : "";

  return [
    `# Ticket Context: ${ticket.key}`,
    "",
    `Summary: ${ticket.summary}`,
    `Type: ${ticket.type}`,
    `Priority: ${ticket.priority}`,
    `Status: ${ticket.status}`,
    `URL: ${ticket.url}`,
    repoLine,
    "",
    "Description:",
    ticket.description,
  ]
    .join("\n")
    .trim();
}
