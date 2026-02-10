import styled from "styled-components";

export const StyledButton = styled.div`
  width: 100%;
  margin-top: 16px;

  .MuiButton-root {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const ButtonContent = styled.div<{ isLoading: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
`;
