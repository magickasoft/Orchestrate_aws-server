module.exports = function ( mongoose ) {
    var Schema = mongoose.Schema;
    var UserSchema = new Schema( {

        Login:        { type: String, required : 'Missing Login', index: true },
        Password:     { type: String, required : 'Missing Password' },
        Created:      { type: Date },
        Enabled:      { type: Number, default: 1 },
        FirstName:    { type: String },
        LastName:     { type: String },
    } );

    return mongoose.model('User', UserSchema );
};
