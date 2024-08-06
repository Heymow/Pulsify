import React from "react";
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import styles from '../styles/ProjectModal.module.css';
import { Component, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons';




function ProjectModal(props) {

    const [audio, setAudio] = useState(null);
    const [isPublic, setIsPublic] = useState(false)

    const uploadVideos = async (files) => {
        const formData = new FormData();

        formData.append("file", files[0]);
        formData.append("upload_preset", "ml_default");
        fetch("https://api.cloudinary.com/v1_1/duiieokac/video/upload", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                setAudio(data.secure_url);

            });
        const dataForPrompt = {
            genre: props.projectTitle,
            prompt: props.prompt,
            audio: audio,
            note,
            isPublic: isPublic
        }
        // let saveAudio = await fetch("http://localhost:3000/prompts", {
        //     method: "POST",
        //     body: { audio: audio }
        // })
        console.log(audio)

    };



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
                <p className={styles.promptContainer}>{props.prompt}</p>
                <div className={styles.import}>
                    <input className={styles.inputImport} type="file" onChange={(e) => uploadVideos(e.target.files)} />
                </div>
                <div className={styles.voteContainer}>
                    <p className={styles.voteTxt}>Votre note :</p>
                    <div className={styles.voteTxt}>
                        <FontAwesomeIcon
                            icon={faStar}
                            className={styles.colorThemeIcon}
                        />
                        <FontAwesomeIcon
                            icon={faStar}
                            className={styles.colorThemeIcon}
                        />
                        <FontAwesomeIcon
                            icon={faStar}
                            className={styles.colorThemeIcon}
                        />
                        <FontAwesomeIcon
                            icon={faStar}
                            className={styles.colorThemeIcon}
                        />
                        <FontAwesomeIcon
                            icon={faStar}
                            className={styles.colorThemeIcon}
                        />
                    </div>
                </div>
                <div className={styles.modalBtnContainer}>
                    <div className={styles.public}>
                        <div className={isPublic === true ? styles.isPublic : styles.isNotPublic} onClick={() => setIsPublic(!isPublic)}>
                        </div>
                        <span className={styles.text}>Public</span>
                    </div>
                    <button className={styles.btn} onClick={props.onRequestClose}>Retour</button>
                    <button className={styles.btn} onClick={() => window.location.href = "../Profil"}>Valider</button>
                </div>
            </div>
        </Modal>
    )
}

export default ProjectModal