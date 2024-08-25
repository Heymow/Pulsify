var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const Project = require("../models/projects")
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const { checkBody } = require('../modules/tools')

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


// Créer un nouvel utilisateur.
router.post('/signup', (req, res) => {

  //Vérifier que les champs sont tous fournis
  if (!checkBody(req.body, ['firstname', 'username', 'password', 'email'])) {
    res.json({ result: false, error: 'Champs manquants ou vides' });
    return;
  }
  //Vérifier que l'e-mail a un format valide
  if (!EMAIL_REGEX.test(req.body.email)) {

    res.json({ result: false, error: 'e-mail invalide' });
    return
  }

  // Vérifier que l'utilisateur n'existe pas déjà en base de données
  User.findOne({ username: req.body.username, email: req.body.email }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      // Créer le nouvel utilisateur
      const newUser = new User({
        firstname: req.body.firstname,
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: uid2(32),

      });
      newUser.save().then(newDoc => {

        res.json({ result: true, token: newDoc.token, firstname: newDoc.firstname, username: req.body.username, email: req.body.email });
      });
    } else {
      // L'utilisateur existe déjà en base de données
      res.json({ result: false, error: 'Utilisateur déjà existant' });
    }
  });
});


// Se connecter
router.post('/signin', (req, res) => {

  // Vérifier que les champs sont tous fournis
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Champs manquants ou vides' });
    return;
  }
  User.findOne({ email: req.body.email })
    .then(data => {
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true, token: data.token, username: data.username, firstname: data.firstname, email: data.email });
      } else {
        res.json({ result: false, error: 'Champs manquants ou vides' })
      }
    })

});


// Se log avec Google
router.post('/signup/google', (req, res) => {

  //Vérifier que les champs sont tous fournis
  if (!checkBody(req.body, ['firstname', 'username', "google_id", 'email', "picture"])) {
    res.json({ result: false, error: 'Champs manquants ou vides' });
    return;
  }
  //Vérifier que l'e-mail a un format valide
  if (!EMAIL_REGEX.test(req.body.email)) {

    res.json({ result: false, error: 'e-mail invalide' });
    return
  }

  // Vérifier que l'utilisateur n'existe pas déjà en base de données
  User.findOne({ google_id: req.body.google_id }).then(data => {
    if (data === null) {
      // Créer le nouvel utilisateur
      const newUser = new User({
        firstname: req.body.firstname,
        username: req.body.username,
        email: req.body.email,
        google_id: req.body.google_id,
        picture: req.body.picture,
        token: uid2(32),
        password: null,
      });
      newUser.save().then(newDoc => {

        res.json({ result: true, token: newDoc.token, firstname: newDoc.firstname, username: req.body.username, email: req.body.email, picture: req.body.picture });
      });
    } else {
      // L'utilisateur existe déjà en base de données
      res.json({ result: true, token: data.token, username: data.username, firstname: data.firstname, email: data.email, picture: data.picture });
    }
  });
});


// Recherche par Username depuis la page Explorer
router.post('/search', async (req, res) => {

  // Vérifier que les champs sont tous fournis
  if (!checkBody(req.body, ['username', 'token', 'email'])) {
    res.json({ result: false, error: 'Champs vides ou manquants' });
    return;
  }

  // Authentification de l'utilisateur
  const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
  if (!foundUser) { return res.json({ result: false, error: 'Access denied' }) };

  const fetchAllUser = await User.find({ username: { $regex: new RegExp(req.body.username.toLowerCase(), "i") } })
  if (fetchAllUser.length) {
    const prompts = []

    for (const user of fetchAllUser) {
      const userPromptsPopulated = await user.populate('prompts')
      for (const userIdInPrompt of userPromptsPopulated.prompts) {
        const userIdInPromptPopulated = await userIdInPrompt.populate('userId')
        userIdInPromptPopulated.isPublic && prompts.push(userIdInPromptPopulated)
      }
    }

    if (prompts.length) {

      res.json({ result: true, promptsList: prompts });
    } else {
      res.json({ result: false, error: "Cet auteur n'a aucun projet" });
    }

  } else {
    res.json({ result: false, error: 'Utilisateur introuvable' })
  }
})


