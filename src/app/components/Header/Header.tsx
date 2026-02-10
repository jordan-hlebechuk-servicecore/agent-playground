import React from "react";
import { Typography } from "@mui/material";
import { StyledHeaderContainer } from "./Header.styles";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Agent Interface",
  subtitle = "Send prompts to the agent",
}) => {
  return (
    <StyledHeaderContainer>
      <Typography variant="h1" className="Title">
        {title}
      </Typography>
      <Typography variant="body2" className="Subtitle">
        {subtitle}
      </Typography>
    </StyledHeaderContainer>
  );
};
