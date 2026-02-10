import type { Request, Response } from "express";

export const getTicketByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

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

    const authToken = Buffer.from(`${atlassianEmail}:${atlassianToken}`, "utf8").toString(
      "base64"
    );
    const fields =
      "summary,description,status,issuetype,priority,assignee,created,updated";
    const url = `${jiraBaseUrl}/rest/api/3/issue/${key}?fields=${fields}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${authToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      res
        .status(response.status)
        .json({ error: `JIRA API error: ${errorText}` });
      return;
    }

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

    res.json({
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
    });
  } catch (error) {
    console.error("Error fetching JIRA ticket:", error);
    res.status(500).json({ error: "Failed to fetch JIRA ticket" });
  }
};
