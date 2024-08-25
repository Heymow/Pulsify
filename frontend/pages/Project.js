import styles from '../styles/Project.module.css'
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCopy, faCheckCircle, faBars } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from "next/router";

import ProjectModal from '../components/ProjectModal';
import GenresModal from '../components/GenresModal';
import Header from '../components/Header';

function Project() {
    const user = useSelector((state) => state.user.value)
    const [projectTitle, setProjectTitle] = useState("");
    const [projectGenre, setProjectGenre] = useState('');
    const [projectPrompt, setProjectPrompt] = useState("")
    const [search, setSearch] = useState("");
    const [genresModalIsOpen, setGenresModalIsOpen] = useState(false)
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([])
    const [suggestionsList, setSuggestionsList] = useState([]);
    const [isCopied, setIsCopied] = useState(false);
    const [titleIsInvalid, setTitleIsInvalid] = useState(false);
    const [genreIsInvalid, setGenreIsInvalid] = useState(false);
    const [promptIsInvalid, setPromptIsInvalid] = useState(false);
    const [blink, setBlink] = useState(false);
    const [totalScore, setTotalScore] = useState(0);
    const [spotifyNoResult, setSpotifyNoResult] = useState(false);
    const [includeLikedPrompts, setIncludeLikedPrompts] = useState(false);
    const [isCheckBoxChecked, setIsCheckBoxChecked] = useState(false);

    const router = useRouter();
    !user.token && router.push({ pathname: '/' });
    let genres = [];

    useEffect(() => {
        if (router.query.genre && !router.query.title && !router.query.prompt) {
            setProjectGenre(router.query.genre);
        }
        if (router.query.genre && router.query.title && router.query.prompt) {
            setProjectGenre(router.query.genre);
            setProjectTitle(router.query.title);
            setProjectPrompt(router.query.prompt);
        }
        if (router.query.isCommunity) {
            setIsCheckBoxChecked(true);
            setIncludeLikedPrompts(true);
        }
    }, [])


    // Fetch des suggestions
    const suggestions = [];
    const fetchSuggestions = async () => {
        const { token, email } = user;
        const fetchSuggestions = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/keywords/suggestions`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, genre: projectGenre, partialPrompt: projectPrompt, includeLikedPrompts }),
            })

        const resSuggestions = await fetchSuggestions.json();

        setTotalScore(resSuggestions.totalScore);
        suggestions = resSuggestions.suggestionsList;

        suggestions && setSuggestionsList([...suggestions]);
    };

    // Rechercher des suggestions à chaque fois que l'utilisateur entre un caractère dans l'imput de prompt
    useEffect(() => {
        fetchSuggestions();
    }, [projectPrompt, projectGenre, includeLikedPrompts])

    // Fonction qui permet de sélectionner le genre depuis la modale
    const handleGenreSelect = (selectedGenre) => {
        setProjectGenre(selectedGenre);
        closeGenresModal();
    };

    // Map des suggestions
    let suggestion = [];
    if (suggestionsList.length != 0) {
        suggestion = suggestionsList.map((data, i) => {
            let pourcentage = 0;
            if (totalScore) {
                (pourcentage = 100 * (data.score_global / totalScore));
                pourcentage = pourcentage.toPrecision(3)
            }
            return (
                <div className={styles.suggestionItem} onClick={() => addGenreFromSearchBar(data.keyword)}>
                    <div className={styles.suggestionItemLeft}>
                        <div key={i} >{data.keyword}</div>
                    </div>
                    {totalScore ? <div className={styles.suggestionItemRight}>{pourcentage}%</div> : <></>}
                </div>
            )
        }
        );
    }

    // Fonction de copier / coller du prompt
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(projectPrompt).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };


    // Retourner sur la page précédente lors du clic sur "Retour"
    const handleBack = () => {
        router.back();
    };


    // Appeler la route de recherche sur Spotify
    const fetchGenreArtistOnSpotify = async (search) => {
        const { token, email } = user;
        const fetchArtist = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/spotify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ search, token, email }),
        });
        const res = await fetchArtist.json();
        setSearchResults(res)
        if (!res.length) {
            genres = <div className={styles.searchTitle}>Pas d'artistes trouvés à ce nom</div>
            setSpotifyNoResult(true);
        } else { setSpotifyNoResult(false); }
    }

    // Rechercher sur Spotify lorsque l'utilisateur appuie sur Entrée
    const handleSearchKeyDown = (event) => {
        if (event.key === 'Enter') {
            fetchGenreArtistOnSpotify(search);
        }
    }

    // Mapper les genres d'un artiste
    spotifyNoResult ? (genres = search ? <div className={styles.searchTitle}>Pas d'artistes trouvés à ce nom</div> : <div className={styles.searchTitle}>Entrez d'abord un artiste</div>) :
        searchResults.length &&
        (genres = searchResults.map((data, i) => (
            <div key={i} className={styles.genreItem} onClick={() => addGenreFromSearchBar(data)}>
                <div>{data}</div>
            </div>
        )))

    const triggerBlink = () => {
        setBlink(true);
        setTimeout(() => {
            setBlink(false);
        }, 200); // Change la bordure en noir après 200ms

        setTimeout(() => {
            setBlink(true);
        }, 400); // Réapplique la bordure rouge après 400ms

        setTimeout(() => {
            setBlink(false);
        }, 800); // Finalise en réappliquant la bordure noire après 800ms
    }


    // Ouvrir et fermer la modale de genres
    const openGenresModal = () => {
        setGenresModalIsOpen(true)
    }
    const closeGenresModal = () => {
        setGenresModalIsOpen(false)
    }

    // Ouvrir la modale de projet au clic sur "Enregistrer"
    const openProjectModal = () => {
        if (projectPrompt.length === 0 || projectTitle.length === 0 || projectGenre.length === 0) {
            if (projectPrompt.length === 0) {
                setPromptIsInvalid(true);
            } else {
                setPromptIsInvalid(false);
            }
            if (projectTitle.length === 0) {
                setTitleIsInvalid(true);
            } else {
                setTitleIsInvalid(false);
            }
            if (projectGenre.length === 0) {
                setGenreIsInvalid(true);
            } else {
                setGenreIsInvalid(false);
            }
            triggerBlink();

        } else {
            setGenreIsInvalid(false);
            setPromptIsInvalid(false);
            setTitleIsInvalid(false);
            setModalIsOpen(true)
        }
    }

    const closeProjectModal = () => {
        setModalIsOpen(false);
    }

    // Ajouter un genre depuis la recherche par artiste
    const addGenreFromSearchBar = (genre) => {
        if (projectPrompt.length === 0) {
            setProjectPrompt(`${genre}, `)
        } else if ((projectPrompt.length + genre.length) < 120) {
            if (projectPrompt[projectPrompt.length - 1] === ' ' && projectPrompt[projectPrompt.length - 2] === ',') {
                setProjectPrompt(projectPrompt + `${genre}, `)
            } else {
                setProjectPrompt(projectPrompt + `, ${genre}, `)
            }
        }
    }


    const checkbox = (e) => {
        if (projectGenre) {
            setGenreIsInvalid(false)
            setIsCheckBoxChecked(e.target.checked)
            setIncludeLikedPrompts(!includeLikedPrompts)
        } else {
            setGenreIsInvalid(true)
            triggerBlink()
        }

    }
    return (
        <div className={styles.main}>

            <Header></Header>
            <div className={styles.projectBody}>
                <div className={styles.leftContainer}>
                    <div className={styles.suggestionContainer}>
                        <div className={styles.suggestionTitle}>Suggestions</div>
                        <div className={styles.suggestionList}>
                            {suggestion}
                        </div>
                        <div className={styles.bottomSuggestionList}>
                            <label className={styles.checkboxLabel}>
                                <input type="checkbox"
                                    className={styles.checkBoxSuggestion}
                                    checked={isCheckBoxChecked}
                                    value={includeLikedPrompts}
                                    onChange={(e) => { checkbox(e) }} />
                                <span className={styles.customCheckbox}></span>
                                Intégrez les mots-clés de la communauté
                            </label>
                        </div>
                    </div>
                    <button className={styles.btn} onClick={handleBack}>Retour</button>
                </div>
                <div className={styles.projectContainer}>
                    <div className={styles.projectHeader}>
                        <div className={styles.leftPartHeader}>
                            <div className={styles.textHeader}>Titre de votre projet</div>
                            <input className={styles.inputProjectTitle}
                                placeholder='Nom du projet'
                                onChange={(e) => setProjectTitle(e.target.value)}
                                style={{
                                    border: titleIsInvalid && blink && '2px solid red',
                                    padding: '10px',
                                    outline: 'none',
                                }}
                                spellCheck='false'
                                value={projectTitle}
                                maxLength={25}
                            ></input>
                        </div>
                        <div className={styles.rightPartHeader}>
                            <div className={styles.textHeader}>Genre de votre projet</div>
                            <div className={styles.genreProject}>
                                <input className={styles.inputGenreProject}
                                    placeholder='Genre du projet'
                                    onChange={(e) => setProjectGenre(e.target.value)}
                                    style={{
                                        border: genreIsInvalid && blink && '2px solid red',
                                        padding: '10px',
                                        outline: 'none',
                                    }}
                                    spellCheck='false'
                                    value={projectGenre}
                                    maxLength={20}>
                                </input>
                                <FontAwesomeIcon
                                    icon={faBars}
                                    className={styles.searchGenreBtn}
                                    onClick={openGenresModal}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.inputPromptContainer}>
                        <textarea className={styles.inputProjectPrompt}
                            placeholder='Entrez votre prompt ici (mots-clés séparés par des virgules)'
                            onChange={(e) => setProjectPrompt(e.target.value)}
                            style={{
                                border: promptIsInvalid && blink && '2px solid red',
                                padding: '10px',
                                outline: 'none',
                            }}
                            value={projectPrompt}
                            maxLength={120}
                            spellCheck='false'
                            onKeyDown={e => {
                                if (e.key === 'Enter')
                                    e.preventDefault()
                            }} />
                        <div className={styles.promptBottom}>
                            <div className={styles.totalCharacters}>{`${projectPrompt.length} / 120`}</div>
                            {isCopied ? (
                                <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className={styles.copyPasteIcon}
                                />
                            ) : (
                                <FontAwesomeIcon
                                    icon={faCopy}
                                    className={styles.copyPasteIcon}
                                    onClick={handleCopyToClipboard}
                                />
                            )}
                        </div>

                    </div>
                    <div className={styles.searchContainer}>
                        <div className={styles.searchTitle}>Recherche de genre par artiste</div>
                        <div className={styles.searchInputContainer}>
                            <input className={styles.searchInput}
                                placeholder='Recherchez vos artistes préférés'
                                onChange={(e) => setSearch(e.target.value)}
                                value={search}
                                spellCheck='false'
                                onKeyDown={handleSearchKeyDown}></input>
                            <FontAwesomeIcon icon={faSearch}
                                className={styles.searchBtn}
                                onClick={() => fetchGenreArtistOnSpotify(search)} />
                        </div>
                        <div className={styles.genresList} >
                            {genres}
                        </div>
                    </div>
                    <button className={styles.btn}
                        onClick={() => openProjectModal()}
                    >Enregistrer</button>
                    <ProjectModal isOpen={modalIsOpen}
                        onRequestClose={closeProjectModal}
                        projectTitle={projectTitle}
                        prompt={projectPrompt}
                        projectGenre={projectGenre}
                    />
                    <GenresModal isOpen={genresModalIsOpen}
                        onRequestClose={closeGenresModal}
                        projectGenre={projectGenre}
                        handleGenreSelect={handleGenreSelect}
                    />
                </div>
            </div>
        </div>

    )
}

export default Project;