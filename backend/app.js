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
app.use(cors({
    origin: '*',  // Autoriser toutes les origines pour tester
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true
}));
app.options('*', cors());

app.use(logger('dev'));
// Augmenter la limite à 50 Mo
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/spotify', spotifyRouter);
app.use('/projects', projectsRouter);
app.use('/keywords', keywordsRouter);
app.use('/genres', genresRouter);



module.exports = app;