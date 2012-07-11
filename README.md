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
Just drag and drop an image from your desktop into the grey box!

Controling how many colours are outputted:
==========================================================================
I'll be adding some html controls in a bit so you'll have to change the
code. If you look up the generateButton.onclick function, you can see
two parameters within the options object: threshold and maxNumColours. The
threshold controls how closely it wants to sample colours that are similar
(filters out a bit of noise) and the maxNumColours will return a set of 
colours equal to or less than the number you specify. Usually lowering
the threshold means more colours are sampled. 


Author: Tim Kim
@timkim