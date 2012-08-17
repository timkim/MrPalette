function MrPalette(){
    // references to the canvas elements that we made should we need them
    this.colourInCanvas = null;
    this.colourOutCanvas = null;
    
    // a better idea might be to have one master canvas tag to push/pull pixels from
    // as opposed to creating multiple hidden ones
    this.masterCanvas = null;
    this.masterCtx = null;

    
    // top app level basic functions
    // init the master canvas for manipulation
    this.init = (function(context){
        if(!context.masterCanvas){
            context.masterCanvas = document.createElement("canvas");
            document.body.appendChild(context.masterCanvas);
            context.masterCanvas.setAttribute("style","display:none");
            context.masterCtx = context.masterCanvas.getContext('2d'); 
        }
    }(this));
    
    // get the image data from the master canvas
    this.getImageData = function(img){
        if(this.masterCanvas && this.masterCtx && img){
            this.resetCanvas();
            this.masterCanvas.width = img.width;
            this.masterCanvas.height = img.height;
            this.masterCtx.drawImage(img,0,0,this.masterCanvas.width, this.masterCanvas.height);
            return this.masterCtx.getImageData(0,0,this.masterCanvas.width, this.masterCanvas.height);   
        }
    };
    
    // reset the canvas for future manipulations
    this.resetCanvas = function(){
        if(this.masterCanvas && this.masterCtx){
            // from: http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
            // Store the current transformation matrix
            this.masterCtx.save();
            
            // Use the identity matrix while clearing the canvas
            this.masterCtx.setTransform(1, 0, 0, 1, 0, 0);
            this.masterCtx.clearRect(0, 0, this.masterCanvas.width, this.masterCanvas.height);
            
            // Restore the transform
            this.masterCtx.restore(); 
        }
    };
    
    // output the image data to an existing img tag
    this.outputImageData = function(imageData, imgContainer){
        if(this.masterCanvas && this.masterCtx && imgContainer){
            this.resetCanvas();   
            this.masterCanvas.width = imageData.width;
            this.masterCanvas.height = imageData.height;
            this.masterCtx.putImageData(imageData, 0, 0);
            var url = this.masterCanvas.toDataURL();
            imgContainer.src = url;
        }
    };
    
    // top image procession functions
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
        
        var imageData = this.getImageData(img);
        var colourData = this.getColours(imageData, options.threshold);
        // need function to get back canvas palette stuff!
        //this.outputImageData
        //this.outputColourPalette(colourData, options.maxNumColours, options.container);
    };
    
    
    this.generateColourHistogram = function(imgOne, imgTwo, imgOut, options){
        if(!options){
            options = {};
        }
        
        if(!options.type){
            options.type = 'rgb';
        }
        
        if(!options.histogramBucketSize){
            options.histogramBucketSize = 256;
        }
        
        var imageDataOne = this.getImageData(imgOne);
        var inImageHistogram = this.getRGBHistogram(imageDataOne);
         
        var imageDataTwo = this.getImageData(imgTwo);
        var outImageHistogram = this.getRGBHistogram(imageDataTwo);

        var pdfOne = this.getRGBPDF(inImageHistogram, imageDataOne.width*imageDataOne.height);
        var pdfTwo = this.getRGBPDF(outImageHistogram, imageDataTwo.width*imageDataTwo.height);
        console.log('pdf done');
        var cdfOne = this.getRGBCDF(pdfOne);
        var cdfTwo = this.getRGBCDF(pdfTwo);
        console.log('cdf done');
        var LUT = this.getRGBLUT(cdfOne,cdfTwo);
        console.log('lut done');
        
        var matchedImage = this.histogramRGBMatch(imageDataOne, LUT);
        this.outputImageData(matchedImage, imgOut);
        
    };
    
    this.generateLuminenceHistogram = function(imgOne, imgTwo, imgOut, options){
        if(!options){
            options = {};
        }
        
        var imageDataOne = this.getImageData(imgOne);
        var inImageHistogram = this.getLuminanceHistogram(imageDataOne);
         
        var imageDataTwo = this.getImageData(imgTwo);
        var outImageHistogram = this.getLuminanceHistogram(imageDataTwo);
        
        var pdfOne = getPDF(inImageHistogram, imageDataOne.width*imageDataOne.height);
        var pdfTwo = getPDF(outImageHistogram, imageDataTwo.width*imageDataTwo.height);
        console.log('pdf done');
        
        var cdfOne = getCDF(pdfOne);
        var cdfTwo = getCDF(pdfTwo);
        console.log('cdf done');
        
        var LUT = this.getLUT(cdfOne,cdfTwo);
        console.log('lut done');
        
        var matchedImage = this.histogramMatch(imageDataOne, LUT);
        this.outputImageData(matchedImage, imgOut);
        
    };
    
    this.getRGBPDF = function(theHistogram,imgSize){
        var thePDF = {
            histogramRed : histogram(256),
            histogramGreen : histogram(256),
            histogramBlue : histogram(256)            
        };
        
        thePDF.histogramRed = getPDF(theHistogram.histogramRed, imgSize);
        thePDF.histogramGreen = getPDF(theHistogram.histogramGreen, imgSize);
        thePDF.histogramBlue = getPDF(theHistogram.histogramBlue, imgSize);
        
        return thePDF;
    };
    
    this.getRGBCDF = function(pdfHistogram){
        var theCDF = {
            histogramRed : histogram(256),
            histogramGreen : histogram(256),
            histogramBlue : histogram(256)           
        };
        
        theCDF.histogramRed = getCDF(pdfHistogram.histogramRed);
        theCDF.histogramGreen = getCDF(pdfHistogram.histogramGreen);
        theCDF.histogramBlue = getCDF(pdfHistogram.histogramBlue);
        
        return theCDF;
    };
    
    this.getRGBLUT = function(cdfOne, cdfTwo){
        var theLUT = {
            histogramRed : histogram(256),
            histogramGreen : histogram(256),
            histogramBlue : histogram(256)         
        };
        
        var gRed = 0;
        var gGreen = 0;
        var gBlue = 0;
        
        var theLength = cdfOne.histogramRed.length;
        for(var i=0;i<theLength;i++){
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

    this.getLUT = function(cdfOne, cdfTwo){
        var theLUT = histogram(256);
        
        var gLumin = 0;
        var theLength = cdfOne.length;
        for(var i=0;i<theLength;i++){
            gLumin = 0;
            while(cdfTwo[gLumin] < cdfOne[i] && gLumin<=255){
                gLumin++;
            }
            theLUT[i] = gLumin;
        }
        return theLUT;
    };
    
    this.histogramRGBMatch = function(imageData,LUT){
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

    this.histogramMatch = function(imageData,LUT){
        var width = imageData.width, height = imageData.height;
        for(var i=0;i<width;i++){
            for(var j=0;j<height;j++){
                var index = (i+j*width)*4;
                imageData.data[index] = LUT[imageData.data[index]];
                imageData.data[index+1] = LUT[imageData.data[index+1]];
                imageData.data[index+2] = LUT[imageData.data[index+2]];
            }
        }
        return imageData;
    };
    
    this.getRGBHistogram = function(imageData){
        var theHistogram = {
            histogramRed : histogram(256),
            histogramGreen : histogram(256),
            histogramBlue : histogram(256)
         }; 
        
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
    
    this.getLuminanceHistogram = function(imageData){
        var theHistogram = histogram(256)
         
        var width = imageData.width, height = imageData.height;
        for(var i=0;i<width;i++){
            for(var j=0;j<height;j++){
                var index = (i+j*width)*4;
                var imageRed = imageData.data[index];
                var imageGreen = imageData.data[index+1];
                var imageBlue = imageData.data[index+2];
                var greyscale = Math.round((0.2126 * imageRed) + (0.7152 * imageGreen) + (0.0722 * imageBlue));
                
                // 0.2126 R + 0.7152 G + 0.0722 B
                theHistogram[greyscale]++;
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