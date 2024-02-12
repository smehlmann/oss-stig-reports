import * as reportGetters from './reportGetters.js';
import * as reportUtils from './reportUtils.js';

async function runSAReportByAsset(auth, emassNums, collections, emassMap) {

    try {

        //console.log(collections);
        //const collections = await reportGetters.getCollectionByName(auth, collectionName);

        var metrics = [];
        var labels = [];
        let labelMap = new Map();

        var rows = [];
        /*var rows = [
            {
                datePulled: 'Date Pulled',
                code: 'Code',
                shortName: 'Short Name',
                collectionName: 'Collection',
                asset: 'Asset',
                deviveType: 'Device-Asset',
                primOwner: 'Primary Owner',
                sysAdmin: 'Sys Admin',                
                rmfAction: "RMF Action",
                isso: "ISSO",
                ccbSAActions: 'CCB_SA_Actions',
                other: "OTHER",
                lastTouched: 'Last Touched',
                stigs: 'STIGs',
                benchmarks: 'Benchmarks',
                assessed: 'Assessed',
                submitted: 'Submitted',
                accepted: 'Accepted',
                rejected: 'Rejected',
                cat3: 'CAT3',
                cat2: 'CAT2',
                cat1: 'CAT1'
            }
        ];*/

        var today = new Date();
        var todayStr = today.toISOString().substring(0, 10);

        for (var i = 0; i < collections.length; i++) {
            var collectionName = collections[i].name;
            console.log('runSAReportByAsset collectionName: ' + collectionName);

            if (!collectionName.startsWith('NP_C')) {
                continue;
            }


            //console.log(collectionName);
            labelMap.clear();
            labels.length = 0;

            labels = await reportGetters.getLabelsByCollection(auth, collections[i].collectionId);
            for (var x = 0; x < labels.data.length; x++) {
                labelMap.set(labels.data[x].labelId, labels.data[x].description);
            }

            metrics = await reportGetters.getCollectionMerticsAggreatedByAsset(auth, collections[i].collectionId);
            //console.log(metrics);

            for (var jMetrics = 0; jMetrics < metrics.data.length; jMetrics++) {
                var myData = getRow(todayStr, collections[i], metrics.data[jMetrics], labelMap);
                rows.push(myData);

            }
        }
    }
    catch (e) {
        console.log(e)
    }

    return rows;
}

function getRow(todayStr, collection, metrics, labelMap) {

    var collectionName = collection.name;
    var code = collection.metadata.Code;
    var shortName = collection.metadata.ShortName;

    const numAssessments = metrics.metrics.assessments;
    const numAssessed = metrics.metrics.assessed;
    const numSubmitted = metrics.metrics.statuses.submitted;
    const numAccepted = metrics.metrics.statuses.accepted;
    const numRejected = metrics.metrics.statuses.rejected;

    var maxTouchTs = metrics.metrics.maxTouchTs;
    var touchDate = new Date(maxTouchTs);
    var today = new Date();
    var timeDiff = today - touchDate;
    var diffInHours = timeDiff / (1000 * 3600);
    var diffInDays = timeDiff / (1000 * 3600 * 24);
    var lastTouched = "";

    // set lastTouched to either hours or days
    var touched = "";
    if (diffInDays < 1) {
        touched = Math.round(diffInHours);
        lastTouched = touched + ' h';
    }
    else {
        touched = Math.round(diffInDays);
        lastTouched = touched.toString() + ' d';
    }

    if(collectionName === 'NP_C10-UnclassCore_Servers_1761_Zone A' && (metrics.name === 'NPK8VDIESX29' || metrics.name === 'npa0aznessus01')){
        
        console.log(collectionName + ' ' + metrics.name);
    }

    const collectionMetadata = reportUtils.getMetadata(labelMap, metrics);
    var avgAssessed = 0;
    var avgSubmitted = 0;
    var avgAccepted = 0;
    var avgRejected = 0;
    var temp = 0;

    if (numAssessments) {
        temp = (numAssessed / numAssessments) * 100;
        avgAssessed = temp.toFixed(2);

        temp = ((numSubmitted + numAccepted + numRejected) / numAssessments) * 100;
        avgSubmitted = temp.toFixed(2);

        temp = (numAccepted / numAssessments) * 100;
        avgAccepted = temp.toFixed(2);

        temp = (numRejected / numAssessments) * 100;
        avgRejected = temp.toFixed(2);

    }

    const sumOfCat3 = metrics.metrics.findings.low;
    const sumOfCat2 = metrics.metrics.findings.medium;
    const sumOfCat1 = metrics.metrics.findings.high;

    var benchmarkIDs = metrics.benchmarkIds.toString();
    benchmarkIDs = benchmarkIDs.replaceAll(",", " ");

    var rowData = {
        datePulled: todayStr,
        code: code,
        shortName: shortName,
        collectionName: collectionName,
        asset: metrics.name,
        deviveType: collectionMetadata.device,
        primOwner: collectionMetadata.primOwner,
        sysAdmin: collectionMetadata.sysAdmin,
        rmfAction: collectionMetadata.rmfAction,
        isso: collectionMetadata.isso,
        ccbSAActions: collectionMetadata.ccbSAActions,
        other: collectionMetadata.other,
        lastTouched: lastTouched,
        stigs: metrics.benchmarkIds.length,
        benchmarks: benchmarkIDs,
        assessed: avgAssessed + '%',
        submitted: avgSubmitted + '%',
        accepted: avgAccepted + '%',
        rejected: avgRejected + '%',
        cat3: sumOfCat3,
        cat2: sumOfCat2,
        cat1: sumOfCat1
    }

    return rowData;

}

export { runSAReportByAsset };