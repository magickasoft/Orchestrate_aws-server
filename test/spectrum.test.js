var util = require( "../model/Util.model.js" );
var Signal = require( "../model/Signal.model.js" );
var Frequencies = require( "../model/Frequencies.model.js" );
var fingerprint = require( "../config/fingerprint.js" );

// var datfile = "../public/sounds/iconic.mp3.dat";
var datfile = "fixtures/1.dat";
console.log( "file:"  + datfile );
console.log( "fingerprint: " + JSON.stringify( fingerprint ) );

var nOffsetOfSignal = 0.0;
( new Signal( datfile )).walk( 0.0, 3, 256, function( tmOffset, arrSignal ) {

   // util.log(  tmOffset + " " + arrSignal.length + " array items" );
   var plot = new Frequencies( tmOffset, arrSignal );
   var top = plot.getTopFrequencies();
   if ( top.length === 0 ) return; // consider it was a frame with silence....

   // if ( ! nOffsetOfSignal )  {
	var bMatching = plot.matchFingerprint( fingerprint );
        console.log( tmOffset + " " + ( bMatching ? "*" : " " ) + " " + JSON.stringify( top ) );
	if ( bMatching  && nOffsetOfSignal === 0.0 ) { 
		nOffsetOfSignal = tmOffset - fingerprint.offset; 
		nOffsetOfSignal = parseInt( nOffsetOfSignal * 100000, 10 )  / 100000;
	} 
//   }

}, function() {
	
	if ( nOffsetOfSignal !== 0.0 ) {
		util.log(  "Control signal found at " + nOffsetOfSignal + ". Track should be started from " + (nOffsetOfSignal + fingerprint.duration) );
	} else {
		util.warn( "Control sound was not detected " );
	}

} );

