import { useEffect, useRef } from "react";
import { AudioResult } from "./useMidi";

// keyboard key : midi key
const notes = {
  a: 60,
  w: 61,
  s: 62,
  e: 63,
  d: 64,
  f: 65,
  t: 66,
  g: 67,
  y: 68,
  h: 69, //hehe
  u: 70,
  j: 71,
  k: 72,
  o: 73,
  l: 74,
  p: 75,
  ";": 76
};

export const useKeyboard = (
  callback: (result: AudioResult | { action: "release-all" }) => void
) => {
  const octaveRef = useRef(0);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
  }, []);

  const keyToNote = (key: string) => {
    return notes[key] + octaveRef.current * 12;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;

    if (e.key === "[") {
      octaveRef.current > -4 && octaveRef.current--;
    } else if (e.key === "]") {
      octaveRef.current < 3 && octaveRef.current++;
    } else {
      if (!notes[e.key]) return;

      callback({
        action: "press",
        note: keyToNote(e.key),
        channel: 0,
        timestamp: Date.now() / 1000, // in seconds
        velocity: 0.8
      });
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (notes[e.key]) {
      callback({
        action: "release",
        note: keyToNote(e.key),
        channel: 0,
        timestamp: Date.now() / 1000, // in seconds
        velocity: 0.8
      });
    }
  };

  const onBlur = () => {
    callback({
      action: "release-all"
    });
  };
};
