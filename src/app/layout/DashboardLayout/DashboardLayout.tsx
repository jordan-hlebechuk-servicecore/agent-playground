import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { IconButton, Avatar, Tooltip } from "@mui/material";
import { Sidebar } from "../Sidebar";
import { StyledDashboardLayoutContainer } from "./DashboardLayout.styles";

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <StyledDashboardLayoutContainer>
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />
      <div className="MainArea">
        <header className="AppHeader">
          <Tooltip title="User Settings">
            <IconButton
              className="ProfileButton"
              onClick={() => navigate("/settings")}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#667eea", fontSize: 14 }}>
                U
              </Avatar>
            </IconButton>
          </Tooltip>
        </header>
        <main className="PageContent">
          <Outlet />
        </main>
      </div>
    </StyledDashboardLayoutContainer>
  );
};
