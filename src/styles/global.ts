import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    margin: 0;
    padding: 0;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
      "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
      sans-serif;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    color: white;
    background: #303030;
  }

  html,
  body,
  #root {
    height: 100%;
    overflow: hidden;
  }
`;

export const AppContainer = styled.div`
  height: 100%;
`;

export const Flex = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
