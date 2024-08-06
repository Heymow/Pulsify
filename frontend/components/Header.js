import styles from '../styles/Header.module.css';
import { useState } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';




function Header() {
    const user = useSelector((state) => state.user.value)

    let topMenu =
        <div className={styles.btnContainer}>
            <Link href='/SignUp'>
                <button className={styles.btn}>Inscription</button>
            </Link>
            <Link href='/Login'>
                <button className={styles.btn}>Connexion</button>
            </Link>
        </div>

    if (user.token) {
        topMenu =
            <div className={styles.btnContainer}>
                <div className={styles.roundBtn}>
                    <Link href='/SignUp'>
                        <FontAwesomeIcon icon={faUser} className={styles.icon} />
                    </Link>
                </div>
                <div className={styles.roundBtn}>
                    <Link href='/Login'>
                        <FontAwesomeIcon icon={faQuestion} className={styles.icon} />
                    </Link>
                </div>
            </div>
    }


    return (
        <header className={styles.handleConnectionContainer}>
            <Link href='/Accueil'>
                <h1 className={styles.title1}>PULSIFY</h1>
            </Link>
            {topMenu}
        </header>
    );
}

export default Header;
