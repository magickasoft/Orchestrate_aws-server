var util = require( "../model/Util.model.js" );
var Track = require( "../model/Track.model.js" );

var t = new Track();
t.record = {};
t.record.original = "../public/uploads/2015-12-18a/56743519b1414d143f24dcee/Baritone_Victor_android_56743519b1414d143f24dcee.amr.wav";
t.record.wav = t.record.original;

t.promise.to.readMeta()
	.then( t.promise.to.createDatFile )
        .then( t.promise.to.createPlot )
        .then( function() {
	     util.info( "readMeta: done" );			      
             util.info( JSON.stringify(t.record) );
	} )
        .catch( util.errorWatcher ).done();
