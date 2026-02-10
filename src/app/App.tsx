import React, { useState } from "react";
import { Header } from "./components/Header";
import { AgentSelector } from "./components/AgentSelector";
import { PromptInput } from "./components/PromptInput";
import { SubmitButton } from "./components/SubmitButton";
import { OutputSection } from "./components/OutputSection";
import { useAgentRunner } from "./components/useAgentRunner";
import type { AgentType } from "./components/types";
import "./components/AgentInput.css";

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>("");
  const [agentType, setAgentType] = useState<AgentType>("coding");
  const { isLoading, output, runAgent } = useAgentRunner();

  const handleSubmit = () => {
    runAgent(agentType, userInput);
  };

  return (
    <div className="agent-input-container">
      <div className="agent-input-wrapper">
        <Header />
        <div className="main-content">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="input-form"
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
          </form>
          <OutputSection output={output} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default App;
