import { Midi } from "@tonejs/midi";
import { findIndex } from "lodash";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Piano } from "../components/Piano";
import { MidiResult } from "../hooks/useMidi";
import { ControlButton, ControlBar } from "../components/ControlBar";
import { midiToNoteName } from "../helpers/midiToNoteName";

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
  time: number;
}

interface SequenceComparison {
  missedNotes: number;
  additionalNotes: number;
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
      const duration = foundNote.timestamp - foundNote.timestamp;
      // set relative start time for each note
      const time =
        sequence.length === 0 ? 0 : foundNote.timestamp - sequence[0].timestamp;
      sequence.push({ ...result, duration, time });
    }
  });

  return sequence;
};

const calculateCorrectness = (
  song: Midi,
  sequence: NoteResult[]
): SequenceComparison => {
  const songNotes = song.tracks[0].notes; // add support for different tracks
  let missedNotes = 0;
  const additionalNotes = sequence.length - songNotes.length;
  const songTimeOffset = songNotes[0].time; // timestamp offset for song notes (Time to first note);

  const notes = songNotes.map(songNote => {
    const sequenceNote = sequence.find(({ note }) => note == songNote.midi);

    if (!sequenceNote) {
      missedNotes++;
      return;
    }

    // zero is perfect, positive values are too soon / too late
    const playedNoteOffset = Math.abs(
      songNote.time - songTimeOffset - sequenceNote.time
    );

    // user played correct note but in wrong octave
    const isCorrectNoteClass =
      midiToNoteName(songNote.midi, { pitchClass: true }) ===
      midiToNoteName(sequenceNote.note, { pitchClass: true });

    return {
      offset: playedNoteOffset,
      correctClass: isCorrectNoteClass
    };
  });

  return {
    missedNotes,
    additionalNotes
  };
};

export const Practice = React.memo(function Practice() {
  const [midiSong, setMidiSong] = useState<Midi | null>(null);
  const [midiResults, setMidiResults] = useState<MidiResult[]>([]);
  const [showPianoLabels, setShowPianoLabels] = useState<boolean>(true);

  const checkResults = () => {
    const sequence = getPlayedSequence(midiResults);
    setMidiResults([]);
    console.log("compare", midiSong, sequence);
    console.log("compare", calculateCorrectness(midiSong!, sequence));
  };

  useEffect(() => {
    Midi.fromUrl("/assets/midi/C_minor_pentatonic_scale.mid").then(midi => {
      setMidiSong(midi);
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
