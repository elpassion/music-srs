import { range, without } from "lodash";
import React, { useState } from "react";
import { midiToNoteName } from "../helpers/midiToNoteName";
import { MidiResult, useMidi } from "../hooks/useMidi";
import { useKeyboard } from "../hooks/useKeyboard";
import { Instrument } from "../Instrument";
import "./Piano.scss";

interface Props {
  onNote: (result: MidiResult) => void;
  showLabels: boolean;
  instrument: Instrument;
}

const midiKeys = range(21, 108); // range of midi keyboard
const blackMidiKeys = [1, 3, 6, 8, 10];

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
  });

  return (
    <div className="Piano__keyboard">
      {midiKeys.map(keyId => {
        const isPressed = !!activeKeys.includes(keyId);
        const keyClass = blackMidiKeys.includes(keyId % 12)
          ? "Piano__black-key"
          : "Piano__white-key";

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
