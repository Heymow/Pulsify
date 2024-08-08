var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const { checkBody } = require('../modules/tools')

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


// POST créer un nouvel utilisateur.
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
  User.findOne({ username: req.body.username }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      // Créer le nouvel utilisateur
      const newUser = new User({
        firstname: req.body.firstname,
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: uid2(32),
        createdAt: new Date()
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

/* Route POST se connecter/signin     */

router.post('/signin', (req, res) => {

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
        createdAt: new Date()
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

//recherche par Username depuis la page Explorer
router.post('/search', async (req, res) => {
  //Vérifier que les champs sont tous fournis
  if (!checkBody(req.body, ['username'])) {
    res.json({ result: false, error: 'Champs vides ou manquants' });
    return;
  }

  const fetchAllUser = await User.find({ username: req.body.username })

  if (fetchAllUser) {
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


module.exports = router;