// Rechercher les prompts de l'utilisateur
router.post('/projets', async (req, res) => {

  // Vérifier que les champs sont tous fournis
  if (!checkBody(req.body, ['email', "token"])) {
    res.json({ result: false, error: 'Champs vides ou manquants' });
    return;
  }

  // Authentification de l'utilisateur
  const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
  if (!foundUser) { return res.json({ result: false, error: 'Access denied' }) };

  // Populate
  const populatedUser = await foundUser.populate('prompts')
  const populatedUserWithLikes = await populatedUser.populate('likedprompts')
  let foundUserPopulated = []
  for (const id of populatedUserWithLikes.likedprompts) {
    foundUserPopulated.push(await id.populate('userId'))
  }

  // Réponse
  res.json({ result: true, myPrompts: foundUser, likedprompts: foundUserPopulated })

})



// Recherche des genres de l'utilisateurs
router.post('/genres', async (req, res) => {
  if (!checkBody(req.body, ['token', 'email'])) {
    res.json({ result: false, error: 'Champs manquants.' });
    return;
  }

  // Authentification de l'utilisateur
  const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
  if (!foundUser) { return res.json({ result: false, error: 'Access denied' }) };

  // Vérifie si l'utilisateur a déjà des genres personnels
  if (!foundUser.genres) {
    return res.json({ result: false, message: "Vous n'avez pas encore créé de genres" });
  }

  // Récupération de tous les genres
  if (req.body.getLikedGenres) {
    const populatedUser = await foundUser.populate('likedprompts');
    const listPrompts = [];
    for (let prompt of populatedUser.likedprompts) {
      !listPrompts.includes(prompt) && listPrompts.push(prompt.genre)
    }
    res.json({ result: true, genres: listPrompts })
  } else {
    res.json({ result: true, genres: foundUser.genres })
  }
})



router.post("/like", async (req, res) => {
  // Vérifier que les champs sont tous fournis
  if (!checkBody(req.body, ['token', 'email', 'id'])) {
    res.json({ result: false, error: 'Access denied.' });
    return;
  }
  // Authentification de l'utilisateur
  const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
  if (!foundUser) { return res.json({ result: false, error: 'Access denied' }) };

  // Ajouter ou retirer un like
  if (!foundUser.likedprompts.includes(req.body.id)) {
    await User.updateOne({ email: req.body.email },
      { $push: { likedprompts: req.body.id } }
    )
  } else {
    await User.updateOne({ email: req.body.email },
      { $pull: { likedprompts: req.body.id } }
    )
  }
  const updatedUser = await User.findOne({ email: req.body.email, token: req.body.token })
  res.json({ result: true, likedPrompts: updatedUser.likedprompts })
})

router.post("/likedPosts", async (req, res) => {

  // Vérifier que les champs sont tous fournis
  if (!checkBody(req.body, ['token', 'email'])) {
    res.json({ result: false, error: 'Access denied.' });
    return;
  }
  // Authentification de l'utilisateur
  const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
  if (!foundUser) { return res.json({ result: false, error: 'Access denied' }) };

  // Renvoie les projets likés de l'utilisateur
  res.json({ result: true, likedPrompts: foundUser.likedprompts })

})

router.post("/getLikeNumberAndCommentsNumber", async (req, res) => {

  // Vérifier que les champs sont tous fournis
  if (!checkBody(req.body, ['token', 'email'])) {
    res.json({ result: false, error: 'Access denied.' });
    return;
  }
  // Authentification de l'utilisateur
  const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
  if (!foundUser) { return res.json({ result: false, error: 'Access denied' }) };

  let likeNumber = 0
  let commentNumber = 0
  const foundAllUsers = await User.find()
  for (const user of foundAllUsers) {
    if (user.likedprompts.includes(req.body.id)) {
      likeNumber++
    }
  }
  const foundProject = await Project.findById(req.body.id)
  foundProject && (commentNumber = foundProject.messages.length)

  res.json({ result: true, likeNumber: likeNumber, commentNumber: commentNumber })
})

module.exports = router;
