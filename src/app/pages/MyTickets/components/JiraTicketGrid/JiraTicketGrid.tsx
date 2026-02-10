import React from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import type { JiraTicket } from "../../../../types";
import type { TicketGroup } from "../../useTicketFilters";
import { JiraTicketCard } from "../JiraTicketCard";
import { StyledTicketGridContainer } from "./JiraTicketGrid.styles";

interface JiraTicketGridProps {
  groups: TicketGroup[];
  isLoading: boolean;
  error: string | null;
  filteredCount: number;
  totalCount: number;
  onAction: (ticket: JiraTicket) => void;
  onRefresh: () => void;
}

function getTypeClass(type: string): string {
  const lower = type.toLowerCase();
  if (lower === "bug") return "bug";
  if (lower === "task" || lower === "sub-task") return "task";
  if (lower === "story") return "story";
  return "default";
}

export const JiraTicketGrid: React.FC<JiraTicketGridProps> = ({
  groups,
  isLoading,
  error,
  filteredCount,
  totalCount,
  onAction,
  onRefresh,
}) => {
  return (
    <StyledTicketGridContainer>
      <Box className="GridHeader">
        <Box className="GridHeaderLeft">
          <Typography className="GridTitle">JIRA Tickets</Typography>
          {!isLoading && totalCount > 0 && (
            <Typography className="TicketCount">
              {filteredCount} of {totalCount}
            </Typography>
          )}
        </Box>
        <Button
          className="RefreshButton"
          onClick={onRefresh}
          disabled={isLoading}
          startIcon={<Refresh />}
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {isLoading && (
        <Box className="LoadingContainer">
          <CircularProgress size={32} />
        </Box>
      )}

      {error && !isLoading && (
        <Box className="ErrorContainer">
          <Typography>{error}</Typography>
          <Button onClick={onRefresh} sx={{ mt: 2 }}>
            Retry
          </Button>
        </Box>
      )}

      {!isLoading && !error && filteredCount === 0 && (
        <Typography className="EmptyState">
          No JIRA tickets match the current filters
        </Typography>
      )}

      {!isLoading && !error && groups.length > 0 && (
        <Box className="GroupedContent">
          {groups.map((group) => (
            <Box key={group.type} className="TypeGroup">
              <Box className="TypeGroupHeader">
                <Typography
                  className={`TypeBadge ${getTypeClass(group.type)}`}
                >
                  {group.type}
                </Typography>
                <Typography className="TypeCount">
                  {group.tickets.length}
                </Typography>
              </Box>
              <Box className="TicketGrid">
                {group.tickets.map((ticket) => (
                  <JiraTicketCard
                    key={ticket.key}
                    ticket={ticket}
                    onAction={onAction}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </StyledTicketGridContainer>
  );
};
