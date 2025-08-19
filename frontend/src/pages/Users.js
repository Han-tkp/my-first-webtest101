import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const fetchUsers = async () => {
    const res = await axios.get('http://localhost:5000/api/users');
    setUsers(res.data);
  };

  const addUser = async () => {
    await axios.post('http://localhost:5000/api/users', form);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    await axios.delete(`http://localhost:5000/api/users/${id}`);
    fetchUsers();
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div>
      <h2>Users</h2>
      <input placeholder="Username" onChange={e => setForm({...form, username: e.target.value})} />
      <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} />
      <input placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
      <button onClick={addUser}>Add</button>
      <ul>
        {users.map(u => (
          <li key={u.id}>{u.username} ({u.email}) <button onClick={() => deleteUser(u.id)}>Delete</button></li>
        ))}
      </ul>
    </div>
  );
}

export default Users;