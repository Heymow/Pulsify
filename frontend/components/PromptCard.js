import styles from '../styles/PromptCard.module.css';
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faHeart, faCircleExclamation, faStar, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import SignalementModal from './SignalementModal';


import UserCard from './UserCard';


function PromptCard(props) {



    const [modalIsOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState("")

    // Open project modal on click on "Enregistrer"
    const openProjectModal = () => {
        setIsOpen(true)
    }
    const closeProjectModal = () => {
        setIsOpen(false);
    }

    const removePrompt = () => {
        fetch('http://localhost:3000/projects/prompt', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, id: props.id })
        })
            .then(response => response.json())
            .then(data => {
                if (!data) {
                    Error('Erreur lors de la récupération des prompts');
                } else {
                    set
                    console.log("Successfully deleted one document.")
                }
            });
    }



    const user = useSelector((state) => state.user.value)
    const [isPlaying, setIsPlaying] = useState(false);


    const displayUser =
        <div className={styles.author}>
            <UserCard email={props.firstname} username={props.username} picture={props.picture} />
        </div>;

    const displayXmark =
        <FontAwesomeIcon icon={faCircleXmark} className={styles.xmark} onClick={() => removePrompt(console.log("coucou"))} />




    const displayicons =
        <>
            <FontAwesomeIcon icon={faHeart} className={styles.icon} />
            <FontAwesomeIcon icon={faCircleExclamation} onClick={() => openProjectModal()} className={styles.icon} />
            <SignalementModal isOpen={modalIsOpen}
                onRequestClose={closeProjectModal}
                prompt={prompt}
            />
        </>




    let play =
        <div className={styles.iconsBox}>
            <FontAwesomeIcon icon={faPlay} className={styles.icon} />
            {!props.isOnProfile && displayicons}
        </div>
    if (isPlaying) {
        play =
            <div className={styles.iconsBox}>
                <FontAwesomeIcon icon={faPause} className={styles.icon} />
                {!props.isOnProfile && displayicons}
            </div>
    }



    return (
        <div className={styles.promptContainer}>

            <div className={styles.itemContainer}>
                {!props.isOnProfile && displayUser}
                <div className={styles.titleBox}>

                    <div className={styles.titleBackground}>
                        <div className={styles.title}>
                            {props.projectName}
                        </div>
                    </div>

                    <div className={styles.score}>
                        <FontAwesomeIcon icon={faStar} className={props.stars >= 1 ? styles.star : styles.starGrey} />
                        <FontAwesomeIcon icon={faStar} className={props.stars >= 2 ? styles.star : styles.starGrey} />
                        <FontAwesomeIcon icon={faStar} className={props.stars >= 3 ? styles.star : styles.starGrey} />
                        <FontAwesomeIcon icon={faStar} className={props.stars >= 4 ? styles.star : styles.starGrey} />
                        <FontAwesomeIcon icon={faStar} className={props.stars === 5 ? styles.star : styles.starGrey} />
                    </div>
                </div>

                <div className={styles.itemPrompt}>
                    {props.prompt}
                </div>
                <div className={styles.iconsBox} onClick={() => setIsPlaying(!isPlaying)}>
                    {play}

                </div>
                {props.isOnProfile && displayXmark}
            </div>

        </div >

    );
}

export default PromptCard;
