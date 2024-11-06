require('dotenv').config();
require('./models/connection');

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const spotifyRouter = require('./routes/spotify');
const projectsRouter = require('./routes/projects');
const keywordsRouter = require('./routes/keywords');
const genresRouter = require('./routes/genres');

const app = express();

// Définir les origines autorisées
app.use(cors({
    origin: 'https://pulsify-pink.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Ajoutez un middleware pour gérer les preflight requests
app.options('*', cors());

app.use(logger('dev'));

// Augmenter la limite de taille des requêtes à 50 Mo
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/spotify', spotifyRouter);
app.use('/projects', projectsRouter);
app.use('/keywords', keywordsRouter);
app.use('/genres', genresRouter);

module.exports = app;
