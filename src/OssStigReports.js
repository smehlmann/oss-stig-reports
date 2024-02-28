import React, { useEffect, useState } from 'react';
import { useAuth } from 'oidc-react';
import { useDispatch } from 'react-redux';
import './App.css';
import { CSVLink } from 'react-csv';
import ClipLoader from "react-spinners/ClipLoader";
import * as GenerateReport from './reports/GenerateReport.js';
import ReportColumns from './components/ReportColumns';
//import $ from 'jquery';
import { getAuth } from './store/index.js';
import axios from 'axios';
import * as reportUtils from './reports/reportUtils.js';



function OssStigReports() {

  var auth = useAuth();
  const idToken = auth.userData?.id_token;
  // console.log(idToken);

  /*===============================================================*/
  /* Logic for refreshing token before it expires */
  /*===============================================================*/
  const dispatch = useDispatch();
  // set the new auth value in the data store
  dispatch({ type: 'refresh', auth: auth });

  const expiresIn = auth.userData?.expires_in
  // calculate the expiration date/time
  const expDate = auth.userData?.expires_at
    ? new Date(auth.userData.expires_at * 1000)
    : null

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
    console.log(auth.userData);

    // set the new auth value in the data store
    dispatch({ type: 'refresh', auth: auth });

    extendSession();
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


  /*===============================================================*/

  const [apiResponse, setApiResponse] = useState([]);
  const [fileData, setFileData] = useState('');
  const [headers, setHeaders] = useState('');
  const [report, setReport] = useState('');
  const [emassNums, setEmassNums] = useState('');
  const [showEmassNum, setShowEmassNums] = useState(false);
  const [showNumDaysOver, setShowNumDaysOver] = useState(false);
  const [numDaysOver, setNumDaysOver] = useState('360');
  const [showData, setShowData] = useState(false);
  const [showNoDataFound, setShowNoDataFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [disableNewReport, setDisableNewReport] = useState(false);

  var jsonData = null;


  // this function will be called when a radio button is checked
  const onRadioChange = (e) => {
    setReport(e.target.value);
    setShowEmassNums(true);
    if (e.target.value === '11') {
      setShowNumDaysOver(true);
    }
  }

  const updateEmass = (event) => {
    // 👇 Get input value from "event"
    setEmassNums(event.target.value);
  };

  const updateNumDaysOver = (event) => {
    // 👇 Get input value from "event"
    setNumDaysOver(event.target.value);
  };

  const newReport = (e) => {

    window.location.reload();
  }

  const cancelReport = (e) => {

    window.location.reload();
  }

  const handleSubmit = async (e) => {


    if (isButtonDisabled === true) {
      return;
    }

    e.preventDefault();

    if (report === '') {
      alert('Please select a report to generate.');
      return;
    }

    if ((report === '11' || report === '8' || report === '9') && emassNums === '') {
      alert('You must enter EMASS number(s)');
      return;
    }

    if (report === '11' && numDaysOver === '') {
      alert('You must enter the number of days over.');
      return;
    }

    setLoading(true);
    setButtonDisabled(true);
    setDisableNewReport(true);

    await callAPI(auth, report, emassNums, numDaysOver).then((data) => {

      if (data && data.rows.length > 0) {
        var mergedData = reportUtils.mergeHeadersAndData(data);
        //setApiResponse(data.rows);
        setApiResponse(mergedData);
        setFileData(data.rows);
        setHeaders(data.headers);
        setShowData(true);
      }
      else {
        setShowNoDataFound(true);
      }
    });

    setLoading(false);
    setButtonDisabled(true);
    setDisableNewReport(false);

  }

  // error handling for if auth is null/undefined or userData doesn't exist
  if (auth && auth.userData) {
    return (
      <div id='banner'>
        <div className="App">
          <div id="banner-content">
            UNCLASSIFIED (U)
          </div>
        </div>

        <div id="mySpinner">
          <ClipLoader
            loading={loading}
            size={150}
            aria-label="Generating Report"
            data-testid="loader"
          />
        </div>

        <div className="title-div">
          <strong className="title">Select Report</strong>
        </div>
        <div className="radio-btn-container-div">
          <form onSubmit={handleSubmit}>
            <label>
              <input
                type="radio"
                value="1"
                checked={report === "1"}
                onChange={onRadioChange}
                disabled={isButtonDisabled}
              />
              <span>1. RMF SAP Report</span>
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="2"
                checked={report === "2"}
                onChange={onRadioChange}
                disabled={isButtonDisabled}
              />
              <span>2. STIG Status per Collection</span>
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="4"
                checked={report === "4"}
                onChange={onRadioChange}
                disabled={isButtonDisabled}
              />
              <span>3. Asset Status per Collection</span>
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="5"
                checked={report === "5"}
                onChange={onRadioChange}
                disabled={isButtonDisabled}
              />
              <span>4. Asset Collection per Primary Owner and System Admin</span>
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="7"
                checked={report === "7"}
                onChange={onRadioChange}
                disabled={isButtonDisabled}
              />
              <span>5. Asset Status per eMASS</span>
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="8"
                checked={report === "8"}
                onChange={onRadioChange}
                disabled={isButtonDisabled}
              />
              <span>6. STIG Deltas per Primary Owner and System Admin (EMASS number(s) required)</span>
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="9"
                checked={report === "9"}
                onChange={onRadioChange}
                disabled={isButtonDisabled}
              />
              <span>7. STIG Benchmark By Results (EMASS number(s) required)</span>
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="10"
                checked={report === "10"}
                onChange={onRadioChange}
                disabled={isButtonDisabled}
              />
              <span>8. Export Asset Collection per Primary Owner and System Admin</span>
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="11"
                checked={report === "11"}
                onChange={onRadioChange}
                disabled={isButtonDisabled}
              />
              <span>9. Checklist Over 356 Days (EMASS number(s) required)</span>
            </label>
            <br /><br />
            {showEmassNum && (
              <div id='emassDiv'>
                <label htmlFor="emassNumsText">Optional for reports 1-5 and 8. Required for reports 6, 7 and 9.<br/> Enter EMASS Number(s) separated by commas: </label>
                <input
                  id='emassNumsText'
                  type='text'
                  value={emassNums}
                  onChange={updateEmass}
                  disabled={isButtonDisabled}
                />
              </div>
            )}
            <br />
            {showNumDaysOver && (
              <div>
                <label htmlFor="emassNumsText">Enter number of days over: </label>
                <input
                  id='numDaysText'
                  type='number'
                  value={numDaysOver}
                  onChange={updateNumDaysOver}
                  disabled={isButtonDisabled}
                />
              </div>
            )}
            <br />
            <button className="submit-btn" type="submit" disabled={isButtonDisabled}>Run Report</button>
            <button className="cancel-report-btn" type='reset' onClick={cancelReport} disabled={false}>Canecl Report</button>
            <button className="new-report-btn" type='reset' onClick={newReport} disabled={disableNewReport}>New Report</button>
            <br /><br />
            {showNoDataFound && (
              <div className="title-div">
                <strong className="title">No data matching your selection found.</strong>
              </div>
            )}
            {showData && (
              <div id='tableDiv'>
                <div id="csv-ink-div">
                  <CSVLink
                    data={fileData}
                    headers={headers}
                    onClick={() => {
                      //window.location.reload();
                    }}
                  >Export report to CSV file.</CSVLink>
                </div>
                <br /><br />
                <div>
                  <table>
                    <tbody>
                      {apiResponse.map((item, index) => (
                        <ReportColumns index={index} item={item} selectedReport={report} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </form>
        </div>
      </div >
    );
  }
}

async function callAPI(auth, report, emassNums, numDaysOver) {

  //alert('callAPI report: ' + report);

  var rows = await GenerateReport.GenerateReport(auth, report, emassNums, numDaysOver);
  //alert('calApi number of rows retruned: ' + rows.length);

  return rows;
}

async function extendSession() {

  try {

    var storedAuth = getAuth();

    // got error Access to XMLHttpRequest at 'https://npc2ismsdev01.nren.navy.mil/stigmanossreports/logo192.png' from origin 
    // 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
    // No 'Access-Control-Allow-Origin' header is present on the requested resource.
    // Referrer Policy: strict-origin-when-cross-origin
    var accessToken = storedAuth.userData?.access_token;
    var myUrl = 'https://npc2ismsdev01.nren.navy.mil/stigmanossreports/logo192.png';
    /*
        var resp = await axios
          .head(myUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
    
        return resp;
    */

    /*
        const headers = { 'Authorization': `Bearer ${accessToken}` }
    
        await fetch(myUrl,
          {
            method: "HEAD",
            mode: 'cors',
            Authorization: `Bearer ${accessToken}`
          })
          .then((response) => {
            if (response.status === 200) {
              console.log('success');
            } else {
              console.log('error');
            }
          })
          .catch((error) => {
            console.log('network error: ' + error);
          });    
    */

    var resp = await axios.get(myUrl, {
      responseType: 'blob',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
        Authorization: `Bearer ${accessToken}`
      }
    });

    //alert('returning resp')
    return resp;

    // got a 404 return status
    /*await $.ajax({
      type: 'HEAD',
      url: 'https://npc2ismsdev01.nren.navy.mil/stigmanossreports/logo192.png',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      success: function () {
        console.log('File exists');
      },
      error: function () {
        console.log('File does not exist');
      }
    });*/

  }
  catch (e) {
    console.log(e.message);
    console.log(e);
  }

  /*await $.ajax({
    type: 'HEAD',
    url: 'https://npc2ismsdev01.nren.navy.mil/stigmanossreports/logo192.png',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    success: function () {
      console.log('File exists');
    },
    error: function () {
      console.log('File does not exist');
    }
  });
}
catch (e) {
  console.log(e.message);
}*/

}

export default OssStigReports;