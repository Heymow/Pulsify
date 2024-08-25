import styles from '../styles/Welcome.module.css';
import ArrowDiagram from './ArrowDiagram';
import Header from './Header';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

function Welcome() {
  const [tutoPage, setTutoPage] = useState(0)

  const handleNext = () => {
    if (tutoPage < 3) {
      setTutoPage(tutoPage + 1)
    }
  }

  const handlePrev = () => {
    if (tutoPage > 0) {
      setTutoPage(tutoPage - 1)
    }
  }

  const handleChangePage = (pageNumber) => {
    setTutoPage(pageNumber)
  }

  let tutoContent;

  if (tutoPage === 0) {
    tutoContent = (
      <div className={styles.tutoContainer}>
        <div className={styles.tutoTextContainer}>
          <h3 className={styles.tutoTitleText}>Bienvenue chez Pulsify !</h3>
          <p className={styles.tutoText}>Votre allié Suno ultime pour générer les musiques dont vous rêvez !</p>

        </div>
        <footer className={styles.tutoFooter}>
          <div className={styles.emptyDiv}></div>
          <div className={styles.tutoCarousel}>
            <FontAwesomeIcon
              icon={faCircle}
              className={styles.carouselIconOn}
            />
            <FontAwesomeIcon
              icon={faCircle}
              onClick={() => handleChangePage(1)}
              className={styles.carouselIconOff}
            />
            <FontAwesomeIcon
              icon={faCircle}
              onClick={() => handleChangePage(2)}
              className={styles.carouselIconOff}
            />
            <FontAwesomeIcon
              icon={faCircle}
              onClick={() => handleChangePage(3)}
              className={styles.carouselIconOff}
            />
          </div>
          <button className={styles.btn} onClick={handleNext}>Suivant</button>
        </footer>
      </div>
    );
  } else if (tutoPage === 1) {
    tutoContent =
      <div className={styles.tutoContainer}>
        <div className={styles.tutoTextContainer}>
          <img className={styles.logoSuno} src="/Logo-Suno.svg" width={"15%"} ></img>
          <p className={styles.tutoText}>Suno est une startup spécialisée dans la création de musique assistée par intelligence artificielle. Leur technologie permet aux utilisateurs de générer des morceaux de musique à partir de simples descriptions textuelles. La génération de ces morceaux de musique coûtent des crédits.</p>
        </div>
        <footer className={styles.tutoFooter}>
          <button className={styles.btn} onClick={handlePrev}>Précédent</button>
          <div className={styles.tutoCarousel}>
            <FontAwesomeIcon
              icon={faCircle}
              onClick={() => handleChangePage(0)}
              className={styles.carouselIconOff}
            />
            <FontAwesomeIcon
              icon={faCircle}
              className={styles.carouselIconOn}
            />
            <FontAwesomeIcon
              icon={faCircle}
              onClick={() => handleChangePage(2)}
              className={styles.carouselIconOff}
            />
            <FontAwesomeIcon
              icon={faCircle}
              onClick={() => handleChangePage(3)}
              className={styles.carouselIconOff}
            />
          </div>
          <button className={styles.btn} onClick={handleNext}>Suivant</button>
        </footer>
      </div>
  } else if (tutoPage === 2) {
    tutoContent = (
      <div className={styles.tutoContainer}>
        <div className={styles.tutoTextContainer}>
          <h3 className={styles.tutoTitleText2}>Economisez vos crédits grâce à des invites de plus en plus pertinentes !</h3>
          <p className={styles.tutoText}>Choisissez des styles musicaux qui correspondent à ce que vous souhaitez générer et ajustez au fur et à mesure</p>



          <div className={styles.straightArrowDiagram}>
            <ArrowDiagram />
          </div>
        </div>
        <footer className={styles.tutoFooter}>
          <button className={styles.btn} onClick={handlePrev}>Précédent</button>
          <div className={styles.tutoCarousel}>
            <FontAwesomeIcon
              icon={faCircle}
              onClick={() => handleChangePage(0)}
              className={styles.carouselIconOff}
            />
            <FontAwesomeIcon
              icon={faCircle}
              onClick={() => handleChangePage(1)}
              className={styles.carouselIconOff}
            />
            <FontAwesomeIcon
              icon={faCircle}
              className={styles.carouselIconOn}
            />
            <FontAwesomeIcon
              icon={faCircle}
              onClick={() => handleChangePage(3)}
              className={styles.carouselIconOff}
            />
          </div>
          <button className={styles.btn} onClick={handleNext}>Suivant</button>
        </footer>
      </div>
    )
  } else if (tutoPage === 3) {
    tutoContent = (
      <div className={styles.tutoContainer}>
        <div className={styles.tutoTextContainer}>
          <h3 className={styles.tutoTitleText2}>Mémorisez les styles musicaux et trouvez les mots-clés qui vont bien ensemble</h3>
          <p className={styles.tutoText}>Découvrez les styles uniques de la communauté, engagez des interactions, et puisez-en l'inspiration pour nourrir vos propres projets créatifs</p>
        </div>
        <footer className={styles.tutoFooter}>
          <button className={styles.btn} onClick={handlePrev}>Précédent</button>
          <div className={styles.tutoCarousel}>
            <FontAwesomeIcon
              icon={faCircle}
              onClick={() => handleChangePage(0)}
              className={styles.carouselIconOff}
            />
            <FontAwesomeIcon
              icon={faCircle}
              onClick={() => handleChangePage(1)}
              className={styles.carouselIconOff}
            />
            <FontAwesomeIcon
              icon={faCircle}
              onClick={() => handleChangePage(2)}
              className={styles.carouselIconOff}
            />
            <FontAwesomeIcon
              icon={faCircle}
              className={styles.carouselIconOn}
            />

          </div>
          <div className={styles.emptyDiv}></div>
        </footer>
      </div>

    )
  }



  return (
    <div>
      <main className={styles.main}>
        <Header />
        <div>
          {tutoContent}
        </div>
      </main>
    </div>
  );
}

export default Welcome;
