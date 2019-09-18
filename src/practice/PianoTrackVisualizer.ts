import { range } from "lodash";
import * as pixi from "pixi.js";
import { pianoKeys, whiteKeysCount } from "./PianoVisualizer";
import { Midi } from "@tonejs/midi";
import { Note } from "@tonejs/midi/dist/Note";

interface PianoTrackState {
  midi: Midi | null;
  currentTime: number;
  keysPositions: {
    [key: number]: {
      x: number;
      width: number;
    };
  };
  notesPositions: {
    [key: string]: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}

export class PianoTrackVisualizer {
  private state: PianoTrackState = {
    midi: null,
    currentTime: 0,
    keysPositions: {},
    notesPositions: {}
  };

  mainStage: pixi.Graphics;
  notesStage: pixi.Graphics;
  stageHeight: number;
  whiteKeyWidth: number;
  blackKeyWidth: number;

  constructor(private app: pixi.Application) {
    this.mainStage = new pixi.Graphics();
    this.notesStage = new pixi.Graphics();

    const { screen } = this.app.renderer;

    this.stageHeight = screen.height - 120;
    this.whiteKeyWidth = screen.width / whiteKeysCount;
    this.blackKeyWidth = this.whiteKeyWidth / 2;

    this.app.stage.addChild(this.mainStage, this.notesStage);
    this.draw();
  }

  public setMidiSong(midi: Midi) {
    this.state.midi = midi;

    this.drawNotes();
  }

  public startAnimation() {
    this.app.ticker.add(this.update);

    setTimeout(() => {
      this.app.ticker.remove(this.update);
    }, this.state.midi.duration * 1000);
  }

  private update = delta => {
    this.state.currentTime += delta * (1 / 60);
    this.drawNotes();
  };

  private drawTracks = () => {
    let pointerX = 0;

    pianoKeys.forEach(key => {
      const keyWidth = key.isBlack
        ? this.blackKeyWidth
        : key.isLargerWhite
        ? this.whiteKeyWidth - this.blackKeyWidth / 2
        : this.whiteKeyWidth - this.blackKeyWidth;

      this.mainStage.lineStyle(1, 0x34495e);
      this.mainStage.beginFill(0x2c3e50);
      this.mainStage.drawRect(pointerX, 0, keyWidth, this.stageHeight);
      this.mainStage.endFill();

      this.state.keysPositions[key.keyId] = {
        width: keyWidth,
        x: pointerX
      };

      pointerX += keyWidth;
    });
  };

  private draw() {
    this.drawTracks();
    this.drawNotes();
  }

  private calculateNotePosition(note: Note) {
    const noteKey = `${note.time}-${note.midi}-${note.duration}`;

    const { x, width } = this.state.keysPositions[note.midi];
    const { screen } = this.app.renderer;
    const height = note.duration * 100;
    const y = screen.height - 120 - height - note.time * 100;

    this.state.notesPositions[noteKey] = {
      x,
      y,
      width,
      height
    };

    return this.state.notesPositions[noteKey];
  }

  private drawNotes() {
    this.notesStage.clear();

    if (this.state.midi) {
      this.state.midi.tracks[0].notes.forEach(note => {
        const noteKey = `${note.time}-${note.midi}-${note.duration}`;
        const { x, y, width, height } =
          this.state.notesPositions[noteKey] ||
          this.calculateNotePosition(note);

        const deltaY = y + this.state.currentTime * 100;
        if (deltaY + height < 0) return;

        this.notesStage.beginFill(0x2ecc71);
        this.notesStage.drawRect(
          x + 1,
          y + this.state.currentTime * 100,
          width - 2,
          height
        );
        this.notesStage.endFill();
      });
    }
  }
}
