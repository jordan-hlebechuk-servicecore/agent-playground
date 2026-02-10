import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const StyledTicketCard = styled(Box)`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }

  .CardHeader {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .CardTopRow {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .TicketKey {
    font-size: 13px;
    font-weight: 600;
    color: #667eea;
  }

  .TicketType {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .TicketType.bug {
    background: #ffebee;
    color: #c62828;
  }

  .TicketType.task {
    background: #e3f2fd;
    color: #1565c0;
  }

  .TicketType.story {
    background: #e8f5e9;
    color: #2e7d32;
  }

  .TicketType.default {
    background: #f5f5f5;
    color: #616161;
  }

  .Summary {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    line-height: 1.4;
  }

  .MetaRow {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .Status {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 4px;
    background: #f0f0f0;
    color: #616161;
  }

  .Priority {
    font-size: 11px;
    color: #999;
  }

  .ExpandedContent {
    padding: 0 16px 16px;
    border-top: 1px solid #f0f0f0;
  }

  .DescriptionLabel {
    font-size: 12px;
    font-weight: 600;
    color: #666;
    margin-bottom: 8px;
    margin-top: 12px;
  }

  .Description {
    font-size: 13px;
    color: #444;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 200px;
    overflow-y: auto;
  }

  .ActionRow {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  .ViewInJira {
    padding: 10px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #555;
    text-transform: none;
    transition: all 0.2s ease;

    &:hover {
      border-color: #667eea;
      color: #667eea;
      background: rgba(102, 126, 234, 0.04);
    }
  }

  .HandleBugfix {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex: 1;
    padding: 10px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: none;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  }
`;
