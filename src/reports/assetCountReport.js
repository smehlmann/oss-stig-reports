import * as reportGetters from './reportGetters.js';

async function runAssetCountReport(auth, emassNums, collections, emassMap) {

    try {

        //console.log(`runStatusReport: Requesting STIG Manager Collections`);
        console.log(`runAssetCountReport: Requesting STIG Manager Data`);
        
        var metrics = [];
        var rows = [];
        /*var rows = [
            {
                collectionName: 'Collection',
                assetCount: 'Asset Count'
            }

        ];*/

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

    var rowData = {
        collectionName: collectionName,
        assetCount: metrics.data.assets
    }

    return rowData
}

export { runAssetCountReport };