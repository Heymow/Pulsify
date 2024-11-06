require('dotenv').config();
require('./models/connection');


var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
let spotifyRouter = require('./routes/spotify')
var projectsRouter = require('./routes/projects');
var keywordsRouter = require('./routes/keywords');
var genresRouter = require('./routes/genres');

var app = express();

const cors = require('cors');
app.use(cors({ origin: 'https://pulsify-pink.vercel.app' }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/spotify', spotifyRouter);
app.use('/projects', projectsRouter);
app.use('/keywords', keywordsRouter);
app.use('/genres', genresRouter);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://pulsify-pink.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

module.exports = app;