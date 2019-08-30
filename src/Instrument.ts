import Soundfont from "soundfont-player";

export class Instrument {
  constructor(
    public player: Soundfont.Player,
    public audioContext: AudioContext
  ) {}

  static async create(name: Soundfont.InstrumentName): Promise<Instrument> {
    const ac = new AudioContext();
    const player = await Soundfont.instrument(ac as any, name);
    return new Instrument(player, ac);
  }
}
