import styled from "styled-components";

export const OutputSectionWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 30px;
  overflow: hidden;
`;

export const OutputTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

export const OutputContainer = styled.div`
  flex: 1;
  background: #f9f9f9;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  padding: 16px;
  overflow-y: auto;
  font-family: "Courier New", monospace;
  font-size: 13px;
  line-height: 1.5;

  /* Webkit scrollbar styles */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;

    &:hover {
      background: #555;
    }
  }

  /* Firefox scrollbar styles */
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
`;

export const EmptyState = styled.p`
  color: #999;
  text-align: center;
  padding: 40px 20px;
  margin: 0;
`;
