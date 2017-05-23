var mongoose = require('../node_modules/mongoose');
var done = function() {
	mongoose.connection.close();
};

var nGroupId = 0;
var songs = [ "Camp down races", "Beethoven 5th", "Mozart the Magic Fluite", "50,000 lbs of bananas" ];

var initSongs = function( err, doc ) {
	if ( err ) { console.log(err); done(); return; }
	if ( songs.length === 0 ) { console.log( "songs.length == 0" ); done(); return; }

	var Song = mongoose.model( "Song" );
	var song = new Song();
	song.GroupId = nGroupId;
	song.Name = songs.shift();

	console.log( ( new Date() ).toISOString() + " Adding Song: \"" + song.Name + "\"" );
	song.save( initSongs );
};

var instruments = [ 
  ['SO', 'Soprano'],
  ['AL', 'Alto'],
  ['TE', 'Tenor'],
  ['BS', 'Bass'],
  ['BR', 'Baritone'],
  ['LE', 'Lead']
];
var initInstruments = function( err, doc ) {
	if ( err ) { console.log(err); done(); return; }
	if ( instruments.length === 0 ) { console.log( "instruments.length == 0" ); done(); return; }

	var Instrument = mongoose.model( "Instrument" );
	var instr = new Instrument();
	var arr = instruments.shift();
	instr.Name = arr[1];
	instr.Code  = arr[0];

	console.log( ( new Date() ).toISOString() + " Adding Instruments: \"" + instr.Name + "\"" );
	instr.save( initInstruments );
};


console.log( ( new Date() ).toISOString() + " Connecting..." );
mongoose.connect( require( "../config/db.js" ).connection );

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {

	console.log( ( new Date() ).toISOString() + " Connected to MongoDB" );

	require( "../model/Group.model.js")(mongoose);
	require( "../model/Song.model.js")(mongoose);
	require( "../model/Instrument.model.js")(mongoose);

	var Group = mongoose.model( "Group" );
	Group.find( { Name: "Demo" }, function( err, docs ) {
		// console.log( docs );
		if ( docs.length === 0 ) {
			var g = new Group();
			g.Name = "Demo";
			g.InvitationCode = Math.random().toFixed(6).replace( "0.", "" );
			g.devices = [
				"19EFFAA1-6C08-4B6C-8060-BB4488EB16D8",
				"8e9dd090e5c29dd2",
				"123412341234"
			];
			g.save( function( err, doc ) {
                // display validation errors.
				if ( err && err.errors !== undefined ) { console.log(err.errors); return; }

				nGroupId = doc._id;
				console.log( ( new Date() ).toISOString() + " Demo group successfully created ID=" + nGroupId );
				initInstruments(); initSongs();
			} );
		} else {
			console.log( ( new Date() ).toISOString() + " Demo group already exists, ID=" + docs[0]._id );
			nGroupId = docs[0]._id;
			initInstruments(); initSongs();
		}

	} );

});
