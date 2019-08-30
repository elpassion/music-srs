import { useEffect, useState } from "react";

export interface KeyboardResult {
  action: string;
  note: number;
}

export interface Event {
  keyCode: number;
}

// keyboard keyCode : midi keyCode
const notes = {
  65: 69,
  83: 71,
  68: 72,
  70: 74,
  71: 76,
  72: 77,
  74: 79,
  75: 81
};

export const useKeyboard = (callback: (result: KeyboardResult) => void) => {
  const [octaveOffset, setOctaveOffset] = useState(0);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
  }, []);

  const keyToNote = (key: number) => {
    return notes[key] + octaveOffset * 12;
  };

  const onKeyDown = (e: Event) => {
    if (e.keyCode === 219) {
      setOctaveOffset(octaveOffset - 1);
    }
    if (e.keyCode === 221) {
      setOctaveOffset(octaveOffset + 1);
    }

    callback({
      action: "press",
      note: keyToNote(e.keyCode)
    });
  };

  const onKeyUp = (e: Event) => {
    callback({
      action: "release",
      note: keyToNote(e.keyCode)
    });
  };
};
