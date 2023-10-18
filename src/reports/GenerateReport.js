import * as assetsByCollectionsReport from './assetsByCollectionsReport.js';

async function GenerateReport(auth, selection, emassNums) {

    //alert('In GenerateReports selection: ' + selection);
    //alert('In GenerateReports auth: ' + auth);

    // getting access token, id token, refresh token, and expiration time
    //const accessToken = auth.userData?.access_token;
    //const idToken = auth.userData?.id_token
    var rows = [];
    try {
        if (selection === '1') {
            console.log('Run Assets by Collection');
            //let tokens = await myTokenUtils.getTokens(oidcBase, client_id, scope);
            rows = await assetsByCollectionsReport.runAssetByCollectionReport(auth, emassNums);
            return rows;
        }
        else if (selection === 2) {
            console.log('Run Status Report');
            // let tokens = await myTokenUtils.getTokens(oidcBase, client_id, scope);
            //rows = await statusReport.runStatusReport(myTokenUtils, emassNums);
            //return rows;
        }
        else if (selection === 3) {
            console.log('Run Asset Count Report');
            //let tokens = await myTokenUtils.getTokens(oidcBase, client_id, scope);
            //rows = await assetCountReport.runAssetCountReport(myTokenUtils, emassNums);
            //return rows;
        }
        else if (selection === 4) {
            console.log('Run SA Report');
            //let tokens = await myTokenUtils.getTokens(oidcBase, client_id, scope);
            //rows = await saReport.runSAReport(myTokenUtils, emassNums);
            //return rows;
        }
        else if (selection === 5) {
            //console.log('Run SA Report by Asset')
            //let tokens = await myTokenUtils.getTokens(oidcBase, client_id, scope);
            //rows = await saReportByAsset.runSAReportByAsset(myTokenUtils, emassNums);
            //return rows;
        }
        else if (selection === 6) {
            console.log('Run Asset Count Report by EMASS Number')
            // let tokens = await myTokenUtils.getTokens(oidcBase, client_id, scope);
            //rows = await assetCountReportByEmass.runAssetCountReportByEmass(myTokenUtils, emassNums);
            //return rows;
        }
        else if (selection === 7) {
            console.log('Run SAReport by Label and EMASS');
            //let tokens = await myTokenUtils.getTokens(oidcBase, client_id, scope);
            //rows = await saReportByLabelAndEmass.runSAReportByLabelAndEmass(myTokenUtils, emassNums);
            //return rows;
        }
        else if (selection === 8) {
            console.log('Run SAReport with Metrics and STIG Benchmark Revisions');
            //let tokens = await myTokenUtils.getTokens(oidcBase, client_id, scope);
            //rows = await saReportWithMetricsAndVersions.runSAReportWithMetricsAndVersions(myTokenUtils, emassNums);
            // return rows;
        }
        else if (selection === 9) {
            // run STIG Benchmark by Results
            console.log('Run STIG Benchmark by Results');
            //let tokens = await myTokenUtils.getTokens(oidcBase, client_id, scope);
            //rows = await stigBenchmarkByResults.runStigBenchmarkByResults(myTokenUtils, emassNums,);
            //return rows;
        }
        else if (selection === 10) {
            // run STIG Benchmark by Results
            console.log('Run Export SA Report by Asset');
            //let tokens = await myTokenUtils.getTokens(oidcBase, client_id, scope);
            //rows = await exportSaReportByAsset.runExportSAReportByAsset(myTokenUtils, emassNums,);
            //return rows;
        }
        else {
            console.log('You must provide a valid report option.');
        }

        return rows;
    }
    catch (e) {
        console.log(e.message);
    }
}

export { GenerateReport }