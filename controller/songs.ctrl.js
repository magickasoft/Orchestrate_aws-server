module.exports = function(app, io, mongoose) {

    var util = require("../model/Util.model.js");

    var Group = mongoose.model("Group");
    var Song = mongoose.model("Song");

    // GET all songs for the selected group
    app.get('/api/groups/:id/songs', function(req, res) {
        Song.find({
            GroupId: req.params.id
        }).sort( { Name:  1 }).exec(function(err, data) {
            if ( util.noError( err, req, res ) ) {
                res.status(200).json(data);
            }
        });
    });

    // GET single songs for the selected group
    app.get('/api/groups/:id/songs/:sid', function(req, res) {
        var query = Song.findOne({
            _id: req.params.sid,
            GroupId: req.params.id
        }).exec(function(err, doc ) {
            if ( util.noError( err, req, res ) ) {
                if ( ! doc ) {
                    res.status( 404 ).json( doc );
                } else {
                    res.status(200).json( doc );
                }
            }
        });
    });

    // POST new song
    app.post('/api/groups/:id/songs', function(req, res) {
        if ( req.body.Name === undefined ) {
            res.status(422).json({ "errors": ["At least one of the songs must be provided"] });
        } else {

            var arrLines = req.body.Name.split("\n");
            for ( var l = 0; l < arrLines.length; l ++ ) {
                if ( arrLines[l].trim() === "" ) continue;

                util.log( "Adding song " + arrLines[l] );
                var g = new Song();
                g.Name = arrLines[l];
                g.GroupId = req.params.id;

                g.save(function(err, msgObject) {
                    if ( err ) { util.log(err); }
                } );
            }
            res.status(201).json([]);
        }
    });

    // DELETE single song
    app.delete('/api/groups/:id/songs/:sid', function(req, res) {
        var query = Song.remove({
            _id: req.params.sid
        }, function( err, doc ) {
            if ( util.noError( err, req, res ) ) {
                res.status(200).json( [] );
            }
        } );
    });

};
