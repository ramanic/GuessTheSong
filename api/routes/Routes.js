module.exports = function (app) {
  var userHandlers = require('../controllers/UserController.js');
  var quizHandlers = require('../controllers/QuizController.js');
  app.route('/profile').post(userHandlers.loginRequired, userHandlers.profile);
  app.route('/auth/register').post(userHandlers.register);
  app.route('/auth/login').post(userHandlers.sign_in);
  app.route('/quiz').post(userHandlers.loginRequired, quizHandlers.creatQuiz);
  app.route('/quiz').get(quizHandlers.getQuizList);
  app.route('/user/:id').get(userHandlers.getUser);
  app.route('/quiz/:id').get(quizHandlers.getQuiz);
};
