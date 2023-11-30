import * as assetsByCollectionsReport from './assetsByCollectionsReport.js';
import * as statusReport from './statusReport.js';
import * as assetCountReport from './assetCountReport.js';
import * as saReport from './saReport.js';
import * as assetCountReportByEmass from './assetCountReportByEmass.js';
import * as saReportWithMetricsAndVersions from './saReportWithMetricsAndVersions.js';
import * as stigBenchmarkByResults from './stigBenchmarkByResults.js';
import * as exportSaReportsByAsset from './exportSaReportByAsset.js';

async function GenerateReport(auth, selection, inEmassNums) {


    var rows = [];

    var emassNums = "";
    // remove whitespace from the eMASS string
    if (inEmassNums && inEmassNums.length > 0){
        emassNums = inEmassNums.replaceAll(' ', '');
    }
    try {
        switch (selection) {
            case '1':
                console.log('Run 1. RMF SAP Report');
                //let tokens = await myTokenUtils.getTokens(oidcBase, client_id, scope);
                rows = await assetsByCollectionsReport.runAssetByCollectionReport(auth, emassNums);
                break;
            case '2':
                console.log('Run 2. STIG Status per Collection');
                rows = await statusReport.runStatusReport(auth, emassNums);
                break;
            case '4':
                console.log('Run 3. Asset Asset Status per Collection');
                rows = await assetCountReport.runAssetCountReport(auth, emassNums);
                break;
            case '5':
                console.log('Run 4. Asset Collection per Primary Owner and System Admin');
                rows = await saReport.runSAReport(auth, emassNums);
                break;
            case '7':
                console.log('Run 5.  Asset Status per eMASS');
                rows = await assetCountReportByEmass.runAssetCountReportByEmass(auth, emassNums);
                break;
            case '8':
                console.log('Run 6. STIG Deltas per Primary Owner and System Admin');
                rows = await saReportWithMetricsAndVersions.runSAReportWithMetricsAndVersions(auth, emassNums);
                break;
            case '9':
                // run STIG Benchmark by Results
                console.log('Run 7. STIG Benchmark By Results');
                rows = await stigBenchmarkByResults.runStigBenchmarkByResults(auth, emassNums,);
                break;
            case '10':
                // run STIG Benchmark by Results
                console.log('Run 8. Export Asset Collection per Primary Owner and System Admin');
                rows = await exportSaReportsByAsset.runExportSAReportByAsset(auth, emassNums,);
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