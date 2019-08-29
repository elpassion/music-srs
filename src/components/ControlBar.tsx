import styled from "styled-components";

export const ControlBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 32px;
`;

export const ControlButton = styled.button<{ success?: boolean }>`
  cursor: pointer;
  background: ${props => (props.success ? "#6cc32f" : "white")};
  border-radius: 6px;
  border: none;
  color: ${props => (props.success ? "white" : "black")};
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0 10px;
`;
