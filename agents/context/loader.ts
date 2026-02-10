import fs from "fs";
import path from "path";
import type { AgentName, LoadedContext } from "./types";
import { getAgentConfig } from "./registry";

const CONTEXT_DIR = path.join(import.meta.dir, "../context_files");

async function loadFile(filePath: string): Promise<string | null> {
  try {
    const content = await Bun.file(filePath).text();
    return content.trim() || null;
  } catch {
    return null;
  }
}

async function loadContextFiles(
  fileNames: string[]
): Promise<{ loaded: { name: string; content: string }[]; errors: string[] }> {
  const loaded: { name: string; content: string }[] = [];
  const errors: string[] = [];

  for (const fileName of fileNames) {
    const filePath = path.join(CONTEXT_DIR, fileName);
    const content = await loadFile(filePath);

    if (content) {
      loaded.push({ name: fileName, content });
    }
  }

  return { loaded, errors };
}

async function loadProjectContextFiles(
  projectPath: string,
  fileNames: string[]
): Promise<{ loaded: { name: string; content: string }[]; errors: string[] }> {
  const loaded: { name: string; content: string }[] = [];
  const errors: string[] = [];

  for (const fileName of fileNames) {
    const filePath = path.join(projectPath, fileName);
    const content = await loadFile(filePath);

    if (content) {
      loaded.push({ name: fileName, content });
    }
  }

  return { loaded, errors };
}

function formatContextSection(
  files: { name: string; content: string }[]
): string {
  if (files.length === 0) return "";

  const sections = files.map(
    ({ name, content }) =>
      `## ${name}\n\n${content}`
  );

  return "\n\n# Project Context\n\n" + sections.join("\n\n---\n\n");
}

export async function buildSystemPrompt(
  agent: AgentName,
  projectPath?: string
): Promise<LoadedContext> {
  const config = getAgentConfig(agent);
  const allLoaded: { name: string; content: string }[] = [];
  const allErrors: string[] = [];

  const bundled = await loadContextFiles(config.contextFiles);
  allLoaded.push(...bundled.loaded);
  allErrors.push(...bundled.errors);

  if (projectPath) {
    const project = await loadProjectContextFiles(
      projectPath,
      config.contextFiles
    );
    allLoaded.push(...project.loaded);
    allErrors.push(...project.errors);
  }

  const contextSection = formatContextSection(allLoaded);

  return {
    systemPrompt: config.baseSystemPrompt + contextSection,
    loadedFiles: allLoaded.map((f) => f.name),
    errors: allErrors,
  };
}
