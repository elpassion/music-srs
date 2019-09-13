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
