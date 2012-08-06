function histogram(size){
    var theHistogram = [];
    for(var i=0;i<size;i++){
        theHistogram[i] = 0;
    }
    return theHistogram;
}

function getPDF(histogram, totalSize){
    var thePDFHistogram = [];
    var length = histogram.length;
    for(var i=0;i<length;i++){
        thePDFHistogram[i] = histogram[i]/totalSize;
    }
    return thePDFHistogram;
}

function getCDF(histogram){
    var theCDFHistogram = [];
    var length = histogram.length;
    var runningTotal = 0;
    for(var i=0;i<length;i++){ 
        // pretty sure I was getting underflow if added back to theCDFHistogram
        // so have a running total instead
        runningTotal += histogram[i];
        theCDFHistogram[i] = runningTotal;
    }
    return theCDFHistogram;
}