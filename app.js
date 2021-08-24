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
    // We set this property in the session
    // This proves the user is logged in.
    // We normally might store the userid or username or 
    // other things in here.
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
  const token = req.cookies.token;
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
