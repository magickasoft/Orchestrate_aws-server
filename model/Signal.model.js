module.exports = function ( file ) {

    var util = require( "../model/Util.model.js" ),
        fs = require("fs"),
	readline = require('readline'),
	path = require("path"),
        stream = require('stream');

    var me = this;

    me.get = function( minTime, maxTime, cb ) {
        var arr = [], nLine = 0;

	var instream = fs.createReadStream( file );
        var rl = readline.createInterface( { input: instream, terminal: false } );
	rl.on('line', function(line) {

	    var columns = line.trim().replace(/\s+/g, ' ').split( " " );
	    var time = parseFloat( columns[0] );

	    if ( typeof( minTime ) !== "undefined" && minTime > time ) return;
	    if ( typeof( maxTime ) !== "undefined" && maxTime < time ) { rl.close(); return; }
            // if ( nLine > 10 ) { rl.close(); return; } 
            // console.log( nLine + " " + columns[0] );

	    arr.push( parseFloat( columns[1] ) );

	    nLine ++;

	}).on('close', function() {
            cb( arr );
        });
    };

    me.walk = function( minTime, maxTime, size, funcOnWindow, funcOnFinish ) {
        var time, arr = [], nLine = 0, tmOffsetStart = 0.0, nOffsetStart = 0;

	var instream = fs.createReadStream( file );
        var rl = readline.createInterface( { input: instream, terminal: false } );
	rl.on('line', function(line) {

	    var columns = line.trim().replace(/\s+/g, ' ').split( " " );
	    time = parseFloat( columns[0] );
	    if ( typeof( minTime ) !== "undefined" && minTime > time ) return;
	    if ( typeof( maxTime ) !== "undefined" && maxTime < time ) { rl.close(); return; }

	    arr.push( parseFloat( columns[1] ) );

	    nLine ++; 
	    if ( arr.length == size ) { 
		funcOnWindow( tmOffsetStart, arr );
		arr = []; nOffsetStart = nLine; tmOffsetStart = time;
	    } else {
		    nOffsetStart ++;
            } 

	}).on('close', function() {
            funcOnFinish();
        });
    };



    
    return me;
};
