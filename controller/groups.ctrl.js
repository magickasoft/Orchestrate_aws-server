module.exports = function(app, io, mongoose) {

    var util = require("../model/Util.model.js");
    var Group = mongoose.model("Group");
    var Recording = mongoose.model("Recording");
    var Song = mongoose.model("Song");
    var path = require("path");
    var fs = require("fs");
    var Q = require("q");

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
    // At the root of your website, we show the index.html page
    app.get('/api/groups', function(req, res) {
//console.log(req);
        var arrFilter = {};
        if ( req.query.InvitationCode !== undefined ) {
            arrFilter.InvitationCode = req.query.InvitationCode;
        } else if ( req.query.LoginCode !== undefined ){
            arrFilter.LoginCode = req.query.LoginCode;
        }

        Group.find( arrFilter ).sort({
            Name: 1
        }).exec( function( err, data ) {
            if ( util.noError( err, req, res ) ) {

                Recording.aggregate([
                    { "$match" : { "Status" : { "$eq" : "recording" } } },
                    { "$group": { "_id": "$GroupId", "count": { "$sum": 1 } } },
                ], function (err, aggData ) {
                   if ( util.noError( err, req, res ) ) {
                      // console.log( aggData );
                      var result = data;
                      for ( var i = 0; i < data.length; i ++ ) {
                        var groupId = data[i]._id;
                        var bFound = false;
                        for ( var k = 0; k < aggData.length;  k ++ ) {
                            if ( aggData[k]._id == groupId ) {
                                result[ i ].Total = aggData[k].count;
                                bFound = true;
                                break;
                            }
                        }
                        if ( !bFound ) {
                            result[ i ].Total = 0;
                        }
                      }

                      res.status(200).json( result );
                   }
                } );

            }
        });
    });


    // GET single group
    app.get('/api/groups/:id', function(req, res) {
        var query = Group.find({
            _id: req.params.id
        }).exec(function( err, data ) {
            if ( util.noError( err, req, res ) ) {
                if (data.length > 0) {

                    var result = data[0];
                    result.Total = 0;
                    Recording.aggregate([
                        { "$match" : {
                            "GroupId" : req.params.id,
                            "Status" : { "$eq" : "recording" }
                        } },
                        { "$group": { "_id": "$GroupId", "count": { "$sum": 1 } } },
                    ], function (err, aggData ) {
                        if ( util.noError( err, req, res ) ) {
                            if ( typeof( aggData[0]) !== "undefined" ) {
                                result.Total = aggData[ 0 ].count;
                            }
                            res.status(200).json( result );
                        }
                    } );

                } else {
                    res.status(404).json( [] );
                }
            }
        });
    });

    // POST new group creation
    app.post('/api/groups', function(req, res) {
        Group.find({
            Name: req.body.Name
        }).exec( function( err, docs) {
            if ( util.noError( err, req, res ) ) {
                if (docs.length === 0) {
                    var g = new Group();
                    g.Name = req.body.Name;
                    g.InvitationCode = ( typeof( req.body.InvitationCode ) !== "undefined" ) ?
                        req.body.InvitationCode :
                        Math.round().toFixed(6).replace( "0.", "" );

                    if ( typeof( req.body.InvitationCode ) !== "undefined" ) {
                        g.LoginCode = req.body.LoginCode;
                    }

                    g.devices = []; // TODO: assign devices from which you can manage that group
                    g.instruments = [];

                    util.log( "Creating new group " + JSON.stringify( g ) ) ;
                    g.save(function(err, msgObject) {
                        util.log( "Group was saved " + JSON.stringify( msgObject ) ) ;
                        if ( util.noError( err, req, res ) ) { res.status(201).json( msgObject ); return; }
                        res.status(201).json( msgObject );
                    });

                } else {
                    res.status(422).json({
                        "errors": ["Group with such name already exists"]
                    });
                }
            }
        });
    });

    // UPDATING existing group
    app.post('/api/groups/:id', function(req, res) {

        if ( req.body.Name === undefined &&
             req.body.InvitationCode === undefined &&
             req.body.instruments === undefined ) {
            res.status(422).json({ "errors": ["Name of Invication Code must be provided"] });
        } else {

            Group.findOne({
                _id: req.params.id
            }).exec( function(err, doc) {

                util.log( "Group record found " + doc._id );
                if ( util.noError( err, req, res ) ) {

                    util.log( "No error, updating group " + doc._id +  " " + JSON.stringify( req.body ) );
                    // updating document name
                    if ( req.body.Name !== undefined ) { doc.Name = req.body.Name; }
                    if ( req.body.InvitationCode !== undefined ) { doc.InvitationCode = req.body.InvitationCode; }
                    if ( req.body.instruments !== undefined ) { doc.instruments = req.body.instruments; }
                    if ( req.body.LoginCode !== undefined ) { doc.LoginCode = req.body.LoginCode; }

                    doc.save(function(err, msgObject) {
                        // display validation errors.
                        util.log( "Group Updated Successfully " + doc._id );
                        if ( util.noError( err, req, res ) ) {
                            res.status(200).json(msgObject);
                        }
                    });
                }
            });
        }
    });

    // GET single group
    app.delete('/api/groups/:id', function(req, res) {
        var query = Group.remove({
            _id: req.params.id
        }, function( err, doc ) {
            if ( util.noError( err, req, res ) ) {

            }
        } );
        var query1 = Song.remove({
            GroupId: req.params.id.toString()
        }, function( err, doc ) {
            if ( util.noError( err, req, res ) ) {

            }
        } );

        Recording.find({
            GroupId: req.params.id.toString()
        }).exec(function( err3, doc1 ) {
            if ( util.noError( err3, req, res ) ) {
                console.log("Recording: ", doc1);

                for ( var k = 0; k < doc1.length; k ++ ) {
                    var rID = doc1[k]._id;
                    console.log("RID: ", rID);
                    Recording.findOne({
                        _id: rID
                    }).exec(function( err, doc ) {
                        if ( util.noError( err, req, res ) ) {
                            console.log("DOC: ",doc);
                            var rID_remove = doc._id;
                            var query = Recording.remove({
                                _id: rID_remove
                            }, function( err2, result ) {
                                if ( util.noError( err2, req, res ) ) {
                                    var tracks = doc.tracks;
                                    var fullPathName = '';
                                    console.log("INTROSCEPTION: ",doc.tracks);
                                    if (tracks && tracks.length > 0) {
                                        console.log("go inner: ",doc.tracks);
                                        if (tracks[0].original) {
                                            fullPathName = tracks[0].original.split('/');
                                            var path = '';
                                            for (var i = 0; i < fullPathName.length -1; i++) {
                                                if (fullPathName[i] && fullPathName[i]!== '') {
                                                    path = path + '/' + fullPathName[i];
                                                }
                                            }
                                            console.log("path: ", path);
                                            rmDir( path );
                                        }
                                    }

                                }
                            } );

                        }
                    } );

                }
                res.status(200).json( [] );
            }
        } );




    });

};
