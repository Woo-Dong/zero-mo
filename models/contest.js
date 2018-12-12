var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  author: {type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
 
  company: {type: String, default: '이름없음'},
  company_category: {type: String, default: '기타'},
  content: {type: String, trim: true, required: true},
  start: {type: Date, default: Date.now},
  end: {type: Date, default: Date.now},
  prize: {type: String, trim: true, default: '없음'},
  category: {type: String, required: true, default: '기타'},
  target: {type: String, required: true, default: '제한없음'},
  commision: {type: String, default: 'closed'},
  report: {type: Number, default: 0},
  img: {type: String},

  numLikes: {type: Number, default: 0},
  numView: {type: Number, default: 0},
  numComments: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now},

}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Contest = mongoose.model('Contest', schema);

module.exports = Contest;
