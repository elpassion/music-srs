import { useEffect } from "react";

export interface KeyboardResult {
 action: string,
 note: number
}

export interface Event {
    keyCode: number
}

export const useKeyboard = (callback: (result: KeyboardResult) => void) => {
    const notes = {
        65: 69,
        83: 71,
        68: 72,
        70: 74,
        71: 76,
        72: 77,
        74: 79,
        75: 81,
    };

    useEffect(() => {
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
    }, [])

    const keyToNote = (key: number) => {
     return notes[key]
    }

    const onKeyDown = (e: Event) => {
        callback({
            action: "press",
            note: keyToNote(e.keyCode)
        })
    }

    const onKeyUp = (e: Event) => {
        callback({
            action: "release",
            note: keyToNote(e.keyCode)
        })
    }
}