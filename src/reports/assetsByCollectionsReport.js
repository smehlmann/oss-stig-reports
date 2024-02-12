import * as reportGetters from './reportGetters.js';
import * as reportUtils from './reportUtils.js';

async function runAssetByCollectionReport(auth, emassNums, collections, emassMap) {

    try {

        console.log(`Running Assets by Collection Report`);
        //alert(`Running Assets by Collection Report`);

        var stigs = [];
        var assets = [];

        var rows = [];
        /*var rows = [
            {
                emass: 'EMASS',
                collection: 'Collection',
                benchmark: 'STIG Benchmark',
                stigVersion: 'Version',
                assetNames: 'Assets'
            }
        ]*/

        emassMap = reportUtils.filterCollectionsByEmassNumber(collections);
        var iKey = 0;
        var iKeyend = emassMap.size;
        var myKeys = emassMap.keys();

        while (iKey < iKeyend) {
            var emassNum = myKeys.next().value;
            var myCollections = emassMap.get(emassNum);

            for (var j = 0; j < myCollections.length; j++) {
                //console.log("Requesting STIGS");j                
                console.log('myCollections: ' + myCollections[j]);

                var collectionName = myCollections[j].name;
                var strToRemove = '_' + emassNum + '_';
                collectionName = collectionName.replace(strToRemove, '');
                stigs = await reportGetters.getStigs(auth, myCollections[j].collectionId);
                //console.log(stigs)

                //console.log("Requesting assets")
                for (var k = 0; k < stigs.data.length; k++) {
                    assets.length = 0;
                    assets = await reportGetters.getAssets(auth, myCollections[j].collectionId, stigs.data[k].benchmarkId)
                    //console.log(assets)

                    var myData = getRow(emassNum, collectionName, stigs.data[k], assets)
                    rows.push(myData);
                }
            }
            iKey++;
        }

        //alert('returning report data');
        return rows;
    }
    catch (e) {
        console.log(e);
        throw (e);
    }
}

function getRow(emassNum, collectionName, stigs, assets) {

    var assetNames = ''
    var benchmarkId = stigs.benchmarkId
    var stigVersion = stigs.revisionStr

    for (var i = 0; i < assets.data.length; i++) {
        if (i < assets.data.length - 1) {
            assetNames += assets.data[i].name + ';'
        }
        else {
            assetNames += assets.data[i].name
        }
    }

    assetNames = assetNames.trim();

    var rowData = {
        emass: emassNum,
        collection: collectionName,
        benchmark: benchmarkId,
        stigVersion: stigVersion,
        assetNames: assetNames
    }

    return rowData
}


export { runAssetByCollectionReport };