module.exports = function(app, io, mongoose ) {

    var util = require( "../model/Util.model.js" ),
        Track = require( "../model/Track.model.js" ),
        path = require("path"),
        fs = require("fs"),
        Q = require("q");

    var Recording = mongoose.model("Recording");

    function rmDir( dirPath ) {
        try { var files = fs.readdirSync(dirPath); }
        catch(e) { return; }
        if (files.length > 0)
            for (var i = 0; i < files.length; i++) {
                var filePath = dirPath + '/' + files[i];
                if (fs.statSync(filePath).isFile())
                    fs.unlinkSync(filePath);
                else
                    rmDir(filePath);
            }
        fs.rmdirSync(dirPath);
    }

    // GET brief recordings information
    app.post( '/api/recordings/bulk-search', function(req, res) {
        util.log( "Getting list of recordings" );
        var sIds = req.body.ids.replace( /,/g , " " );
        var arrIds = sIds.trim().replace( /\s+/g, " " ).split( " " );
        var queue = [], nLength = arrIds.length;

        for ( var i = 0; i < arrIds.length; i ++ ) {
            var sId = arrIds[ i ];
            util.debug( "SEARCH FOR ID:" + sId );

            Recording
                .findOne( { _id : sId } )
                .exec( function(err, data) {

                    if ( err ) { util.error( err );  }

                    if ( err || data === null ) {
                        util.debug( "Record not found" );
                        nLength --;
                        if ( queue.length >= nLength  ) { util.debug( queue );
                        res.status( 200 ).json( queue ); }
                        return;
                    }

                    queue.push( {
                        "_id" : data._id,
                        "Status" : data.Status,
                        "Name" : data.Name,
                        // "Duration" : data.Duration,
                        "Created" : data.Created,
                    } );
                    if ( queue.length >= nLength ) {
                        util.debug( queue );
                        res.status( 200 ).json( queue );
                    }
                } );
        }

        if ( arrIds.length === 0 ) {
            res.status( 200 ).json( [] );
        }

    });


    // GET all recordings
    app.get('/api/recordings', function(req, res) {
        util.log( "Getting list of recordings" );
        var query = Recording.find({
        }).sort({
            Created: 1
        }).exec( function(err, data) {
            if ( util.noError( err, req, res ) ) {
                res.status(200).json(data);
            }
        });
    });

    // GET details of singer
    app.get('/api/recordings/:rid', function(req, res) {

        util.log( "Seeking recording with id=" + req.params.rid );
        var query = Recording.findOne({
            _id: req.params.rid
        }).exec( function(err, data) {
            if ( util.noError( err, req, res ) ) {
                res.status(200).json(data);
            }
        });
    });


    // DELETE recording
    app.delete('/api/recordings/:rid', function(req, res) {
        Recording.findOne({
            _id: req.params.rid
        }).exec(function( err, doc ) {
            if ( util.noError( err, req, res ) ) {
                var query = Recording.remove({
                    _id: req.params.rid
                }, function( err2, result ) {
                    if ( util.noError( err2, req, res ) ) {
                        res.status(200).json( [] );

                        //var arrFiles =[ doc.original, doc.dat, doc.png, doc.wav ];
                        //for ( var k = 0; k < arrFiles.length; k ++ ) {
                        //    if ( arrFiles[ k ] === undefined ) continue;
                        //    fs.unlinkSync(  arrFiles[ k ] );
                        //}
                        var tracks = doc.tracks;
                        var fullPathName = '';
                        console.log("INTROSCEPTION: ",doc.tracks);
                        //if (tracks && typeof doc['tracks'] !== "undefined" && doc.hasOwnProperty('tracks')){
                        if (tracks && tracks.length > 0) {
                            console.log("go inner: ",doc.tracks);
                            /*for ( var k = 0; k < tracks.length; k ++ ) {
                                if ( tracks[k].original){
                                    fs.unlinkSync(tracks[k].original);
                                }
                                if ( tracks[k].dat){
                                    fs.unlinkSync(tracks[k].dat);
                                }
                                if ( tracks[k].png){
                                    fs.unlinkSync(tracks[k].png);
                                }
                                if ( tracks[k].wav){
                                    fs.unlinkSync(tracks[k].wav);
                                }
                                if ( tracks[k].gpi){
                                    fs.unlinkSync(tracks[k].gpi);
                                }
                                if ( tracks[k].mp3){
                                    fs.unlinkSync(tracks[k].mp3);
                                }
                            }*/
                            if (tracks[0].original) {
                                fullPathName = tracks[0].original.split('/');
                                var path = '';
                                for (var i = 0; i < fullPathName.length -1; i++) {
                                    if (fullPathName[i] && fullPathName[i]!== '') {
                                        path = path + '/' + fullPathName[i];
                                    }
                                }
                                rmDir( path );
                            }
                            //console.log(path);
                            //fs.rmdirSync( path );
                        }

                    }
                } );

            }
        } );
    });
};
