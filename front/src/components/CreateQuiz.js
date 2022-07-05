import { React, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardMedia from '@material-ui/core/CardMedia';
import { useHistory } from 'react-router-dom';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
export default function CreateQuiz() {
  const [timer, setTimer] = useState(null);
  let history = useHistory();
  const [token, setToken] = useState(null);
  const [songs, setSongs] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState(false);
  const [timeLimit, setTimeLimit] = useState(0);
  const [invalidUrl, setInvalidUrl] = useState(false);

  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    error: { color: '#D32F2F' },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    media: {
      height: 140,
    },
    songsgrid: { marginTop: '5rem' },
    linkInput: { width: '100%', height: '3.2rem' },
    header: { color: 'white', textAlign: 'center' },
    authInput: { width: '20rem' },
  }));

  const classes = useStyles();
  const changeInput = (url) => {
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
    setTimer(
      setTimeout(() => {
        setInvalidUrl(true);
        try {
          url = new URL(url);
          var playlist_id = url.searchParams.get('list');
        } catch (e) {}

        if (playlist_id) {
          setInvalidUrl(false);
          getSongList(playlist_id);
        }
      }, 1000)
    );
  };

  const updateAnswer = (newValue, id) => {
    const selectedSongIndex = songs.findIndex((x) => x.id == id);
    var selectedSong = songs[selectedSongIndex];
    selectedSong.answer = newValue;
    let updatedSongs = songs;
    updatedSongs[selectedSongIndex] = selectedSong;
    setSongs([...updatedSongs]);
  };

  const getSongList = (id) => {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow',
    };
    const api_url = process.env.REACT_APP_WEB_URL + '/getSongs';

    fetch(`${api_url}?id=${id}`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const myList = JSON.parse(result).data.items;
        const songs = myList.map(({ id, bestThumbnail, title, shortUrl }) => {
          return {
            id,
            image: bestThumbnail.url,
            title,
            url: shortUrl,
            answer: title,
          };
        });
        setSongs(songs);
      })
      .catch((error) => setInvalidUrl(true));
  };
  const create = () => {
    setError(false);
    const api_url = process.env.REACT_APP_WEB_URL + '/quiz';

    var myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
    myHeaders.append('Authorization', `Bearer ${token}`);
    var urlencoded = new URLSearchParams();
    urlencoded.append('timeLimit', timeLimit);
    urlencoded.append('name', name);
    urlencoded.append('songs', JSON.stringify(songs));
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
          history.push('/');
        }
      })
      .catch((error) => setError(true));
  };
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      var myHeaders = new Headers();
      myHeaders.append('Authorization', `Bearer ${token}`);

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow',
      };
      const api_url = process.env.REACT_APP_WEB_URL + '/profile';

      fetch(api_url, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          try {
            const data = JSON.parse(result);

            if (data.success) {
              localStorage.setItem('user', JSON.stringify(data.data));
              setToken(token);
            } else {
              localStorage.clear();
              history.push('/login');
            }
          } catch (e) {
            localStorage.clear();
            history.push('/login');
          }
        })
        .catch((error) => {
          localStorage.clear();
          history.push('/login');
        });
    } else {
      history.push('/login');
    }
  }, []);

  return (
    <>
      <h3 className={classes.header}>Create New Quiz</h3>
      <Grid container spacing={3}>
        <Grid item xs={10}>
          <TextField
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            id="name"
            label="Quiz Name"
            variant="outlined"
            className={classes.linkInput}
          />
        </Grid>
        <Grid item xs={2}>
          <TextField
            value={timeLimit}
            id="timeLimit"
            label="Time Limit"
            variant="outlined"
            onChange={(e) => {
              setTimeLimit(e.target.value);
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">sec</InputAdornment>,
            }}
            className={classes.linkInput}
          />
        </Grid>
        <Grid item xs={10}>
          <TextField
            onChange={(e) => {
              changeInput(e.target.value);
            }}
            id="playlist-url"
            label="Youtube Playlist URL"
            variant="outlined"
            className={classes.linkInput}
          />
          {error ? (
            <>
              <br />
              <p className={classes.error}>Error, Please fill all details.</p>
            </>
          ) : (
            <></>
          )}
          {invalidUrl ? (
            <>
              <br />
              <p className={classes.error}>
                Invalid url , please enter valid youtube playlist url.
              </p>
            </>
          ) : (
            <></>
          )}
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="outlined"
            color="primary"
            onClick={create}
            size="large"
            className={classes.linkInput}
          >
            Create Quiz
          </Button>
        </Grid>
      </Grid>
      <Grid item xs={12} className={classes.songsgrid}>
        <Grid container justify="center" spacing={5}>
          {songs.map(({ id, image, title, answer }) => (
            <Grid key={id} item xs={4} sm={4}>
              <Card>
                <CardActionArea>
                  <CardMedia
                    className={classes.media}
                    image={image}
                    title="Contemplative Reptile"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h5">
                      {title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <TextField
                    label="Answer"
                    variant="outlined"
                    onChange={(e) => {
                      updateAnswer(e.target.value, id);
                    }}
                    value={answer}
                    className={classes.linkInput}
                  />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </>
  );
}
