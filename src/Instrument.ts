import Soundfont from "soundfont-player";

export class Instrument {
  constructor(public player: Soundfont.Player) {}

  static async create(name: Soundfont.InstrumentName): Promise<Instrument> {
    const player = await Soundfont.instrument(new AudioContext() as any, name);
    return new Instrument(player);
  }
}
