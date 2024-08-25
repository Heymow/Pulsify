import styles from '../styles/Profil.module.css';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { logout } from '../reducers/user';
import { faArrowRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons'
import PromptCard from '../components/PromptCard'
import { useRouter } from 'next/router';
import { setLikedList } from '../reducers/user';

function Profil() {

  const [selectedTab, setSelectedTab] = useState(1);
  const [maBibliotheque, setMaBibliotheque] = useState(true);
  const [community, setCommunaute] = useState(false);
  const [myPrompts, setMyPrompts] = useState([]);
  const [communityList, setCommunityList] = useState([]);
  const [reRender, setReRender] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value)
  const router = useRouter()

  !user.token && router.push({ pathname: '/' });

  const handleLogout = () => {
    dispatch(logout());
    router.push({ pathname: '/' })
  }

  const getAllLikedPosts = () => {
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

  useEffect(() => {
    getAllLikedPosts();
  }, [selectedTab, reRender])


  // Fonction pour afficher ma bibliotheque

  const clickBibliotheque = () => {
    if (user.token) {
      fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/users/projets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, token: user.token })
      })
        .then(response => response.json())
        .then(data => {
          if (!data) {
            Error('Erreur lors de la récupération des prompts');
          } else {
            setMyPrompts(data.myPrompts.prompts)
            setCommunityList(data.likedprompts)
          }

        });
    } else {
      router.push({ pathname: '/' })
    }
  }

  useEffect(() => {
    clickBibliotheque();
  }, [])

  // Fonction pour exclure l'element supprimé, inverse data flow avec promptCard
  const handleUpdate = (id) => {
    const newModeles = myPrompts.filter(model => model._id !== id);
    setMyPrompts(newModeles);
  };

  const refresh = () => {
    setReRender(!reRender);
  }

  const listBibliotheque = myPrompts.map((data, i) => {

    return (
      <div className={styles.promptCard}>
        <PromptCard
          key={i}
          isOnProfile={true}
          isOnMyProjects={true}
          isOnFavoritesProjects={false}
          stars={data.rating}
          audio={data.audio}
          projectName={data.title}
          prompt={data.prompt}
          id={data._id}
          genre={data.genre}
          onRemove={() => handleUpdate(data._id)}
          reRender={refresh} />
      </div>)
  }).reverse()

  const communityMap = communityList.map((data, i) => {
    return (
      <div className={styles.promptCard}>
        <PromptCard
          key={i}
          firstname={data.userId.firstname}
          username={data.userId.username}
          picture={data.userId.picture}
          isOnProfile={false}
          isOnFavoritesProjects={true}
          isOnMyProjects={false}
          stars={data.rating}
          audio={data.audio}
          projectName={data.title}
          prompt={data.prompt}
          id={data._id}
          genre={data.genre}
          onRemove={() => handleUpdate(data._id)}
          reRender={refresh} />
      </div>)
  }).reverse()

  let display =
    <div className={styles.modelChoiceContainer}>
      {listBibliotheque}
    </div>
  if (maBibliotheque) {
    display =
      <div className={styles.modelChoiceContainer}>
        <div className={styles.scrollWindow}>
          <div className={styles.promptCard} >
            {listBibliotheque}
          </div>
        </div>
      </div>
  } else if (community) {
    display =
      <div className={styles.modelChoiceContainer}>
        <div className={styles.scrollWindow}>
          <div className={styles.promptCard} >
            {communityMap}
          </div>
        </div>
      </div>
  }



  return (
    <div className={styles.container}>
      <div className={styles.headerProfile}>
        {user.picture ? <img src={user.picture} className={styles.profilPicture} /> : <FontAwesomeIcon icon={faUser} className={styles.faUserProfil} />}
        <div className={styles.usernameAndName}> {user.firstname}
          <span className={styles.username}>@{user.username}</span>
        </div>
        <FontAwesomeIcon icon={faArrowRightFromBracket} className={styles.btnLogOut} onClick={() => handleLogout()} />
      </div>

      <div className={styles.selectModelContainer}>
        <div className={styles.tabBar}>
          <div className={selectedTab === 1 ? styles.selectedTab : styles.tab} onClick={() => { setSelectedTab(1); setMaBibliotheque(true); setCommunaute(false) }}>
            Mes projets
          </div>
          <div className={selectedTab === 2 ? styles.selectedTab : styles.tab} onClick={() => { setSelectedTab(2); setCommunaute(true); setMaBibliotheque(false) }} >
            Projets favoris
          </div>
        </div>
        <div className={styles.display}>
          {display}
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.btn} onClick={() => router.push('/Accueil')}>
          Retour
        </div>
      </div>
    </div >
  );
}

export default Profil;

