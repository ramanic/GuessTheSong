import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
const themeX = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#1E88E5',
    },
    background: {
      paper: '#1E1E1E',
    },
  },
});
ReactDOM.render(
  <React.StrictMode>
    <MuiThemeProvider theme={themeX}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MuiThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
