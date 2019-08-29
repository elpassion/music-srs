import { range, without } from "lodash";
import React, { useState } from "react";
import styled from "styled-components";
import { useMidi, MidiResult } from "../hooks/useMidi";
import { midiToNoteName } from "../helpers/midiToNoteName";
import { ControlBar } from "./ControlBar";

export interface PressableKey {
  isPressed?: boolean;
}

const whiteKeyWidth = 75;

const KeyboardContainer = styled.div`
  justify-content: center;
  border-top: 2px solid black;
  overflow: hidden;
  display: flex;
  position: relative;
`;

const Box = styled.div`
  position: relative;
`;

const WhiteKey = styled.div<PressableKey>`
  display: block;
  position: relative;
  width: ${whiteKeyWidth}px;
  height: 264px;
  flex-shrink: 0;
  border-radius: 0 0 4px 4px;
  background: white;
  top: 0;
  margin-right: 4px;
  cursor: pointer;
  transition: all 0.05s ease;
  opacity: ${props => (props.isPressed ? 0.7 : 1)};
  transform: translate(0, ${props => (props.isPressed ? 0 : "-3px")});
  user-select: none;
`;

const KeyLabel = styled.span`
  position: absolute;
  font-weight: 600;
  font-size: 12px;
  color: #555555;
  text-transform: uppercase;
  bottom: 30px;
  left: 50%;
  transform: translate(-50%, 0);
  user-select: none;
`;

const BlackKey = styled.div<PressableKey>`
  display: inline-block;
  border-radius: 0 0 8px 8px;
  position: absolute;
  z-index: 1;
  flex-shrink: 0;
  top: 0;
  height: 156px;
  width: 38px;
  background: #303030;
  transform: translate(
    calc(-50% - 2px),
    ${props => (props.isPressed ? 0 : "-3px")}
  );
  transition: all 0.05s ease;
  cursor: pointer;

  &::before {
    content: "";
    background: #4a4a4a;
    display: block;
    margin: 0 auto;
    width: calc(100% - 12px);
    height: calc(100% - 34px);
    border-radius: 0 0 4px 4px;
    opacity: ${props => (props.isPressed ? 0 : 1)};
    transform: translateY(${props => (props.isPressed ? 0 : "-3px")});
    transition: all 0.05s ease;
  }

  ${KeyLabel} {
    bottom: 12px;
    color: white;
  }
`;

interface Props {
  onNote: (result: MidiResult) => void;
  showLabels: boolean;
}

export const Piano: React.FC<Props> = ({ onNote, showLabels }) => {
  const [activeKeys, setActiveKeys] = useState<number[]>([]);

  useMidi(result => {
    onNote && onNote(result);
    if (result.action === "press") {
      setActiveKeys(keys => [...keys, result.note]);
    } else {
      setActiveKeys(keys => without(keys, result.note));
    }
  });

  const midiKeys = range(21, 108); // range of midi keyboard
  const blackMidiKeys = [1, 3, 6, 8, 10];

  return (
    <KeyboardContainer>
      {midiKeys.map(keyId => {
        const isPressed = !!activeKeys.includes(keyId);
        const Key = blackMidiKeys.includes(keyId % 12) ? BlackKey : WhiteKey;

        return (
          <Box key={keyId}>
            <Key isPressed={isPressed}>
              {showLabels && (
                <KeyLabel>
                  {midiToNoteName(keyId, { pitchClass: true, sharps: true })}
                </KeyLabel>
              )}
            </Key>
          </Box>
        );
      })}
    </KeyboardContainer>
  );
};
