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
    
    $('#generateButton').click(function(){
        
        //var colourOut = document.getElementById('colourOut');
       // if(colourOut.hasChildNodes()){
           // while(colourOut.childNodes.length>0){
                //colourOut.removeChild(colourOut.firstChild);
            //}
        //}
        var myPalette = new MrPalette();
        var myPicOne = $('.uploadImage')[0];
        var myPicTwo = $('.uploadImage')[1];
        
        //var options = {
            //threshold: 50,
            //maxNumColours: 8,
            //container: 'colourOut'
       // }
        
        myPalette.generateColourHistogram(myPicOne, myPicTwo, $('#theOutput')[0]);          
    });    
}