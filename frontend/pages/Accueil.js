import styles from "../styles/Accueil.module.css"
import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/router";

import Header from "../components/Header";
import ModelCard from "../components/ModelCard";
import { useSelector } from "react-redux";

let connected = false;

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


    const handleClick = (genre) => {
        router.push({
            pathname: '/Project',
            query: { genre },
        });
    };

    //Rechercher les prompts de l'utilisateur pendant qu'il remplit le champ de recherche
    const fetchProjects = async () => {
        // Fetch des projets 
        const fetchProject = await fetch('http://localhost:3000/genres/searchMyGenres', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ search, email: user.email, token: user.token }),
        })
        const res = await fetchProject.json();
        res.result && setListProject(res.searchResults);
    }

    //Rechercher les prompts de la communauté liké par l'utilisateur pendant qu'il remplit le champ de recherche
    const fetchCommunityProjects = async () => {
        // Fetch des projets 
        const fetchProject = await fetch('http://localhost:3000/genres/searchCommunityGenres', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ search: searchCommunity, email: user.email, token: user.token }),
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


    let display =
        <div className={styles.container}>
            <div className={styles.choiceContainer}>
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


    if (newExistingProject) {


        let mappedProjects;
        if (selectedTab === 1) {
            const myProjects = listProjects;
            if (listProjects.length && search.length) {
                mappedProjects = listProjects.map((project, i) => {
                    let { prompt, genre, titre, userId } = project;
                    return <div className={styles.modelCard} onClick={() => handleClick(genre)}>
                        <ModelCard genre={genre}
                            prompt={prompt}
                            title={titre}
                            firstname={userId.firstname}
                            username={userId.username}
                            picture={userId.picture}
                        />
                    </div>
                });
            } else {
                mappedProjects = myProjects.map((project, i) => {
                    let { prompt, genre, titre, userId } = project;
                    return <div className={styles.modelCard} onClick={() => handleClick(genre)}>
                        <ModelCard genre={genre}
                            prompt={prompt}
                            title={titre}
                            firstname={userId.firstname}
                            username={"Moi"}
                            picture={userId.picture}
                        />
                    </div>
                });
            }
        } else if (selectedTab === 2) {
            const myProjects = listCommunityProject;
            if (listProjects.length && search.length) {
                mappedProjects = listCommunityProject.map((project, i) => {
                    let { prompt, genre, titre, userId } = project;
                    return <div className={styles.modelCard} onClick={() => handleClick(genre)}>
                        <ModelCard genre={genre}
                            prompt={prompt}
                            title={titre}
                            firstname={userId.firstname}
                            username={userId.username}
                            picture={userId.picture}
                        />
                    </div>
                });
            } else {
                mappedProjects = myProjects.map((project, i) => {
                    let { prompt, genre, titre, userId } = project;
                    return <div className={styles.modelCard} onClick={() => handleClick(genre)}>
                        <ModelCard genre={genre}
                            prompt={prompt}
                            title={titre}
                            firstname={userId.firstname}
                            username={userId.username}
                            picture={userId.picture}
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
