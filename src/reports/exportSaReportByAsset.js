import * as reportGetters from './reportGetters.js';
import * as reportUtils from './reportUtils.js';

async function runExportSAReportByAsset(auth, args) {

    try {

        //const prompt = promptSync();
        //const collectionName = prompt('Enter collection name.');

        console.log(`runExportSAReportByAsset: Requesting STIG Manager Collections`);
        //console.log(`runStatusReport: Requesting STIG Manager Data for collection ` + collectionName);
        var collections = [];
        var tempCollections = [];

        // Get collections
        tempCollections = await reportGetters.getCollections(auth);
        if (!args || args.length === 0) {
            collections = tempCollections.data;
        }
        else {
            var emassMap = reportUtils.getCollectionsByEmassNumber(tempCollections);
            var emassArray = args.split(',');
            for (var mapIdx = 0; mapIdx < emassArray.length; mapIdx++) {
                if (emassMap.has(emassArray[mapIdx])) {

                    var mappedCollection = emassMap.get(emassArray[mapIdx]);
                    if (mappedCollection) {
                        collections = collections.concat(mappedCollection);
                    }
                }
            }
        }

        //console.log(collections);
        //const collections = await reportGetters.getCollectionByName(tokens.access_token, collectionName);

        var metrics = [];
        var labels = [];
        let labelMap = new Map();

        var rows = [
            {
                datePulled: 'Date Pulled',
                code: 'Code',
                shortName: 'Short Name',
                collectionName: 'Collection',
                asset: 'Asset',
                primOwner: 'Primary Owner',
                sysAdmin: 'Sys Admin',
                deviveType: 'Device-Asset',
                lastTouched: 'Last Touched',
                stigs: 'STIGs',
                assessed: 'Assessed',
                submitted: 'Submitted',
                accepted: 'Accepted',
                rejected: 'Rejected'
            }
        ];

        var today = new Date();
        var todayStr = today.toISOString().substring(0, 10);

        for (var i = 0; i < collections.length; i++) {
            var collectionName = collections[i].name;

            var upperCaseName = collectionName.toUpperCase();

            //exclude collections thqt do not start with NP_C
            if (!upperCaseName.startsWith('NP_C')) {
                continue;
            }

            if (collections[i].metadata.NonStig) {
                continue;
            }
            else if (collections[i].metadata.ParkingLot) {
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

            for (var j = 0; j < metrics.data.length; j++) {
                var myData = getRow(todayStr, collections[i], metrics.data[j], labelMap);
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
    if(!code){
        code = '';
    }
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
    var touched;

    // set lastTouched to either hours or days
    if (diffInDays < 1) {
        touched = Math.round(diffInHours);
        lastTouched = touched + ' h';
    }
    else {
        touched = Math.round(diffInDays);
        lastTouched = touched.toString() + ' d';
    }

    var primOwner = "";
    var sysAdmin = "";
    var device = "";
    for (var iLabel = 0; iLabel < metrics.labels.length; iLabel++) {

        var labelDesc = labelMap.get(metrics.labels[iLabel].labelId);

        if (labelDesc) {
            if (labelDesc.toUpperCase() === 'PRIMARY OWNER') {
                if (primOwner === "") {
                    primOwner = metrics.labels[iLabel].name;
                }
            }
            else if (labelDesc.toUpperCase() === 'SYS ADMIN') {
                sysAdmin = metrics.labels[iLabel].name;
            }
            else if (labelDesc.toUpperCase() === 'ASSET TYPE') {
                device = metrics.labels[iLabel].name;
            }
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
    
    var rowData = {
        datePulled: todayStr,
        code: code,
        shortName: shortName,
        collectionName: collectionName,
        asset: metrics.name,
        primOwner: primOwner,
        sysAdmin: sysAdmin,
        deviveType: device,
        lastTouched: lastTouched,
        stigs: metrics.benchmarkIds.length,
        assessed: avgAssessed + '%',
        submitted: avgSubmitted + '%',
        accepted: avgAccepted + '%',
        rejected: avgRejected + '%'
    }

    return rowData;

}

export { runExportSAReportByAsset };