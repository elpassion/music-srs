import { Midi } from "@tonejs/midi";
import { findIndex } from "lodash";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Piano } from "../components/Piano";
import { MidiResult } from "../hooks/useMidi";
import { ControlButton, ControlBar } from "../components/ControlBar";

const PracticeViewContainer = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
`;

const PracticeViewScreen = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const H3 = styled.h3`
  font-size: 80px;
  color: white;
  font-weight: 600;
  line-height: 1.5;
`;

interface NoteResult extends MidiResult {
  duration: number;
}

const getPlayedSequence = (results: MidiResult[]): NoteResult[] => {
  const sequence: NoteResult[] = [];
  const presses: MidiResult[] = [];

  results.forEach(result => {
    if (result.action === "press") {
      presses.push(result);
    } else {
      const foundIndex = findIndex(presses, ({ note }) => note === result.note);
      const foundNote = presses[foundIndex];
      presses.splice(foundIndex, 1);
      const duration = result.timestamp - foundNote.timestamp;
      sequence.push({ ...result, duration });
    }
  });

  return sequence;
};

export const Practice = React.memo(() => {
  const [value, setValue] = useState<Midi | null>(null);
  const [midiResults, setMidiResults] = useState<MidiResult[]>([]);
  const [showPianoLabels, setShowPianoLabels] = useState<boolean>(true);

  const checkResults = () => {
    const sequence = getPlayedSequence(midiResults);
    setMidiResults([]);
    console.log("compare", value, sequence);
  };

  useEffect(() => {
    Midi.fromUrl("/assets/midi/C_minor_pentatonic_scale.mid").then(midi => {
      setValue(midi);
      console.log("loaded midi:", midi);
    });
  }, []);

  return (
    <PracticeViewContainer>
      <PracticeViewScreen>
        <H3>Played {Math.ceil(midiResults.length / 2)} notes</H3>
      </PracticeViewScreen>

      <Piano
        showLabels={showPianoLabels}
        onNote={result =>
          setMidiResults(prevResults => [...prevResults, result])
        }
      />

      <ControlBar>
        <ControlButton onClick={() => setShowPianoLabels(show => !show)}>
          {showPianoLabels ? "Hide" : "Show"} Keys Names
        </ControlButton>
        <ControlButton success onClick={() => checkResults()}>
          Check Results
        </ControlButton>
      </ControlBar>
    </PracticeViewContainer>
  );
});
