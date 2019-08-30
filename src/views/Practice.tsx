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
  successRate: number,
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
    if(additonal > 0) {
      return (notes - missed) / (additonal + notes)
    }else {
      return (notes - missed) / notes
    }
}

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

  successRate = calculateCorrectnessProcentage(songNotes.length, missedNotes, additionalNotes)

  return {
    successRate,
    missedNotes,
    additionalNotes
  };
};

const animationIds = [];

export const Practice = React.memo(function Practice() {
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

    midiSong.tracks.forEach(track => {
      track.notes.forEach((note, i) => {
        const playTime =
          instrument.current.audioContext.currentTime + note.time;
        instrument.current.player.start(note.name, playTime, {
          duration: note.duration,
          gain: note.velocity
        });

        const isLastNote = i === track.notes.length - 1;

        if (isLastNote) {
          setTimeout(() => {
            setIsPlaying(false);
            stopAnimation();
          }, playTime * 1000);
        }
      });
    });
  };

  const runAnimation = () => {
    const id = window.requestAnimationFrame(runAnimation);

    setNotesOffset(prevOffset => prevOffset + 100 / 60);
    animationIds.push(id);
  };

  const stopAnimation = () => {
    animationIds.forEach(id => {
      window.cancelAnimationFrame(id);
    });

    setNotesOffset(0);
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
        <div
          className={`Practice__track ${
            isPlaying ? "Practice__track--playing" : ""
          }`}
        >
          {pianoKeys.map(({ keyId, isBlack, isLargerWhite }) => {
            const colorClass = isBlack ? "Practice__track-key--black" : "";
            const sizeClass = isLargerWhite
              ? "Practice__track-key--larger"
              : "";

            return (
              <div
                key={keyId}
                className={`Practice__track-key ${colorClass} ${sizeClass}`}
              >
                {midiSong.tracks.map(track => {
                  return track.notes.map(note => {
                    if (note.midi !== keyId) return;
                    return (
                      <div
                        key={note.name + note.time + note.duration}
                        className="Practice__track-note"
                        style={{
                          height: note.duration * 100,
                          bottom: note.time * 100 - notesOffset
                        }}
                      >
                        {note.name}
                      </div>
                    );
                  });
                })}
              </div>
            );
          })}
        </div>
        <h3 className="Practice__h3">
          {playerScore ? (
              <span className="Practice__h3-wrapper">
                <span className={playerScore.successRate < 0.5 ? 'Practice__h3--error' : 'Practice__h3--sucess'}>
                  Sucess rate: {(playerScore.successRate * 100).toFixed(2)} %
                </span>
                <span className={playerScore.successRate < 0.5 ? 'Practice__h3--error' : 'Practice__h3--sucess'}>
                  (repeat in {playerScore.successRate < 0.5 ? '1 minute' : '1 day'})
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
