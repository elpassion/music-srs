import React, { useState } from "react";
import { GoogleLogin, GoogleLoginResponse } from "react-google-login";
import { Practice } from "./views/Practice";
import "./styles/global.scss";

const AuthContext = React.createContext<{ idToken: string | null }>({
  idToken: null
});

function App() {
  const [idToken, setIdToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ idToken }}>
      {idToken ? (
        <div className="App__container">
          <Practice />
        </div>
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
