import styles from "../styles/Explorer.module.css"
import Header from "../components/Header";
import PromptCard from '../components/PromptCard';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSortAmountUp, faSortAmountDown } from '@fortawesome/free-solid-svg-icons';
import { Popover } from 'react-tiny-popover'
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from "next/router";
import { setLikedList } from "../reducers/user";

function Explorer() {
    const user = useSelector((state) => state.user.value)
    const [search, setSearch] = useState('');
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [checkedAutor, setCheckedAutor] = useState(false);
    const [checkedKeyword, setCheckedKeyword] = useState(false);
    const [checkedProject, setCheckedProject] = useState(false);
    const [checkedGenre, setCheckedGenre] = useState(true);
    const [sortUp, setSortUp] = useState(false);
    const [sortDown, setSortDown] = useState(false);
    const [errorSearch, setErrorSearch] = useState(false);
    const [listProject, setListProject] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [placeHolder, setPlaceHolder] = useState('Recherche par genre...');
    const [allGenres, setAllGenres] = useState([]);
    const [discover, setDiscover] = useState(false);
    const [reRender, setReRender] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(0);
    const [abortController, setAbortController] = useState(null)

    const dispatch = useDispatch();
    const router = useRouter()


    // Si non connecté renvoi à la page de connexion/inscription
    !user.token && router.push({ pathname: '/' });

    useEffect(() => {
        search || foundAllGenres();
        search && fetchSearch();

    }, [search, checkedAutor, checkedGenre, checkedKeyword, checkedProject])


    // Récupération de toutes les genres 
    const foundAllGenres = async () => {
        const { token, email } = user;
        const foundGenres = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/genres/allGenres`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, email }),
        })
        const res = await foundGenres.json();
        if (res.result) {
            setAllGenres(res.allGenres);
            setDiscover(true);
        } else {
            setDiscover(false);
        }
    }

    const getAllLikedPosts = async () => {
        const { email, token } = user;
        fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/users/likedPosts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token })
        })
            .then(response => response.json())
            .then(data => {
                if (!data) {
                    Error('Erreur lors de la récupération des prompts');
                } else {
                    dispatch(setLikedList(data.likedPrompts))
                }
            });
    }

    let discoverGenres;
    let discoverMessage;

    if (discover) {
        discoverMessage = <div className={styles.discoverMessage}>Découvrez des nouveaux genres...</div>
        discoverGenres = allGenres.map((genre, i) => {
            return (
                <div key={i} className={styles.discover}>
                    <div className={styles.discoverText} onClick={() => fetchGenre(genre)} >
                        {genre}
                    </div>
                </div>
            )
        })
    }

    // Met par défaut la recherche par Genre si aucun filtre n'est séléctionné 
    if (!checkedAutor && !checkedKeyword && !checkedProject && !checkedGenre) {
        setCheckedGenre(true)
        setPlaceHolder('Recherche par genre...')
    }

    // Changement de filtre pour la recherche par Auteur, Mot clé, Nom de projet, Genre
    const handleChange = (props) => {
        if (props === 'Autor') {
            setCheckedAutor(!checkedAutor)
            setCheckedKeyword(false)
            setCheckedProject(false)
            setErrorSearch(false)
            setCheckedGenre(false)
            //setSearch('')
            setPlaceHolder('Recherche par auteur...')
        }
        if (props === 'Keyword') {
            setCheckedKeyword(!checkedKeyword)
            setCheckedAutor(false)
            setCheckedProject(false)
            setErrorSearch(false)
            setCheckedGenre(false)
            //setSearch('')
            setPlaceHolder('Recherche par mots clés...')
        }
        if (props === 'Project') {
            setCheckedProject(!checkedProject)
            setCheckedAutor(false)
            setCheckedKeyword(false)
            setErrorSearch(false)
            setCheckedGenre(false)
            //setSearch('')
            setPlaceHolder('Recherche par nom de projet...')
        }
        if (props === 'Genre') {
            setCheckedGenre(!checkedGenre)
            setCheckedAutor(false)
            setCheckedKeyword(false)
            setErrorSearch(false)
            setCheckedProject(false)
            //setSearch('')
            setPlaceHolder('Recherche par genre...')
        }

    }

    // Application d'une couleur aux icônes si elles sont séléctionné 
    let colorFilter = isPopoverOpen ? '#504E6B' : undefined
    let colorUp = sortUp ? '#504E6B' : undefined
    let colorDown = sortDown ? '#504E6B' : undefined

    const handleSearch = () => {
        if (checkedAutor) {
            fetchAutor()
        } else if (checkedProject) {
            fetchProject()
        } else if (checkedGenre) {
            fetchGenre()
        } else if (checkedKeyword) {
            fetchKeyword()
        }
    }


    // Instauration d'un debounce dans la fonction search.
    const fetchSearch = () => {
        setDiscover(false)
        setSortUp(false)
        setSortDown(false)
        clearTimeout(debounceTimer)
        let timer = setTimeout(() => {
            handleSearch()
        }, 2000);
        setDebounceTimer(timer)
    }

    // Récupération des auteurs 
    const fetchAutor = async () => {
        const { email, token } = user;
        const fetchAutor = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/users/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: search, token, email }),
        })
        const res = await fetchAutor.json()
        if (res.result) {
            setListProject(res.promptsList)
            setErrorSearch(false)
        } else {
            setErrorSearch(true)
            setErrorMessage(res.error)
        }
    }

    // Récupération des mots clés
    const fetchKeyword = async () => {
        if (abortController) {
            abortController.abort()
        }
        const newAbortController = new AbortController()
        setAbortController(newAbortController);
        try {
            const { email, token } = user;
            const fetchKeyWord = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/keywords/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword: search, email, token }),
                signal: newAbortController.signal,
            })
            const res = await fetchKeyWord.json()
            if (res.result) {
                setListProject(res.keywordsList)
                setErrorSearch(false)
            } else {
                setErrorSearch(true)
                setErrorMessage(res.error)
            }
        }
        catch (error) {
            console.log('error :', error)
        }

    }

    // Récupération des projets 
    const fetchProject = async () => {
        const { email, token } = user;
        const fetchProject = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/projects/searchTitle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: search, email, token }),
        })
        const res = await fetchProject.json()
        if (res.result) {
            setListProject(res.promptsList)
            setErrorSearch(false)
        } else {
            setErrorSearch(true)
            setErrorMessage(res.error)
        }
    }



    // Récupération des projets soit pour la recherche soit pour l'affichage des suggestions
    const fetchGenre = async (genre) => {
        setDiscover(false)
        const { email, token } = user;
        if (genre) {
            // Récupération des projets pour la suggestion de recherche 
            setSearch(genre)
            const fetchProject = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/genres/searchGenre`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ genre, email, token }),
            })
            const res = await fetchProject.json()
            if (res.result) {
                setListProject(res.promptsList)
                setErrorSearch(false)
            } else {
                setErrorSearch(true)
                setErrorMessage(res.error)
            }
        } else {
            // Récupération des projets pour la recherche
            const fetchProject = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/genres/searchGenre`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ genre: search, email, token }),
            })
            const res = await fetchProject.json()
            if (res.result) {
                setListProject(res.promptsList)
                setErrorSearch(false)
            } else {
                setErrorSearch(true)
                setErrorMessage(res.error)
            }
        }
    }

    useEffect(() => {
        getAllLikedPosts();
    }, [])

    const refresh = () => {
        setReRender(!reRender);
    }

    // Map pour afficher le résultat de la recherche et faire un tri de la note
    let listProjectSearch = listProject.map((data, i) => { return (<div className={styles.containerPromptCard}><PromptCard key={i} audio={data.audio} isOnExplore={true} projectName={data.title} genre={data.genre} stars={data.rating} prompt={data.prompt} firstname={data.userId.firstname} username={data.userId.username} picture={data.userId.picture} id={data._id} reRender={refresh} /></div>) }) //listProject.map((data, i) => { return <PromptCard /> })

    if (sortUp) {
        listProjectSearch = listProject.sort((a, b) => b.rating - a.rating).map((data, i) => { return (<div className={styles.containerPromptCard}><PromptCard key={i} isOnExplore={true} audio={data.audio} projectName={data.title} genre={data.genre} stars={data.rating} prompt={data.prompt} firstname={data.userId.firstname} username={data.userId.username} picture={data.userId.picture} id={data._id} reRender={refresh} /></div>) }) //classé par + liké first
    }
    if (sortDown) {
        listProjectSearch = listProject.sort((a, b) => a.rating - b.rating).map((data, i) => { return (<div className={styles.containerPromptCard}><PromptCard key={i} isOnExplore={true} audio={data.audio} projectName={data.title} genre={data.genre} stars={data.rating} prompt={data.prompt} firstname={data.userId.firstname} username={data.userId.username} picture={data.userId.picture} id={data._id} reRender={refresh} /></div>) }) //classé par - liké first
    }

    // Affichage du message d'erreur en fonction de la recherche, s'adapte à ce qui est retourné par la route
    let error = errorSearch && <h4 style={{ color: 'red', fontWeight: 'normal', fontStyle: 'italic', display: 'flex', justifyContent: 'center' }}>{errorMessage}</h4>



    return (
        <>
            <Header></Header>
            <div className={styles.container}>

                <h1 className={styles.title}>Explorer</h1>


                <div className={styles.containerSearch}>
                    <input type='string' placeholder={placeHolder}
                        onChange={(e) => { setSearch(e.target.value); setErrorSearch(false); setListProject([]); }}
                        value={search} className={styles.inputSearch} />

                    <div className={styles.containerIcon}>
                        <Popover
                            isOpen={isPopoverOpen}
                            positions={'bottom'}
                            align={'center'}
                            padding={12}
                            reposition={false}
                            onClickOutside={() => setIsPopoverOpen(false)}
                            content={
                                <div className={styles.popoverContainer}>
                                    <div className={styles.checkboxContainer} onClick={() => handleChange('Autor')}>
                                        <input
                                            type="checkbox"
                                            checked={checkedAutor}
                                            onChange={() => handleChange('Autor')}
                                            className={styles.checkbox}
                                        />
                                        Auteur
                                    </div>

                                    <div className={styles.checkboxContainer} onClick={() => handleChange('Keyword')}>
                                        <input
                                            type="checkbox"
                                            checked={checkedKeyword}
                                            onChange={() => handleChange('Keyword')}
                                            className={styles.checkbox}
                                        />
                                        Mots clés
                                    </div>

                                    <div className={styles.checkboxContainer} onClick={() => handleChange('Project')}>
                                        <input
                                            type="checkbox"
                                            checked={checkedProject}
                                            onChange={() => handleChange('Project')}
                                            className={styles.checkbox}
                                        />
                                        Nom du projet
                                    </div>

                                    <div className={styles.checkboxContainer} onClick={() => handleChange('Genre')}>
                                        <input
                                            type="checkbox"
                                            checked={checkedGenre}
                                            onChange={() => handleChange('Genre')}
                                            className={styles.checkbox}
                                        />
                                        Genre
                                    </div>

                                </div>
                            }
                        >
                            <FontAwesomeIcon icon={faFilter} className={styles.icon} onClick={() => setIsPopoverOpen(!isPopoverOpen)} color={colorFilter} />
                        </Popover>
                        <FontAwesomeIcon icon={faSortAmountUp} className={styles.icon} color={colorUp} onClick={() => { setSortUp(true), setSortDown(false) }} />
                        <FontAwesomeIcon icon={faSortAmountDown} className={styles.icon} color={colorDown} onClick={() => { setSortDown(true), setSortUp(false) }} />
                    </div>
                </div>
                {discoverMessage}
                <div className={styles.scrollWindow} >
                    {error}
                    {discoverGenres}
                    {discover || listProjectSearch}
                </div>
                <button className={styles.btnRetour} onClick={() => window.location.href = '/Accueil'}>Retour</button>
            </div>


        </>
    )
}

export default Explorer;
