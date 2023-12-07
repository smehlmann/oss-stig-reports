import React, { useEffect, useState } from 'react';
import { useAuth } from 'oidc-react';
import { useSelector, useDispatch } from 'react-redux';
import './App.css';
import { CSVLink } from 'react-csv';
import ClipLoader from "react-spinners/ClipLoader";
import * as GenerateReport from './reports/GenerateReport.js';
import ReportColumns from './components/ReportColumns';



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

  /*===============================================================*/

  const [apiResponse, setApiResponse] = useState([]);
  const [fileData, setFileData] = useState('');
  const [report, setReport] = useState('');
  const [emassNums, setEmassNums] = useState('');
  const [showEmassNum, setShowEmassNums] = useState(false);
  const [showData, setShowData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [disableNewReport, setDisableNewReport] = useState(false);

  var jsonData = null;


  // this function will be called when a radio button is checked
  const onRadioChange = (e) => {
    setReport(e.target.value);
    setShowEmassNums(true);
  }

  const updateEmass = (event) => {
    // 👇 Get input value from "event"
    setEmassNums(event.target.value);
  };

  const newReport = (e) => {

    window.location.reload();
  }

  const cancelReport = (e) => {

    window.location.reload();
  }

  const enableShowData = () => {
    setShowData(true);
  }

  const handleSubmit = async (e) => {


    e.preventDefault();

    if (report === '') {
      alert('Please select a report to generate.');
      return;
    }

    if (isButtonDisabled === true) {
      return;
    }

    setLoading(true);
    setButtonDisabled(true);
    setDisableNewReport(true);

    await callAPI(auth, report, emassNums).then((data) => {
      setApiResponse(data);
      setFileData(data);
      setShowData(true);
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
              <span>6. STIG Deltas per Primary Owner and System Admin</span>
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
              <span>7. STIG Benchmark By Results</span>
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
            <br /><br />{showEmassNum && (
              <div id='emassDiv'>
                <label htmlFor="emassNumsText">Optional: Enter EMASS Numbers separated by commas: </label>
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
            <button className="submit-btn" type="submit" disabled={isButtonDisabled}>Run Report</button>
            <button className="cancel-report-btn" type='reset' onClick={cancelReport} disabled={false}>Canecl Report</button>
            <button className="new-report-btn" type='reset' onClick={newReport} disabled={disableNewReport}>New Report</button>
            <br /><br />
            {showData && (
              <div id='tableDiv'>
                <div id="csv-ink-div">
                  <CSVLink
                    data={fileData}
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

async function callAPI(auth, report, emassNums) {

  //alert('callAPI report: ' + report);

  var rows = await GenerateReport.GenerateReport(auth, report, emassNums);
  //alert('calApi number of rows retruned: ' + rows.length);

  return rows;
}

const RenderRow = (props) => {
  return props.keys.map((key, index) => {
    return <td key={props.data[key]}>{props.data[key]}</td>
  })
}

export default OssStigReports;