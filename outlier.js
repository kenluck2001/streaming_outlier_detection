
function slice(collection, start, end, step) {
    var slice = collection.slice || Array.prototype.slice,
        sliced = slice.call(collection, start, end),
        result, length, i;

    if (!step) {
        return sliced;
    }
    result = [];
    length = sliced.length;
    i = (step > 0) ? 0 : length - 1;
    for (; i < length && i >= 0; i += step) {
        result.push(sliced[i]);
    }
    return typeof collection == "string" ? result.join("") : result;
}


function mergeArrays(arr1, arr2) {
    var merger = [];

    for (var i = 0; i < arr1.length; i++) {
        merger.push( [arr1[i][0], arr1[i][1], arr1[i][2] ] );
    }

    for (var i = 0; i < arr2.length; i++) {
        if (!(arr2[i][0] in merger)) {
        	if (typeof arr1[i] !== 'undefined' && arr1[i] !== null) {
            	merger.push(  [arr2[i][0], arr1[i][1], arr1[i][2] ]);
        	}
        }
    }

    var output = [];
    for (var key in merger) {
        output.push(merger[key]);
    }
    return output;               
}
/**
var Array1 = [
    [1,2,4],
    [3,4,5],
    [6,7,8]
];
var Array2 = [
    [9, 10, 11],
    [12, 13, 14],
    [15, 16, 17],
];
var result = mergeArrays(Array1, Array2);
alert(JSON.stringify(result));
*/

outlier=
{
	mean: null,
	covMatrix: null,
	prevMean: null,
	prevCovMatrix: null,
	num_rows: 0,
	num_cols: 0,
	testValx: null,
	data: null,
	streamData: null,
	windowSize: 5, //make as large as possible so the covariance matrix will be reasonable
	
	initclassifier:function(data)
	{
		/**
			initialize the classifier
		*/
		var dims = data.dimensions();
		outlier.num_cols = dims.cols;		//dimensions or features
		outlier.mean = outlier.findMean(data);
		outlier.covMatrix = outlier.findCovarianceMatrix(data);
		outlier.data = data;
		outlier.streamData = data;
		//outlier.setWindowSize(10); 
	},
 
	findMean:function (data) 
	{
		/**
			obtain the mean from the data
		*/
		var dims = data.dimensions();
		var num_rows = dims.rows;		//size
		var output = Vector.Zero(outlier.num_cols);
		for (var i = 1; i <= num_rows; i++) {
			var curRow = data.row(i);
			output = output.add(curRow)
		}
		var noutput = output.x(1/num_rows);
		return noutput;

	},
	setWindowSize:function (windowSize) 
	{
		/**
			set the window size
		*/
		outlier.windowSize = windowSize;
	},

	convertVectorToMatrix:function ( vec, num_of_rows)
	{
		/**
			convert vectors to matrix
		*/
		var output = [];
		for (var i = 1; i <= num_of_rows; i++) {
			output.push(vec.elements);
		}
		return $M(output);
	},
	
	findCovarianceMatrix:function (data) 
	{
		/**
			estimate the covariance matrix from the data
		*/
		var dims = data.dimensions();
		var num_rows = dims.rows;		//size

		var mean = outlier.findMean(data);

		var meanMatrix = outlier.convertVectorToMatrix(  mean, num_rows); //m x n
		var subMeandata = data.subtract( meanMatrix );  //zero the data
		
		var subMeandataT = subMeandata.transpose();
		var covMatrix = subMeandataT.x( subMeandata ); 
		return covMatrix;

	},
	trainClassifer:function (data)
	{
		/**
			train the classifer
		*/
		outlier.initclassifier(data);	
	},

	trainClassiferWithParameters:function (mean, covMatrix)
	{
		/**
			train the classifer
		*/
		var dims = mean.dimensions();
		outlier.num_cols = dims;		//dimensions or features
		outlier.mean = mean;
		outlier.covMatrix = covMatrix;
		outlier.prevMean = mean;

	},

	getprobabValue:function (testValx)
	{
		/**
			calculate the probability density function of a multivariate data set.
		*/
		outlier.testValx = testValx;
		var mean = outlier.prevMean;
		var cov = outlier.prevCovMatrix;
		var ar1 = Math.pow( ( 2 * Math.PI ), ( outlier.num_cols / 2 ) );
		var ar2 = Math.pow( cov.det() , 0.5);

		var subMeandata = outlier.testValx.subtract( mean );  //zero the data
		//convert vector to matrix and transpose to allow for muliplication
		var nsubMeandata = $M(subMeandata);
		var nsubMeandataT = nsubMeandata.transpose();

		var invCov = cov.inverse();


		var ar3 = nsubMeandataT.x(invCov);
		ar3 = ar3.x(nsubMeandata); 
		ar3 = ar3.elements[0][0];
		ar3 = -1 * 0.5 * ar3;
		ar3 = Math.exp(ar3);

		var output = (1 / (ar1 * ar2)) * ar3;
		return output ;
	
	},

	incrementalClassifer:function (curVal)
	{
		/**
			the argument is normal javascript array or multidimensional array
		*/

		//update data
		
		var previousData = outlier.data;
		var previousDataArr = previousData.elements; //convert to real javascript array
		outlier.streamData = previousDataArr;
		var currentData  = mergeArrays(previousDataArr, curVal);
		//outlier.data = $M(currentData);

		var dataSize = currentData.length;
		var end_index = dataSize - 1;
		var start_index = end_index - outlier.windowSize;
		if (start_index >= 0)
		{

			currentData = slice(currentData, start_index, end_index, 1); //remove old data

			var data = $M(currentData) ;
			outlier.data = data;

			//update mean
			outlier.prevMean =  outlier.mean;
			var mean = outlier.findMean(data);
			outlier.mean = mean;

			//update covariance matrix
			outlier.prevCovMatrix =  outlier.covMatrix;
			var covMatrix = outlier.findCovarianceMatrix(data);
			outlier.covMatrix = covMatrix;
		}
		 

	},

	checkIfOutlier:function (testValx, threshold = 0.0159)
	{
		/**
			set up a flag to set the threshold of the classifier.
		*/
		var prob = outlier.getprobabValue(testValx);
		var isOutlier = false;
		if (prob  < threshold)
		{
			isOutlier = true;
		}
		return isOutlier;

	}
}
