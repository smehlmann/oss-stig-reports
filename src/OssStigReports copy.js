import React, { useEffect, useState } from 'react';
import { useAuth } from 'oidc-react';
import './App.css';
import { CSVLink } from 'react-csv';
import Papa from 'papaparse';
import ClipLoader from "react-spinners/ClipLoader";
import * as GenerateReport from './reports/GenerateReport.js';



function OssStigReports() {

  var auth = useAuth();
  const idToken = auth.userData?.id_token;
  // console.log(idToken);

  /*===============================================================*/
  /* Logic for refreshing token before it expires */
  /*===============================================================*/
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
  const [disabled, setDisabled] = useState(true);
  const [fileName, setFileName] = useState('');
  const [output, setOutput] = useState('');
  const [emassNums, setEmassNums] = useState('');
  const [showEmassNum, setShowEmassNums] = useState(false);
  const [showData, setShowData] = useState(false);
  const [loading, setLoading] = useState(false);

  var jsonData = null;


  // this function will be called when a radio button is checked
  const onRadioChange = (e) => {
    setReport(e.target.value);
    setShowEmassNums(true);
    //accessToken = auth.userData?.access_token;
    //accessTokenId = auth.userData?.id_token;
    //alert('token ID: ' + accessTokenId);
  }

  const updateEmass = (event) => {
    // 👇 Get input value from "event"
    setEmassNums(event.target.value);
  };

  const newReport = (e) => {
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

    setLoading(true);

    await callAPI(auth, report, emassNums).then((data) => {
      setApiResponse(data);
      setFileData(data);
      setShowData(true);
    })
    setLoading(false);
    // alert('Number of rows returned' + rows.length);

    // if (rows.length > 0) {
    //   alert('Report is ready to save. Use the "Download report" link below to save the report.');
    // }

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
              />
              <span>7. Stig Benchmark By Results</span>
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="10"
                checked={report === "10"}
                onChange={onRadioChange}
              />
              <span>8. Export Asset Collection per Primary Owner and System Admin</span>
            </label>
            <br /><br />{showEmassNum && (
              <div id='emassDiv'>
                <label htmlFor="emassNumsText">Optional: Enter EMASS Numbers: </label>
                <input
                  id='emassNumsText'
                  type='text'
                  value={emassNums}
                  onChange={updateEmass}
                />
              </div>
            )}
            <br />
            <button className="submit-btn" type="submit">Run Report</button>
            <button className="new-report-btn" type='reset' onClick={newReport}>New Report</button>
            <br /><br />
            {showData && report == '1' && (
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
                        <tr key={index}>
                          <td>
                            {item.emass}
                          </td>
                          <td>
                            {item.collection}
                          </td>
                          <td>
                            {item.benchmark}
                          </td>
                          <td>
                            {item.stigVersion}
                          </td>
                          <td>
                            {item.assetNames}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {showData && report == '9' && (
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
                        <tr key={index}>
                          <td>
                            {item.emass}
                          </td>
                          <td>
                            {item.collectionName}
                          </td>
                          <td>
                            {item.benchmark}
                          </td>
                          <td>
                            {item.latestRev}
                          </td>
                          <td>
                            {item.prevRev}
                          </td>
                          <td>
                            {item.quarterVer}
                          </td>
                          <td>
                            {item.groupId}
                          </td>
                          <td>
                            {item.asset}
                          </td>
                          <td>
                            {item.Result}
                          </td>
                          <td>
                            {item.detail}
                          </td>
                          <td>
                            {item.comment}
                          </td>
                          <td>
                            {item.status}
                          </td>
                        </tr>
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