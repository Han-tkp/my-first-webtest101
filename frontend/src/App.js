import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Users from './pages/Users';
import Items from './pages/Items';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/users">Users</Link> | <Link to="/items">Items</Link>
      </nav>
      <Routes>
        <Route path="/users" element={<Users />} />
        <Route path="/items" element={<Items />} />
      </Routes>
    </Router>
  );
}

export default App;