var express = require('express');
var router = express.Router();
require('../models/connection');

const Keyword = require('../models/keywords');
const User = require('../models/users');
const { checkBody } = require('../modules/tools')

router.post('/search', async (req, res) => {

    if (!checkBody(req.body, ['keyword', 'email', "token"])) {
        res.json({ result: false, error: 'Champs vides ou manquants' });
        return;
    }

    const fetchAllKeywords = await Keyword.find({ keyword: { $regex: new RegExp(req.body.keyword.toLowerCase(), "i") } })

    if (fetchAllKeywords.length) {
        const prompts = []

        for (const keyword of fetchAllKeywords) {
            const populatedPrompts = await keyword.populate('prompts')
            for (const prompt of populatedPrompts.prompts) {
                if (prompt.isPublic) {
                    const promptWithUserId = await prompt.populate('userId')
                    prompts.push(promptWithUserId)
                }

            }

        }

        if (prompts.length) {
            res.json({ result: true, keywordsList: prompts })
        } else {
            res.json({ result: false, error: 'Mot clé existant mais projet associé non public' })
        }
    } else {
        res.json({ result: false, error: 'Mot clé non utilisé' })
    }


});



router.post("/suggestions", async (req, res) => {

    // Vérification des éléments requis pour la route
    if (!checkBody(req.body, ['token', 'genre', 'email'])) {
        res.json({ result: false, error: 'Champs manquants ou vides' });
        return;
    }

    // Authentification de l'utilisateur
    const foundUser = await User.findOne({ email: req.body.email, token: req.body.token })
    !foundUser && res.json({ result: false, error: 'Access denied' });

    // Initialisation de la liste de suggestions
    let suggestionsList = [];

    // Afficher des suggestions de départ si le champ prompt n'est pas rempli
    if (req.body.partialPrompt === '') {
        if (!req.body.includeLikedPrompts) {
            const allKeywords = await Keyword.find({ userId: foundUser._id, genre: req.body.genre });
            res.json({ result: true, totalScore: 0, suggestionsList: allKeywords });
            return;
        } else {
            const allKeywords = await Keyword.find({ genre: req.body.genre });
            res.json({ result: true, totalScore: 0, suggestionsList: allKeywords.sort((a, b) => { a.frequency - b.frequency }) });
            return;
        }
    }

    // Récupérer les keywords de manière formatée 
    const promptToSplit = req.body.partialPrompt.trim()
    const promptToSplitWithoutComa = promptToSplit[promptToSplit.length - 1] === "," ? promptToSplit.slice(0, -1) : promptToSplit
    const splittedKeywords = promptToSplitWithoutComa.split(',')
    const keywords = []
    for (const wordToFormat of splittedKeywords) {
        const trimmedWords = wordToFormat.trim()
        keywords.push(trimmedWords.charAt(0).toUpperCase() + trimmedWords.slice(1))
    }

    // Fonction pour échapper tous les caractères spéciaux
    const escapeRegex = (keyword) => {
        return keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    let regexKeywords = keywords.map(keyword => new RegExp(`^${escapeRegex(keyword)}$`, 'i'));


    //Initialisation des coefficients de calcul du score
    const weight_rating = 0.7;
    const weight_frequency = 0.3;

    // Création de la pipeline Mongoose

    let pipeline = [];

    if (req.body.partialPrompt) {
        if (req.body.includeLikedPrompts) {
            // Si la case Inclure la Communauté est cochée
            pipeline.push(
                // Match pour garder les keywords qui correspondent à tous le prompts likés, au genre et à ce qui est tapé dans le prompt
                {
                    $match: {
                        genre: req.body.genre,
                        keyword: { $in: regexKeywords }
                    }
                }
            );
        } else {
            // Si la case Inclure la Communauté n'est pas cochée
            pipeline.push(
                // Match pour garder les keywords qui correspondent à l'utilisateur, au genre et à ce qui est tapé dans le prompt
                {
                    $match: {
                        userId: foundUser._id,
                        genre: req.body.genre,
                        keyword: { $in: regexKeywords }
                    }
                }
            );
        }
    } else {
        pipeline.push(
            // Match pour garder les keywords qui correspondent à tous le prompts likés, au genre et à ce qui est tapé dans le prompt
            {
                $match: {
                    _id: { $in: foundUser.likedprompts },
                    genre: req.body.genre,
                }
            }
        );
    }

    pipeline.push(
        // On unwind related_keywords pour traiter chacun individuellement
        {
            $unwind: "$related_keywords"
        },
        // Populate ou 'jointure'
        {
            $lookup: {
                from: "keywords",
                localField: "related_keywords",
                foreignField: "_id",
                as: "related_keyword_data"
            }
        },
        // On acède aux data des related_keywords de façon individuelle
        {
            $unwind: "$related_keyword_data"
        },
        // On ajoute des champs temporaires pour calculer le score global
        {
            $addFields: {
                score_global: {
                    $add: [
                        { $multiply: [weight_rating, "$related_keyword_data.average_rating"] },
                        { $multiply: [weight_frequency, { $log10: "$related_keyword_data.frequency" }] }
                    ]
                }
            }
        },
        // Si un related_keyword vient deux ou plusieurs fois, on en garde qu'un et on additionne le score_global
        {
            $group: {
                _id: "$related_keyword_data._id",
                keyword: { $first: "$related_keyword_data.keyword" },
                score_global: { $sum: "$score_global" }
            }
        },
        // On enlève des résultats les keywords que l'utilisateur a déjà tapé
        {
            $match: {
                keyword: { $nin: keywords }
            }
        },
        // Le tri
        {
            $sort: {
                score_global: -1
            }
        },
        // On en garde que 10
        {
            $limit: 10
        },
        // On rajoute un totalScore qui servira au front à calculer le pourcentage et on range le reste dans 'suggestions'
        {
            $group: {
                _id: null,
                totalScore: { $sum: "$score_global" },
                suggestions: { $push: { keyword: "$keyword", score_global: "$score_global" } }
            }
        }
    );

    suggestionsList = await Keyword.aggregate(pipeline);

    // Réponse avec la liste de suggestions
    if (suggestionsList.length > 0) {
        res.json({ result: true, totalScore: suggestionsList[0].totalScore, suggestionsList: suggestionsList[0].suggestions });
    } else {
        res.json({ result: true, totalScore: 0, suggestionsList: [] });
    }
})











module.exports = router;