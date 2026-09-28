import React from 'react';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div className="sidebar">
      <div className="logo-block">
        <img className="logo" src="/logo.jpg" alt="logo" />
      </div>
      <nav>
        <Link to="/">Главная</Link>
      </nav>
    </div>
  );
}

export default App;