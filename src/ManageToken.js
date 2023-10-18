import React, { useEffect, useState } from 'react'
import { useAuth } from 'oidc-react'

// example code displaying how our access token config will work and flow 
function ManageToken() {
  // calling authenicator
  const auth = useAuth()

  // getting access token, id token, refresh token, and expiration time
  const accessToken = auth.userData?.access_token
  const idToken = auth.userData?.id_token
  const refreshToken = auth.userData?.refresh_token
  const expiresIn = auth.userData?.expires_in
  // calculate the expiration date/time
  const expDate = auth.userData?.expires_at
    ? new Date(auth.userData.expires_at * 1000)
    : null

  //const [accessTokenId, setAccessTokenId] = useState(accessToken);

  // setting remaining time
  const [remainingTime, setRemainingTime] = useState(expiresIn)

  // reducing remaining time by 1 second every second
  useEffect(() => {
    // Set initial value
    setRemainingTime(expiresIn)

    // Update every second
    const intervalId = setInterval(() => {
      setRemainingTime(prev => (prev > 0 ? prev - 1 : 0)); // Prevent negative values
    }, 1000)

    // Clear interval when component unmounts
    return () => clearInterval(intervalId)
  }, [expiresIn])

  // event handler for token expiring
  const handleTokenExpiring = () => {
    console.log('Access token expiring event fired');
    //alert('Access token expiring event fired');
    console.log(auth.userData);
    //setAccessTokenId(auth.userData?.access_token);
  };

  // adding event listener for token expiring from oidc-react 
  useEffect(() => {
    const userManager = auth.userManager;

    if (userManager) {
      userManager.events.addAccessTokenExpiring(handleTokenExpiring);

      // Remove event listener with the exact function that was added
      return () => {
        userManager.events.removeAccessTokenExpiring(handleTokenExpiring);
      };
    }
  }, [auth, handleTokenExpiring]);

  // formatting token to be shorter and easier to read
  const formatToken = token => {
    if (!token) return null
    const start = token.substring(0, 8)
    const end = token.substring(token.length - 8)
    return `${start}...${end}`
  }

  // error handling for if auth is null/undefined or userData doesn't exist
  if (!auth || !auth.userData) {
    // Handle the situation where auth is null/undefined or userData doesn't exist
    return;
  }

  return;
}

export default ManageToken
