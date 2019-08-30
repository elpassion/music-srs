import React, { useState, useEffect } from "react";
import { GoogleLogin, GoogleLoginResponse } from "react-google-login";
import { Practice } from "./views/Practice";
import "./styles/global.scss";

const AuthContext = React.createContext<{ idToken: string | null }>({
  idToken: null
});

interface Midi {
  id: string;
  data: string;
  userId: string;
  results: Result[];
}

interface Result {
  id: number;
  score: number;
  createdAt: string;
  midiId: string;
}

function App() {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [midis, setMidis] = useState<Midi[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [file, setFile] = useState<any>(null);
  const [isPracticing, setIsPracticing] = useState(false);

  const downloadMidis = async () => {
    if (!idToken) return;
    const response = await fetch("http://localhost:9090/midis", {
      headers: { authorization: idToken }
    });
    if (response.status !== 200) return;
    const midis = await response.json();
    setMidis(midis);
  };

  useEffect(() => {
    downloadMidis();
  }, [idToken]);

  async function uploadMidi() {
    const formData = new FormData();
    formData.append("id", fileName);
    formData.append("file", file);
    await fetch("http://localhost:9090/midis", {
      method: "POST",
      body: formData,
      headers: { authorization: idToken }
    });
    downloadMidis();
  }

  return (
    <AuthContext.Provider value={{ idToken }}>
      {idToken ? (
        isPracticing ? (
          <div className="App__container">
            <Practice midis={midis} />
          </div>
        ) : (
          <div>
            <ul>
              {midis.map(midi => (
                <li>
                  {midi.id}:{" "}
                  {midi.results[0] ? midi.results[0].score : "No score"}
                </li>
              ))}
            </ul>
            <input
              value={fileName}
              onChange={e => setFileName(e.target.value)}
            />
            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <button onClick={() => uploadMidi()}>UPLOAD</button>
          </div>
        )
      ) : (
        <GoogleLogin
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
