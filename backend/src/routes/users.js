
import { Router } from 'express';
import User from '../models/User.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { hashPassword } from '../utils/password.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, async (req,res)=>{
  const users = await User.findAll({ order:[['id','ASC']] });
  res.json(users);
});

router.post('/', requireAuth, requireAdmin, async (req,res)=>{
  const { name, email, password, role } = req.body;
  const passwordHash = await hashPassword(password || '123456');
  const user = await User.create({ name, email, passwordHash, role: role || 'user' });
  res.status(201).json(user);
});

router.put('/:id', requireAuth, requireAdmin, async (req,res)=>{
  const { id } = req.params;
  const { name, email, password, role } = req.body;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  if (password) user.passwordHash = await hashPassword(password);
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  await user.save();
  res.json(user);
});

router.delete('/:id', requireAuth, requireAdmin, async (req,res)=>{
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  await user.destroy();
  res.json({ ok: true });
});

export default router;
