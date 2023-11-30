import React from 'react'
import { AuthProvider } from 'oidc-react'
//import ManageToken from './ManageToken'
import OssStigReports from './OssStigReports';
import { Provider } from 'react-redux';
import store from './store/index.js';


// main app component
function App() {
  return (
    <div>
      <AuthProvider
        authority={process.env.REACT_APP_AUTH_CONNECT_URL}
        clientId={process.env.REACT_APP_CLIENT_ID}
        redirectUri={process.env.REACT_APP_REDIRECT_URI}
        silentRedirectUri={process.env.REACT_APP_SILENT_REDIRECT_URI}
        scope={process.env.REACT_APP_AUTH_SCOPE}
        responseType={process.env.REACT_APP_RESPONSE_TYPE}
        postLogoutRedirectUri={process.env.REACT_APP_REDIRECT_URI}
        automaticSilentRenew={true}
      >
        <Provider store={store}>
          <OssStigReports />
        </Provider>
      </AuthProvider>

    </div>
  )
}

export default App;
