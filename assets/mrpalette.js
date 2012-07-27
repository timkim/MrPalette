function MrPalette(){
    // references to the canvas elements that we made should we need them
    this.colourInCanvas = null;
    this.colourOutCanvas = null;
   
    // img: is a reference to the img tag that holds the picture we want to get the colours from
    // threshold: controls how the algorithm averages out similar colours
    this.generateColourPalette = function(img, options){
        if(!options){
            options = {};
        }
        
        if(!options.threshold){
            options.threshold = 50;
        }
        
        if(!options.maxNumColours){
            options.maxNumColours = 6;
        }
        
        var imageData = this.imageToCanvas(img);
        var colourData = this.getColours(imageData, options.threshold);
        this.outputColourPalette(colourData, options.maxNumColours, options.container);
    };
    
    this.generateColourHistogram = function(imgOne, imgTwo){
        var imageDataOne = this.imageToCanvas(imgOne);
        var inImageHistogram = this.getColourHistogram(imageDataOne);
         
        var imageDataTwo = this.imageToCanvas(imgTwo);
        var outImageHistogram = this.getColourHistogram(imageDataTwo);

        var pdfOne = this.getPDF(inImageHistogram, imageDataOne.width*imageDataOne.height);
        var pdfTwo = this.getPDF(outImageHistogram, imageDataTwo.width*imageDataTwo.height);
        console.log('pdf done');
        var cdfOne = this.getCDF(pdfOne);
        var cdfTwo = this.getCDF(pdfTwo);
        console.log('cdf done');
        var LUT = this.getLUT(cdfOne,cdfTwo);
        console.log('lut done');
        var matchedImage = this.histogramMatch(imageDataOne, LUT);
        
        var matchCanvas = document.createElement("canvas");
        matchCanvas.height = matchedImage.height;
        matchCanvas.width = matchedImage.width;
        document.body.appendChild(matchCanvas);     
        var theCtx = matchCanvas.getContext('2d');
        
        theCtx.putImageData(matchedImage,0,0);
    };
    
    this.getPDF = function(histogram,imgSize){
        var thePDF = {
            histogramRed : [],
            histogramGreen : [],
            histogramBlue : []            
        };
        this.initHistogram(thePDF);
        
        for(var i=0;i<=255;i++){
            thePDF.histogramRed[i] = histogram.histogramRed[i]/imgSize;
            thePDF.histogramGreen[i] = histogram.histogramGreen[i]/imgSize;
            thePDF.histogramBlue[i] = histogram.histogramBlue[i]/imgSize;
        }
        return thePDF;
    };
    
    this.getCDF = function(pdfHistogram){
        var theCDF = {
            histogramRed : [],
            histogramGreen : [],
            histogramBlue : []          
        };
        
        this.initHistogram(theCDF);
        var runningRed = 0;
        var runningGreen = 0;
        var runningBlue = 0;
        for(var i=0;i<=255;i++){
            runningRed += pdfHistogram.histogramRed[i];
            runningGreen += pdfHistogram.histogramGreen[i];
            runningBlue += pdfHistogram.histogramBlue[i];
            theCDF.histogramRed[i] += runningRed;
            theCDF.histogramGreen[i] += runningGreen;
            theCDF.histogramBlue[i] += runningBlue;
        }
        return theCDF;
    };
    
    this.getLUT = function(cdfOne, cdfTwo){
        var theLUT = {
            histogramRed : [],
            histogramGreen : [],
            histogramBlue : []         
        };
        
        this.initHistogram(theLUT);
        var gRed = 0;
        var gGreen = 0;
        var gBlue = 0;
        
        for(var i=0;i<=255;i++){
            gRed = 0;
            gGreen = 0;
            gBlue = 0;
            while(cdfTwo.histogramRed[gRed] < cdfOne.histogramRed[i] && gRed<=255){
                gRed++;
            }
            theLUT.histogramRed[i] = gRed;
            
            while(cdfTwo.histogramGreen[gGreen] < cdfOne.histogramGreen[i] && gGreen<=255){
                gGreen++;
            }
            theLUT.histogramGreen[i] = gGreen;
            
            while(cdfTwo.histogramBlue[gBlue] < cdfOne.histogramBlue[i] && gBlue<=255){
                gBlue++;
            }
            theLUT.histogramBlue[i] = gBlue;
        }
        return theLUT;
    };
    
    this.histogramMatch = function(imageData,LUT){
        var width = imageData.width, height = imageData.height;
        for(var i=0;i<width;i++){
            for(var j=0;j<height;j++){
                var index = (i+j*width)*4;
                imageData.data[index] = LUT.histogramRed[imageData.data[index]];
                imageData.data[index+1] = LUT.histogramGreen[imageData.data[index+1]];
                imageData.data[index+2] = LUT.histogramBlue[imageData.data[index+2]];
                
            }
        }
        return imageData;
    };
    
    this.initHistogram = function(histogramObject){
        for(var i=0;i<=255;i++){
            histogramObject.histogramRed[i]=0;
        }
        histogramObject.histogramGreen = histogramObject.histogramGreen.concat(histogramObject.histogramRed);
        histogramObject.histogramBlue = histogramObject.histogramBlue.concat(histogramObject.histogramRed);
    };
    
    this.getColourHistogram = function(imageData){
        var theHistogram = {
            histogramRed : [],
            histogramGreen : [],
            histogramBlue : []
         }; 
         
        this.initHistogram(theHistogram);
        
        var width = imageData.width, height = imageData.height;
        for(var i=0;i<width;i++){
            for(var j=0;j<height;j++){
                var index = (i+j*width)*4;
                var imageRed = imageData.data[index];
                var imageGreen = imageData.data[index+1];
                var imageBlue = imageData.data[index+2];
                theHistogram.histogramRed[imageRed]++;
                theHistogram.histogramGreen[imageGreen]++;
                theHistogram.histogramBlue[imageBlue]++;
            }
        }   
        return theHistogram;
    };
    
    // draw the image to canvas - basically prepping it for image processing
    // img is a reference to the tag that holds the pic
    // returns the canvas info needed to start processing
    this.imageToCanvas = function(img){
        var theCanvas = document.createElement("canvas");
        document.body.appendChild(theCanvas);
        theCanvas.setAttribute("style","display:none");
        var theCtx = theCanvas.getContext('2d');
        this.colourInCanvas = theCanvas;
        
        theCanvas.width = img.width;
        theCanvas.height = img.height;
        theCtx.drawImage(img,0,0,theCanvas.width, theCanvas.height);
        return theCtx.getImageData(0,0,theCanvas.width,theCanvas.height);
    };
    
    // output the colour data to a canvas for display
    // colourData: the colour palette info
    // maxNumColours: specify the max number of colours to show
    this.outputColourPalette = function(colourData, maxNumColours, container){
        var theCanvas = document.createElement("canvas");
        
        if(container){
            document.getElementById(container).appendChild(theCanvas);
        }else{
            document.body.appendChild(theCanvas);
        }
        
        var theCtx = theCanvas.getContext('2d');
        this.colourOutCanvas = theCanvas;
        
        
        
        if(maxNumColours > colourData.length){
            maxNumColours = colourData.length;
        }
        
        theCanvas.width = maxNumColours*25;
        theCanvas.height = 25;
        
        for(var i=0;i<maxNumColours;i++){
            theCtx.fillStyle = 'rgb(' + colourData[i].red + ',' +   
                                   colourData[i].green + ',' + colourData[i].blue+')';  
            theCtx.fillRect(i*25,0,25,25);  
        }
    };
    
    // the main workhorse of this library - does all the processing to figure out the colour palette
    // of a particular image
    // imageData: reference to the canvas pixel array
    // threshold: controls how the algorithm averages out similar colours
    this.getColours = function(imageData, threshold){ 
        var colourOut = [];
        var currentThreshold = 0;
        var similar = false;
        
        var width = imageData.width, height = imageData.height;
        for(var i=0;i<width;i++){
            for(var j=0;j<height;j++){
                var index = (i+j*width)*4;
                var imageRed = imageData.data[index];
                var imageGreen = imageData.data[index+1];
                var imageBlue = imageData.data[index+2];
                
                if(colourOut.length===0){
                    colourOut.push({
                        red:imageRed,
                        green:imageGreen,
                        blue:imageBlue,
                        count: 1
                    });
                }else{
                    similar = false;

                    for(var k=0;k<colourOut.length;k++){
                        // simplify colour matching by using intensity 
                        currentThreshold = 0;                  
                        currentThreshold += Math.abs((colourOut[k].red-imageRed)*0.3);
                        currentThreshold += Math.abs((colourOut[k].green-imageGreen)*0.59);
                        currentThreshold += Math.abs((colourOut[k].blue-imageBlue)*0.3);
                        
                        // another similiar colour found 
                        if(currentThreshold<threshold){
                            similar = true;
                            colourOut.red = Math.floor((colourOut[k].red+imageRed)/2);
                            colourOut.green = Math.floor((colourOut[k].green+imageGreen)/2);
                            colourOut.blue = Math.floor((colourOut[k].green+imageBlue)/2);
                            colourOut[k].count += 1; 
                        }
                    }
                    
                    if(!similar){
                        colourOut.push({
                            red:imageRed,
                            green:imageGreen,
                            blue:imageBlue,
                            count: 1
                        });
                    }
                    
                }
                
            }
        }  
        return colourOut;
    };
    
    // might be able to use this on noisy pictures - just keep in 
    // here for now
    this.medianFilter = function(imgIn, imgOut, windowSize){
        var colourHistogram = [];
    
        var edgeX = Math.floor(windowSize/2);
        var edgeY = Math.floor(windowSize/2);
        
        //var width = imgIn.width-windowSize, height = imgIn.height-windowSize;
        var width = imgIn.width, height = imgIn.height;
        for(var i=0;i<width;i++){
            for(var j=0;j<height;j++){
                
                colourHistogram = [];
                var radius = Math.floor(windowSize/2);
                var offsetWidth = width - (i+windowSize);
                var offsetHeight = height - (j+windowSize);
                var windowLeft = 0;
                var windowTop = 0;
    
                for(var k=0;k<windowSize;k++){
                    for(var l=0;l<windowSize;l++){
    
                        // change the windowBox's coords when we get close to the edge
                        // make sure to never go pass the edge of the image
                        
                        if(offsetWidth < 0 ){
                            windowLeft = k + i + offsetWidth;
                        }else{
                            windowLeft = k + i;
                        }
                        
                        if(offsetHeight < 0){
                            windowTop = j + l + offsetHeight;
                        }else{
                            windowTop = j + l;
                        }
                        
                        if(windowLeft - radius > 0) {
                            windowLeft -= radius;
                        }else{
                            windowLeft = 0;
                        }
                        
                        if(windowTop - radius > 0){
                            windowTop -= radius;
                        }else{
                            windowTop = 0;
                        }
                        
                        var index = (windowLeft+windowTop*width)*4;
                        // hope that intensity corresponds to the colour in the image closely enough
                        // to generate a good pallette
                        var imageRed = imgIn.data[index];
                        var imageGreen = imgIn.data[index+1];
                        var imageBlue = imgIn.data[index+2];
                        var intensity = imageRed*0.3 + imageGreen*0.59 + imageBlue*0.1;
                        colourHistogram.push({	
                            intensity:intensity,
                            red: imageRed,
                            green:imageGreen,
                            blue:imageBlue
                        });
                    }
                }
                
                var imageOutIndex = (i+j*width)*4;
    
                colourHistogram.sort(function(a,b){return a.intensity-b.intensity;});
                var medianColour = colourHistogram[Math.floor(colourHistogram.length/2)];
                imgOut.data[imageOutIndex] = medianColour.red;
                imgOut.data[imageOutIndex+1] = medianColour.green;
                imgOut.data[imageOutIndex+2] = medianColour.blue;
                imgOut.data[imageOutIndex+3] = 255;
            }
        }  
    };
}