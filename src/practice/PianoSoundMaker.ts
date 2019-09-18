import { map } from "lodash";
import { toMidi } from "../helpers/midiToNoteName";

function loadScript(src: string) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    document.body.appendChild(script);
    script.onload = resolve;
    script.onerror = reject;
    script.async = true;
    script.src = src;
  });
}

function base64ToArrayBuffer(base64: string) {
  var binaryString = window.atob(base64);
  var len = binaryString.length;
  var bytes = new Uint8Array(len);

  for (var i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

const buffersCache = {};
const instrumentCache = {};

export async function loadSoundFont(
  ctx: AudioContext,
  name = "acoustic_grand_piano"
) {
  if (buffersCache[name]) return buffersCache[name];

  await loadScript(
    `http://gleitz.github.io/midi-js-soundfonts/FatBoy/${name}-mp3.js`
  );
  // @ts-ignore
  const data = window.MIDI.Soundfont[name];
  instrumentCache[name] = data;

  const promises = map(data, (base64string, noteName) => {
    return new Promise(resolve => {
      const data = base64ToArrayBuffer(base64string.split(",")[1]);
      return ctx.decodeAudioData(data, audioBuffer => {
        buffersCache[name] = buffersCache[name] || {};

        buffersCache[name][toMidi(noteName)] = audioBuffer;
        resolve();
      });
    });
  });

  await Promise.all(promises);
  return buffersCache[name];
}

export class PianoSoundMaker {
  ctx: AudioContext;
  buffers: AudioBuffer;

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
