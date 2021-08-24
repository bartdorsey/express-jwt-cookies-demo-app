const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const jwt = require('jsonwebtoken');

const app = express();

const secret = 'SSSSSSHHH';

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const users = {
  testuser: 'password'
}

// Logs a user in
// Normall we would check the DB, but we are just using hardcoded users in this demo
app.post('/login', (req, res, next) => {
  const { username, password } = req.body;
  console.log(req.body);
  if (users[username] && users[username] === password) {
    // We sign a JWT and store it in a cookie on the response.
    // The browser will store it and send it back down
    res.cookie('token', jwt.sign({
      username
    }, secret),{
      sameSite: 'strict',
      httpOnly: true
    })
    res.send({
      loggedIn: true,
      message: "Successfully Logged In"
    });
  } else {
    res.status(401).send({
      loggedIn: false,
      message: "Unauthorized"
    });
  }

});

// This is an authenticated route.
// We could probably move these checks into an authRequired middleware.
app.get('/authenticated', (req, res, next) => {
  // We grab the token from the cookies
  const token = req.cookies.token;
  // jwt verify throws an exception when the token isn't valid
  try { 
    jwt.verify(token, secret) 
  }
  catch (error) {
    res.status(401).send({
      loggedIn: false,
      message: "Unauthorized"
    });
    return;
  }
  res.send({
    loggedIn: true,
    message: "Congrats you can see this"
  });
});

// This logs the user out by destroying their session
app.get('/logout', (req, res, next) => {
  // We just clear the token cookie to log the user out.
  res.clearCookie('token', {
    sameSite: 'strict',
    httpOnly: true
  });
  res.send({
    loggedIn: false,
    message: 'Logged Out'
  });
});


module.exports = app;
