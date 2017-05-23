module.exports = function( tmOffset, arrSignal ) {

	var nSampleRate = 8000;
	var fft = require('fft-js').fft,  fftUtil = require('fft-js').util;

	this.tm   = tmOffset;

	var phasors= fft(arrSignal);
	var frequencies = fftUtil.fftFreq( phasors, nSampleRate );
	var magnitudes = fftUtil.fftMag( phasors );

	this.size = frequencies.length;
	this.freq = frequencies;
	this.mag  = magnitudes;

	this.sorted = [];
	for ( var i = 0; i < this.size; i ++ ) { this.sorted.push( { f : this.freq[ i ], m : this.mag[ i ] } ); }
	this.sorted.sort( function(a, b){ return parseFloat( b.m ) - parseFloat( a.m ); } );

	var arrTop = [];
	for ( var k = 0; k < this.sorted.length; k ++ ) {
		if ( parseInt( this.sorted[k].m, 10 ) < 0.0001 ) break; 
		arrTop.push( this.sorted[ k ].f ); // ( parseInt( this.sorted[k].m, 10 ) > 0 ? " [" + parseInt( this.sorted[k].m, 10 )+"]" : "") );
		if ( arrTop.length > 5 ) break;
	}	

	this.getTopFrequencies = function() { return arrTop; };
	
	this.matchFingerprint = function( fp ) {
		// for each fingerprint's frequency
		for ( var ffi = 0; ffi < fp.frequencies.length; ffi ++ ) {		
			var bFreqFound = false;
			var fltFreqRequired = fp.frequencies[ ffi ];

			for ( var i = 0; i < arrTop.length; i ++ ) {
				if ( ( arrTop[i] + fp.precision ) >= fltFreqRequired && 
                                     ( arrTop[i] - fp.precision ) <= fltFreqRequired ) {

					bFreqFound = true;
				}
			}		
			if ( ! bFreqFound ) return false; // ALL fp frequencies should be available
		}
		return true; // we have all fp frequencies here
	}
	return this;	         	

};


