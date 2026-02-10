import type { Request, Response } from "express";

export const getTickets = async (req: Request, res: Response) => {
  try {
    const jiraBaseUrl = process.env.JIRA_BASE_URL?.replace(/['"]/g, "").replace(
      /\/+$/,
      ""
    );
    const atlassianEmail = process.env.ATLASSIAN_USER_EMAIL?.replace(/['"]/g, "");
    const atlassianToken = process.env.ATLASSIAN_API_TOKEN?.replace(/['"]/g, "");

    if (!jiraBaseUrl || !atlassianEmail || !atlassianToken) {
      res.status(500).json({ error: "JIRA configuration missing" });
      return;
    }

    const jql =
      (req.query.jql as string) ||
      "assignee = currentUser() ORDER BY updated DESC";
    const maxResults = parseInt((req.query.maxResults as string) || "50", 10);

    const authToken = Buffer.from(`${atlassianEmail}:${atlassianToken}`, "utf8").toString(
      "base64"
    );
    const fields =
      "summary,description,status,issuetype,priority,assignee,created,updated";
    const params = new URLSearchParams({
      jql,
      maxResults: String(maxResults),
      fields,
    });
    const url = `${jiraBaseUrl}/rest/api/3/search/jql?${params.toString()}`;

    console.log("JIRA request URL:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${authToken}`,
        Accept: "application/json",
      },
    });

    console.log("JIRA response:", {
      status: response.status,
      redirected: response.redirected,
      finalUrl: response.url,
    });

    if (!response.ok) {
      const errorText = await response.text();
      res
        .status(response.status)
        .json({ error: `JIRA API error: ${errorText}` });
      return;
    }

    const data = (await response.json()) as {
      issues: Array<{
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
      }>;
      total: number;
    };

    const tickets = data.issues.map((issue) => ({
      key: issue.key,
      summary: issue.fields.summary,
      description: issue.fields.description,
      status: issue.fields.status?.name,
      type: issue.fields.issuetype?.name,
      priority: issue.fields.priority?.name,
      assignee: issue.fields.assignee?.displayName || "Unassigned",
      created: issue.fields.created,
      updated: issue.fields.updated,
      url: `${jiraBaseUrl}/browse/${issue.key}`,
    }));

    res.json({ tickets, total: data.total });
  } catch (error) {
    console.error("Error fetching JIRA tickets:", error);
    res.status(500).json({ error: "Failed to fetch JIRA tickets" });
  }
};
