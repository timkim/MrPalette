$(document).ready(init);
        
function init(){
    console.log('app ready');
    
    // taken from and modified slightly: http://www.html5rocks.com/en/tutorials/file/dndfiles/#toc-selecting-files-dnd
     function handleFileSelectOne(evt) {
        evt.stopPropagation();
        evt.preventDefault();
            
        var files = evt.originalEvent.dataTransfer.files; // FileList object.
    
        // files is a FileList of File objects. List some properties.
        for (var i = 0, f; f = files[i]; i++) {
    
        // Only process image files.
        if (!f.type.match('image.*')) {
            continue;
        }
    
        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {
                var span = document.createElement('span');
                span.innerHTML = ['<img class="uploadImage" src="', e.target.result,'"/>'].join('');
                //document.getElementById('pic').innerHTML = span.innerHTML;      
                $(evt.currentTarget).find('.pic').html(span.innerHTML);
            };
        })(f);
        
        // Read in the image file as a data URL.
        reader.readAsDataURL(f);            
        }
    }
    
    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.originalEvent.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }
    
    $('.dropzone').on('dragover', handleDragOver);
    $('.dropzone').on('drop', handleFileSelectOne);
    
    $('#generateColourButton').click(function(){
        var myPalette = new MrPalette();
        var myPicOne = $('.uploadImage')[0];
        var myPicTwo = $('.uploadImage')[1];
        
        myPalette.generateColourHistogram(myPicOne, myPicTwo, $('#theOutput')[0]);          
    });   
    
    $('#generateLuminenceButton').click(function(){
        var myPalette = new MrPalette();
        var myPicOne = $('.uploadImage')[0];
        var myPicTwo = $('.uploadImage')[1];
        
        myPalette.generateLuminenceHistogram(myPicOne, myPicTwo, $('#theOutput')[0]);          
    });   
    
    $('#convolution3x3').click(function(){
        var myPalette = new MrPalette();
        var myPicOne = $('.uploadImage')[0];
        myPalette.doEdgeDetect(myPicOne,3,[0, -1, 0, 
-1, 4, -1, 
0, -1, 0]);          
    });  
    
    $('#convolution5x5').click(function(){
        var myPalette = new MrPalette();
        var myPicOne = $('.uploadImage')[0];
        myPalette.doEdgeDetect(myPicOne,5,[0.0029690167439506495, 0.013306209891014003, 0.021938231279715035, 0.013306209891014003, 0.0029690167439506495, 
0.013306209891014003, 0.059634295436180214, 0.09832033134884507, 0.059634295436180214, 0.013306209891014003, 
0.021938231279715035, 0.09832033134884507, 0.16210282163712414, 0.09832033134884507, 0.021938231279715035, 
0.013306209891014003, 0.059634295436180214, 0.09832033134884507, 0.059634295436180214, 0.013306209891014003, 
0.0029690167439506495, 0.013306209891014003, 0.021938231279715035, 0.013306209891014003, 0.0029690167439506495]);          
    });  
    
    $('#convolution7x7').click(function(){
        var myPalette = new MrPalette();
        var myPicOne = $('.uploadImage')[0];
        


        myPalette.doEdgeDetect(myPicOne,7,[0.00000067,	0.00002292,	0.00019117,	0.00038771,	0.00019117,	0.00002292,	0.00000067,
0.00002292,	0.00078633,	0.00655965,	0.01330373,	0.00655965,	0.00078633,	0.00002292,
0.00019117,	0.00655965,	0.05472157,	0.11098164,	0.05472157,	0.00655965,	0.00019117,
0.00038771,	0.01330373,	0.11098164,	0.22508352,	0.11098164,	0.01330373,	0.00038771,
0.00019117,	0.00655965,	0.05472157,	0.11098164,	0.05472157,	0.00655965,	0.00019117,
0.00002292,	0.00078633,	0.00655965,	0.01330373,	0.00655965,	0.00078633,	0.00002292,
0.00000067,	0.00002292,	0.00019117,	0.00038771,	0.00019117,	0.00002292,	0.00000067]);          
    });  
}