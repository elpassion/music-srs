import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 32px;
`;

const Button = styled.button`
  background: white;
  border-radius: 6px;
  border: none;
  color: black;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

export const ControlBar = ({
  showLabels,
  toggleLabels
}: {
  showLabels: boolean;
  toggleLabels: Function;
}) => {
  return (
    <Container>
      <Button onClick={() => toggleLabels()}>
        {showLabels ? "Hide" : "Show"} Keys Names
      </Button>
    </Container>
  );
};
