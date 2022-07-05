import './App.css';
import Home from './components/Home';

import { Route, Switch } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { useHistory } from 'react-router-dom';
import CreateQuiz from './components/CreateQuiz';
import Error from './components/Error';
import Login from './components/Login';
import Register from './components/Register';
import Room from './components/Room';
function App() {
  // const useStyles = makeStyles((theme) => ({
  //   root: {
  //     backgroundColor: theme.palette.background.paper,
  //     width: 500,
  //   },
  // }));
  let history = useHistory();
  return (
    <div className="App">
      <div>
        <div className="title">
          <Typography
            onClick={() => {
              history.push('/');
            }}
            gutterBottom
            variant="h2"
            component="h2"
          >
            Guess The Song
          </Typography>
        </div>
      </div>
      <Switch>
        <Route path="/" component={Home} exact />
        <Route path="/create" component={CreateQuiz} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Register} />
        <Route path="/room/:quizID/:roomID" component={Room} />

        <Route component={Error} />
      </Switch>
    </div>
  );
}

export default App;
