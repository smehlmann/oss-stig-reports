import React, { useState } from 'react';
import { useAuth } from 'oidc-react';
import './App.css';
//import { CSVLink } from 'react-csv';
//import { usePapaParse } from 'react-papaparse';
//import Papa from 'papaparse';
import * as GenerateReport from './reports/GenerateReport.js';



function OssStigReports() {

  const auth = useAuth();
  const idToken = auth.userData?.id_token;
  console.log(idToken);

  const [apiResponse, setApiResponse] = useState('');
  const [fileData, setFileData] = useState('');
  const [report, setReport] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [fileName, setFileName] = useState('');
  const [output, setOutput] = useState('');
  const [emassNums, setEmassNums] = useState('');
  const [showEmassNum, setShowEmassNums] = useState(false);
  const [showData, setShowData] = useState(false);

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

  const handleSubmit = (e) => {
    
    e.preventDefault();

    if (report.length === 0) {
      alert('Please select a report to generate.');
      return;
    }

    if (report.length > 0) {

      callAPI(auth, report, emassNums);

    }
  }

  return (
    <div id='banner'>
      <div className="App">
        <div id="banner-content">
          UNCLASSIFIED (U)
        </div>
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
        </form>
      </div>
    </div >
  );
}

async function callAPI(auth, report, emassNums) {

  //alert('callAPI report: ' + report);

  var rows = await GenerateReport.GenerateReport(auth, report, emassNums);

  return rows;

}

export default OssStigReports;