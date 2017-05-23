module.exports = function(app, io, mongoose) {

    var Instrument = mongoose.model("Instrument");
    var util = require("../model/Util.model.js");

    // At the root of your website, we show the index.html page
    app.get('/api/instruments', function(req, res) {
        var query = Instrument.find({}).sort({
            Name: 1
        }).exec( function(err, data) {
            if ( util.noError( err, req, res ) ) {
                res.status(200).json(data);
            }
        });
    });

    // GET single inrtument details
    app.get('/api/instruments/:id', function(req, res) {
        var query = Instrument.findOne({
            _id : req.params.id
        }).exec( function( err, data) {
            res.status(200).json(data);
        });
    });




    // UPDATING existing group
    app.post('/api/instruments/:id', function(req, res) {
        if ( req.body.Name === undefined &&
             req.body.Code === undefined ) {
            res.status(422).json({ "error": ["Name and Code must be provided"] });
        } else {
            Instrument.findOne({
                _id: req.params.id
            }).exec( function(err, doc) {

                util.log( "Instrument record found " + doc._id );
                if ( util.noError( err, req, res ) ) {

                    util.log( "No error, updating instrument " + doc._id +  " " + JSON.stringify( req.body ) );
                    // updating document name
                    if ( req.body.Name !== undefined ) { doc.Name = req.body.Name; }
                    if ( req.body.Code !== undefined ) { doc.Code = req.body.Code; }

                    doc.save(function(err, msgObject) {
                        // display validation errors.
                        util.log( "Instrument Updated Successfully " + doc._id );
                        if ( util.noError( err, req, res ) ) {
                            res.status(200).json(msgObject);
                        }
                    });
                }
            });
        }
    });


    // POST new instrument creation
    app.post('/api/instruments', function(req, res) {
        Instrument.find({
            Name: req.body.Name
        }).exec( function( err, docs) {
            if ( util.noError( err, req, res ) ) {
                if (docs.length === 0) {
                    var g = new Instrument();
                    g.Name = req.body.Name;
                    g.save(function(err, msgObject) {
                        if ( util.noError( err, req, res ) ) { res.status(201).json([]); }
                    });
                } else {
                    res.status(422).json({
                        "error": ["Instrument with such name already exists"]
                    });
                }
            }
        });
    });



    // GET single group
    app.delete('/api/instruments/:id', function(req, res) {
        var query = Instrument.remove({
            _id: req.params.id
        }, function( err, doc ) {
            if ( util.noError( err, req, res ) ) {
                res.status(200).json( [] );
            }
        } );
    });

};
