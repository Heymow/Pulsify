import styles from '../styles/Login.module.css';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from "jwt-decode";
import { GoogleOAuthProvider } from '@react-oauth/google'
import { login } from '../reducers/user';
import { useRouter } from 'next/router';

function Login() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter()

  const user = useSelector((state) => state.user.value);

  user.token && router.push({ pathname: '/Accueil' });

  let error
  if (errorLogin) { error = <h4 style={{ color: 'red', fontWeight: 'normal', fontStyle: 'italic' }}>Champs manquants ou invalides</h4> }

  let googleBtn = <GoogleLogin
    shape='pill'
    theme='filled_blue'
    text='continue_with'
    onSuccess={(credentialResponse) => {
      const email = jwtDecode(credentialResponse.credential).email
      const firstnameGoogle = jwtDecode(credentialResponse.credential).given_name
      const usernameGoogle = jwtDecode(credentialResponse.credential).name
      const pictureGoogle = jwtDecode(credentialResponse.credential).picture
      const googleID = jwtDecode(credentialResponse.credential).sub
      connexionGoogle(email, firstnameGoogle, usernameGoogle, pictureGoogle, googleID)
    }}
    onError={() => {
      setErrorLogin(true)
    }}
  />

  const connexionGoogle = async (emailGoogle, firstname, username, picture, googleId) => {
    const fetchLogin = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/users/signup/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailGoogle, username: username, firstname: firstname, google_id: googleId, picture: picture }),
    })
    const res = await fetchLogin.json()
    if (res.result) {
      dispatch(login({ token: res.token, username: res.username, firstname: res.firstname, email: res.email, picture: res.picture }))
      window.location.href = '/Accueil'
    } else {
      setErrorLogin(true)
    }
  }

  const connexion = async () => {
    const fetchLogin = await fetch(`${process.env.NEXT_PUBLIC_FETCH_URL}/users/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password }),
    })
    const res = await fetchLogin.json()
    if (res.result) {
      dispatch(login({ token: res.token, username: res.username, firstname: res.firstname, email: res.email }));
      window.location.href = '/Accueil'
    } else {
      setErrorLogin(true)
    }
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={styles.container}>
        <h1 className={styles.title}>Connexion</h1>
        {googleBtn}
        <h3>ou ...</h3>
        <input type='email' placeholder='Email' onChange={(e) => setEmail(e.target.value)} value={email} className={styles.inputEmail} />
        <input type='password' placeholder='Mot de passe' onChange={(e) => setPassword(e.target.value)} value={password} className={styles.inputPassword} />
        {error}
        {/*<h5>Mot de passe oublié ?</h5>*/}
        <button className={styles.btn} onClick={() => connexion()}>Connexion</button>
        <button className={styles.btnRetour} onClick={() => window.location.href = '/'}>Retour</button>
      </div>
    </GoogleOAuthProvider>
  )
}

export default Login;
