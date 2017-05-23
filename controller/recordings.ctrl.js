module.exports = function(app, io, mongoose ) {

    var util = require( "../model/Util.model.js" ),
        Track = require( "../model/Track.model.js" ),
        path = require("path"),
        fs = require("fs"),
        Q = require("q");

    var Recording = mongoose.model("Recording");
    var Song = mongoose.model("Song");
    var Group = mongoose.model("Group");

    function mkdirSync( p, root) {
        var dirs = path.normalize( p ).replace(/\\/g, "/").split('/'), dir = dirs.shift(), root = (root || '') + dir + '/';
        try { fs.mkdirSync(root); } catch (e) {
            if(!fs.statSync(root).isDirectory()) throw new Error(e);
        }
        return !dirs.length || mkdirSync(dirs.join('/'), root);
    }

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


    // GET all recordings in  the group
    app.get('/api/groups/:id/recordings', function(req, res) {
        util.log( "Getting list of recording for group id=" + req.params.id );
        var query = Recording.find({
            GroupId: req.params.id
        }).sort({
            Created: 1
        }).exec( function(err, data) {
            if ( util.noError( err, req, res ) ) {
                res.status(200).json(data);
            }
        });
    });

    // GET details of recording
    app.get('/api/groups/:id/recordings/:rid', function(req, res) {

        util.log( "Seeking recording for group id=" + req.params.id + ", with id=" + req.params.rid );
        var query = Recording.findOne({
            _id: req.params.rid,
            GroupId: req.params.id
        }).exec( function(err, data) {
            if ( util.noError( err, req, res ) ) {
                res.status(200).json(data);
            }
        });
    });


    // POST new recording
    app.post('/api/groups/:id/songs/:songid/recordings', function(req, res) {
        util.log( "Adding recording for group id=" + req.params.id + ", songid=" + req.params.songid );
        var query = Song.findOne({
            _id: req.params.songid,
            GroupId: req.params.id
        }).exec(function(err, doc ) {
            if ( util.noError( err, req, res ) ) {
                if ( doc ) {
                    var obj = new Recording();
                    obj.Name = doc.Name;
                    obj.GroupId = req.params.id;
                    obj.Status = "recording";
                    obj.Created = new Date();
                    obj.tracks = [];

                    util.log( "Song found " + doc.Name );
                    obj.save(function(err, msgObject) {
                        if ( util.noError( err, req, res ) ) {
                            util.log( "Recording created for group id=" + req.params.id + ", with _id=" + msgObject._id );

                            res.status(201).json( msgObject );
                            io.emit( "recording-start", { "GroupId": req.params.id, "Name" : doc.Name, "RecordingId" : msgObject._id } );
                        }
                    } );

                } else {
                    util.log( "Song was not found from ID " +  req.params.songid );
                    res.status(404).json( [] );
                }
            }
        } );
    });

    var multer  = require('multer');
    var upload = multer( { dest: 'public/uploads/' } );


    function handleUploadedFile( recording, newPath ) {

        var rid = recording._id;
        var t = new Track();
        t.record.original = newPath;


        t.promise.to.createWavFile()
            .then( t.promise.to.readMeta )
            .then( t.promise.to.createDatFile )
            .then( t.promise.to.findControlSound )
            .then( t.promise.to.createMp3File )
            .then( t.promise.to.createPlot )
            .then( function() {

                util.trace( 'File for recording #' + rid + ': DAT file generated, plot created. Ready to SAVE to #' + rid );
                util.info( JSON.stringify(t.record) );

                var query = Recording.findOne( { _id: rid } ).exec( function(err, r ) {
                    if ( err ) { util.error( err ); return; }
                    util.info("FOUND: #" + r._id );

                    r.tracks.push( t.record );
                    r.save( function() {
                        util.info("SUCCESS: tracks of " + r._id );
                        io.emit("files-refresh", {"RecordingId": rid, "Name" : r.Name, "tracks" : r.tracks } );
                    } );
                } );

            })
            .catch(util.errorWatcher).done();
    }

    app.post('/api/groups/:id/recordings/:rid/files', upload.single('file'),  function(req, res) {

        var sFolder = (new Date()).toISOString().substring(0, 10) + "/" + req.params.rid;
        var dir = path.join(__dirname, '..', '/public/uploads/' + sFolder ).replace( /\\/g, '/' );
        mkdirSync(dir);

        var query = Recording.findOne({
            _id: req.params.rid,
            GroupId: req.params.id
        }).exec(function(err, recording) {
            if ( util.noError( err, req, res ) ) {

                var source = fs.createReadStream( req.file.path );
                var dest = fs.createWriteStream( dir + '/' + req.file.originalname );
                source.pipe( dest );
                source.on('end', function() {
                    handleUploadedFile( recording, dir + '/' + req.file.originalname );
                    res.json( [] );
                });
                source.on('error', function(err) {
                    util.log( err );
                    res.status(501).json( { "errors" : [ err ] } );
                });

            }
        } );
    } );


    app.post('/api/groups/:id/recordings/:rid/webapifiles', upload.array(), function(req, res) {

        var sFolder = (new Date()).toISOString().substring(0, 10) + "/" + req.params.rid;
        var dir = path.join(__dirname, '..', '/public/uploads/' + sFolder ).replace( /\\/g, '/' );
        mkdirSync(dir);
        util.log( "req.body.length=" + req.body.length );

        var query = Recording.findOne({
            _id: req.params.rid,
            GroupId: req.params.id
        }).exec(function(err, recording) {

            if ( util.noError( err, req, res ) ) {
                var newPath = dir + "/" + req.body.fname;
                util.log('File for recording #' + req.params.rid + ': saved at ' + newPath);

                var b64string = req.body.data.substr(req.body.data.indexOf(",") + 1);
                var buf = new Buffer(b64string, 'base64');

                fs.writeFile(newPath, buf, function(err) {
                    if ( util.noError( err, req, res ) ) {

                        handleUploadedFile( recording, newPath );
                        res.json([]);

                    }
                });
            }
        });
    } );


    // UPDATING recording information. Used for updating Status
    app.post('/api/groups/:id/recordings/:rid', function(req, res) {
        util.log( "Updating recording for group id=" + req.params.id + ", RecordingId=" + req.params.rid );
        if ( req.body.Status === undefined  ) {
            res.status(422).json({ "errors": ["Status field must be provided"] });
        } else {
            var query = Recording.findOne({
                _id: req.params.rid
            }).exec(function( err, doc ) {
                if ( util.noError( err, req, res ) ) {
                    doc.Status = req.body.Status;
                    doc.save(function(err, msgObject) {
                        if ( util.noError( err, req, res ) ) {
                            util.log( "Recording id=" + req.params.rid + ", status was updated to " + doc.Status );

                            res.status(200).json( [] );
                            io.emit( "recording-stop", {"GroupId": req.params.id, "Name" : doc.Name, "RecordingId" : req.params.rid } );
                        }
                    } );
                }
            } );

        }
    });

    // DELETE recording
    app.delete('/api/groups/:id/recordings/:rid', function(req, res) {

        Recording.findOne({
            _id: req.params.rid
        }).exec(function( err, doc ) {
            if ( util.noError( err, req, res ) ) {

                //console.log(doc.tracks.length);
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
