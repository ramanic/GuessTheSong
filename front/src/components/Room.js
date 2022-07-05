import { React, useEffect, useState, useRef } from 'react';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import socketIOClient from 'socket.io-client';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { FixedSizeList } from 'react-window';
import ReactPlayer from 'react-player';
export default function Room() {
  const { roomID, quizID } = useParams();
  const [user, setUser] = useState({});
  const [name, setName] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [room, setRoom] = useState({ users: [], quiz: [], current: -1 });
  const [isStarted, setStarted] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  const [muted, setMuted] = useState(true);
  const [myMessage, setMyMessage] = useState('');
  const [message, setMessage] = useState([]);
  const socketRef = useRef();
  const msg = [
    { msg: 'hi', usr: 'abc' },
    { msg: 'hello', usr: 'abcd' },
  ];
  useEffect(() => {
    let user = localStorage.getItem('user');
    user = JSON.parse(user);
    setUser(user);

    // If no user do nothing (First create Usee)
    if (!user) {
      console.log('DO nothing');
      return;
    }
    if (roomID == 1) {
      const api_url =
        process.env.REACT_APP_WEB_URL +
        `/room/create?userID=${user._id}&quizID=${quizID}`;
      fetch(api_url)
        .then((res) => res.json())
        .then((data) => {
          console.log('test');
          if (data.success === true) {
            window.location = `/room/${quizID}/${data.data}`;
          }
        })
        .catch((e) => {
          console.log(e);
          window.location = '/';
        });
      console.log('finish');
      return;
    }
    console.log('Socket Connection');

    socketRef.current = socketIOClient(process.env.REACT_APP_SOCKET, {
      query: { roomID, userName: user.name, userID: user._id },
    });

    socketRef.current.on('connect', () => {
      console.log('Connected', socketRef.current.id);
    });
    socketRef.current.on('ROOM_UPDATE', (room) => {
      console.log(room);
      setRoom({ ...room });
      console.log(room);
      console.log(room.adminID);
      console.log(user._id);

      if (room.adminID === user._id) {
        setAdmin(true);
      }
    });
    socketRef.current.on('MSG_UPDATE', (msgs) => {
      scrollToBottom();
      setMessage([...msgs]);
    });
    socketRef.current.on('PLAY_NEXT', (current) => {
      setSongUrl(current);

      console.log('Play nest');
    });
  }, []);

  const playNext = () => {
    socketRef.current.emit('NEXT');
  };
  const scrollToBottom = () => {
    var div = document.getElementById('chat-window');
    if (div != null) {
      div.scrollIntoView();
    }
  };
  const handleMsgKeyPress = (event) => {
    console.log(event.key);
    if (event.key == 'Enter') {
      if (myMessage.length > 0) {
        socketRef.current.emit('SEND_MSG', {
          message: myMessage,
          muser: user,
          id: socketRef.current.id,
          type: 0,
        });
        scrollToBottom();
        setMyMessage('');
      }
    }
  };

  return (
    <div>
      {user ? (
        <Grid container spacing={3}>
          <Grid item xs={3}>
            <h3 style={{ color: 'whitesmoke', textAlign: 'center' }}>Users</h3>
            <Divider />
            <List>
              {room.users.map(({ userName, score }) => (
                <ListItemText
                  style={{ color: 'white' }}
                  primary={userName}
                  secondary={score}
                />
              ))}
            </List>
          </Grid>
          <Grid item xs={8}>
            <div>
              <h3 style={{ color: 'whitesmoke', textAlign: 'center' }}>
                {room.current > -1
                  ? `Current Question : ${room.current + 1}`
                  : isAdmin
                  ? ''
                  : 'Waitng for Game to start..'}
                {isAdmin ? (
                  <Button
                    onClick={playNext}
                    style={{ margin: '0', marginLeft: '2rem' }}
                    variant="outlined"
                    color="primary"
                    size="small"
                  >
                    {room.current > -1 ? 'Skip' : 'Start Game'}
                  </Button>
                ) : (
                  ''
                )}
              </h3>
            </div>
            {room.current > -1 ? (
              <>
                <div
                  style={{
                    height: 400,
                    overflowY: 'scroll',
                    padding: '2.5rem',
                  }}
                >
                  {message.map(({ message, muser, type }) => {
                    return (
                      <div>
                        {type == 0 ? (
                          <>
                            {' '}
                            <small
                              style={{
                                color: 'white',
                                margin: 0,
                                marginLeft: '0.5rem',
                                fontSize: '0.5rem',
                              }}
                            >
                              {muser.name}
                            </small>
                            <p
                              style={{
                                fontSize: '0.8rem',
                                borderRadius: 10,
                                margin: 0,
                                color: 'whitesmoke',
                                backgroundColor: '#1e88e5',
                                width: 'fit-content',
                                padding: '0.4rem',
                                marginBottom: '0.2rem',
                              }}
                            >
                              {message}
                            </p>
                          </>
                        ) : type == 1 ? (
                          <>
                            <p
                              style={{
                                fontSize: '0.8rem',
                                borderRadius: 10,
                                margin: 0,
                                color: 'green',

                                width: 'fit-content',
                                padding: '0.4rem',
                                marginBottom: '0.2rem',
                              }}
                            >
                              {' '}
                              {message}
                            </p>
                          </>
                        ) : type == 2 ? (
                          <>
                            <p
                              style={{
                                fontSize: '0.8rem',
                                borderRadius: 10,
                                margin: 0,
                                color: 'red',
                                width: 'fit-content',
                                padding: '0.4rem',
                                marginBottom: '0.2rem',
                              }}
                            >
                              {' '}
                              {message}
                            </p>
                          </>
                        ) : type == 3 ? (
                          <>
                            <p
                              style={{
                                fontSize: '0.8rem',
                                borderRadius: 10,
                                margin: 0,
                                color: '#1e88e5',
                                width: 'fit-content',
                                padding: '0.4rem',
                                marginBottom: '0.2rem',
                              }}
                            >
                              {' '}
                              {message}
                            </p>
                          </>
                        ) : (
                          ''
                        )}
                      </div>
                    );
                  })}
                  <div id="chat-window"></div>
                </div>
                <TextField
                  autoComplete="off"
                  value={myMessage}
                  style={{ width: '100%' }}
                  id="timeLimit"
                  variant="outlined"
                  onChange={(e) => {
                    setMyMessage(e.target.value);
                  }}
                  onKeyPress={handleMsgKeyPress}
                />
              </>
            ) : (
              ''
            )}

            <ReactPlayer
              width={0}
              height={0}
              url={songUrl}
              playing={true}
              controls={false}
              muted={muted}
              onPlay={() => {
                setTimeout(function () {
                  setMuted(false);
                }, 500);
                setTimeout(function () {
                  setMuted(true);
                }, room.quiz.timeLimit * 1000);
              }}
            />
          </Grid>
        </Grid>
      ) : (
        <>
          {' '}
          <Grid container justify="center" spacing={2}>
            <Grid item>
              <TextField
                style={{ width: '20rem' }}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                id="name"
                label="Display Name"
                variant="outlined"
              />
            </Grid>
          </Grid>
          <Grid container justify="center" spacing={2}>
            <Grid item>
              <Button
                style={{ width: '20rem' }}
                onClick={() => {
                  console.log(name);
                  if (name.length > 2) {
                    var uniqID = `${Date.now()}${Math.random()
                      .toString(36)
                      .substring(7)}`;
                    localStorage.setItem(
                      'user',
                      JSON.stringify({ _id: uniqID, name })
                    );
                    window.location.reload();
                  }
                }}
                variant="outlined"
                color="primary"
                size="large"
              >
                Join
              </Button>
            </Grid>
          </Grid>
        </>
      )}
    </div>
  );
}
