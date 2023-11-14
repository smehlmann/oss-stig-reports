import * as assetsByCollectionsReport from './assetsByCollectionsReport.js';
import * as statusReport from './statusReport.js';
import * as assetCountReport from './assetCountReport.js';
import * as saReport from './saReport.js';
import * as assetCountReportByEmass from './assetCountReportByEmass.js';
import * as saReportWithMetricsAndVersions from './saReportWithMetricsAndVersions.js';
import * as stigBenchmarkByResults from './stigBenchmarkByResults.js'

async function GenerateReport(auth, selection, emassNums) {


    var rows = [];
    try {
        switch (selection) {
            case '1':
                console.log('Run  RMF SAP Report');
                //let tokens = await myTokenUtils.getTokens(oidcBase, client_id, scope);
                rows = await assetsByCollectionsReport.runAssetByCollectionReport(auth, emassNums);
                break;
            case '2':
                console.log('Run STIG Status per Collectiont');
                rows = await statusReport.runStatusReport(auth, emassNums);
                break;
            case '4':
                console.log('Run Asset Count Report');
                rows = await assetCountReport.runAssetCountReport(auth, emassNums);
                break;
            case '5':
                console.log('Run SA Report by Asset');
                rows = await saReport.runSAReport(auth, emassNums);
                break;
            case '7':
                console.log('Run SA Report by Asset');
                rows = await assetCountReportByEmass.runAssetCountReportByEmass(auth, emassNums);
                break;
            case '8':
                console.log('Run SAReport with Metrics and STIG Benchmark Revisions');
                rows = await saReportWithMetricsAndVersions.runSAReportWithMetricsAndVersions(auth, emassNums);
                break;
            case '9':
                // run STIG Benchmark by Results
                console.log('Run STIG Benchmark by Results');
                rows = await stigBenchmarkByResults.runStigBenchmarkByResults(auth, emassNums,);
                break;
            default:
                alert('You must provide a valid report option.');
        }

        return rows;
    }
    catch (e) {
        console.log(e.message);
    }
}

export { GenerateReport }