MrPalette
=========

Get the colour palette of an image using canvas and js.

How to run:
==========================================================================
You won't be able to just open up the index.html file to run this example.
This is because when you use getImageData function, it'll throw a security 
error. To get around this, launch mamp, iis, python server, etc and serve
the page that way. Or figure out how to disable that particular security
flag on your browser (I'll leave that up to you to figure out).

Using your own image:
==========================================================================
Currently the image is hardcoded so just change the refernce in the img
src to point to whichever one you want. This will change in the future
to allow drag/drop, file upload, or something generally cleaner.

Controling how many colours are outputted:
==========================================================================
The function generateColourPalette(imageData, threshold) is the main function
that determines how many colours are outputted. Try setting the threshold to 
a lower number to allow more colours and a higher number for less.

Don't set it too low (less than 16) otherwise it might take awhile to 
process.

If you set it too high, you'll get less and less colours to point where 
you might just get two.


Author: Tim Kim
@timkim