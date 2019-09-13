import { range, without } from "lodash";
/*
import React, { useState } from "react";
import { midiToNoteName } from "../helpers/midiToNoteName";
import { useKeyboard } from "../hooks/useKeyboard";
import { AudioResult, useMidi } from "../hooks/useMidi";
import { Instrument } from "../Instrument";
import "./Piano.scss";

interface Props {
  onNote: (result: AudioResult) => void;
  showLabels: boolean;
  instrument: Instrument;
}

export const pianoKeys = range(21, 108).map((keyId, i) => ({
  isBlack: [1, 3, 6, 8, 10].includes(keyId % 12),
  isLargerWhite: i === 0 ? true : [0, 4, 5, 11].includes(keyId % 12),
  keyId
}));

export const Piano: React.FC<Props> = ({ onNote, showLabels, instrument }) => {
  const [activeKeys, setActiveKeys] = useState<number[]>([]);

  useMidi(result => {
    if (result.action === "press") {
      instrument.player.play(midiToNoteName(result.note));
      setActiveKeys(keys => [...keys, result.note]);
    } else {
      setActiveKeys(keys => without(keys, result.note));
    }

    onNote && onNote(result);
  });

  useKeyboard(result => {
    if (result.action === "press") {
      instrument.player.play(midiToNoteName(result.note));
      setActiveKeys(keys => [...keys, result.note]);
    } else {
      setActiveKeys(keys => without(keys, result.note));
    }

    onNote && onNote(result);
  });

  return (
    <div className="Piano__keyboard">
      {pianoKeys.map(({ keyId, isBlack }) => {
        const isPressed = !!activeKeys.includes(keyId);
        const keyClass = isBlack ? "Piano__black-key" : "Piano__white-key";

        return (
          <div className="box" key={keyId}>
            <div
              className={`${keyClass} ${
                isPressed ? keyClass + "--pressed" : ""
              }`}
            >
              {showLabels && (
                <div className="Piano__key-label">
                  {midiToNoteName(keyId, { pitchClass: true, sharps: true })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
*/
