import React from "react";
import { Piano } from "../components/Piano";
import styled from "styled-components";

const PracticeViewContainer = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
`;

const PracticeViewScreen = styled.div`
  flex-grow: 1;
`;

export const Practice = React.memo(() => {
  return (
    <PracticeViewContainer>
      <PracticeViewScreen></PracticeViewScreen>
      <Piano />
    </PracticeViewContainer>
  );
});
