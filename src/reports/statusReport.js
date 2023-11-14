import * as reportGetters from './reportGetters.js';
import * as reportUtils from './reportUtils.js';

async function runStatusReport(auth, emassNums) {

    try {

        //console.log(`runStatusReport: Requesting STIG Manager Collections`);
        console.log(`runStatusReport: Requesting STIG Manager Data`);
        var collections = [];
        var tempCollections = [];

        tempCollections = await reportGetters.getCollections(auth);
        if (!emassNums || emassNums.length === 0) {
            //collections = tempCollections;
            for (var i = 0; i < tempCollections.data.length; i++) {
                collections.push(tempCollections.data[i])
            }
        }
        else {
            var emassMap = reportUtils.getCollectionsByEmassNumber(tempCollections);
            var emassArray = emassNums.split(',');
            for (var mapIdx = 0; mapIdx < emassArray.length; mapIdx++) {
                if (emassMap.has(emassArray[mapIdx])) {

                    var mappedCollection = emassMap.get(emassArray[mapIdx]);
                    if (mappedCollection) {
                        collections = collections.concat(mappedCollection);
                    }
                }
            }
        }
        

        //var assets = [];
        var metrics = [];
        //var findings = [];
        var stigs = [];

        var rows = [
            {
                collectionName: 'Collection',
                sumOfStigs: 'Sum of STIGs',
                sumOfChecks: 'Sum of Checks',
                avgAssessed: 'Average of Assessed',
                avgSubmitted: 'Average of Submitted',
                avgAccepted: 'Average of Accepted',
                avgRejected: 'Average of Rejected',
                sumOfCat3: 'Sum of CAT3',
                sumOfCat2: 'Sum of CAT2',
                sumOfCat1: 'Sum of CAT1'
            }

        ];

        for (var iColl = 0; iColl < collections.length; iColl++) {
            var collectionName = collections[iColl].name;

            if(!collectionName.startsWith('NP_C')) {
                continue;
            }

            stigs.length = 0;
            stigs = await reportGetters.getStigs(auth, collections[iColl].collectionId);
            //console.log(stigs);

            metrics.length = 0;
            metrics = await reportGetters.getCollectionMertics(auth, collections[iColl].collectionId);

            var myData = getRow(collectionName, stigs, metrics);
            rows.push(myData);
        }

        return rows;
    }
    catch (e) {
        console.log(e);
        throw(e);
    }
}

function getRow(collectionName, stigs, metrics) {

    const sumOfStigs = metrics.data.stigs;
    var numSubmitted = 0;
    var numAccepted = 0;
    var numRejected = 0;

    // get metrics data
    const numAssessments = metrics.data.metrics.assessments;
    const numAssessed = metrics.data.metrics.assessed;
    numSubmitted = metrics.data.metrics.statuses.submitted.total;
    numAccepted = metrics.data.metrics.statuses.accepted.total;
    numRejected = metrics.data.metrics.statuses.rejected.total;

    const totalChecks = numAssessments;

    var avgAssessed = Math.round(numAssessments ? (numAssessed / numAssessments) * 100 : 0);
    var avgSubmitted = Math.round(numAssessments ? ((numSubmitted + numAccepted + numRejected) / numAssessments) * 100 : 0);
    var avgAccepted = Math.round(numAssessments ? ((numAccepted) / numAssessments) * 100 : 0);
    var avgRejected = Math.round(numAssessments ? ((numRejected) / numAssessments) * 100 : 0);

    const sumOfCat3 = metrics.data.metrics.findings.low;
    const sumOfCat2 = metrics.data.metrics.findings.medium;
    const sumOfCat1 = metrics.data.metrics.findings.high;

    var rowData = {
        collectionName: collectionName,
        sumOfStigs: sumOfStigs,
        sumOfChecks: totalChecks,
        avgAssessed: avgAssessed + "%",
        avgSubmitted: avgSubmitted + "%",
        avgAccepted: avgAccepted + "%",
        avgRejected: avgRejected + "%",
        sumOfCat3: sumOfCat3,
        sumOfCat2: sumOfCat2,
        sumOfCat1: sumOfCat1
    }

    return rowData
}

export { runStatusReport };