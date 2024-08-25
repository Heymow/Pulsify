var express = require('express');
var router = express.Router();
require('../models/connection');
const { checkBody } = require('../modules/tools')
const Project = require('../models/projects');
const User = require('../models/users')
const Keyword = require("../models/keywords")


router.post("/searchMyGenres", async (req, res) => {
    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['email', 'token'])) {
        res.json({ result: false, message: 'Champs manquants ou vides' });
        return;
    }

    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token });
    if (!foundUser) {
        return res.json({ result: false, error: 'Access denied' });
    }

    // Formattage du champ de recherche
    let formattedSearch = req.body.search ? req.body.search.trim() : '';
    if (formattedSearch) {
        formattedSearch = formattedSearch[formattedSearch.length - 1] === "," ? formattedSearch.slice(0, -1) : formattedSearch;
        formattedSearch = formattedSearch[0] === "," ? formattedSearch.slice(1) : formattedSearch;
    }

    // Récupération des projets correspondant à l'utilisateur et au critère de recherche
    // TODO, ask about spread operator "...(formattedSearch &&"
    let projects = await Project.find({
        userId: foundUser._id,
        ...(formattedSearch && {
            $or: [
                { genre: { $regex: new RegExp(formattedSearch, 'i') } },
                { title: { $regex: new RegExp(formattedSearch, 'i') } }
            ]
        })
    }).populate('userId', 'firstname picture');

    // Regroupement des projets par genre et récupération des titres des projets
    let genreMap = {};

    projects.forEach(project => {
        const genre = project.genre;
        // Cette condition pour éviter les doublons quand on liste les genres
        if (!genreMap[genre]) {
            genreMap[genre] = {
                genre: genre,
                userId: project.userId,
                titles: [],
            };
        }

        // Ajouter le titre du projet à la liste des titres pour ce genre
        genreMap[genre].titles.push(project.title);
    });

    // Conversion de genreMap en tableau
    let genresList = Object.values(genreMap).map(genreItem => {
        const { genre, userId, titles } = genreItem;
        return {
            genre: genre,
            userId: userId,
            titles: titles.join(', ')
        };
    });

    res.json({ result: true, searchResults: genresList });
});







router.post("/searchLikedGenres", async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['email', 'token'])) {
        res.json({ result: false, message: 'Champs manquants ou vides' });
        return;
    }

    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token });
    if (!foundUser) {
        return res.json({ result: false, error: 'Access denied' });
    }

    // Formattage du champ de recherche
    let formattedSearch = req.body.search ? req.body.search.trim() : '';
    if (formattedSearch) {
        formattedSearch = formattedSearch[formattedSearch.length - 1] === "," ? formattedSearch.slice(0, -1) : formattedSearch;
        formattedSearch = formattedSearch[0] === "," ? formattedSearch.slice(1) : formattedSearch;
    }

    // Récupération des projets que l'utilisateur a liké et qui sont publics
    let likedProjects = await Project.find({
        _id: { $in: foundUser.likedprompts },
        isPublic: true,
        ...(formattedSearch && {
            $or: [
                { genre: { $regex: new RegExp(formattedSearch, 'i') } },
                { title: { $regex: new RegExp(formattedSearch, 'i') } }
            ]
        })
    }).populate('userId', 'firstname picture username');

    // Regroupement des projets par genre et récupération des titres des projets
    let genreMap = {};

    likedProjects.forEach(project => {
        const genre = project.genre;
        if (!genreMap[genre]) {
            genreMap[genre] = {
                genre: genre,
                userId: project.userId,
                titles: [],
            };
        }

        // Ajouter le titre du projet à la liste des titres pour ce genre
        genreMap[genre].titles.push(project.title);
    });

    // Conversion de genreMap en tableau
    let genresList = Object.values(genreMap).map(genreItem => {
        const { genre, userId, titles } = genreItem;
        return {
            genre: genre,
            userId: userId,
            titles: titles.join(', ')
        };
    });

    res.json({ result: true, searchResults: genresList });
});





router.post('/searchGenre', async (req, res) => {

    // Authentification de l'utilisateur
    if (!checkBody(req.body, ['genre', 'email', 'token'])) {
        res.json({ result: false });
        return;
    }

    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
    if (!foundUser) { return res.json({ result: false, error: 'Access denied' }) };

    // Recherche par genre en ignorant la casse
    const fetchAllPrompts = await Project.find({ genre: { $regex: new RegExp(req.body.genre.toLowerCase(), "i") } })

    if (fetchAllPrompts.length) {

        const prompts = []

        for (const populateUserId of fetchAllPrompts) {
            const userIdPopulatedInPrompt = await populateUserId.populate('userId')
            userIdPopulatedInPrompt.isPublic && prompts.push(userIdPopulatedInPrompt)
        }

        if (prompts.length) {
            res.json({ result: true, promptsList: prompts })
        } else {
            res.json({ result: false, error: 'Genre existant mais non public' })
        }

    } else {
        res.json({ result: false, error: 'Genre non existant' })
    }
});


router.post('/allGenres', async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['token', 'email'])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }
    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
    if (!foundUser) { return res.json({ result: false, error: 'Access denied' }) };

    // Récupération de tous les genres
    const foundAllProject = await Project.find()
    if (foundAllProject.length) {
        allGenres = []
        for (const project of foundAllProject) {
            if (!allGenres.some(e => e === project.genre) && project.isPublic)
                allGenres.push(project.genre)
        }
        res.json({ result: true, allGenres: allGenres })
    } else {
        res.json({ result: false })
    }
})



// Supprimer un genre et tous les mots-clés asscociés
router.post('/removeGenre', async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['token', 'email', 'genre'])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }
    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
    if (!foundUser) { return res.json({ result: false, error: 'Access denied' }) };

    // Récupération de tous les genres
    foundUser.genres = foundUser.genres.filter(e => e !== req.body.genre);
    const foundProjects = await Project.find({ userId: foundUser._id, genre: req.body.genre })

    // Retirer les Id des projets des prompts dans l'utilisateur 
    for (let i = 0; i < foundProjects.length; i++) {
        foundUser.prompts = foundUser.prompts.filter(e => String(foundProjects[i]._id) !== String(e))
    }

    await foundUser.save();

    const foundKeywords = await Keyword.deleteMany({ genre: req.body.genre, userId: foundUser._id });
    const foundProjectForDelete = await Project.deleteMany({ genre: req.body.genre, userId: foundUser._id });

    if (foundProjectForDelete) {
        res.json({ result: true, message: 'Successfully deleted', genre: req.body.genre, projects: foundProjectForDelete, keywords: foundKeywords })
    }


})




module.exports = router;