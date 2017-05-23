module.exports = function(app, io, mongoose) {

    var util = require("../model/Util.model.js");

    var User = mongoose.model("User");

    // GET all users
    app.get('/api/users', function(req, res) {
        User.find({}).sort( { Login:  1 }).exec(function(err, data) {
            if ( util.noError( err, req, res ) ) {
                var arrSecure = [];
                for ( var k = 0; k < data.length; k ++ ) {
                    var copy = data[ k ];
                    copy.Password = undefined;
                    arrSecure.push( copy );
                }
                res.status(200).json(arrSecure);
            }
        });
    });

    // GET single user
    app.get('/api/users/:id', function(req, res) {
        var query = User.findOne({
            _id: req.params.id,
        }).exec(function(err, doc ) {
            if ( util.noError( err, req, res ) ) {
                if ( ! doc ) {
                    res.status(404).json( doc );
                } else {
                    res.status(200).json( doc );
                }
            }
        });
    });

    // POST: Creates new user
    app.post('/api/users', function(req, res) {
        if ( req.body.Login === undefined ) {
            res.status(422).json({ "errors": ["At least user login must be provided"] });
        } else {

            var u = new User();
            u.Login = req.body.Login;
            u.Password = req.body.Password;
            u.Created = new Date();
            u.Enabled = typeof( req.body.Enabled ) === undefined ? 1 : req.body.Enabled;
            u.FirstName = req.body.FirstName;
            u.LastName = req.body.LastName;
            u.save( function(err, msgObject) {
                    if ( err ) { util.log(err); }
            } );
            res.status(201).json([]);
        }
    });

    // POST: Update existing user
    app.post('/api/users/:id', function(req, res) {
        var query = User.findOne({
            _id: req.params.id,
        }).exec(function(err, doc ) {
            if ( util.noError( err, req, res ) ) {
                if ( ! doc ) {
                    res.status(404).json( doc );
                } else {
                    var arrFields = [ "Login", "Password", "Enabled", "FirstName", "LastName"];
                    for ( var i =0; i < arrFields.length; i ++ ) {
                        var f = arrFields[ i ];
                        if ( typeof( req.body[ f ] ) !== "undefined" ) {
                            doc[ f ] = req.body[ f ];
                        }
                    }
                    doc.save( function(err, msgObject) {
                        if ( err ) { util.log(err); }
                    } );
                    res.status(200).json( doc );
                }
            }
        });
    });


    // DELETE: Remove existing user
    app.delete('/api/users/:id', function(req, res) {
        var query = User.remove({
            _id: req.params.id
        }, function( err, doc ) {
            if ( util.noError( err, req, res ) ) {
                res.status(200).json( [] );
            }
        } );
    });

};
