require('dotenv').config();
var express = require('express');
var router = express.Router();
const { checkBody } = require('../modules/tools')
const User = require('../models/users')

//This function generate a token from front request
async function getToken() {
    const URL = 'https://accounts.spotify.com/api/token';
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const bClient = btoa(`${clientId}:${clientSecret}`);

    const config = {
        method: 'POST',
        headers: {
            Authorization: `Basic ${bClient}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: 'grant_type=client_credentials',
    };
    return await fetch(URL, config)
        .then(res => res.json())
        .then(data => data.access_token);
}

// route get music genres from artist name
router.post('/', async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['token', 'email'])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }

    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
    !foundUser && res.json({ result: false, error: 'Access denied' });


    let token = await getToken();
    console.log('token :', token)
    const response = await fetch(`https://api.spotify.com/v1/search?q=${req.body.search}&type=artist&limite=1`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
    });
    const data = await response.json()
    console.log('data :', data)

    data.artists ? res.json(data.artists.items[0].genres) : res.json({ error: "Merci de spécifier une recherche" })
})
module.exports = router;