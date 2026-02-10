import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material";
import { AGENT_OPTIONS } from "../types";
import type { AgentType } from "../types";
import { SelectorWrapper } from "./AgentSelector.styles";

interface AgentSelectorProps {
  value: AgentType;
  onChange: (agent: AgentType) => void;
  disabled?: boolean;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const handleChange = (event: SelectChangeEvent<AgentType>) => {
    onChange(event.target.value as AgentType);
  };

  return (
    <SelectorWrapper>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="agent-select-label">Select Agent</InputLabel>
        <Select
          labelId="agent-select-label"
          id="agent-select"
          value={value}
          label="Select Agent"
          onChange={handleChange}
        >
          {AGENT_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </SelectorWrapper>
  );
};
