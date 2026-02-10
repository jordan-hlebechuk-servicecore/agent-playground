import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import {
  SmartToy,
  ConfirmationNumber,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { StyledSidebarContainer } from "./Sidebar.styles";

const NAV_ITEMS = [
  { label: "Agent Runner", path: "/agent", icon: <SmartToy /> },
  { label: "My Tickets", path: "/tickets", icon: <ConfirmationNumber /> },
  { label: "Settings", path: "/settings", icon: <Settings /> },
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <StyledSidebarContainer open={open}>
      <div className="SidebarHeader">
        {open && <span className="SidebarLogo">Agent Practice</span>}
        <IconButton
          className="CollapseButton"
          onClick={onToggle}
          size="small"
        >
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </div>
      <List className="NavList" disablePadding>
        {NAV_ITEMS.map((item) => (
          <Tooltip
            key={item.path}
            title={open ? "" : item.label}
            placement="right"
          >
            <ListItemButton
              className={`NavItem ${isActive(item.path) ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon className="NavItemIcon">
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText className="NavItemText" primary={item.label} />
              )}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </StyledSidebarContainer>
  );
};
