module.exports = function ( mongoose ) {
    var Schema = mongoose.Schema;
    var MemberSchema = new Schema( {

        GroupId:        { type: String, required : 'Missing Group Id', index: true },
        SortOrder:      { type: Number, default : 0 }, // # inside the group
        ConnectedDate:  { type: Date },

        FirstName:     { type: String, required : 'Missing First Name' },
        LastName:      { type: String, required : 'Missing Last Name' },
        Instrument:    { type: String, required : 'Missing Instrument (Channel) Name' },

    } );

    return mongoose.model('Member', MemberSchema );
};
