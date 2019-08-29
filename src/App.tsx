import React from "react";
import { AppContainer, GlobalStyles } from "./styles/global";
import { Practice } from "./views/Practice";

function App() {
  return (
    <AppContainer>
      <GlobalStyles />
      <Practice />
    </AppContainer>
  );
}

export default App;
