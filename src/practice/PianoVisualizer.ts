import { range } from "lodash";
import * as pixi from "pixi.js";

export const pianoKeys = range(21, 108).map((keyId, i) => ({
  isBlack: [1, 3, 6, 8, 10].includes(keyId % 12),
  isLargerWhite: i === 0 ? true : [0, 4, 5, 11].includes(keyId % 12),
  keyId
}));

export const whiteKeysCount = pianoKeys.reduce(
  (acc, key) => (key.isBlack ? acc : acc + 1),
  0
);

export class PianoVisualizer {
  private state = {
    activeKeys: []
  };

  private whiteKeysGraphics: pixi.Graphics;
  private blackKeysGraphics: pixi.Graphics;

  constructor(private app: pixi.Application) {
    this.whiteKeysGraphics = new pixi.Graphics();
    this.blackKeysGraphics = new pixi.Graphics();

    this.app.stage.addChild(this.whiteKeysGraphics, this.blackKeysGraphics);
    this.draw();
  }

  private draw() {
    this.blackKeysGraphics.clear();
    this.whiteKeysGraphics.clear();

    const { screen } = this.app.renderer;

    const whiteKeyWidth = screen.width / whiteKeysCount;
    const blackKeyWidth = whiteKeyWidth / 2;
    const whiteKeyHeight = 120;
    const blackKeyHeight = whiteKeyHeight * 0.55;

    let xPointer = 0;
    const yPointer = screen.height - whiteKeyHeight;

    const white = 0xecf0f1;
    const black = 0x2c3e50;
    const green = 0x2ecc71;

    pianoKeys.forEach(key => {
      const isActive = this.state.activeKeys.includes(key.keyId);

      if (key.isBlack) {
        this.blackKeysGraphics.beginFill(isActive ? green : black, 1);
        this.blackKeysGraphics.drawRect(
          xPointer - blackKeyWidth / 2,
          yPointer,
          blackKeyWidth,
          blackKeyHeight
        );
        this.blackKeysGraphics.endFill();
      } else {
        this.whiteKeysGraphics.lineStyle(1, black);
        this.whiteKeysGraphics.beginFill(isActive ? green : white, 1);
        this.whiteKeysGraphics.drawRect(
          xPointer,
          yPointer,
          whiteKeyWidth,
          whiteKeyHeight
        );
        this.whiteKeysGraphics.endFill();

        xPointer += whiteKeyWidth;
      }
    });
  }

  public setKeyActive = (keyId: number) => {
    this.state.activeKeys.push(keyId);

    this.draw();
  };

  public setAllInactive = () => {
    this.state.activeKeys = [];

    this.draw();
  };

  public setKeyInactive = (keyId: number) => {
    this.state.activeKeys.splice(this.state.activeKeys.indexOf(keyId), 1);

    this.draw();
  };
}
