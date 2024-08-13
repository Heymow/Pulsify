import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from "next/router";

import Header from '../components/Header';
import styles from '../styles/ProjectComments.module.css'
import PromptCard from '../components/PromptCard';
import UserCard from '../components/UserCard';
import SignalementModal from '../components/SignalementModal';
import MessageCard from '../components/MessageCard'

function ProjectComments() {
    const user = useSelector((state) => state.user.value)
    const [commentsList, setCommentsList] = useState([])
    const [comment, setComment] = useState("")

    const [projectInfo, setProjectInfo] = useState({})
    const router = useRouter();
    const { id } = router.query; // Retrieve the project ID from the query parameters

    // console.log('id :', id)

    const handleBack = () => {
        router.back();
    };



    const postComment = async () => {
        const postCommentInBD = await fetch('http://localhost:3000/projects/comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, comment: comment, email: user.email }),
        })
        //console.log("postCommentInBD :", postCommentInBD)
        const res = await postCommentInBD.json()
        console.log('res :', res)
        if (res.result) {
            console.log('comment :', comment)
            setCommentsList([...commentsList, res.newComment])
            setComment('')
        } else {
            console.log('Error:', res.message);
            // Optionally, handle errors by showing a message to the user
        }
    }

    useEffect(() => {
        // console.log(id)
        if (id) {
            fetchProjectData(id)
            // Fetch the project data using the ID, or perform any required logic
            console.log('Project ID:', id);
            // You can use this ID to fetch data associated with the specific project
        }

    }, [id]);




    const fetchProjectData = async (id) => {
        console.log('id :', id)
        const fetchData = await fetch(`http://localhost:3000/projects/ProjectById`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id }),
        });
        // console.log('fetchData :', fetchData)
        const res = await fetchData.json()
        console.log('project info :', res.info)
        setProjectInfo(res.info)
        setCommentsList(res.info.messages)
    }



    let projet
    let comments
    if (projectInfo._id) {
        projet = <PromptCard id={id}
            username={projectInfo.userId.username}
            firstname={projectInfo.userId.firstname}
            picture={projectInfo.userId.picture}
            stars={projectInfo.rating}
            projectName={projectInfo.title}
            genre={projectInfo.genre}
            prompt={projectInfo.prompt}
        />

        comments = commentsList.map((data, i) => {
            return (
                < MessageCard key={i} comment={data.comment} userId={data.userId} />
            )
        }).reverse()
    }



    return (
        <div className={styles.main}>
            <Header></Header>
            <div className={styles.topCommentPage}>
                <button className={styles.btn} onClick={handleBack}>Retour</button>
                <button className={styles.btn}>Utiliser ce modèle</button>
            </div>
            <div className={styles.promptCardContainer}>
                {projet}
            </div>
            <div className={styles.commentsContainer}>
                {comments}
            </div>
            <div className={styles.addYourOwnCommentContainer}>
                <textarea placeholder='enter your comment' className={styles.commentInput} onChange={(e) => setComment(e.target.value)}
                    value={comment}
                    maxLength={250} />
                <button className={styles.postYrCommentBtn} onClick={() => postComment()}>Publier</button>
            </div>

        </div>
    )
}

export default ProjectComments;