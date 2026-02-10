import React from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { StyledSubmitButtonContainer } from "./SubmitButton.styles";

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
    <StyledSubmitButtonContainer>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={disabled || isLoading}
        onClick={onClick}
      >
        <Box className="ButtonContent">
          {isLoading ? (
            <>
              <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
              Running Agent...
            </>
          ) : (
            "Run Agent"
          )}
        </Box>
      </Button>
    </StyledSubmitButtonContainer>
  );
};
