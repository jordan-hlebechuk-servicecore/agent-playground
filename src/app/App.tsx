import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layout";
import { AgentRunner, MyTickets, UserSettings } from "./pages";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/agent" element={<AgentRunner />} />
          <Route path="/tickets" element={<MyTickets />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="*" element={<Navigate to="/tickets" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
