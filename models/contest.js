var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

    const imageSchema = new mongoose.Schema({
  width: Number,
  height: Number,
  default: 
});

var schema = new Schema({
  author: {type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
 
  company: {type: String, default: '기타'},
  content: {type: String, trim: true, required: true},
  start: {type: Date, default: Date.now},
  end: {type: Date, default: Date.now},
  prize: {type: Number, trim: true, default: 0},
  category: {type: String, required: true, default: '기타'},
  target: {type: String, required: true, default: '제한없음'},
  
  image: imageSchema,

  tags: [String],
  numLikes: {type: Number, default: 0},
  numView: {type: Number, default: 0},
  numComments: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now},

}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var contest = mongoose.model('Contest', schema);

module.exports = contest;
