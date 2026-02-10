import React from "react";
import { Typography } from "@mui/material";
import {
  StyledStatusFilterContainer,
  StyledStatusChip,
} from "./StatusFilter.styles";

interface StatusFilterProps {
  statuses: string[];
  excludedStatuses: Set<string>;
  onToggle: (status: string) => void;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  statuses,
  excludedStatuses,
  onToggle,
}) => {
  if (statuses.length === 0) return null;

  return (
    <StyledStatusFilterContainer>
      <Typography className="FilterLabel">Status:</Typography>
      {statuses.map((status) => {
        const isExcluded = excludedStatuses.has(status.toLowerCase());
        return (
          <StyledStatusChip
            key={status}
            label={status}
            variant="outlined"
            size="small"
            excluded={isExcluded}
            onClick={() => onToggle(status)}
          />
        );
      })}
    </StyledStatusFilterContainer>
  );
};
