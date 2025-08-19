
import { Router } from 'express';
import Machine from '../models/Machine.js';
import MachineType from '../models/MachineType.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req,res)=>{
  const list = await Machine.findAll({ include: [MachineType], order:[['id','ASC']] });
  res.json(list);
});

router.post('/', requireAuth, requireAdmin, async (req,res)=>{
  const m = await Machine.create(req.body);
  res.status(201).json(m);
});

router.put('/:id', requireAuth, requireAdmin, async (req,res)=>{
  const m = await Machine.findByPk(req.params.id);
  if (!m) return res.status(404).json({ error: 'Not found' });
  Object.assign(m, req.body);
  await m.save();
  res.json(m);
});

router.delete('/:id', requireAuth, requireAdmin, async (req,res)=>{
  const m = await Machine.findByPk(req.params.id);
  if (!m) return res.status(404).json({ error: 'Not found' });
  await m.destroy();
  res.json({ ok:true });
});

export default router;
