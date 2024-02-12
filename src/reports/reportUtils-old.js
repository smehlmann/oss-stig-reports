var quarters = [
    {
        name: 'Q1',
        startDate: '10/1/2023',
        endDate: '12/31/2023'
    },
    {
        name: 'Q2',
        startDate: '1/1/2024',
        endDate: '3/31/2024'
    },
    {
        name: 'Q3',
        startDate: '4/1/2024',
        endDate: '6/30/2024'
    },
    {
        name: 'Q4',
        startDate: '7/1/2024',
        endDate: '9/30/2024'
    }
];


function getCollectionsByEmassNumber(collections) {

    let emassMap = new Map();

    try {
        for (var x = 0; x < collections.data.length; x++) {

            console.log('collectionName: ' + collections.data[x].name);

            if(!collections.data[x].name.startsWith('NP_C')) {
                continue;
            }

            if(!collections.data[x].metadata){
                continue;
            }

            var emassNum = collections.data[x].metadata.eMASS;
            if (emassNum) {

                var myVal = emassMap.get(emassNum);
                if (myVal) {
                    myVal.push(collections.data[x]);
                    emassMap.set(emassNum, myVal);
                }
                else {
                    myVal = collections.data[x];
                    var collVal = [];
                    collVal.push(myVal);
                    emassMap.set(emassNum, collVal);
                }
            }
        }
    }
    catch (e) {
        console.log('Error in getCollectionsByEmassNumber');
        console.log(e);
    }

    return emassMap;
}

function filterCollectionsByEmassNumber(collections) {

    let emassMap = new Map();

    try {
        for (var x = 0; x < collections.length; x++) {

            console.log('collectionName: ' + collections[x].name);

            if(!collections[x].name.startsWith('NP_C')) {
                continue;
            }

            if(!collections[x].metadata){
                continue;
            }

            var emassNum = collections[x].metadata.eMASS;
            if (emassNum) {

                var myVal = emassMap.get(emassNum);
                if (myVal) {
                    myVal.push(collections[x]);
                    emassMap.set(emassNum, myVal);
                }
                else {
                    myVal = collections[x];
                    var collVal = [];
                    collVal.push(myVal);
                    emassMap.set(emassNum, collVal);
                }
            }
        }
    }
    catch (e) {
        console.log('Error in getCollectionsByEmassNumber');
        console.log(e);
    }

    return emassMap;
}

function getCurrentQuarter() {

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();


    var retQuarter = null;
    for (var i = 0; i < quarters.length; i++) {
        var splitStartDate = quarters[i].startDate.split('/');
        var splitEndDate = quarters[i].endDate.split('/');

        // Are the years the same?
        if (splitStartDate[2] == currentYear) {
            // is the month within range
            if ((currentMonth >= splitStartDate[0]) && currentMonth <= splitEndDate[0]) {
                retQuarter = quarters[i];
                break;
            }
        }
    }

    return retQuarter;
}

/*
    Returns the version string if versionDateStr is in the current quarter
*/
function getVersionForQuarter(quarter, versionDateStr, versionStr) {

    var returnVer = '';

    /* if quarter is null, return an empty string */
    if (!quarter) {
        return returnVer;
    }

    var splitVersionDateStr = versionDateStr.split('-');
    var startSplitDate = quarter.startDate.split('/');
    var endSplitDate = quarter.endDate.split('/');

    /* check that the years are the same */
    if (splitVersionDateStr[0] === startSplitDate[2] &&
        splitVersionDateStr[0] == endSplitDate[2]) {

        /* check if the month is in range for the quarter */
        if ((parseInt(splitVersionDateStr[1]) >= parseInt(startSplitDate[1])) &&
            (parseInt(splitVersionDateStr[1]) <= parseInt(endSplitDate[1]))) {
            returnVer = versionStr;
        }
    }

    return returnVer;

}

function getEmassAcronymMap() {

    let emassAcronymMap = new Map();

    emassAcronymMap.set('6969', 'C34 ZD-U');
    emassAcronymMap.set('1446', 'AIMTCIS');
    emassAcronymMap.set('7296', 'VWES-U');
    emassAcronymMap.set('6931', 'USWRIC');
    emassAcronymMap.set('1656', 'C15 ZD-U');
    emassAcronymMap.set('6491', 'C15 PIT A-ZD-U');
    emassAcronymMap.set('8061', 'C85 ZD - U');
    emassAcronymMap.set('6593', 'C70 ZD-U');
    emassAcronymMap.set('11238', 'AUTEC ASSA');
    emassAcronymMap.set('3504', 'C70 PIT A-ZD-U');
    emassAcronymMap.set('5492', 'AUTEC - ISPNET');
    emassAcronymMap.set('7374', 'RDT&E CSS');
    emassAcronymMap.set('2008', 'Enchilada');
    emassAcronymMap.set('1878', 'ASI');
    emassAcronymMap.set('7371', 'NCCM-NW');
    emassAcronymMap.set('7372', 'NCCM-W');
    emassAcronymMap.set('2862', 'NewPortal');
    emassAcronymMap.set('7373', 'NCCM-S');
    emassAcronymMap.set('1761', 'Unclass Core');
    emassAcronymMap.set('1315', 'NUWCDIVNPT B3COI');
    emassAcronymMap.set('2874', 'NERDS');
    emassAcronymMap.set('12412', 'NDNSA');
    emassAcronymMap.set('4435', 'TOPSIDEC3');
    emassAcronymMap.set('3212', 'AUURV');
    emassAcronymMap.set('8801', 'C45 ZD-U');


    return emassAcronymMap;
}

function getMetricsAverages(metrics) {

    const numAssessments = metrics.metrics.assessments;
    const numAssessed = metrics.metrics.assessed;
    const numSubmitted = metrics.metrics.statuses.submitted;
    const numAccepted = metrics.metrics.statuses.accepted;
    const numRejected = metrics.metrics.statuses.rejected;
    const numSaved = metrics.metrics.statuses.rejected;
    const numAssets = metrics.assets;

    const avgAssessed = numAssessments ? (numAssessed / numAssessments) * 100 : 0;
    //const avgAssessed = Math.round(numAssessments ? (numAssessed / numAssessments) * 100 : 0);

    const avgSubmitted = numAssessments ? ((numSubmitted + numAccepted + numRejected) / numAssessments) * 100 : 0;
    //const avgSubmitted = Math.round(numAssessments ? ((numSubmitted + numAccepted + numRejected) / numAssessments) * 100 : 0);

    const avgAccepted = numAssessments ? ((numAccepted) / numAssessments) * 100 : 0;
    //const avgAccepted = Math.round(numAssessments ? ((numAccepted) / numAssessments) * 100 : 0);

    const avgRejected = numAssessments ? ((numRejected) / numAssessments) * 100 : 0;

    //const avgRejected = Math.round(numAssessments ? ((numRejected) / numAssessments) * 100 : 0);

    var averages = {
        assessed: avgAssessed,
        submitted: avgSubmitted,
        accepted: avgAccepted,
        rejected: avgRejected
    }

    return averages;
}

export {
    getCollectionsByEmassNumber,
    filterCollectionsByEmassNumber,
    getCurrentQuarter,
    getVersionForQuarter,
    getEmassAcronymMap,
    getMetricsAverages
};