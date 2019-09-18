import * as pixi from "pixi.js";
import React from "react";
import { useKeyboard } from "../hooks/useKeyboard";
import { Midi } from "@tonejs/midi";
import { toMidi } from "../helpers/midiToNoteName";
import { useMidi } from "../hooks/useMidi";
import { PianoSoundMaker } from "./PianoSoundMaker";
import { PianoVisualizer } from "./PianoVisualizer";
import { PianoTrackVisualizer } from "./PianoTrackVisualizer";
import "./style.scss";

export class Practice {
  private app: pixi.Application;
  public instrumentVisualizer: PianoVisualizer;
  public trackVisualizer: PianoTrackVisualizer;

  constructor(canvas: HTMLCanvasElement, parentNode: HTMLElement) {
    this.app = new pixi.Application({
      view: canvas,
      antialias: true,
      autoDensity: true,
      resizeTo: parentNode,
      resolution: 2
    });

    this.instrumentVisualizer = new PianoVisualizer(this.app);
    this.trackVisualizer = new PianoTrackVisualizer(this.app);
  }
}

export const PracticeComponent = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const parentContainerRef = React.useRef<HTMLDivElement>(null);
  const practiceRef = React.useRef<Practice>();
  const instrumentRef = React.useRef<PianoSoundMaker>();

  const [midiSong, setMidiSong] = React.useState<Midi | null>(null);

  React.useEffect(() => {
    fetch("/assets/midi/Clair-de-Lune-via-Suite-Bergamasque-No-3.mid").then(
      async res => {
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const midi = new Midi(arrayBuffer);
          setMidiSong(midi);
          practiceRef.current.trackVisualizer.setMidiSong(midi);
        } else {
          throw new Error(`could not load midi`);
        }
      }
    );
  }, []);

  useKeyboard(result => {
    switch (result.action) {
      case "press":
        practiceRef.current.instrumentVisualizer.setKeyActive(result.note);
        instrumentRef.current.playNote(result.note);
        break;
      case "release":
        practiceRef.current.instrumentVisualizer.setKeyInactive(result.note);
        instrumentRef.current.stopNote(result.note);
        break;
      default:
        practiceRef.current.instrumentVisualizer.setAllInactive();
        instrumentRef.current.stopAll();
    }
  });

  useMidi(result => {
    if (result.action === "press") {
      practiceRef.current.instrumentVisualizer.setKeyActive(result.note);
      instrumentRef.current.playNote(result.note);
    } else {
      practiceRef.current.instrumentVisualizer.setAllInactive();
      instrumentRef.current.stopAll();
    }
  });

  React.useEffect(() => {
    practiceRef.current = new Practice(
      canvasRef.current,
      parentContainerRef.current
    );
    instrumentRef.current = new PianoSoundMaker();
  }, []);

  return (
    <>
      <div ref={parentContainerRef} className="PracticeCanvas__container">
        <canvas ref={canvasRef} />
      </div>
      <button
        style={{ position: "absolute", bottom: 0, right: 0 }}
        onClick={() => {
          practiceRef.current.trackVisualizer.startAnimation();

          midiSong.tracks.forEach(track => {
            track.notes.forEach((note, i) => {
              setTimeout(() => {
                instrumentRef.current.playNote(toMidi(note.name));
              }, note.time * 1000);
            });
          });
        }}
      >
        Play
      </button>
    </>
  );
};
