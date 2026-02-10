import React from "react";
import { Button, CircularProgress } from "@mui/material";
import { StyledButton, ButtonContent } from "./SubmitButton.styles";

interface SubmitButtonProps {
  disabled?: boolean;
  isLoading?: boolean;
  onClick: () => void;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  disabled = false,
  isLoading = false,
  onClick,
}) => {
  return (
    <StyledButton>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={disabled || isLoading}
        onClick={onClick}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: 600,
          textTransform: "none",
          transition: "all 0.2s ease",
          "&:hover:not(:disabled)": {
            transform: "translateY(-2px)",
            boxShadow: "0 10px 20px rgba(102, 126, 234, 0.3)",
          },
          "&:active:not(:disabled)": {
            transform: "translateY(0)",
          },
          "&:disabled": {
            opacity: 0.6,
          },
        }}
      >
        <ButtonContent isLoading={isLoading}>
          {isLoading ? (
            <>
              <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
              Running Agent...
            </>
          ) : (
            "Run Agent"
          )}
        </ButtonContent>
      </Button>
    </StyledButton>
  );
};
