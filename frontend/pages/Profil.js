import styles from '../styles/Profil.module.css';
import User, { login } from '../reducers/user';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import user from '../reducers/user'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { logout } from '../reducers/user';
import UserCard from '../components/UserCard';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'


function Profil() {

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value)
  const [selectedTab, setSelectedTab] = useState(1);
  const [maBibliotheque, setMaBibliotheque] = useState(true);
  const [communaute, setCommunaute] = useState(false);


  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/';
  }
  //falseArrowRightFromBracket

  let display =
    <div className={styles.boxes}>
      <div className={styles.box}>
      </div>
    </div>

  if (maBibliotheque) {
    display =

      <div className={styles.modelChoiceContainer}>

        <div className={styles.scrollWindow}>

          <button className={styles.listItemContainer}>
            <div className={styles.listItemTitle}>
              Rockabilly
            </div>
            <div className={styles.listItemPrompt}>
              Jazz, rock, musette, flute
            </div>
          </button>
          <button className={styles.listItemContainer}>
            <div className={styles.listItemTitle}>
              Rock Indie
            </div>
            <div className={styles.listItemPrompt}>
              rock, electric guitar/bass/drums, pop,folk
            </div>
          </button>
          <button className={styles.listItemContainer}>
            <div className={styles.listItemTitle}>
              Modern classical
            </div>
            <div className={styles.listItemPrompt}>
              contemporary, mordern classical, XXcentury
            </div>
          </button>
          <button className={styles.listItemContainer}>
            <div className={styles.listItemTitle}>
              Rockabilly
            </div>
            <div className={styles.listItemPrompt}>
              Jazz, rock, musette, flute
            </div>
          </button>
          <button className={styles.listItemContainer}>
            <div className={styles.listItemTitle}>
              Rockabilly
            </div>
            <div className={styles.listItemPrompt}>
              Jazz, rock, musette, flute
            </div>
          </button>
          <button className={styles.listItemContainer}>
            <div className={styles.listItemTitle}>
              Rockabilly
            </div>
            <div className={styles.listItemPrompt}>
              Jazz, rock, musette, flute
            </div>
          </button>
          <button className={styles.listItemContainer}>
            <div className={styles.listItemTitle}>
              Rockabilly
            </div>
            <div className={styles.listItemPrompt}>
              Jazz, rock, musette, flute
            </div>
          </button>
          <button className={styles.listItemContainer}>
            <div className={styles.listItemTitle}>
              Rockabilly
            </div>
            <div className={styles.listItemPrompt}>
              Jazz, rock, musette, flute
            </div>
          </button>
        </div>
      </div>
  }

  if (communaute) {
    display =
      <div className={styles.modelChoiceContainer}>
        <div className={styles.scrollWindow}>
          <button className={styles.listItemContainer}>
            <div className={styles.listItemTitle}>
              Rockabilly
            </div>
            <div className={styles.listItemPrompt}>
              Jazz,rock, musette, flute
            </div>
          </button>
          <button className={styles.listItemContainer}>
            <div className={styles.listItemTitle}>
              Rock Indie
            </div>
            <div className={styles.listItemPrompt}>
              rock, electric guitar/bass/drums, pop,folk
            </div>
          </button>
          <button className={styles.listItemContainer}>
            <div className={styles.listItemTitle}>
              Modern classical
            </div>
            <div className={styles.listItemPrompt}>
              contemporary, mordern classical, XXcentury
            </div>
          </button>
          <button className={styles.listItemContainer}>
            <div className={styles.listItemTitle}>
              Rockabilly
            </div>
            <div className={styles.listItemPrompt}>
              Jazz, rock, musette, flute
            </div>
          </button>
          <button className={styles.listItemContainer}>
            <div className={styles.listItemTitle}>
              Rockabilly
            </div>
            <div className={styles.listItemPrompt}>
              Jazz, rock, musette, flute
            </div>
          </button>
          <button className={styles.listItemContainer}>
            <div className={styles.listItemTitle}>
              Rockabilly
            </div>
            <div className={styles.listItemPrompt}>
              Jazz, rock, musette, flute
            </div>
          </button>
          <button className={styles.listItemContainer}>
            <div className={styles.listItemTitle}>
              Rockabilly
            </div>
            <div className={styles.listItemPrompt}>
              Jazz, rock, musette, flute
            </div>
          </button>
          <button className={styles.listItemContainer}>
            <div className={styles.listItemTitle}>
              Rockabilly
            </div>
            <div className={styles.listItemPrompt}>
              Jazz, rock, musette, flute
            </div>
          </button>
        </div>
      </div>
  }

  /*fonction card ma bibliotheque
  const clickBibliotheque = () => {
    fetch('http://localhost:3000/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email })
    })
      .then(response => response.json())
      .then(data => {
        if (!data) {
          Error('Erreur lors de la récupération des prompts');
        } else {
          setMaBibliotheque(data.prompts)
        }
      });
  }
  
  fonction card ma bibliotheque
  const clickFavoris = () => {
    fetch('http://localhost:3000/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email })
    })
      .then(response => response.json())
      .then(data => {
        if (!data) {
          Error('Erreur lors de la récupération des likedprompts');
        } else {
          setMaBibliotheque(data.likedprompts)
        }
      });
  }
      <div className={styles.profilesContainer}>
        <div>

          <button className={styles.btnLogOut} onClick={() => handleLogout()}>LogOut</button>
        </div>

      </div>
  */




  return (
    <div className={styles.container}>

      <div className={styles.headerProfile}>
        <UserCard username={user.username} email={user.firstname} />
        <FontAwesomeIcon icon={faArrowRightFromBracket} className={styles.btnLogOut} onClick={() => handleLogout()} />
      </div>


      <div className={styles.selectModelContainer}>
        <div className={styles.tabBar}>
          <div className={selectedTab === 1 ? styles.selectedTab : styles.tab} onClick={() => { setSelectedTab(1); setMaBibliotheque(true); setCommunaute(false) }}>
            Mes modèles
          </div>
          <div className={selectedTab === 2 ? styles.selectedTab : styles.tab} onClick={() => { setSelectedTab(2); setCommunaute(true); setMaBibliotheque(false) }} >
            Communauté
          </div>
        </div>
        {display}
      </div>

      <div className={styles.btn}>
        <button onClick={() => window.location.href = '/'}>Retour</button>
      </div>


    </div >
  );
}

export default Profil;

/*<div className={styles.tabBar}>
        <div className={selectedTab === 1 ? styles.selectedTab : styles.tab} onClick={() => { setSelectedTab(1); setMaBibliotheque(true); setCommunaute(false) }}>
          Ma bibliothèque
        </div>
        <div className={selectedTab === 2 ? styles.selectedTab : styles.tab} onClick={() => { setSelectedTab(2); setCommunaute(true); setMaBibliotheque(false) }} >
          Bibliothèque de la communauté
        </div>
      </div>



      {display}



      <div className={styles.btn}>
        <button className={styles.btnRetour} onClick={() => window.location.href = '/'}>Retour</button>
      </div>*/