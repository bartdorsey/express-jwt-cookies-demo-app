import logo from './logo.svg';
import './App.css';
import LoginForm from './components/LoginForm';
import { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  // This logs a user in by posting to 
  // our /login route we pass this to our LoginForm
  // so it can use it onSubmit
  const login = async (username, password) => {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });
    const result = await response.json();
    setLoggedIn(result.loggedIn);
    setMessage(result.message);
  }

  // This logs us out by calling the backend 
  // to destroy the session
  const logout = async () => {
    const response = await fetch('/logout');
    const result = await response.json();
    setLoggedIn(result.loggedIn)
    setMessage(result.message);
  }

  // This is doing a sample authenticated call
  // if this call fails, we are not logged in
  // and we can update state accordingly.
  // everytime loggedIn changes, we try this again.
  // to update the message
  useEffect(() => {
    async function fetchAuthenticated() {
      const response = await fetch('/authenticated');
      const result = await response.json();
      setMessage(result.message);
      setLoggedIn(result.loggedIn);
    }
    fetchAuthenticated();
  },[loggedIn])


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        { !loggedIn ? <LoginForm onSubmit={login}></LoginForm> : null }
        <h1>{loggedIn ? 'Logged In' : 'Not Logged In'}</h1>
        <h2>{message}</h2>
        { loggedIn ? <button onClick={logout}>Logout</button> : null }
      </header>
    </div>
  );
}

export default App;
