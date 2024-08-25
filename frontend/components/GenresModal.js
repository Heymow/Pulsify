import React, { useEffect } from "react";
import Modal from 'react-modal';
import styles from '../styles/GenresModal.module.css';
import { useState } from 'react';
import { useSelector } from "react-redux";

function GenresModal(props) {
    const user = useSelector((state) => state.user.value)
    const [genresList, setGenresList] = useState([])
    const [includeCommunityFavorites, setIncludeCommunityFavorites] = useState(false);

    // Fetch les genres quand la checkbox est actionnée
    useEffect(() => {
        includeCommunityFavorites ? fetchLikedGenres() : fetchAllGenres();
    }, [includeCommunityFavorites]);

    // Fetch les genres de l'utilisateur
    const fetchAllGenres = async () => {
        const { token, email } = user
        if (token) {
            const fetchGenres = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/genres/searchMyGenres`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, email }),
            })
            const resGenre = await fetchGenres.json()
            setGenresList(resGenre.searchResults)
        }
    }

    // Fetch les genres de l'utilisateur et ceux qu'il a liké
    const fetchLikedGenres = async () => {
        const { token, email } = user
        const fetchLikedGenres = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/genres/searchLikedGenres`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, email, getLikedGenres: true }),
        })
        const resLikedGenres = await fetchLikedGenres.json()
        setGenresList([...new Set([...genresList, ...resLikedGenres.searchResults])])
    }

    const handleClickOnGenre = (genre) => {
        props.handleGenreSelect(genre)
    }

    const genreButtons = genresList && genresList.map((genre, i) => {
        return (
            <div key={i} className={styles.genresBtn} onClick={() => handleClickOnGenre(genre.genre)}>{genre.genre}</div>
        )
    });

    // Handle checkbox toggle
    const handleCheckboxChange = (event) => {
        const isChecked = event.target.checked;
        setIncludeCommunityFavorites(isChecked);
    };

    return (
        <Modal
            isOpen={props.isOpen}
            className={styles.modalContainer}
            onRequestClose={props.onRequestClose}
            contentLabel="Example Modal">
            <div className={styles.content}>
                <div className={styles.modalTitleContent}>
                    <div className={styles.modalTitle}>Mes genres</div>

                </div>
                <div className={styles.genresContainer}>
                    {genreButtons}
                </div>
                <div className={styles.bottomGenreModal}>
                    <label className={styles.checkboxLabel}>
                        <input type="checkbox"
                            className={styles.checkBoxSuggestion}
                            onChange={handleCheckboxChange}
                        />
                        <span className={styles.customCheckbox}></span>
                        Intégrez les genres ajoutés en favori
                    </label>
                </div>
            </div>
        </Modal>
    )
}


export default GenresModal