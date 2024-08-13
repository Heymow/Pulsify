import React, { useEffect } from "react";
import Modal from 'react-modal';
import styles from '../styles/GenresModal.module.css';
import { Component, useState } from 'react';
import { useSelector } from "react-redux";

function GenresModal(props) {
    const user = useSelector((state) => state.user.value)
    const [genresList, setGenresList] = useState([])
    const [includeCommunityFavorites, setIncludeCommunityFavorites] = useState(false); // State for checkbox

    useEffect(() => {
        fetchAllGenres()

    }, []);

    const fetchAllGenres = async () => {
        const { token, email } = user
        if (token) {
            const fetchGenres = await fetch('http://localhost:3000/users/genres', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, email }),
            })
            const resGenre = await fetchGenres.json()
            setGenresList(resGenre.genres)
            console.log("genres :", resGenre)
        }
    }

    const fetchLikedGenres = async () => {
        const { token, email } = user
        const fetchLikedGenres = await fetch('http://localhost:3000/users/genres', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, email }),
        })
        const resLikedGenres = await fetchLikedGenres.json()
        setGenresList([...genresList, ...resLikedGenres])
    }



    const handleClickOnGenre = (genre) => {
        props.handleGenreSelect(genre)
    }



    const genreButtons = genresList && genresList.map((genre, i) => {
        return (
            <div key={i} className={styles.genresBtn} onClick={() => handleClickOnGenre(genre)}>{genre}</div>
        )
    });

    // Handle checkbox toggle
    const handleCheckboxChange = (event) => {
        const isChecked = event.target.checked;
        setIncludeCommunityFavorites(isChecked);
        if (isChecked) {
            fetchLikedGenres(); // Fetch liked genres if checked
            console.log("coucou")
        }
    };

    return (
        <Modal
            isOpen={props.isOpen}
            className={styles.modalContainer}
            onRequestClose={props.onRequestClose}
            contentLabel="Example Modal">
            <div className={styles.content}>
                <div className={styles.modalTitleContent}>
                    <div className={styles.modalTitle}>Vos genres favoris</div>

                </div>
                <div className={styles.genresContainer}>
                    {genreButtons}
                </div>
                <div className={styles.bottomGenreModal}>
                    <label className={styles.checkboxLabel}>
                        <input type="checkbox"
                            className={styles.checkBoxSuggestion}
                            onChange={handleCheckboxChange} // Add onChange handler
                        />
                        <span className={styles.customCheckbox}></span>
                        Intégrez les favoris de la communauté
                    </label>
                </div>
            </div>
        </Modal>
    )
}


export default GenresModal