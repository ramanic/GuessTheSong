var mongoose = require('mongoose'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt');
User = mongoose.model('User');

exports.register = function (req, res) {
  var newUser = new User(req.body);
  if (req.body.password) {
    newUser.password = bcrypt.hashSync(req.body.password, 10);
  }
  newUser.save(function (err, user) {
    if (err) {
      return res.status(400).send({
        message: err,
      });
    } else {
      user.hash_password = undefined;
      return res.json(user);
    }
  });
};

exports.sign_in = function (req, res) {
  User.findOne(
    {
      email: req.body.email,
    },
    function (err, user) {
      if (err) throw err;
      if (!user || !user.comparePassword(req.body.password)) {
        return res.status(401).json({
          message: 'Authentication failed. Invalid user or password.',
        });
      }
      return res.json({
        token: jwt.sign(
          { email: user.email, fullName: user.fullName, _id: user._id },
          'RESTFULAPIs'
        ),
      });
    }
  );
};

exports.loginRequired = function (req, res, next) {
  if (req.user) {
    next();
  } else {
    return res.status(401).json({ message: 'Unauthorized user!!' });
  }
};
exports.profile = function (req, res, next) {
  if (req.user) {
    User.findOne({ email: req.user.email }, 'email name').then(
      (result, err) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token' });
        }
        console.log(result);
        return res.send({ success: 'true', data: result });
      }
    );
  } else {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
exports.getUser = (req, res, next) => {
  const { id } = req.params;
  if (id) {
    User.findOne({ _id: id }, 'name').then((result, err) => {
      if (err) {
        return res.status(401).json({ message: 'Error Fetching Data' });
      }
      console.log(result);
      return res.send({ success: 'true', data: result });
    });
  } else {
    return res.status(401).json({ message: 'Error Fetching Data' });
  }
};
