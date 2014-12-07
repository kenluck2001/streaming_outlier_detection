Outlier detection in Javascript for data streams
=================================================

This is the implementation of a multivariate normal distribution model for
predicting the outliers in the data set. There are two kinds of data which are either outliers or normal. The normal data are assumed to have been generated a gaussian distribution. We select a threshold is means truncated the tail shape. This algorithm is symmetry so it can account for both extremes of outliers (high and low). The value of the threshold can be estimated by training performing crossvalidation on a test data set.

This library was built using the syvester.js library. The html files in the bundle show how it should be used in practice.

However, the demo in example in index1.html works for data of 3 dimensions. This can be updated by modifying the mergeArrays method in outlier.js. This is because we are appending batches of data and a few lines of code tweaks will result in making it suitable for any number of dimensions.

This algorithm obey the principle of never mixing the training and test set. We need to set the classifer to begin the process. This data is not taken as training set for next batch of data will be fed to the classifier.

The covariance matrix and means is obtained on the training set and used to make classification on the test set. This allows us to know if the current data is an outlier in respect to past events. This gives the classifer the ability to understand concept drift in the data.

We kept two version of the means and covariance matrix which matches the training and testing sets respectively.

Here is an example of how to use the library



var data = $M([
	  [6,2,8],
	  [9,1,3],
	  [0,7,6],
	  [2,2,2],
	  [7,3,8],
	  [2,1,5],
	  [0,6,2],
	  [2,2,2],
	  [5,1,8],
	  [1,1,4],
	  [2,5,3],
	  [4,6,3],
	  [3,3,4],
	  [5,1,8]]);

outlier.trainClassifer(data); //training the classifier

//provide a test set
	var curVal = [
	  [5,1,7],
	  [8,0,2],
	  [1,6,5],
	  [6,2,8],
	  [8,1,2],
	  [2,7,5]]; 

outlier.incrementalClassifer(curVal); //incremental train the classifier 

//iterate through every element in the test set to check for outliers
	var testValx = $V([5,1,7]);
	var status = outlier.checkIfOutlier(testValx)//if true then it is an outlier
	console.log(status );


There is a stationary version of the same algorithm by the same author on https://github.com/kenluck2001/outlier_detection.
