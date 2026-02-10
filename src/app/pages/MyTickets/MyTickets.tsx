import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import type { JiraTicket } from "../../types";
import { StatusFilter } from "./components/StatusFilter";
import { JiraTicketGrid } from "./components/JiraTicketGrid";
import { useJiraTickets } from "./components/JiraTicketGrid/useJiraTickets";
import { useTicketFilters } from "./useTicketFilters";
import { StyledMyTicketsContainer } from "./MyTickets.styles";

export const MyTickets: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, isLoading, error, refetch } = useJiraTickets();
  const {
    availableStatuses,
    excludedStatuses,
    toggleStatus,
    groups,
    filteredCount,
    totalCount,
  } = useTicketFilters(tickets);

  const handleAction = (ticket: JiraTicket) => {
    navigate(`/agent?ticket=${ticket.key}`);
  };

  return (
    <StyledMyTicketsContainer>
      <Box className="PageHeader">
        <Box className="PageHeaderTop">
          <Box>
            <Typography className="PageTitle">My Tickets</Typography>
            <Typography className="PageSubtitle">
              View and manage your JIRA tickets
            </Typography>
          </Box>
        </Box>
        {!isLoading && tickets.length > 0 && (
          <Box className="FilterBar">
            <StatusFilter
              statuses={availableStatuses}
              excludedStatuses={excludedStatuses}
              onToggle={toggleStatus}
            />
          </Box>
        )}
      </Box>
      <Box className="GridArea">
        <JiraTicketGrid
          groups={groups}
          isLoading={isLoading}
          error={error}
          filteredCount={filteredCount}
          totalCount={totalCount}
          onAction={handleAction}
          onRefresh={refetch}
        />
      </Box>
    </StyledMyTicketsContainer>
  );
};
