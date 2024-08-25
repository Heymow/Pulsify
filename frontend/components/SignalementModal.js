import styles from '../styles/Signalement.module.css';
import React from "react";
import Modal from 'react-modal';

import { useState } from 'react';
import { useSelector } from 'react-redux'



function SignalementModal(props) {
  const [commentaire, setCommentaire] = useState('')
  const user = useSelector((state) => state.user.value)

  const handleValidation = async () => {
    if (props.id) {
      try {
        const signalement = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/projects/signalementProject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idPrompt: props.id,
            text: commentaire,
            token: user.token,
            email: user.email
          }),
        });
        const response = await signalement.json()
        props.onRequestClose()
        if (!response.result) {
          Error('Erreur lors de la validation du signalement');
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    }

    if (props.comment) {
      try {
        const signalement = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/projects/signalementComment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: props.userId,
            comment: props.comment,
            idProject: props.idProject,
            text: commentaire,
            token: user.token,
            email: user.email
          }),
        });
        const response = await signalement.json()
        props.onRequestClose()
        if (!response.result) {
          Error('Erreur lors de la validation du signalement');
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
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
          <h1 className={styles.modalTitle}>Signalement</h1>
        </div>
        <div>
          <p className={styles.text}>Signalez un commentaire innaproprié ou offensant </p>
        </div>
        <div className={styles.promptContainer} >
          <textarea placeholder="Expliquer votre signalement ici..." className={styles.input} onChange={e => setCommentaire(e.target.value)} value={commentaire}>
          </textarea>
        </div>
        <div className={styles.modalBtnContainer}>
          <button className={styles.btn} onClick={props.onRequestClose}>Annuler</button>
          <button className={styles.btn} onClick={handleValidation}>Valider</button>
        </div>
      </div>
    </Modal >


  )
}



export default SignalementModal;
