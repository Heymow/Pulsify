import styles from '../styles/Profil.module.css';
import { useSelector } from 'react-redux';




function UserCard(props) {
  const user = useSelector((state) => state.user.value)
  console.log(props)
  console.log(user)
  let profil =
    <div className={styles.profilesContainer}>
      <img className={styles.profilesPic} src={user.picture} alt='photo de profil' />

      <div className={styles.namediv}>
        <h3 className={styles.nom}> {props.firstname}</h3>
        <h4 className={styles.identifiant}>@{props.username}</h4>
      </div>
    </div>



  return (
    <>
      {profil}
    </>
  );
}

export default UserCard;
