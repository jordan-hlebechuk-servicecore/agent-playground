import React from "react";
import { TextField } from "@mui/material";
import { StyledPromptInputContainer } from "./PromptInput.styles";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Enter your prompt here...",
  rows = 4,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <StyledPromptInputContainer>
      <TextField
        id="prompt-input"
        label="Prompt"
        multiline
        rows={rows}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        fullWidth
        variant="outlined"
        sx={{
          "& .MuiOutlinedInput-root": {
            fontFamily: "inherit",
            fontSize: "14px",
          },
        }}
      />
    </StyledPromptInputContainer>
  );
};
