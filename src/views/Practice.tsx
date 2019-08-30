import { Midi } from "@tonejs/midi";
import { findIndex } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { Piano, pianoKeys } from "../components/Piano";
import { midiToNoteName } from "../helpers/midiToNoteName";
import { MidiResult, AudioResult } from "../hooks/useMidi";
import { Instrument } from "../Instrument";
import "./Practice.scss";

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
  const presses: AudioResult[] = [];

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
  const [loading, setLoading] = useState(true);
  const [midiSong, setMidiSong] = useState<Midi | null>(null);
  const [playerResults, setPlayerResults] = useState<AudioResult[]>([]);
  const [showPianoLabels, setShowPianoLabels] = useState<boolean>(true);
  const instrument = useRef<Instrument | null>(null);

  const checkResults = () => {
    const sequence = getPlayedSequence(playerResults);
    setPlayerResults([]);
    console.log("compare", midiSong, sequence);
    console.log("compare", calculateCorrectness(midiSong!, sequence));
  };

  const previewAudio = () => {
    if (!instrument.current) return;

    midiSong.tracks.forEach(track => {
      track.notes.forEach(note => {
        instrument.current.player.play(
          note.name,
          instrument.current.audioContext.currentTime + note.time,
          {
            duration: note.duration,
            gain: note.velocity
          }
        );
      });
    });
  };

  useEffect(() => {
    Promise.all([
      fetch("/assets/midi/C_minor_pentatonic_scale.mid").then(async res => {
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          setMidiSong(new Midi(arrayBuffer));
        } else {
          throw new Error(`could not load midi`);
        }
      }),
      Instrument.create("acoustic_grand_piano").then(loadedInstrument => {
        instrument.current = loadedInstrument;
      })
    ]).then(() => setLoading(false));
  }, []);

  if (loading || !instrument.current) return <>Loading...</>;

  return (
    <div className="Practice__container">
      <div className="Practice__screen">
        <div className="Practice__track">
          {pianoKeys.map(({ keyId, isBlack, isLargerWhite }) => {
            const colorClass = isBlack ? "Practice__track-key--black" : "";
            const sizeClass = isLargerWhite
              ? "Practice__track-key--larger"
              : "";

            return (
              <div
                key={keyId}
                className={`Practice__track-key ${colorClass} ${sizeClass}`}
              />
            );
          })}
        </div>
        <h3 className="Practice__h3">
          Played {Math.ceil(playerResults.length / 2)} notes
        </h3>
      </div>

      <Piano
        instrument={instrument.current}
        showLabels={showPianoLabels}
        onNote={result =>
          setPlayerResults(prevResults => [...prevResults, result])
        }
      />

      <div className="ControlBar">
        <div
          className="ControlBar__button"
          onClick={() => setShowPianoLabels(show => !show)}
        >
          {showPianoLabels ? "Hide" : "Show"} Keys Names
        </div>
        <div
          className="ControlBar__button ControlBar__button--success"
          onClick={() => checkResults()}
        >
          Check Results
        </div>
        <div className="ControlBar__button" onClick={() => previewAudio()}>
          Play Audio 🔈
        </div>
      </div>
    </div>
  );
});
