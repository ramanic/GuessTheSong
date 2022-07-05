import { React, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { useHistory } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
export default function Home() {
  const [quizes, setQuizes] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  let history = useHistory();
  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
  }));
  useEffect(() => {
    const api_url = process.env.REACT_APP_WEB_URL + '/quiz';
    setLoading(true);
    setError(true);
    fetch(api_url)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);

        if (data.success === true) {
          setQuizes(data.data);
          setError(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, []);
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <div className="title-second">
        Select a Quiz to or
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            history.push('/create');
          }}
        >
          Create New Quiz
        </Button>
      </div>
      <Grid item xs={12}>
        <Grid container justify="center" spacing={5}>
          {quizes.map(({ _id, name, songs, timeLimit, createdAt }) => (
            <Grid key={_id} item xs={6} sm={3}>
              <Card>
                <CardActionArea>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="h6">
                      {name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="p"
                    >
                      Total Songs : {songs.length}
                      <br />
                      Time Limit : {timeLimit} sec <br />
                      <small>Created on {formatDate(createdAt)}</small>
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <Button
                    size="medium"
                    color="primary"
                    onClick={() => {
                      history.push(`/room/${_id}/1`);
                    }}
                  >
                    Host Game
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </div>
  );
}
