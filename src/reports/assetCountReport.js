import * as reportGetters from './reportGetters.js';
import * as reportUtils from './reportUtils.js';

async function runAssetCountReport(auth, emassNums) {

    try {

        //console.log(`runStatusReport: Requesting STIG Manager Collections`);
        console.log(`runAssetCountReport: Requesting STIG Manager Data`);
        
        var metrics = [];
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

        var rows = [
            {
                collectionName: 'Collection',
                assetCount: 'Asset Count'
            }

        ];

        for (var i = 0; i < collections.length; i++) {
            var collectionName = collections[i].name;

            if(!collectionName.startsWith('NP_C')) {
                continue;
            }

            metrics.length = 0;
            metrics = await reportGetters.getCollectionMertics(auth, collections[i].collectionId);

            var myData = getRow(collectionName, metrics);
            rows.push(myData);
        } 
    }
    catch (e) {
        console.log(e)
    }

    return rows;
}

function getRow(collectionName, metrics) {

    const sumOfStigs = metrics.data.stigs;
    var totalAssetCount = 0;


    // get metrics data
    totalAssetCount = metrics.data.assets;

    var rowData = {
        collectionName: collectionName,
        assetCount: metrics.data.assets
    }

    return rowData
}

export { runAssetCountReport };