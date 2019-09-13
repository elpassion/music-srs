import React from "react";

export interface AudioResult {
  channel: number;
  note: number;
  velocity: number;
  timestamp: number;
  action: "press" | "release";
}

/*

export interface MidiResult extends AudioResult {
  name?: string;
  manufacturer?: string;
  state?: string;
  type?: string;
  event?: number;
}

export const useMidi = (callback: (result: MidiResult) => void) => {
  React.useEffect(() => {
    function connectInputs(midiAccess: any) {
      const inputs = midiAccess.inputs.values();

      for (
        let input = inputs.next();
        input && !input.done;
        input = inputs.next()
      ) {
        input.value.onmidimessage = onMIDIMessage;
      }
    }

    function onMIDISuccess(midiAccess: any) {
      connectInputs(midiAccess);

      midiAccess.onstatechange = (e: any) => {
        if (e.port.state === "connected") {
          connectInputs(midiAccess);
        }
      };
    }

    function onMIDIFailure() {
      console.log("Could not access your MIDI devices.");
    }

    function onMIDIMessage(message: any) {
      const srcElement = message.srcElement;
      const data = message.data;
      const channel = data[0] & 0xf;
      const event = data[0] & 0xf0;
      const note = data[1];
      const velocity = data[2];
      const timestamp = Date.now() / 1000; // in seconds

      if ([144, 128].includes(event)) {
        // only listen to noteOn and noteOff events
        const result: MidiResult = {
          name: srcElement.name,
          manufacturer: srcElement.manufacturer,
          state: srcElement.state,
          channel: channel,
          type: srcElement.type,
          event,
          action: velocity > 0 ? "press" : "release",
          timestamp,
          note,
          velocity
        };

        callback(result);
      }
    }

    // @ts-ignore
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
  }, []);
};
*/
