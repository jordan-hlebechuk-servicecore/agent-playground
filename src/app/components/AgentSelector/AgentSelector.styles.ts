import styled from "styled-components";

export const SelectorWrapper = styled.div`
  width: 100%;

  .MuiFormControl-root {
    width: 100%;
  }

  .MuiInputLabel-root {
    font-weight: 500;
  }

  .MuiOutlinedInput-root {
    background-color: white;

    &:hover .MuiOutlinedInput-notchedOutline {
      border-color: #667eea;
    }

    &.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  .MuiOutlinedInput-root.Mui-disabled {
    background-color: #f5f5f5;
    opacity: 0.6;
  }
`;
