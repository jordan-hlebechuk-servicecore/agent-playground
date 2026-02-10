import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 64;

export const SIDEBAR_WIDTHS = { expanded: DRAWER_WIDTH, collapsed: COLLAPSED_WIDTH };

export const StyledSidebarContainer = styled(Box)<{ open: boolean }>`
  width: ${({ open }) => (open ? DRAWER_WIDTH : COLLAPSED_WIDTH)}px;
  min-width: ${({ open }) => (open ? DRAWER_WIDTH : COLLAPSED_WIDTH)}px;
  height: 100vh;
  background: #1a1a2e;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease, min-width 0.2s ease;
  overflow: hidden;

  .SidebarHeader {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .SidebarLogo {
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    color: #667eea;
  }

  .CollapseButton {
    color: rgba(255, 255, 255, 0.6);
    min-width: 36px;

    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.08);
    }
  }

  .NavList {
    flex: 1;
    padding: 8px;
  }

  .NavItem {
    border-radius: 8px;
    margin-bottom: 2px;
    color: rgba(255, 255, 255, 0.7);
    padding: 10px 12px;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: white;
    }

    &.active {
      background: rgba(102, 126, 234, 0.2);
      color: #667eea;
    }
  }

  .NavItemIcon {
    color: inherit;
    min-width: 36px;
  }

  .NavItemText {
    white-space: nowrap;

    .MuiListItemText-primary {
      font-size: 14px;
      font-weight: 500;
    }
  }
`;
