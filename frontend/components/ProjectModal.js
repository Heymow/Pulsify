import React, { useState } from "react";
import Modal from 'react-modal';
import styles from '../styles/ProjectModal.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

function ProjectModal(props) {
    const [isPublic, setIsPublic] = useState(false);
    const [hoveredStars, setHoveredStars] = useState(0);
    const [score, setScore] = useState(0);
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('')

    const user = useSelector((state) => state.user.value);
    const router = useRouter()

    // Sauvegarder en base de données prompt + audio si l'audio est présent
    const uploadPrompt = async () => {
        if (user.token) {
            const dataForPrompt = {
                genre: props.projectGenre,
                prompt: props.prompt,
                rating: score,
                isPublic: isPublic,
                username: user.username,
                email: user.email,
                token: user.token,
                title: props.projectTitle,
            };
            // Envoyer les data du prompt sans l'audio
            const saveDataForPrompt = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/projects/add`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataForPrompt),
            });

            const responseDataPrompt = await saveDataForPrompt.json();


            if (responseDataPrompt.result) {
                setMessage(`Ajout de l'audio en cours`);

                // Envoyer le fichier audio avec le l'id du prompt sauvegardé 
                if (file && file.length > 0) {
                    const formData = new FormData();
                    formData.append('audio', file[0]);

                    // Envoyer l'audio au backend au format formData
                    const audioResponse = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/projects/${responseDataPrompt.prompt._id}/upload-audio`, {
                        method: "POST",
                        body: formData,
                    });
                    const audioResult = await audioResponse.json();

                    if (audioResult.result) {
                        setMessage(`L'audio a été ajouté avec succes`);

                    } else {
                        setMessage(`Echec de l'ajout de l'audio`);
                    }
                }
            } else {
                setMessage('Echec de la sauvegarde');
            }
        }
        setErrorMessage("")
        router.push('/Profil')
    };

    const mouseOver = (rating) => {
        setHoveredStars(rating)
    }
    const mouseLeave = () => {
        setHoveredStars(0)
    }
    const clickToRate = (rating) => {
        setScore(rating)
    }


    return (
        <Modal
            isOpen={props.isOpen}
            className={styles.modalContainer}
            onRequestClose={props.onRequestClose}
            contentLabel="Example Modal">
            <div className={styles.content}>
                <div className={styles.modalTitleContent}>
                    <h1 className={styles.modalTitle}>{props.projectTitle}</h1>
                </div>
                <div className={styles.genreTxt}>Genre du projet : {props.projectGenre}</div>
                <p className={styles.promptContainer}>{props.prompt}</p>
                <div className={styles.import}>
                    <input
                        type="file"
                        className={styles.inputImport}
                        onChange={(e) => setFile(e.target.files)}
                        accept="audio/*"
                    />
                    {message && <p>{message}</p>}
                </div>
                <p className={styles.errorMessage}>{errorMessage}</p>
                <div className={styles.voteContainer}>
                    <div className={styles.voteContainerLeft}>
                        <p className={styles.voteTxt}>Ecoutez sur Suno, puis donnez votre note :</p>
                        <div className={styles.voteStars}>
                            {[1, 2, 3, 4, 5].map((star) => {
                                const isStarSelected = score >= star;
                                const isStarHovered = hoveredStars >= star;

                                let color = "gray";
                                if (isStarHovered && !isStarSelected) {
                                    color = "white";
                                } else if (isStarSelected) {
                                    color = "#B300F2";
                                }

                                return (
                                    <FontAwesomeIcon
                                        key={star}
                                        icon={faStar}
                                        style={{ color }}
                                        onMouseEnter={() => mouseOver(star)}
                                        onMouseLeave={mouseLeave}
                                        onClick={() => clickToRate(star)}
                                    />
                                );
                            })}
                        </div>
                        <div className={styles.public} onClick={() => setIsPublic(!isPublic)}>
                            <div
                                className={isPublic ? styles.isPublic : styles.isNotPublic}
                            />
                            <span className={styles.text}>Public</span>
                        </div>
                    </div>
                </div>
                <div className={styles.modalBtnContainer}>
                    <button className={styles.btn} onClick={props.onRequestClose}>Retour</button>
                    <button className={styles.btn} onClick={() => { score !== 0 ? uploadPrompt() : setErrorMessage("Merci de renseigner une note") }}>Valider</button>

                </div>

            </div>
        </Modal>
    );
}

export default ProjectModal;