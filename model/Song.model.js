module.exports = function ( mongoose ) {
    var Schema = mongoose.Schema;
    var SongSchema = new Schema( {

        GroupId:    { type: String, required : 'Missing Group Id', index: true },
        Name:       { type: String, required : 'Missing Song Name' },

        SortOrder:  { type: Number, default: 0 },
    } );
    return mongoose.model('Song', SongSchema );
};
