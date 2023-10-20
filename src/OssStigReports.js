import React, { useEffect, useState } from 'react';
import { useAuth } from 'oidc-react';
import './App.css';
import { CSVLink } from 'react-csv';
import Papa from 'papaparse';
import * as GenerateReport from './reports/GenerateReport.js';



function OssStigReports() {

  const auth = useAuth();
  const idToken = auth.userData?.id_token;
  console.log(idToken);

  const [apiResponse, setApiResponse] = useState([]);
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

  const enableShowData = () => {
    setShowData(true);
  }

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (report === '') {
      alert('Please select a report to generate.');
      return;
    }

    await callAPI(auth, report, emassNums).then((data) => {
      setApiResponse(data);
      setFileData(data);
      setShowData(true);
    })
    // alert('Number of rows returned' + rows.length);

    // if (rows.length > 0) {
    //   alert('Report is ready to save. Use the "Download report" link below to save the report.');
    // }

  }

  const getKeys = () => {

    jsonData = Papa.parse(apiResponse, { header: true });
    console.log('jsonData: ' + jsonData.data);

    var keys = jsonData.data[0];
    return Object.keys(keys);
  }


  const getHeader = () => {
    var keys = getKeys();
    return keys.map((key, index) => {
      return <th key={key}>{key.toUpperCase()}</th>
    })
  }

  const getRowsData = () => {
    //var items = this.state.apiResponse;
    var items = jsonData.data;
    var keys = getKeys();
    return items.map((row, index) => {
      return <tr key={index}><RenderRow key={index} data={row} keys={keys} /></tr>
    })
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
        </form>
      </div>
    </div >
  );
}

async function callAPI(auth, report, emassNums) {

  //alert('callAPI report: ' + report);

  var rows = await GenerateReport.GenerateReport(auth, report, emassNums);
  alert('calApi number of rows retruned: ' + rows.length);

  return rows;
}

const RenderRow = (props) => {
  return props.keys.map((key, index) => {
    return <td key={props.data[key]}>{props.data[key]}</td>
  })
}


export default OssStigReports;