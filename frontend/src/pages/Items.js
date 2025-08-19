import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Items() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', stock: '' });

  const fetchItems = async () => {
    const res = await axios.get('http://localhost:5000/api/items');
    setItems(res.data);
  };

  const addItem = async () => {
    await axios.post('http://localhost:5000/api/items', form);
    fetchItems();
  };

  const deleteItem = async (id) => {
    await axios.delete(`http://localhost:5000/api/items/${id}`);
    fetchItems();
  };

  useEffect(() => { fetchItems(); }, []);

  return (
    <div>
      <h2>Items</h2>
      <input placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} />
      <input placeholder="Price" onChange={e => setForm({...form, price: e.target.value})} />
      <input placeholder="Stock" onChange={e => setForm({...form, stock: e.target.value})} />
      <button onClick={addItem}>Add</button>
      <ul>
        {items.map(i => (
          <li key={i.id}>{i.name} - ${i.price} ({i.stock}) <button onClick={() => deleteItem(i.id)}>Delete</button></li>
        ))}
      </ul>
    </div>
  );
}

export default Items;