import React, { useState } from "react";
import { Box, Typography, Button, Collapse } from "@mui/material";
import {
  ArrowForward,
  ExpandMore,
  ExpandLess,
  OpenInNew,
} from "@mui/icons-material";
import type { JiraTicket } from "../../../../types";
import { StyledTicketCard } from "./JiraTicketCard.styles";

interface JiraTicketCardProps {
  ticket: JiraTicket;
  onAction: (ticket: JiraTicket) => void;
}

function renderDescription(description: unknown): string {
  if (!description) return "No description available.";
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

function getTypeClass(type: string): string {
  const lower = type.toLowerCase();
  if (lower === "bug") return "bug";
  if (lower === "task" || lower === "sub-task") return "task";
  if (lower === "story") return "story";
  return "default";
}

export const JiraTicketCard: React.FC<JiraTicketCardProps> = ({
  ticket,
  onAction,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isBug = ticket.type?.toLowerCase() === "bug";

  return (
    <StyledTicketCard onClick={() => setExpanded(!expanded)}>
      <Box className="CardHeader">
        <Box className="CardTopRow">
          <Typography className="TicketKey">{ticket.key}</Typography>
          <Typography className={`TicketType ${getTypeClass(ticket.type)}`}>
            {ticket.type}
          </Typography>
        </Box>
        <Typography className="Summary">{ticket.summary}</Typography>
        <Box className="MetaRow">
          <Typography className="Status">{ticket.status}</Typography>
          <Typography className="Priority">{ticket.priority}</Typography>
          {expanded ? (
            <ExpandLess fontSize="small" />
          ) : (
            <ExpandMore fontSize="small" />
          )}
        </Box>
      </Box>
      <Collapse in={expanded}>
        <Box className="ExpandedContent" onClick={(e) => e.stopPropagation()}>
          <Typography className="DescriptionLabel">Description</Typography>
          <Typography className="Description">
            {renderDescription(ticket.description)}
          </Typography>
          <Box className="ActionRow">
            <Button
              className="ViewInJira"
              onClick={(e) => {
                e.stopPropagation();
                console.log("ticket.url: ", ticket.url);
                window.open(ticket.url, "_blank", "noopener");
              }}
              startIcon={<OpenInNew />}
            >
              View in JIRA
            </Button>
            {isBug && (
              <Button
                className="HandleBugfix"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(ticket);
                }}
                endIcon={<ArrowForward />}
              >
                Handle Bugfix
              </Button>
            )}
          </Box>
        </Box>
      </Collapse>
    </StyledTicketCard>
  );
};
