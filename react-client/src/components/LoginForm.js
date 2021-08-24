import React, { useState } from 'react';

const LoginForm = ({onSubmit}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    onSubmit(username, password);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text"
        onChange={e => setUsername(e.target.value)}
        value={username}
        placeholder="Username"/>
      <input 
        type="password"
        onChange={e => setPassword(e.target.value)}
        value={password}
        placeholder="Password"/>
      <button>Login</button>
    </form>
  )
}


export default LoginForm;