module.exports = function ( mongoose ) {
    var Schema = mongoose.Schema;
    var RecordingSchema = new Schema( {

        GroupId: { type: String, index: true },
        Status: { type: String, index: true },
        Name:    { type: String, required : 'Missing Recording Name' },
        Created: { type: Date },
        Duration: { type: Number, default: 0 },
        Members: { type: Number, default: 0 },

        // Files that were uploaded from clients
        tracks : []
    } );
    return mongoose.model('Recording', RecordingSchema );
};
