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

export const AgentRunner: React.FC = () => {
  const [searchParams] = useSearchParams();
  const ticketKey = searchParams.get("ticket");

  const [userInput, setUserInput] = useState("");
  const [agentType, setAgentType] = useState<AgentType>(
    ticketKey ? "ticket" : "coding"
  );
  const [selectedRepos, setSelectedRepos] = useState<RepoOption[]>([]);
  const [ticket, setTicket] = useState<JiraTicket | null>(null);
  const { isLoading, output, runAgent, stopAgent } = useAgentRunner();

  useEffect(() => {
    if (!ticketKey) return;

    const fetchTicket = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/jira/tickets/${ticketKey}`
        );
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
    runAgent(agentType, userInput, {
      ticketKey: ticketKey ?? undefined,
      repoSlugs: selectedRepos.map((r) => r.name),
    });
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
