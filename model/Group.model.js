module.exports = function ( mongoose ) {
    var Schema = mongoose.Schema;
    var GroupSchema = new Schema( {

        Name:    { type: String, required : 'Missing Group Name', index: true, unique: true },
        InvitationCode: { type: String, default: '', index: true, unique: true },
        LoginCode: { type: String, default: '', index: true, unique: true },

        // Not actually used!
        Total : { type: Number, default: 0 },


        // ASSIGNED DEVICES, THAT ARE ALLOWED TO MODIFY THAT GROUP
        devices : [],
        // ASSIGNED INSTRUMENTS
        instruments : []
    } );

    return mongoose.model('Group', GroupSchema );
};
