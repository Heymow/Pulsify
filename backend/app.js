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
const allowedOrigins = ['https://pulsify-pink.vercel.app'];

app.use(cors({
    origin: function (origin, callback) {
        // Autoriser les requêtes sans origin (ex. : curl, tests mobiles)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],  // Autoriser les en-têtes requis
    credentials: true     // Nécessaire pour les requêtes avec des informations d’authentification
}));

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
