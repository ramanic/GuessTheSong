import { React, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';

import { useHistory } from 'react-router-dom';
export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    error: { color: '#D32F2F' },
    header: { color: 'white', textAlign: 'center' },
    authInput: { width: '20rem' },
  }));

  const signup = () => {
    setError(false);
    setSuccess(false);
    const api_url = process.env.REACT_APP_WEB_URL + '/auth/register';

    var myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    var urlencoded = new URLSearchParams();
    urlencoded.append('email', email);
    urlencoded.append('name', name);
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
        } else if (data._id) {
          setSuccess(true);
        }
      })
      .catch((error) => setError(true));
  };
  const classes = useStyles();
  let history = useHistory();
  return (
    <>
      <h3 className={classes.header}>Sign Up</h3>
      <Grid item xs={12}>
        <Grid container justify="center" spacing={2}>
          <Grid item>
            <TextField
              value={name}
              className={classes.authInput}
              onChange={(e) => {
                setName(e.target.value);
              }}
              id="name"
              label="Name"
              variant="outlined"
            />
          </Grid>
        </Grid>
        <Grid container justify="center" spacing={2}>
          <Grid item>
            <TextField
              type="email"
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
              onClick={signup}
              variant="outlined"
              color="primary"
              size="large"
              className={classes.authInput}
            >
              Sign Up
            </Button>
            {error ? (
              <p
                style={{
                  textAlign: 'center',
                  color: '#D32F2F',
                  fontSize: '0.8rem',
                }}
              >
                Error: Please enter all details.
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
                  history.push('/login');
                }}
                color="inherit"
              >
                {success
                  ? 'Succesfully Signed Up,'
                  : 'Already have an account? '}
                Login
              </Link>
            </p>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
