import React, { useState, useEffect } from "react";
import { GoogleLogin, GoogleLoginResponse } from "react-google-login";
import { Practice } from "./views/Practice";
import "./styles/global.scss";

const AuthContext = React.createContext<{ idToken: string | null }>({
  idToken: null
});

export interface MidiEntity {
  id: string;
  data: string;
  userId: string;
  results: ResultEntity[];
}

interface ResultEntity {
  id: number;
  score: number;
  createdAt: string;
  midiId: string;
}

const url = "https://demo2-spring.herokuapp.com";

function App() {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [midis, setMidis] = useState<MidiEntity[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [file, setFile] = useState<any>(null);
  const [
    currentlyPracticedMidiIndex,
    setCurrentlyPracticedMidiIndex
  ] = useState<number | null>(null);

  const downloadMidis = async () => {
    if (!idToken) return;
    const response = await fetch(`${url}/midis`, {
      headers: { authorization: idToken }
    });
    if (response.status !== 200) return;
    const midis = await response.json();
    setMidis(midis);
  };

  const startNextPractice = (score: number) => {
    fetch(`${url}/midis/${midis[currentlyPracticedMidiIndex].id}/results`, {
      method: "POST",
      headers: { authorization: idToken, "content-type": "application/json" },
      body: JSON.stringify({ score })
    });
    if (currentlyPracticedMidiIndex === midis.length - 1) {
      setCurrentlyPracticedMidiIndex(null);
    } else {
      setCurrentlyPracticedMidiIndex(currentlyPracticedMidiIndex + 1);
    }
  };

  const startPracticing = () => {
    setCurrentlyPracticedMidiIndex(0);
  };

  useEffect(() => {
    downloadMidis();
  }, [idToken]);

  async function uploadMidi() {
    const formData = new FormData();
    formData.append("id", fileName);
    formData.append("file", file);
    await fetch(`${url}/midis`, {
      method: "POST",
      body: formData,
      headers: { authorization: idToken }
    });
    downloadMidis();
  }

  return (
    <AuthContext.Provider value={{ idToken }}>
      {idToken ? (
        currentlyPracticedMidiIndex !== null ? (
          <div className="App__container">
            <Practice
              key={currentlyPracticedMidiIndex}
              midi={midis[currentlyPracticedMidiIndex]}
              onPracticeEnd={startNextPractice}
            />
          </div>
        ) : (
          <div>
            <ul>
              {midis.map(midi => (
                <li>
                  {`${midi.id} `}
                  {midi.results[0]
                    ? `Last Score: ${midi.results[0].score}`
                    : "No score"}
                </li>
              ))}
            </ul>
            <input
              value={fileName}
              onChange={e => setFileName(e.target.value)}
            />
            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <button onClick={() => uploadMidi()}>UPLOAD</button>
            <button onClick={startPracticing}>START PRACTICE</button>
          </div>
        )
      ) : (
        <GoogleLogin
            className="Login__button"
          clientId="992982463904-4f09pjlv8rglfgsgle2640bugqvs29h8.apps.googleusercontent.com"
          buttonText="Login"
          onSuccess={(response: GoogleLoginResponse) => {
            setIdToken(response.getAuthResponse().id_token);
          }}
          onFailure={console.error}
          cookiePolicy={"single_host_origin"}
        />
      )}
    </AuthContext.Provider>
  );
}

export default App;
