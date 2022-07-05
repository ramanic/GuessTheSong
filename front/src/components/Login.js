import { React, useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';

import { useHistory } from 'react-router-dom';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    error: { color: '#D32F2F' },
    header: { color: 'white', textAlign: 'center' },
    authInput: { width: '20rem' },
  }));
  const login = () => {
    setError(false);
    const api_url = process.env.REACT_APP_WEB_URL + '/auth/login';
    var myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    var urlencoded = new URLSearchParams();
    urlencoded.append('email', email);
    urlencoded.append('password', password);
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow',
    };
    fetch(api_url, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const data = JSON.parse(result);
        if (data.message) {
          setError(true);
        } else if (data.token) {
          localStorage.setItem('token', data.token);

          history.push('/create');
        }
      })
      .catch((error) => setError(true));
  };
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (token) {
      history.push('/create');
    }
  }, []);
  const classes = useStyles();
  let history = useHistory();
  return (
    <>
      <h3 className={classes.header}>Login</h3>
      <Grid item xs={12}>
        <Grid container justify="center" spacing={2}>
          <Grid item>
            <TextField
              value={email}
              className={classes.authInput}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              id="email"
              label="Email"
              variant="outlined"
            />
          </Grid>
        </Grid>
        <Grid container justify="center" spacing={2}>
          <Grid item>
            <TextField
              value={password}
              className={classes.authInput}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              type="password"
              id="password"
              label="Password"
              variant="outlined"
            />
          </Grid>
        </Grid>
        <Grid container justify="center" spacing={2}>
          <Grid item>
            <Button
              onClick={login}
              variant="outlined"
              color="primary"
              size="large"
              className={classes.authInput}
            >
              Login
            </Button>
            {error ? (
              <p
                style={{
                  textAlign: 'center',
                  color: '#D32F2F',
                  fontSize: '0.8rem',
                }}
              >
                Authentication error
              </p>
            ) : (
              <></>
            )}
            <p
              style={{
                textAlign: 'center',
                color: '#42a5f5',
                fontSize: '0.8rem',
              }}
            >
              <Link
                onClick={() => {
                  history.push('/signup');
                }}
                color="inherit"
              >
                Don't have an account ? Sign up
              </Link>
            </p>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
