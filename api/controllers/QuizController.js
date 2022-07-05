var mongoose = require('mongoose');
Quiz = mongoose.model('Quiz');

exports.creatQuiz = (req, res) => {
  quizData = req.body;
  quizData.songs = JSON.parse(quizData.songs);

  quizData.user = req.user._id;
  var newQuiz = new Quiz(req.body);
  newQuiz.save(function (err, quiz) {
    if (err) {
      return res.status(400).send({
        message: err,
      });
    } else {
      return res.json(quiz);
    }
  });
};

exports.getQuizList = (req, res) => {
  quizes = Quiz.find({}).then((result, err) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'There was some error fetching data.',
      });
    }
    return res.json({
      success: true,
      data: result,
    });
  });
};

exports.getQuiz = (req, res, next) => {
  const { id } = req.params;
  if (id) {
    Quiz.findOne({ _id: id }, 'name').then((result, err) => {
      if (err) {
        return res.status(401).json({ message: 'Error Fetching Data' });
      }

      return res.send({ sucess: 'true', data: result });
    });
  } else {
    return res.status(401).json({ message: 'Error Fetching Data' });
  }
};
