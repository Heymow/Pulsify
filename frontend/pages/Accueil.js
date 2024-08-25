import { useEffect, useState } from 'react';
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import styles from "../styles/Accueil.module.css"
import Link from "next/link";
import Header from "../components/Header";
import ModelCard from "../components/ModelCard";

function Accueil() {

    const [newProject, setNewProject] = useState(false);
    const [newExistingProject, setNewExistingProject] = useState(false);
    const [search, setSearch] = useState('');
    const [searchCommunity, setSearchCommunity] = useState('');
    const [selectedTab, setSelectedTab] = useState(1);
    const [listProjects, setListProject] = useState([]);
    const [listCommunityProject, setListCommunityProject] = useState([]);

    const router = useRouter();
    const user = useSelector((state => state.user.value));


    // Si pas d'utilisateur connectés, navigue vers la page Welcome/tutorial
    !user.token && router.push({ pathname: '/' });

    const handleClick = (genre, isCommunity) => {
        router.push({
            pathname: '/Project',
            query: { genre, isCommunity },
        });
    };

    //Rechercher les prompts de l'utilisateur pendant qu'il remplit le champ de recherche
    const fetchProjects = async () => {
        // Fetch des projets 
        const { email, token } = user;
        const fetchProject = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/genres/searchMyGenres`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ search, email, token }),
        })
        const res = await fetchProject.json();
        res.result && setListProject(res.searchResults);
    }

    //Rechercher les prompts de la communauté liké par l'utilisateur pendant qu'il remplit le champ de recherche
    const fetchCommunityProjects = async () => {
        // Fetch des projets 
        const { email, token } = user;
        const fetchProject = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/genres/searchLikedGenres`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ search: searchCommunity, email, token }),
        })
        const res = await fetchProject.json();
        res.result && setListCommunityProject(res.searchResults);
    }

    // Mettre à jour la liste des résultats personnels à chaque frappe de clavier dans le champ de recherche
    useEffect(() => {
        fetchProjects();
    }, [search]);

    // Mettre à jour la liste des résultats de la communauté à chaque frappe de clavier dans le champ de recherche
    useEffect(() => {
        fetchCommunityProjects();
    }, [searchCommunity]);


    // Fonction pour supprimer un genre et tous les mots-clés associés.
    const handleRemoveGenre = async (genre) => {
        const { email, token } = user;
        const removedGenre = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/genres/removeGenre`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ genre, email, token }),
        })
        fetchProjects();
        fetchCommunityProjects();
    }

    // Premier display avec lien Suno et direction vers nouveau projet (newProject(false))
    let display =
        <div className={styles.container}>
            <div className={styles.choiceContainer}>
                <div className={styles.advice}>Dans un premier temps, pour ouvrir Suno : <a href={'https://suno.com/'}
                    style={{ textDecoration: 'none' }}
                    target='_blank'
                    rel="noopener noreferrer"><span className={styles.link} >Cliquez ici</span></a></div>
                <button className={styles.createBtn} onClick={() => setNewProject(true)}>Nouveau projet</button>
            </div>
            <Link href='Explorer'>
                <button className={styles.exploreBtn}>Explorer</button>
            </Link>
        </div>

    if (newProject) {
        display =
            <>
                <div className={styles.selectModelContainer}>
                    <div className={styles.choiceContainer}>
                        <button className={styles.createBtn} onClick={() => setNewExistingProject(true)}>Utiliser un genre</button>
                        <Link href='/Project'>
                            <button className={styles.createBtn}>Démarrer un projet vierge</button>
                        </Link>
                    </div>
                    <Link href='Explorer'>
                        <button className={styles.exploreBtn}>Explorer</button>
                    </Link>
                </div>
            </>
    }

    // si l'itulisateur click sur "utiliser un genre".
    if (newExistingProject) {
        let mappedProjects;
        // L'utilisateur est sur le tab "Mes genres".
        if (selectedTab === 1) {
            const myProjects = listProjects;
            // Display si l'utilisateur utilise l'input de recherche.
            if (listProjects.length && search.length) {
                mappedProjects = listProjects.map((project, i) => {
                    const { genre, userId, titles } = project;
                    return <div className={styles.modelCard} key={i}>
                        <ModelCard genre={genre}
                            firstname={userId.firstname}
                            username={userId.username}
                            picture={userId.picture}
                            projects={titles}
                            isOnMyProfil={true}
                            isOwnGenre={true}
                            isOnCommunityGenre={false}
                            handleRemoveGenre={handleRemoveGenre}
                            handleClick={handleClick}
                            isCommunity={false}
                        />
                    </div>
                });
            } else {
                //Display des genres créés par l'utilisteur
                mappedProjects = myProjects.map((project, i) => {
                    const { genre, userId, titles } = project;
                    return (
                        <div className={styles.modelCard} key={i}>
                            <ModelCard
                                genre={genre}
                                firstname={userId.firstname}
                                username={"Moi"}
                                picture={userId.picture}
                                projects={titles}
                                isOwnGenre={true}
                                isOnCommunityGenre={false}
                                handleRemoveGenre={handleRemoveGenre}
                                handleClick={handleClick}
                                isCommunity={false}
                            />
                        </div>
                    );
                });
            }

            // L'utilisateur est sur le tab "Communauté".
        } else if (selectedTab === 2) {
            const myProjects = listCommunityProject;
            // Utilise l'input de recherche
            if (listProjects.length && search.length) {
                mappedProjects = listCommunityProject.map((project, i) => {

                    let { genre, userId, titles } = project;
                    return <div className={styles.modelCard} key={i}>
                        <ModelCard genre={genre}
                            firstname={userId.firstname}
                            username={userId.username}
                            picture={userId.picture}
                            projects={titles}
                            isOnCommunityGenre={true}
                            handleRemoveGenre={handleRemoveGenre}
                            handleClick={handleClick}
                            isCommunity={true}
                        />
                    </div>
                });
            } else {
                // Tous les genres de la communauté sont affichés par défaut.
                mappedProjects = myProjects.map((project, i) => {

                    let { genre, userId, titles } = project;
                    return <div className={styles.modelCard} key={i}>
                        <ModelCard genre={genre}
                            firstname={userId.firstname}
                            username={userId.username}
                            picture={userId.picture}
                            projects={titles}
                            isOnCommunityGenre={true}
                            handleRemoveGenre={handleRemoveGenre}
                            handleClick={handleClick}
                            isCommunity={true}
                        />
                    </div>
                });
            }
        }

        display =
            <div className={styles.container} >
                <div className={styles.title}>Sélectionnez un genre enregistré</div>
                <div className={styles.selectModelContainer}>
                    <div className={styles.tabBar}>
                        <div className={selectedTab === 1 ? styles.selectedTab : styles.tab} onClick={() => {
                            setSelectedTab(1)
                        }}>
                            Mes genres
                        </div>
                        <div className={selectedTab === 2 ? styles.selectedTab : styles.tab} onClick={() => {
                            setSelectedTab(2)
                        }} >
                            Communauté
                        </div>
                    </div>
                    <div className={styles.modelChoiceContainer}>

                        <input type='string' placeholder='Recherche...' value={selectedTab === 1 ? search : searchCommunity} onChange={(e) => { selectedTab === 1 ? setSearch(e.target.value) : setSearchCommunity(e.target.value) }
                        } className={styles.inputSearch} />
                        {(listProjects.length && selectedTab === 1) || (listCommunityProject.length && selectedTab === 2) ? <div className={styles.columnTitles}>
                            <div className={styles.columnAuthor}>Auteur</div>
                            <div className={styles.columnGenre}>Genre</div>
                            <div className={styles.columnProject}>Projets</div>
                            <div></div>
                            <div></div>
                        </div> : <></>}
                        <div className={styles.scrollWindow}>
                            {mappedProjects}
                        </div>
                    </div>
                </div>
                <button className={styles.exploreBtn} onClick={() => { setNewProject(false); setNewExistingProject(false) }}>Retour</button>
            </div >
    }



    return (
        <>
            <Header></Header>
            {display}
        </>
    )
}

export default Accueil;
