import * as reportGetters from './reportGetters.js';
import * as reportUtils from './reportUtils.js';

async function runChecklistOver365Days(auth, emassNums) {

    try {

        //const currentQuarter = reportUtils.getCurrentQuarter();

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

        var labels = [];
        let labelMap = new Map();

        var rows = [
            {
                collectionName: 'Collection',
                asset: 'Asset',
                primOwner: 'Primary Owner',
                sysAdmin: 'Sys Admin',
                benchmark: 'STIG Benchmark',
                revision: 'Revision',
                groupId: 'Group ID',
                result: 'Result',
                detail: 'Detail',
                comment: 'Comment',
                modifiedDate: 'Modified Date',
                modifiedBy: 'Modified By',
                ruleId: 'Rule',
                status: 'Status',
                statusDate: 'Status Date',
                checkedBy: 'Checked By'
            }
        ];


        for (var i = 0; i < collections.length; i++) {
            var collectionName = collections[i].name;
            var collectionId = collections[i].collectionId;
            console.log(i + ' collection name: ' + collectionName);

            labelMap.clear();
            labels.length = 0;
            if (collectionName.toUpperCase() === "HAPPY CORP") {
                continue;
            }

            //exclude collections that do not start with NP_C
            if (!collectionName.startsWith('NP_C')) {
                continue;
            }

            labelMap.clear();
            labels.length = 0;
            labels = await reportGetters.getLabelsByCollection(auth, collections[i].collectionId);
            for (var x = 0; x < labels.data.length; x++) {
                labelMap.set(labels.data[x].labelId, labels.data[x].description);
            }

            var metrics = await reportGetters.getCollectionMerticsAggreatedByAsset
                (auth, collectionId);
            //console.log('Number metrics: ' + metrics.length);

            for (var iMetrics = 0; iMetrics < metrics.data.length; iMetrics++) {

                var minTs = metrics.data[iMetrics].metrics.minTs;
                var maxTs = metrics.data[iMetrics].metrics.maxTs;
                var diffInDays = reportUtils.calcDiffInDays(minTs);
                if (diffInDays < 365) {
                    continue;
                }

                var assetId = metrics.data[iMetrics].assetId;
                var assetName = metrics.data[iMetrics].name;

                var stigs = await reportGetters.getStigsByAsset(auth, assetId);
                for (var iStigs = 0; iStigs < stigs.data.length; iStigs++) {
                    var benchmarkId = stigs.data[iStigs].benchmarkId;
                    var revisionStr = stigs.data[iStigs].revisionStr;

                    var checklists = await reportGetters.getChecklists(
                        auth, assetId, benchmarkId, revisionStr);
                    //console.log('Number of checklists: ' + checklists.length);

                    for (var iCkl = 0; iCkl < checklists.data.length; iCkl++) {
                        var result = checklists.data[iCkl].result;
                        result = reportUtils.resultAbbreviation(result);

                        var groupId = checklists.data[iCkl].groupId;

                        var reviews = await reportGetters.getReviewByGroupId(
                            auth, collectionId, assetId, benchmarkId, groupId);
                        //console.log('Number of reviews: ' + reviews.length);

                        if (!reviews) {
                            continue;
                        }

                        for (var iReviews = 0; iReviews < reviews.data.length; iReviews++) {

                            var modifiedDate = reviews.data[iReviews].ts;
                            diffInDays = reportUtils.calcDiffInDays(modifiedDate);
                            if (diffInDays < 365) {
                                continue;
                            }

                            var modifiedBy = reviews.data[iReviews].username;
                            var status = reviews.data[iReviews].status.label;
                            var statusDate = reviews.data[iReviews].status.ts;
                            var checkedBy = reviews.data[iReviews].status.user.username;
                            var ruleId = reviews.data[iReviews].ruleId;

                            var myDetail = reviews.data[iReviews].detail;
                            var detail = myDetail.replaceAll('/', '-');
                            detail = detail.replaceAll('\r', '\\r');
                            detail = detail.replaceAll('\n', '\\n');
                            detail = detail.replaceAll('\t', '\\t');
                            detail = detail.replaceAll(',', ';');

                            if (detail.length > 32000) {
                                detail = detail.substring(0, 32000);
                            }

                            var comment = reviews.data[iReviews].comment;
                            comment = comment.replaceAll('/', '|');
                            comment = comment.replaceAll('\r', '\\r');
                            comment = comment.replaceAll('\n', '\\n');
                            comment = comment.replaceAll('\t', '\\t');
                            comment = comment.replaceAll(',', ';');
                            //console.log('detail.length: ' + detail.length + ' comment.length: ' + comment.length);

                            if (comment.length > 32000) {
                                comment = comment.substring(0, 32000);
                            }

                            var myData = getRow(collectionName,
                                assetName,
                                benchmarkId,
                                revisionStr,
                                groupId,
                                result,
                                detail,
                                comment,
                                modifiedDate,
                                modifiedBy,
                                ruleId,
                                status,
                                statusDate,
                                checkedBy,
                                metrics.data[iMetrics],
                                labelMap);
                            rows.push(myData);
                        } // end reviews
                    }// end checklists
                } // end stigs
            } // end metrics
        } // end collections

        return rows;
    }
    catch (e) {
        console.log(e);
        throw (e);
    }
}

function getRow(
    collectionName,
    assetName,
    benchmarkId,
    revisionStr,
    groupId,
    result,
    detail,
    comment,
    modifiedDate,
    modifiedBy,
    ruleId,
    status,
    statusDate,
    checkedBy,
    metrics,
    labelMap) {

    var primOwner = "";
    var sysAdmin = "";

    for (var iLabel = 0; iLabel < metrics.labels.length; iLabel++) {

        var labelDesc = labelMap.get(metrics.labels[iLabel].labelId);

        if (labelDesc) {
            if (labelDesc.toUpperCase() === 'PRIMARY OWNER') {
                primOwner = metrics.labels[iLabel].name;
            }
            else if (labelDesc.toUpperCase() === 'SYS ADMIN') {
                sysAdmin = metrics.labels[iLabel].name;
            }
        }
    }

    var rowData = {
        collectionName: collectionName,
        asset: assetName,
        primOwner: primOwner,
        sysAdmin: sysAdmin,
        benchmark: benchmarkId,
        revision: revisionStr,
        groupId: groupId,
        result: result,
        detail: detail,
        comment: comment,
        modifiedDate: modifiedDate,
        modifiedBy: modifiedBy,
        ruleId: ruleId,
        status: status,
        statusDate: statusDate,
        checkedBy: checkedBy
    }

    return rowData;

}

export { runChecklistOver365Days };