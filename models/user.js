var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  name: {type: String, required: true, trim: true},
  idname: {type: String, required: true, index: true, unique: true, trim: true},
  tel: {type: String, required: true, index: true, unique: true, trim: true, default: '010-0000-0000'},
  password: {type: String},
  salt: {type: String},
  facebook: {id: String, token: String, photo: String},
  createdAt: {type: Date, default: Date.now},
  isAdmin: {type: Boolean, default: false}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var User = mongoose.model('User', schema);

module.exports = User;