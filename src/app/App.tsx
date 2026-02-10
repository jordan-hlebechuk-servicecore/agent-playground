import React, { useState } from "react";
import { Box } from "@mui/material";
import { Header } from "./components/Header";
import { AgentSelector } from "./components/AgentSelector";
import { PromptInput } from "./components/PromptInput";
import { SubmitButton } from "./components/SubmitButton";
import { StopButton } from "./components/StopButton";
import { OutputSection } from "./components/OutputSection";
import { useAgentRunner } from "./components/useAgentRunner";
import type { AgentType } from "./components/types";
import { StyledAppContainer } from "./App.styles";

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>("");
  const [agentType, setAgentType] = useState<AgentType>("coding");
  const { isLoading, output, runAgent, stopAgent } = useAgentRunner();

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
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop: "16px",
              }}
            >
              <SubmitButton
                onClick={handleSubmit}
                isLoading={isLoading}
                disabled={!userInput.trim()}
              />
              {isLoading && <StopButton onClick={stopAgent} disabled={false} />}
            </Box>
          </Box>
          <OutputSection output={output} isLoading={isLoading} />
        </Box>
      </Box>
    </StyledAppContainer>
  );
};

export default App;
