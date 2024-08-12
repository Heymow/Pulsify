import styles from "../styles/Explorer.module.css"
import Header from "../components/Header";
import PromptCard from '../components/PromptCard';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSortAmountUp, faSortAmountDown } from '@fortawesome/free-solid-svg-icons';
import { Popover } from 'react-tiny-popover'
import { useSelector } from 'react-redux';

function Explorer() {
    const user = useSelector((state) => state.user.value)
    const [search, setSearch] = useState('')
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [checkedAutor, setCheckedAutor] = useState(false);
    const [checkedKeyword, setCheckedKeyword] = useState(true);
    const [checkedProject, setCheckedProject] = useState(false);
    const [checkedGenre, setCheckedGenre] = useState(false);
    const [sortUp, setSortUp] = useState(false);
    const [sortDown, setSortDown] = useState(false);
    const [errorSearch, setErrorSearch] = useState(false);
    const [listProject, setListProject] = useState([]);
    const [errorMessage, setErrorMessage] = useState('')
    const [placeHolder, setPlaceHolder] = useState('Recherche par mots clés...')
    const [allGenres, setAllGenres] = useState([])
    const [discover, setDiscover] = useState(false)

    //if no connect go welcome
    if (!user.isLogged) {
        window.location.href = '/'
    }
    // enelevé résultat recherche et error 

    useEffect(() => {
        foundAllGenres()
    }, [])

    const foundAllGenres = async () => {
        const foundGenres = await fetch('http://localhost:3000/users/allGenres')
        const res = await foundGenres.json()
        if (res.result) {
            setAllGenres(res.allGenres)
            setDiscover(true)
        } else {
            setDiscover(false)
        }
    }

    let discoverGenres

    if (discover) {
        discoverGenres = allGenres.map((genre, i) => {
            return (
                <div key={i} className={styles.discover}>
                    <div className={styles.discoverText}>
                        {genre}
                    </div>
                </div>
            )
        })
    }

    if (!checkedAutor && !checkedKeyword && !checkedProject && !checkedGenre) {
        setCheckedKeyword(true)
        setPlaceHolder('Recherche par mots clés...')
    }

    const handleChange = (props) => {
        if (props === 'Autor') {
            setCheckedAutor(!checkedAutor)
            setCheckedKeyword(false)
            setCheckedProject(false)
            setErrorSearch(false)
            setCheckedGenre(false)
            setSearch('')
            setPlaceHolder('Recherche par auteur...')
        }
        if (props === 'Keyword') {
            setCheckedKeyword(!checkedKeyword)
            setCheckedAutor(false)
            setCheckedProject(false)
            setErrorSearch(false)
            setCheckedGenre(false)
            setSearch('')
            setPlaceHolder('Recherche par mots clés...')
        }
        if (props === 'Project') {
            setCheckedProject(!checkedProject)
            setCheckedAutor(false)
            setCheckedKeyword(false)
            setErrorSearch(false)
            setCheckedGenre(false)
            setSearch('')
            setPlaceHolder('Recherche par nom de projet...')
        }
        if (props === 'Genre') {
            setCheckedGenre(!checkedGenre)
            setCheckedAutor(false)
            setCheckedKeyword(false)
            setErrorSearch(false)
            setCheckedProject(false)
            setSearch('')
            setPlaceHolder('Recherche par genre...')
        }

    }

    let colorFilter = isPopoverOpen && '#504E6B'
    let colorUp = sortUp && '#504E6B'
    let colorDown = sortDown && '#504E6B'

    const fetchSearch = () => {
        setSortUp(false)
        setSortDown(false)
        if (checkedAutor) {
            fetchAutor()
            return
        }
        if (checkedProject) {
            fetchProject()
            return
        }
        if (checkedGenre) {
            fetchGenre()
            return
        }
        if (checkedKeyword) {
            fetchKeyword()
            return
        }
    }

    const fetchAutor = async () => {
        // fetch des auteurs 
        const fetchAutor = await fetch('http://localhost:3000/users/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: search, token: user.token, email: user.email }),
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
    const fetchKeyword = async () => {
        // fetch des mots clés
        const fetchKeyWord = await fetch('http://localhost:3000/keywords/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword: search }),
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
    const fetchProject = async () => {
        // fetch des projets 
        const fetchProject = await fetch('http://localhost:3000/projects/searchTitle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: search }),
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

    const fetchGenre = async () => {
        // fetch des projets 
        const fetchProject = await fetch('http://localhost:3000/genres/searchGenre', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ genre: search }),
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



    let listProjectSearch = listProject.map((data, i) => { return (<div className={styles.containerPromptCard}><PromptCard key={i} projectName={data.title} genre={data.genre} stars={data.rating} prompt={data.prompt} firstname={data.userId.firstname} username={data.userId.username} picture={data.userId.picture} /></div>) }) //listProject.map((data, i) => { return <PromptCard /> })

    if (sortUp) {
        listProjectSearch = listProject.sort((a, b) => b.rating - a.rating).map((data, i) => { return (<div className={styles.containerPromptCard}><PromptCard key={i} projectName={data.title} genre={data.genre} stars={data.rating} prompt={data.prompt} firstname={data.userId.firstname} username={data.userId.username} picture={data.userId.picture} /></div>) }) //classé par + liké first
    }
    if (sortDown) {
        listProjectSearch = listProject.sort((a, b) => a.rating - b.rating).map((data, i) => { return (<div className={styles.containerPromptCard}><PromptCard key={i} projectName={data.title} genre={data.genre} stars={data.rating} prompt={data.prompt} firstname={data.userId.firstname} username={data.userId.username} picture={data.userId.picture} /></div>) }) //classé par - liké first
    }

    let error = errorSearch && <h4 style={{ color: 'red', fontWeight: 'normal', fontStyle: 'italic', display: 'flex', justifyContent: 'center' }}>{errorMessage}</h4>

    return (
        <>
            <Header></Header>
            <div className={styles.container}>

                <h1 className={styles.title}>Explorer</h1>


                <div className={styles.containerSearch}>
                    <input type='string' placeholder={placeHolder} onChange={(e) => { setSearch(e.target.value); setErrorSearch(false); setListProject([]); fetchSearch(search); setDiscover(false) }} value={search} className={styles.inputSearch} />
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
                                    <div className={styles.checkboxContainer}>
                                        <input
                                            type="checkbox"
                                            checked={checkedAutor}
                                            onChange={() => handleChange('Autor')}
                                            className={styles.checkbox}
                                        />
                                        Auteur
                                    </div>

                                    <div className={styles.checkboxContainer}>
                                        <input
                                            type="checkbox"
                                            checked={checkedKeyword}
                                            onChange={() => handleChange('Keyword')}
                                            className={styles.checkbox}
                                        />
                                        Mots clés
                                    </div>

                                    <div className={styles.checkboxContainer}>
                                        <input
                                            type="checkbox"
                                            checked={checkedProject}
                                            onChange={() => handleChange('Project')}
                                            className={styles.checkbox}
                                        />
                                        Nom du projet
                                    </div>

                                    <div className={styles.checkboxContainer}>
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

                <div className={styles.scrollWindow}>
                    {error}
                    {discoverGenres}
                    {listProjectSearch}
                </div>
                <button className={styles.btnRetour} onClick={() => window.location.href = '/Accueil'}>Retour</button>
            </div>


        </>
    )
}

export default Explorer;
