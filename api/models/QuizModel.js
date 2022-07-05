var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var QuizSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    songs: Array,
    timeLimit: {
      type: Number,
      required: true,
    },

    user: { type: Schema.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);
mongoose.model('Quiz', QuizSchema);
