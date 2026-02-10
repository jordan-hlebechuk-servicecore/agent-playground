import React, { useState } from "react";
import { Box } from "@mui/material";
import { Header } from "./components/Header";
import { AgentSelector } from "./components/AgentSelector";
import { PromptInput } from "./components/PromptInput";
import { SubmitButton } from "./components/SubmitButton";
import { OutputSection } from "./components/OutputSection";
import { useAgentRunner } from "./components/useAgentRunner";
import type { AgentType } from "./components/types";
import { StyledAppContainer } from "./App.styles";

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>("");
  const [agentType, setAgentType] = useState<AgentType>("coding");
  const { isLoading, output, runAgent } = useAgentRunner();

  const handleSubmit = () => {
    runAgent(agentType, userInput);
  };

  return (
    <StyledAppContainer>
      <Box className="Wrapper">
        <Header />
        <Box className="MainContent">
          <Box
            component="form"
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="InputForm"
          >
            <div style={{ marginBottom: "16px" }}>
              <AgentSelector
                value={agentType}
                onChange={setAgentType}
                disabled={isLoading}
              />
            </div>
            <PromptInput
              value={userInput}
              onChange={setUserInput}
              disabled={isLoading}
            />
            <SubmitButton
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!userInput.trim()}
            />
          </Box>
          <OutputSection output={output} isLoading={isLoading} />
        </Box>
      </Box>
    </StyledAppContainer>
  );
};

export default App;
