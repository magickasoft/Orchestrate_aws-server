module.exports = function () {

    var util = require( "../model/Util.model.js" ),
        fs = require("fs"),
		path = require("path"),
		Q = require("q"),
		Signal = require( "../model/Signal.model.js" ),
		Frequencies = require( "../model/Frequencies.model.js" ),
		fingerprint = require( "../config/fingerprint.js" );


    var track = this;
    track.record = { original: "" };

	track.promise = {};
	track.promise.to = {};
	track.promise.to.readMeta = function( ) {
		r = track.record;

		util.log( "readMeta:"  + r.wav  );
		return util.promise.to.execute( "sox --i " + util.shellescape( r.wav )  )
			.then( function( data ) {
				var arrLines = data.split("\n" );
				for ( var i = 0 ; i < arrLines.length; i ++ ) {
					if ( arrLines[ i ].indexOf( ":" ) !== -1 ) {
						var keyval = arrLines[ i ].split( ":" );
						var k = keyval.shift();
						r[ k.trim() ] = keyval.join(":").trim().replace( "'", "" );
					}
				}
				track.record = r;
				return r;
			} );
	};


	track.promise.to.createWavFile = function(  ) {
		r = track.record;
		if ( /\.wav$/.test( r.original ) ) {
			//r.wav = r.original;
			//util.log( "createWavFile:"  + r.wav + " - wav was already uploaded" );
			//var deferred = Q.defer();
			//deferred.resolve( "ok" );
			//return deferred.promise;
			r.wav = r.original + ".wav";
			util.log( "createWavFile:"  + r.wav );
			return util.promise.to.execute( "ffmpeg -i " + util.shellescape(r.original) + " " + util.shellescape( r.wav )  );
		} else {
			// if original was a wav file
			r.wav = r.original + ".wav";
			util.log( "createWavFile:"  + r.wav );
			return util.promise.to.execute( "ffmpeg -i " + util.shellescape(r.original) + " " + util.shellescape( r.wav )  );
		}
	};


	track.promise.to.createDatFile = function( ) {
		r = track.record;
		r.dat = r.original + ".dat";
		util.log( "createDatFile:"  + r.dat );
		return util.promise.to.execute( "sox " +  util.shellescape( r.wav ) + " -c 1 -r 8000 -t dat - | tail -n +3 > " +  util.shellescape( r.original + ".dat" )  );
	};


	track.promise.to.findControlSound = function() {
		r = track.record;
		r.nOffsetOfSignal = 0.0;
		var deferred = Q.defer();
		util.log( "findControlSound from " + r.dat );

		( new Signal( r.dat ) ).walk( 0.0, 10, 256, function( tmOffset, arrSignal ) {
			// util.log(  tmOffset + " " + arrSignal.length + " array items" );
                        var plot = new Frequencies( tmOffset, arrSignal );
			var top = plot.getTopFrequencies();

			if ( top.length === 0 ) return; // consider it was a frame with silence....
			var bMatching = false;
			if ( ! r.nOffsetOfSignal )  {
				bMatching = plot.matchFingerprint( fingerprint );
				// console.log( tmOffset + " " + ( bMatching ? "*" : " " ) + " " + JSON.stringify( top ) );
				if ( bMatching ) {
					r.nOffsetOfSignal = tmOffset - fingerprint.offset;
					r.nOffsetOfSignal = parseInt( r.nOffsetOfSignal * 10000, 10 )  / 10000;
				}
			}
			util.info( tmOffset + " " + ( bMatching ? "*" : " " ) + " " + JSON.stringify( top ) );

		}, function() {
			if ( r.nOffsetOfSignal !== 0.0 ) {
				util.log(  "Control signal found at " + r.nOffsetOfSignal + ". Track should be started from " + (r.nOffsetOfSignal + fingerprint.duration) );
			} else {
				util.warn( "Control sound was not detected withing 10 seconds" );
			}
			deferred.resolve( "ok" );
		} );
		return deferred.promise;
	};


	track.promise.to.createMp3File = function( ) {
		r = track.record;
		r.mp3 = r.original + ".mp3";

		var sCommand = "sox -v `sox " +  util.shellescape( r.wav ) + " -n stat -v 2>&1` " +  util.shellescape( r.wav ) + " " + util.shellescape( r.mp3 );
		if ( typeof ( r.nOffsetOfSignal ) !== "undefined" && r.nOffsetOfSignal !== 0.0 ) {
			sCommand += " trim " + (r.nOffsetOfSignal + fingerprint.duration);
		}
		util.log( "createMp3File:"   + r.mp3 );
		return util.promise.to.execute( sCommand );
	};

	track.promise.to.createPlot = function() {
		r = track.record;
		var regex = /^([0-9][0-9]):([0-9][0-9]):([0-9][0-9])\./;
		var matches = r.Duration.match(regex);
		var seconds = parseInt( matches[3], 10 ) + parseInt( matches[2], 10 )*60 + parseInt( matches[1], 10 )*60*60;

		r.gpi = r.original + ".gpi";
		r.png = r.original + ".png";
		r.seconds = seconds;
		r.width = r.seconds * 10;

		util.log( "Duration: " + seconds + " seconds, creating plot " + r.width + "x50, " + r.gpi );
		var arrGpiLines = [
			"set yr [-1:1]",
			"set term png size "+r.width+",50 font 'DejaVu Serif'",
			"set output \"" + r.png + "\"",
			"unset key",
			"unset tics",
			"unset border",
			"set lmargin 0",
			"set rmargin 0",
			"set tmargin 0",
			"set bmargin 0",
			"set obj 1 rectangle behind from screen 0,0 to screen 1,1",
			"set obj 1 fillstyle solid 1.0 fillcolor rgbcolor \"#EEEEEE\"",
			"plot \"" + ( r.dat  ) + "\" with lines"
		];
		fs.writeFileSync( r.gpi, arrGpiLines.join("\n") );
		return util.promise.to.execute( "gnuplot " + util.shellescape( r.gpi ) );
	};

    return  track;
};
