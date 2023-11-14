import * as reportGetters from './reportGetters.js';
import * as reportUtils from './reportUtils.js';

async function runSAReportWithMetricsAndVersions(auth, emassNums) {

    try {

        const currentQuarter = reportUtils.getCurrentQuarter();

        console.log(`runSAReportWithMetricsAndVersions: Requesting STIG Manager Collections`);
        //console.log(`runStatusReport: Requesting STIG Manager Data for collection ` + collectionName);
        var collections = [];
        var tempCollections = [];

        tempCollections = await reportGetters.getCollections(auth);
        if (!emassNums || emassNums.length === 0) {
            //collections = tempCollections;
            for (var j = 0; j < tempCollections.data.length; j++) {
                collections.push(tempCollections.data[j])
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

        var metrics = [];
        var labels = [];
        let labelMap = new Map();

        var rows = [
            {
                collectionName: 'Collection',
                asset: 'Asset',
                primOwner: 'Primary Owner',
                sysAdmin: 'Sys Admin',
                benchmarks: 'STIG Benchmark',
                latestRev: 'Latest Revision',
                prevRev: 'Previous Revision',
                quarterVer: 'Current Quarter STIG Version',
                assessed: 'Assessed',
                submitted: 'Submitted',
                accepted: 'Accepted',
                rejected: 'Rejected',
                cat3: 'CAT3',
                cat2: 'CAT2',
                cat1: 'CAT1'
            }
        ];


        for (var i = 0; i < collections.length; i++) {
            var collectionName = collections[i].name;
            console.log('collection name: ' + collectionName);

            if (!collectionName.startsWith('NP_C')) {
                continue;
            }

            labelMap.clear();
            labels.length = 0;
           
            labels = await reportGetters.getLabelsByCollection(auth, collections[i].collectionId);
            for (var x = 0; x < labels.data.length; x++) {
                labelMap.set(labels.data[x].labelId, labels.data[x].description);
            }


            metrics = await reportGetters.getCollectionMerticsAggreatedByAsset(auth, collections[i].collectionId);
            console.log('num metrics: ' + metrics.data.length);

            for (var iMetrics = 0; iMetrics < metrics.data.length; iMetrics++) {

                var benchmarkIDs = metrics.data[iMetrics].benchmarkIds;
                console.log('num benchmarks: ' + benchmarkIDs.length);

                for (var idx = 0; idx < benchmarkIDs.length; idx++) {

                    console.log('benchmarkId: ' + benchmarkIDs[idx]);

                    var revisions = await reportGetters.getBenchmarkRevisions(auth, benchmarkIDs[idx]);

                    var latestRev = '';
                    var prevRev = '';
                    var latestRevDate = '';
                    var prevRevDate = '';
                    if (revisions) {
                        for (var bmIdx = 0; bmIdx < revisions.data.length && bmIdx < 2; bmIdx++) {
                            if (bmIdx === 0) {
                                latestRev = revisions.data[bmIdx].revisionStr;
                                latestRevDate = revisions.data[bmIdx].benchmarkDate;
                            }
                            else if (bmIdx === 1) {
                                prevRev = revisions.data[bmIdx].revisionStr;
                                prevRevDate = revisions.data[bmIdx].benchmarkDate;
                            }
                        }
                    }
                    else {
                        var stig = await reportGetters.getStigById(auth, benchmarkIDs[idx]);

                        latestRev = stig.data.lastRevisionStr;
                        latestRevDate = stig.data.lastRevisionDate;
                    }

                    var myData = getRow(
                        collectionName,
                        metrics.data[iMetrics],
                        labelMap,
                        latestRev,
                        latestRevDate,
                        prevRev,
                        benchmarkIDs[idx],
                        currentQuarter);

                    rows.push(myData);

                }
            }
        }
    }
    catch (e) {
        console.log(e)
    }

    return rows;
}

function getRow(collectionName,
    metrics,
    labelMap,
    latestRev,
    latestRevDate,
    prevRev,
    benchmarkID,
    currentQuarter) {

    const quarterVer = reportUtils.getVersionForQuarter(currentQuarter, latestRevDate, latestRev);

    const numAssessments = metrics.metrics.assessments;
    const numAssessed = metrics.metrics.assessed;
    const numSubmitted = metrics.metrics.statuses.submitted;
    const numAccepted = metrics.metrics.statuses.accepted;
    const numRejected = metrics.metrics.statuses.rejected;
    const numSaved = metrics.metrics.statuses.rejected;
    const numAssets = metrics.assets;

    var primOwner = "";
    var secOwner = "";
    var sysAdmin = "";
    var labelName = "";
    for (var iLabel = 0; iLabel < metrics.labels.length; iLabel++) {

        var labelDesc = labelMap.get(metrics.labels[iLabel].labelId);

        if (labelDesc) {
            if (labelDesc.toUpperCase() === 'PRIMARY OWNER') {
                primOwner = metrics.labels[iLabel].name;
            }
            else if (labelDesc.toUpperCase() === 'SYS ADMIN') {
                sysAdmin = metrics.labels[iLabel].name;
            }
            else {
                labelName = metrics.labels[iLabel].name;
            }
        }
        else {
            labelName = metrics.labels[iLabel].name;
        }
    }


    const numUnassessed = numAssessments - numAssessed;
    const totalChecks = numAssessments;

    const avgAssessed = Math.round(numAssessments ? (numAssessed / numAssessments) * 100 : 0);
    const avgSubmitted = Math.round(numAssessments ? ((numSubmitted + numAccepted + numRejected) / numAssessments) * 100 : 0);
    const avgAccepted = Math.round(numAssessments ? ((numAccepted) / numAssessments) * 100 : 0);
    const avgRejected = Math.round(numAssessments ? ((numRejected) / numAssessments) * 100 : 0);

    const sumOfCat3 = metrics.metrics.findings.low;
    const sumOfCat2 = metrics.metrics.findings.medium;
    const sumOfCat1 = metrics.metrics.findings.high;

    var rowData = {
        collectionName: collectionName,
        asset: metrics.name,
        primOwner: primOwner,
        sysAdmin: sysAdmin,
        benchmarks: benchmarkID,
        latestRev: latestRev,
        prevRev: prevRev,
        quarterVer: quarterVer,
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

export { runSAReportWithMetricsAndVersions };