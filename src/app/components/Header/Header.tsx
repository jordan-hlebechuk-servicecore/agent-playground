import React from "react";
import { HeaderWrapper, Title, Subtitle } from "./Header.styles";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Agent Interface",
  subtitle = "Send prompts to the agent",
}) => {
  return (
    <HeaderWrapper>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </HeaderWrapper>
  );
};
