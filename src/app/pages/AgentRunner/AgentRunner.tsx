import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { AgentSelector } from "./components/AgentSelector";
import { PromptInput } from "./components/PromptInput";
import { SubmitButton } from "../../components/SubmitButton";
import { StopButton } from "../../components/StopButton";
import { OutputSection } from "./components/OutputSection";
import { RepoSelector } from "./components/RepoSelector";
import { useAgentRunner } from "./useAgentRunner";
import type { AgentType, JiraTicket, RepoOption } from "../../types";
import { StyledAgentRunnerContainer } from "./AgentRunner.styles";

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

export const AgentRunner: React.FC = () => {
  const [searchParams] = useSearchParams();
  const ticketKey = searchParams.get("ticket");

  const [userInput, setUserInput] = useState("");
  const [agentType, setAgentType] = useState<AgentType>(ticketKey ? "ticket" : "coding");
  const [selectedRepos, setSelectedRepos] = useState<RepoOption[]>([]);
  const [ticket, setTicket] = useState<JiraTicket | null>(null);
  const { isLoading, output, runAgent, stopAgent } = useAgentRunner();

  useEffect(() => {
    if (!ticketKey) return;

    const fetchTicket = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/jira/tickets/${ticketKey}`);
        if (response.ok) {
          const data = (await response.json()) as JiraTicket;
          setTicket(data);
          setAgentType("ticket");
        }
      } catch (err) {
        console.error("Failed to fetch ticket:", err);
      }
    };

    fetchTicket();
  }, [ticketKey]);

  const handleSubmit = () => {
    let systemContext: string | undefined;

    if (ticket) {
      const repoInfo =
        selectedRepos.length > 0
          ? `\n\nTarget repositories:\n${selectedRepos.map((r) => `- ${r.name} (${r.cloneUrl})`).join("\n")}`
          : "";

      systemContext = `# JIRA Ticket: ${ticket.key}\n\n**Summary:** ${ticket.summary}\n**Status:** ${ticket.status}\n**Priority:** ${ticket.priority}\n**Type:** ${ticket.type}\n\n**Description:**\n${renderDescription(ticket.description)}${repoInfo}`;
    }

    runAgent(agentType, userInput, systemContext);
  };

  return (
    <StyledAgentRunnerContainer>
      <Box className="PageHeader">
        <Typography className="PageTitle">
          {ticket ? `${ticket.type}: ${ticket.key}` : "Agent Runner"}
        </Typography>
        <Typography className="PageSubtitle">
          {ticket ? ticket.summary : "Select an agent type and send prompts"}
        </Typography>
      </Box>

      {ticket && (
        <Box className="TicketBanner">
          <Typography className="TicketKey">{ticket.key}</Typography>
          <Typography className="TicketSummary">{ticket.summary}</Typography>
        </Box>
      )}

      <Box className="ContentArea">
        <Box
          component="form"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="InputForm"
        >
          {!ticket && (
            <div style={{ marginBottom: "16px" }}>
              <AgentSelector
                value={agentType}
                onChange={setAgentType}
                disabled={isLoading}
              />
            </div>
          )}
          {ticket && (
            <RepoSelector
              selectedRepos={selectedRepos}
              onChange={setSelectedRepos}
              disabled={isLoading}
            />
          )}
          <PromptInput
            value={userInput}
            onChange={setUserInput}
            disabled={isLoading}
          />
          <Box className="ActionButtons">
            <SubmitButton
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!userInput.trim()}
            />
            {isLoading && <StopButton onClick={stopAgent} disabled={false} />}
          </Box>
        </Box>
        <OutputSection output={output} isLoading={isLoading} />
      </Box>
    </StyledAgentRunnerContainer>
  );
};
