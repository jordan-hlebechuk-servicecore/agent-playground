import path from "path";
import type { BuildContextInput, LoadedContext } from "./types";
import { getAgentConfig, getRepoContextFiles } from "./registry";
import { fetchTicketInfo, formatTicketContext } from "./ticket";

const CONTEXT_DIR = path.join(import.meta.dir, "../context_files");
const REPO_CONTEXT_DIR = path.join(CONTEXT_DIR, "repo_specific");

async function loadFile(filePath: string): Promise<string | null> {
  try {
    const content = await Bun.file(filePath).text();
    return content.trim() || null;
  } catch {
    return null;
  }
}

async function loadFilesFromDir(
  dir: string,
  fileNames: string[]
): Promise<{ loaded: { name: string; content: string }[]; errors: string[] }> {
  const loaded: { name: string; content: string }[] = [];
  const errors: string[] = [];

  for (const fileName of fileNames) {
    const filePath = path.join(dir, fileName);
    const content = await loadFile(filePath);

    if (content) {
      loaded.push({ name: fileName, content });
    } else {
      errors.push(`Failed to load: ${fileName}`);
    }
  }

  return { loaded, errors };
}

function formatSection(heading: string, files: { name: string; content: string }[]): string {
  if (files.length === 0) return "";

  const sections = files.map(
    ({ name, content }) => `## ${name}\n\n${content}`
  );

  return `\n\n# ${heading}\n\n${sections.join("\n\n---\n\n")}`;
}

export async function buildSystemPrompt(
  input: BuildContextInput
): Promise<LoadedContext> {
  const { agent, repoSlugs, ticketKey, projectPath } = input;
  const config = getAgentConfig(agent);
  const allLoaded: string[] = [];
  const allErrors: string[] = [];
  let prompt = config.baseSystemPrompt;

  const agentFiles = await loadFilesFromDir(CONTEXT_DIR, config.contextFiles);
  allLoaded.push(...agentFiles.loaded.map((f) => f.name));
  allErrors.push(...agentFiles.errors);
  prompt += formatSection("Project Context", agentFiles.loaded);

  if (projectPath) {
    const projectFiles = await loadFilesFromDir(projectPath, config.contextFiles);
    allLoaded.push(...projectFiles.loaded.map((f) => `${projectPath}/${f.name}`));
    allErrors.push(...projectFiles.errors);
    prompt += formatSection("Project-Specific Context", projectFiles.loaded);
  }

  if (repoSlugs && repoSlugs.length > 0) {
    const repoFileNames = getRepoContextFiles(repoSlugs);
    if (repoFileNames.length > 0) {
      const repoFiles = await loadFilesFromDir(REPO_CONTEXT_DIR, repoFileNames);
      allLoaded.push(...repoFiles.loaded.map((f) => `repo_specific/${f.name}`));
      allErrors.push(...repoFiles.errors);
      prompt += formatSection("Repository Context", repoFiles.loaded);
    }
  }

  if (ticketKey) {
    const ticket = await fetchTicketInfo(ticketKey);
    if (ticket) {
      prompt += "\n\n" + formatTicketContext(ticket, repoSlugs);
      allLoaded.push(`ticket:${ticketKey}`);
    } else {
      allErrors.push(`Failed to fetch ticket: ${ticketKey}`);
    }
  }

  return {
    systemPrompt: prompt,
    loadedFiles: allLoaded,
    errors: allErrors,
  };
}
