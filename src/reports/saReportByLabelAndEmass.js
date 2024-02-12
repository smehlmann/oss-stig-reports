import * as reportGetters from './reportGetters.js';
import * as reportUtils from './reportUtils.js';

async function runSAReportByLabelAndEmass(auth, emassNums, collections, emassMap) {

    try {

        //console.log(`runSAReportByLabelAndEmass Requesting STIG Manager Data for collection ` + collectionName);
        var emassMap = reportUtils.filterCollectionsByEmassNumber(collections);
        var acronymMap = reportUtils.getEmassAcronymMap();

        var metrics = [];
        var rows = [];
        /*var rows = [
            {
                emass: 'eMASS Number',
                acronym: 'eMASS Acronym',
                asset: 'Asset',
                assessed: 'Assessed',
                submitted: 'Submitted',
                accepted: 'Accepted',
                rejected: 'Rejected',
                cat3: 'CAT3',
                cat2: 'CAT2',
                cat1: 'CAT1'
            }
        ];*/

        var iKey = 0;
        var iKeyend = emassMap.size;
        var myKeys = emassMap.keys();
        //console.log(myKeys);

        var collectionNames = '';
        while (iKey < iKeyend) {
            var emassNum = myKeys.next().value;
            var myCollections = emassMap.get(emassNum);
            var metricsData = [];

            for (var i = 0; i < myCollections.length; i++) {

                var containsStr = myCollections[i].name.includes('Database/Web');

                if (!containsStr) {
                    metrics = await reportGetters.getCollectionMerticsAggreatedByLabel(
                        auth, myCollections[i].collectionId);
                    //console.log(metrics);
                    metricsData.push(metrics);
                }
            }

            if (metricsData.length > 0) {
                var myData = getRow(emassNum, metricsData, acronymMap);
                rows.push(myData);
            }
            iKey++;
            metricsData.length = 0;
        }

        return rows;
    }
    catch (e) {
        console.log(e);
        throw (e);
    }
}

function getRow(emassNum, metrics, acronymMap) {

    var numAssessments = 0;
    var numAssessed = 0;
    var numSubmitted = 0;
    var numAccepted = 0;
    var numRejected = 0;
    var numAssets = 0;
    var sumOfCat3 = 0;
    var sumOfCat2 = 0;
    var sumOfCat1 = 0;


    for (var i = 0; i < metrics.length; i++) {
        var myMetricsData = metrics[i].data;
        //console.log(myMetricsData);
        var myMetrics;
        for (var j = 0; j < myMetricsData.length; j++) {
            myMetrics = myMetricsData[j].metrics;
            //console.log(myMetrics);

            numAssessments += myMetrics.assessments;
            numAssessed += myMetrics.assessed;
            numSubmitted += myMetrics.statuses.submitted;
            numAccepted += myMetrics.statuses.accepted;
            numRejected += myMetrics.statuses.rejected;
            numAssets += myMetricsData[j].assets;
            sumOfCat3 += myMetrics.findings.low;
            sumOfCat2 += myMetrics.findings.medium;
            sumOfCat1 += myMetrics.findings.high;
        }
    }

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

    var emassAcronym = acronymMap.get(emassNum);
    if (!emassAcronym) {
        emassAcronym = '';
    }

    var rowData = {
        emass: emassNum,
        acronym: emassAcronym,
        asset: numAssets,
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

export { runSAReportByLabelAndEmass };