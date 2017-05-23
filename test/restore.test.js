var util = require( "../model/Util.model.js" );
var Track = require( "../model/Track.model.js" );
var Recording = require( "../model/recording.model.js" );

var rid = process.argv[1];
if ( typeof( rid ) === "undefined" ) { 
	util.log( "USAGE: recording ID expected"); process.exit( 1 ); 
}


var query = Recording.findOne({ _id: rid }).exec(function(err, recording) {
	if ( err ) { 
		util.log( err ); process.exit( 1 ); 
	}

	var t = new Track();
	t.record = recording;
	t.promise.to.readMeta()
		.then( t.promise.to.createDatFile )
	        .then( t.promise.to.createPlot )
        	.then( function() {
		     util.info( "readMeta: done" );			      
        	     util.info( JSON.stringify( t.record ) );
		} )
		// .then()
        	.catch( util.errorWatcher ).done();

} );	
