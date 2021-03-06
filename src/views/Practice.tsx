import { Midi } from "@tonejs/midi";
import { toByteArray } from "base64-js";
import { findIndex } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { Piano } from "../components/Piano";
import { midiToNoteName } from "../helpers/midiToNoteName";
import { AudioResult, MidiResult } from "../hooks/useMidi";
import { Instrument } from "../Instrument";
import "./Practice.scss";
import { MidiEntity } from "../App";

interface NoteResult extends MidiResult {
  duration: number;
  time: number;
}

interface SequenceComparison {
  successRate: number;
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

const calculateCorrectnessProcentage = (notes, missed, additonal) => {
  if (additonal > 0) {
    return (notes - missed) / (additonal + notes);
  } else {
    return (notes - missed) / notes;
  }
};

const calculateCorrectness = (
  song: Midi,
  sequence: NoteResult[]
): SequenceComparison => {
  const songNotes = song.tracks[0].notes; // add support for different tracks
  let successRate = 0;
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

  successRate = calculateCorrectnessProcentage(
    songNotes.length,
    missedNotes,
    additionalNotes
  );

  return {
    successRate,
    missedNotes,
    additionalNotes
  };
};

let animationId = 0;

export const Practice = React.memo(function Practice({
  midi,
  onPracticeEnd
}: {
  midi: MidiEntity;
  onPracticeEnd: (score: number) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [notesOffset, setNotesOffset] = useState(0);
  const [midiSong, setMidiSong] = useState<Midi | null>(null);
  const [playerResults, setPlayerResults] = useState<AudioResult[]>([]);
  const [playerScore, setPlayerScore] = useState();
  const [showPianoLabels, setShowPianoLabels] = useState<boolean>(true);
  const instrument = useRef<Instrument | null>(null);

  const checkResults = () => {
    const sequence = getPlayedSequence(playerResults);
    const result = calculateCorrectness(midiSong!, sequence);
    setPlayerResults([]);
    setPlayerScore(result);
    setTimeout(() => onPracticeEnd(result.successRate), 1000);
    console.log("compare", midiSong, sequence);
    console.log("compare result", result);
  };

  const resetResult = () => {
    setPlayerResults([]);
    setPlayerScore(null);
  };

  const previewAudio = () => {
    if (!instrument.current) return;
    setIsPlaying(true);
    runAnimation();

    setTimeout(() => {
      setIsPlaying(false);
      stopAnimation();
    }, midiSong.duration * 1000 + 1000);

    midiSong.tracks.forEach(track => {
      track.notes.forEach((note, i) => {
        const playTime =
          instrument.current.audioContext.currentTime + note.time;

        instrument.current.player.start(note.name, playTime, {
          duration: note.duration,
          gain: note.velocity
        });
      });
    });
  };

  const runAnimation = () => {
    const id = window.requestAnimationFrame(runAnimation);
    animationId = id;

    setNotesOffset(prevOffset => prevOffset + 100 / 60);
  };

  const stopAnimation = () => {
    window.cancelAnimationFrame(animationId);

    setNotesOffset(0);
  };

  useEffect(() => {
    setMidiSong(new Midi(toByteArray(midi.data)));
    Instrument.create("acoustic_grand_piano")
      .then(loadedInstrument => {
        instrument.current = loadedInstrument;
      })
      .then(() => setLoading(false));
  }, []);

  if (loading || !instrument.current) return <>Loading...</>;

  return (
    <div className="Practice__container">
      <div className="Practice__screen">
        <div className="Practice__track"></div>
        <h3 className="Practice__h3">
          {playerScore ? (
            <span className="Practice__h3-wrapper">
              <span
                className={
                  playerScore.successRate < 0.5
                    ? "Practice__h3--error"
                    : "Practice__h3--sucess"
                }
              >
                Sucess rate: {(playerScore.successRate * 100).toFixed(2)} %
              </span>
              <span
                className={
                  playerScore.successRate < 0.5
                    ? "Practice__h3--error"
                    : "Practice__h3--sucess"
                }
              >
                (repeat in{" "}
                {playerScore.successRate < 0.5 ? "1 minute" : "1 day"})
              </span>
            </span>
          ) : (
            <span>Played {Math.ceil(playerResults.length / 2)} notes</span>
          )}
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
        {playerScore ? (
          <div
            className="ControlBar__button ControlBar__button--warning"
            onClick={() => resetResult()}
          >
            Reset result
          </div>
        ) : (
          <div
            className="ControlBar__button ControlBar__button--success"
            onClick={() => checkResults()}
          >
            Check Results
          </div>
        )}
        <div className="ControlBar__button" onClick={() => previewAudio()}>
          Play Audio 🔈
        </div>
      </div>
    </div>
  );
});
