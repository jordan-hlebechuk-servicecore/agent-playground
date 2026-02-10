import type { Request, Response } from "express";
import { filterRepos } from "./utils/filterRepos";

export const getRepos = async (req: Request, res: Response) => {
  try {
    const bitbucketBaseUrl =
      process.env.BITBUCKET_BASE_URL || "https://api.bitbucket.org/2.0";
    const atlassianEmail = process.env.ATLASSIAN_USER_EMAIL;
    const bitbucketToken = process.env.BITBUCKET_TOKEN;
    const bitbucketWorkspace = process.env.BITBUCKET_WORKSPACE;

    if (!atlassianEmail || !bitbucketToken || !bitbucketWorkspace) {
      res.status(500).json({ error: "Bitbucket configuration missing" });
      return;
    }

    const response = await fetch(
      `${bitbucketBaseUrl}/repositories/${bitbucketWorkspace}?pagelen=100`,
      {
        headers: {
          Authorization: `Basic ${btoa(`${atlassianEmail}:${bitbucketToken}`)}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      res
        .status(response.status)
        .json({ error: `Bitbucket API error: ${errorText}` });
      return;
    }

    const data = (await response.json()) as {
      values: Array<{
        slug: string;
        name: string;
        links?: { clone?: Array<{ href: string; name: string }> };
      }>;
    };

    const repos = data.values.map((repo) => ({
      slug: repo.slug,
      name: repo.name,
      cloneUrl: repo.links?.clone?.find((l) => l.name === "https")?.href || "",
    }));

    res.json({ repos: filterRepos(repos) });
  } catch (error) {
    console.error("Error fetching repos:", error);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
};
