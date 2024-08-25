import styles from '../styles/PromptCard.module.css';
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCircleExclamation, faStar, faCircleXmark, faComment } from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import UserCard from './UserCard';
import { setLikedList } from '../reducers/user';
import SignalementModal from './SignalementModal';


function PromptCard(props) {
    const router = useRouter()
    const [modalIsOpen, setIsOpen] = useState(false);
    const [likeNumber, setLikeNumber] = useState(null)
    const [commentNumber, setCommentNumber] = useState(null)
    const [isLiked, setIsLiked] = useState(false)


    const dispatch = useDispatch()
    const user = useSelector((state) => state.user.value)

    // Ouvrir la modal Project au click sur "Enregistrer" 
    const openSignalementModal = () => {
        setIsOpen(true)
    }
    const closeSignalementModal = () => {
        setIsOpen(false);
    }


    const getLikeNumberAndCommentsNumber = async () => {
        if (!props.isOnProjectComment) {
            return
        }
        let id = props.id
        const { email, token } = user;
        const request = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/users/getLikeNumberAndCommentsNumber`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, id, token })
        })
        const response = await request.json()
        setLikeNumber(response.likeNumber)
        setCommentNumber(response.commentNumber)
    }

    const removePrompt = () => {
        const { email, token } = user;
        fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/projects/prompt`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token, id: props.id })
        })
            .then(response => response.json())
            .then(data => {
                if (!data) {
                    Error('Erreur lors de la récupération des prompts');
                } else {
                    Error("Successfully deleted one document.")
                    props.onRemove()
                }
            });
    }


    const like = async () => {
        let id = props.id
        const { email, token } = user;
        const response = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/users/like`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, id, token })
        })
        const responseLiked = await response.json()
        dispatch(setLikedList(responseLiked.likedPrompts))
        setIsLiked(responseLiked.likedPrompts.includes(id));
        getLikeNumberAndCommentsNumber()
    }

    // Naviguer vers la page ProjectComments avec l'id du projet 
    const commentClick = () => {
        router.push(`/ProjectComments?id=${props.id}`);
    }


    // Set la prompt card sur toutes les pages
    useEffect(() => {
        setIsLiked(user.liked.includes(props.id));
        getLikeNumberAndCommentsNumber()
        props.reRender();
    }, [props.id])


    const displayXmark =
        <FontAwesomeIcon icon={faCircleXmark} className={styles.xmark} onClick={() => removePrompt()} />


    const displayUser =
        <div className={styles.author} onClick={() => handleClick(props.genre, props.projectName, props.prompt)}>
            {!props.isOnMyProjects ? <UserCard isOnExplore={props.isOnExplore} firstname={props.firstname} username={props.username} picture={props.picture} /> : <UserCard isOnExplore={props.isOnExplore} isOnMyProjects={props.isOnMyProjects} firstname={props.firstname} username={props.username} picture={props.picture} />}
        </div>;
    const displayicons =
        <>
            {(!props.isOnMyProjects && !props.isOnProjectComment) && (props.username !== user.username &&
                <FontAwesomeIcon icon={faHeart}
                    className={isLiked ? styles.likedIcon : styles.icon}
                    onClick={() => like(props)} />)}
            {(props.isOnProjectComment) && (props.username !== user.username &&
                <div className={styles.numberLike}>
                    <FontAwesomeIcon icon={faHeart}
                        className={isLiked ? styles.likedIcon : styles.icon}
                        onClick={() => like(props)} />
                    {likeNumber}</div>)}
            {!props.isOnProjectComment ?
                <FontAwesomeIcon icon={faComment}
                    className={styles.icon} onClick={commentClick} /> : <div className={styles.commentNumber}>
                    <FontAwesomeIcon icon={faComment}
                        className={styles.icon}
                        onClick={commentClick} />
                    {commentNumber}</div>}
            {!props.isOnMyProjects ? (<FontAwesomeIcon icon={faCircleExclamation}
                onClick={() => openSignalementModal()}
                className={styles.icon} />) : <> </>}
            <SignalementModal isOpen={modalIsOpen}
                onRequestClose={closeSignalementModal}
                id={props.id}
            />
        </>

    let itemPrompt;

    if (props.isOnMyProjects) {
        itemPrompt = styles.itemPromptOnProfile
    } else if (props.isOnFavoritesProjects) {
        itemPrompt = styles.itemPromptFavorites
    } else if (props.isOnProjectComment) {
        itemPrompt = styles.itemPromptProjectComment
    } else {
        itemPrompt = styles.itemPrompt
    }

    const handleClick = (genre, title, prompt) => {

        if (!props.isOnExplore) {
            router.push({
                pathname: '/Project',
                query: { genre, title, prompt },
            });
        } else {
            router.push({
                pathname: '/Project',
                query: { genre },
            });
        }
    };



    return (
        <div className={styles.promptContainer}>
            <div className={styles.itemContainer}>
                {!props.isOnProfile && displayUser}
                <div className={styles.titleBox} onClick={() => handleClick(props.genre, props.projectName, props.prompt)}>
                    <div className={styles.titleBackground}>
                        <div className={styles.title}>
                            {props.projectName}
                        </div>
                    </div>
                    <div className={styles.genre}>
                        {props.genre}
                    </div>

                    <div className={styles.score} >
                        <FontAwesomeIcon icon={faStar} className={props.stars >= 1 ? styles.star : styles.starGrey} />
                        <FontAwesomeIcon icon={faStar} className={props.stars >= 2 ? styles.star : styles.starGrey} />
                        <FontAwesomeIcon icon={faStar} className={props.stars >= 3 ? styles.star : styles.starGrey} />
                        <FontAwesomeIcon icon={faStar} className={props.stars >= 4 ? styles.star : styles.starGrey} />
                        <FontAwesomeIcon icon={faStar} className={props.stars === 5 ? styles.star : styles.starGrey} />
                    </div>
                </div>
                <div className={itemPrompt} onClick={() => handleClick(props.genre, props.projectName, props.prompt)}>
                    {props.prompt}
                </div>
                <div className={styles.iconsBoxAndAudio} >
                    {props.audio && <audio className={styles.audioInput} type='file' controls src={props.audio} ></audio>}
                    <div className={styles.iconsBox} >
                        <div className={styles.iconsBox}>
                            {!props.isOnProfile && displayicons}
                            {props.isOnMyProjects && displayicons}
                            {props.isOnProfile && displayXmark}
                            {(props.isOnProjectComment && props.isOnMyProjects) && displayicons}
                        </div>
                    </div>
                </div>

            </div>

        </div >

    );
}

export default PromptCard;
