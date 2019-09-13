import * as pixi from "pixi.js";
import React from "react";
import { range } from "lodash";
import { useKeyboard } from "../hooks/useKeyboard";
import { loadSoundFont } from "./SoundLoader";
import { Midi } from "@tonejs/midi";
import { toMidi } from "../helpers/midiToNoteName";

export const pianoKeys = range(21, 108).map((keyId, i) => ({
  isBlack: [1, 3, 6, 8, 10].includes(keyId % 12),
  isLargerWhite: i === 0 ? true : [0, 4, 5, 11].includes(keyId % 12),
  keyId
}));

export class Instrument {
  ctx: AudioContext;
  buffers: any;

  constructor() {
    this.ctx = new AudioContext();

    this.loadSounds();
  }

  async loadSounds() {
    this.buffers = await loadSoundFont(this.ctx);
  }

  playNote(midiId: number) {
    const source = this.ctx.createBufferSource();
    source.buffer = this.buffers[midiId];
    let panX = 0;
    let panY = panX + 90;
    panY > 90 && (panY = 180 - panY);

    const gainNode = this.ctx.createGain();
    const filterNode = this.ctx.createBiquadFilter();
    filterNode.type = "lowpass";
    const panNode = this.ctx.createPanner();
    panNode.panningModel = "equalpower";
    panNode.setPosition(
      Math.sin(panX * (Math.PI / 180)),
      0,
      Math.sin(panY * (Math.PI / 180))
    );
    // filterNode.frequency.value = mapCurve(velocity, 0, 127, 350, 13500, 2.72) // midicps[notePitch]
    filterNode.Q.value = 0.4;
    filterNode.connect(gainNode);
    // gainNode.gain.value = Math.max(0, mapCurve(velocity, 0, 127, 0, 1, 1)) * this.masterVolume
    gainNode.connect(panNode);
    panNode.connect(this.ctx.destination);
    source.connect(filterNode);

    source.connect(this.ctx.destination);
    source.start(0);
  }

  stopNote(midiId: number) {}

  stopAll() {}
}

export class Practice {
  private app: pixi.Application;
  private state = {
    activeKeys: []
  };
  private whiteKeysGraphics: pixi.Graphics;
  private blackKeysGraphics: pixi.Graphics;

  constructor(canvas: HTMLCanvasElement) {
    this.app = new pixi.Application({
      view: canvas,
      antialias: true,
      autoDensity: true,
      resolution: 2
    });

    this.whiteKeysGraphics = new pixi.Graphics();
    this.blackKeysGraphics = new pixi.Graphics();
    this.app.stage.addChild(this.whiteKeysGraphics, this.blackKeysGraphics);

    this.drawPiano();
  }

  public setKeyActive = (keyId: number) => {
    this.state.activeKeys.push(keyId);
    this.drawPiano();
  };

  public setAllInactive = () => {
    this.state.activeKeys = [];
    this.drawPiano();
  };

  public setKeyInactive = (keyId: number) => {
    this.state.activeKeys.splice(this.state.activeKeys.indexOf(keyId), 1);
    this.drawPiano();
  };

  private drawPiano = () => {
    this.blackKeysGraphics.clear();
    this.whiteKeysGraphics.clear();

    let xPointer = 0;

    const white = 0xecf0f1;
    const black = 0x2c3e50;
    const green = 0x2ecc71;

    pianoKeys.forEach(key => {
      const isActive = this.state.activeKeys.includes(key.keyId);

      if (key.isBlack) {
        this.blackKeysGraphics.beginFill(isActive ? green : black, 1);
        this.blackKeysGraphics.drawRect(xPointer - 5, 10, 10, 50);
        this.blackKeysGraphics.endFill();
      } else {
        this.whiteKeysGraphics.lineStyle(1, black);
        this.whiteKeysGraphics.beginFill(isActive ? green : white, 1);
        this.whiteKeysGraphics.drawRect(xPointer, 10, 20, 100);
        this.whiteKeysGraphics.endFill();

        xPointer += 20;
      }
    });
  };
}

export const PracticeComponent = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const practiceRef = React.useRef<Practice>();
  const instrumentRef = React.useRef<Instrument>();

  const [midiSong, setMidiSong] = React.useState<Midi | null>(null);
  React.useEffect(() => {
    fetch("/assets/midi/Clair-de-Lune-via-Suite-Bergamasque-No-3.mid").then(
      async res => {
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          setMidiSong(new Midi(arrayBuffer));
        } else {
          throw new Error(`could not load midi`);
        }
      }
    );
  }, []);

  useKeyboard(result => {
    switch (result.action) {
      case "press":
        practiceRef.current.setKeyActive(result.note);
        instrumentRef.current.playNote(result.note);
        break;
      case "release":
        practiceRef.current.setKeyInactive(result.note);
        instrumentRef.current.stopNote(result.note);
        break;
      default:
        practiceRef.current.setAllInactive();
        instrumentRef.current.stopAll();
    }
  });

  React.useEffect(() => {
    practiceRef.current = new Practice(canvasRef.current);
    instrumentRef.current = new Instrument();
  }, []);

  return (
    <>
      <canvas ref={canvasRef} />
      <button
        onClick={() =>
          midiSong.tracks.forEach(track => {
            track.notes.forEach((note, i) => {
              setTimeout(() => {
                instrumentRef.current.playNote(toMidi(note.name));
              }, note.time * 1000);
              // instrumentRef.current.playNote(toMidi(note.name));
            });
          })
        }
      >
        Play
      </button>
    </>
  );
};
