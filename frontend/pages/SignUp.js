import styles from "../styles/SignUp.module.css"
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from "react-redux";
import { login } from "../reducers/user";
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from "jwt-decode";
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useRouter } from "next/router";


function SignUp() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setconfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false)
    const [showRePassword, setShowRePassword] = useState(false)
    const [isIdentical, setIsIdentical] = useState(true)
    const [isValidEmail, setisValidEmail] = useState(true)
    const [isValidUsername, setIsValidUsername] = useState(true)
    const [isValidName, setIsValidName] = useState(true)
    const [errorLogin, setErrorLogin] = useState(true);

    const dispatch = useDispatch();
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    const router = useRouter()
    const user = useSelector((state) => state.user.value);

    user.token && router.push({ pathname: '/Accueil' });


    // Change le mot de passe en invisible/visible et l'icone associée.
    let passwordEye;
    let rePasswordEye
    if (showPassword) {
        passwordEye = <FontAwesomeIcon icon={faEye} onClick={() => setShowPassword(!showPassword)} className={styles.userSection} />;
    } else {
        passwordEye = <FontAwesomeIcon icon={faEyeSlash} onClick={() => setShowPassword(!showPassword)} className={styles.userSection} />;
    }

    if (showRePassword) {
        rePasswordEye = <FontAwesomeIcon icon={faEye} onClick={() => setShowRePassword(!showRePassword)} className={styles.userSection} />;
    } else {
        rePasswordEye = <FontAwesomeIcon icon={faEyeSlash} onClick={() => setShowRePassword(!showRePassword)} className={styles.userSection} />;
    }

    // Appel le backend pour créer un utilisateur dans la base de donnée.
    const createAccount = async () => {
        const fetchSignin = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/users/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, username: username, firstname: name, password: password }),
        })
        const res = await fetchSignin.json()
        if (res.result) {
            dispatch(login({ token: res.token, username: res.username, firstname: res.firstname, email: res.email }));
            router.push({ pathname: '/Accueil' });
        } else {
            setErrorLogin(true)
        }
    }

    // Messages d'erreur si les champs ne sont pas bien remplis
    const passwordMessage = <span className={styles.messages}>Les deux mots de passe ne sont pas identifiques</span>
    const mailMessage = <span className={styles.messages}>Mail invalide</span>
    const usernameMessage = <span className={styles.messages}>Nom d'utilisateur invalide</span>
    const nameMessage = <span className={styles.messages}>Prénom invalide</span>
    const errorMessage = <span>Erreur server</span>

    // Check la validité de l'email, du password et des userNames.
    const checkForm = () => {
        const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (pattern.test(email) && email !== "") {
            setisValidEmail(true)
        } else {
            setisValidEmail(false)
        }

        if (password === confirmPassword && password != "" && confirmPassword != "") {
            setIsIdentical(true)
            createAccount()
        } else {
            setIsIdentical(false)
        }
        username === "" ? setIsValidUsername(false) : setIsValidUsername(true)
        name === "" ? setIsValidName(false) : setIsValidName(true)

    }

    // Bouton créer un compte/ connexion avec Google
    let googleBtn = <GoogleLogin
        shape='pill'
        theme='filled_blue'
        text='continue_with'
        onSuccess={async (credentialResponse) => {

            // Récupération des infos présentes sur le compte Google 
            const emailGoogle = jwtDecode(credentialResponse.credential).email
            const firstnameGoogle = jwtDecode(credentialResponse.credential).given_name
            const usernameGoogle = jwtDecode(credentialResponse.credential).name
            const pictureGoogle = jwtDecode(credentialResponse.credential).picture
            const googleID = jwtDecode(credentialResponse.credential).sub


            const fetchSignin = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/users/signup/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailGoogle, username: usernameGoogle, firstname: firstnameGoogle, google_id: googleID, picture: pictureGoogle }),
            })
            const res = await fetchSignin.json()
            if (res.result) {
                dispatch(login({ token: res.token, username: res.username, firstname: res.firstname, email: res.email, picture: res.picture }));
                router.push({ pathname: '/Accueil' });
            } else {
                setErrorLogin(true)
            }
        }
        }
        onError={() => {
            setErrorLogin(true)
        }}
    />


    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div className={styles.mainContainer}>
                <h1 className={styles.h1}>Créer un compte</h1>
                <h2 className={styles.h2}>Créer un compte pour visualier, gérer et partager vos projets</h2>
                <div className={styles.inputContainer}>
                    {googleBtn}
                    ou ...
                    <input className={styles.input} type="email"
                        title="Email invalide" placeholder="Email" onChange={(e) => setEmail(e.target.value)} value={email} />
                    {!isValidEmail && mailMessage}
                    <input className={styles.input} placeholder="Nom d'utilisateur" onChange={(e) => setUsername(e.target.value)} value={username} />
                    {!isValidUsername && usernameMessage}
                    <input className={styles.input} placeholder="Prénom" onChange={(e) => setName(e.target.value)} value={name} />
                    {!isValidName && nameMessage}

                    <div className={styles.inputPassword}>
                        <input className={styles.password} type={showPassword ? "text" : "password"}
                            placeholder="Mot de passe" onChange={(e) => setPassword(e.target.value)} value={password} required />
                        {passwordEye}
                    </div>
                    <div className={styles.inputPassword}>
                        <input className={styles.password} type={showRePassword ? "text" : "password"}
                            placeholder="Confirmation mot de passe" onChange={(e) => setconfirmPassword(e.target.value)} value={confirmPassword} required />
                        {rePasswordEye}
                    </div>
                    {!isIdentical && passwordMessage}

                    <h3 className={styles.h3}> En créant un compte, vous acceptez les conditions d'utilisation et la politique de confidentialité </h3>
                    <button className={styles.createBtn} onClick={() => checkForm()}>Créer un compte</button>
                    {!errorLogin && errorMessage}
                    <div className={styles.returnBtn}>
                        <button className={styles.createBtn} onClick={() => router.push({ pathname: '/' })}>Retour</button>
                    </div>
                </div >
            </div >
        </GoogleOAuthProvider >
    )
}

export default SignUp;
