module.exports = function ( mongoose ) {
    var Schema = mongoose.Schema;
    var InstrumentSchema = new Schema( {
        Name:       { type: String, required : 'Missing Instrument Name' },
        Code:       { type: String },
    } );
    return mongoose.model('Instrument', InstrumentSchema );
};
