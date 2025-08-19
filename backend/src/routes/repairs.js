
import { Router } from 'express';
import Repair from '../models/Repair.js';
import Machine from '../models/Machine.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req,res)=>{
  const list = await Repair.findAll({ include: [Machine], order:[['id','DESC']] });
  res.json(list);
});

router.post('/', requireAuth, requireAdmin, async (req,res)=>{
  const r = await Repair.create(req.body);
  const m = await Machine.findByPk(r.MachineId);
  if (m) { m.status = 'repair'; await m.save(); }
  res.status(201).json(r);
});

router.put('/:id', requireAuth, requireAdmin, async (req,res)=>{
  const r = await Repair.findByPk(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  Object.assign(r, req.body);
  if (r.status === 'done') {
    const m = await Machine.findByPk(r.MachineId);
    if (m) { m.status = 'idle'; await m.save(); }
  }
  await r.save();
  res.json(r);
});

router.delete('/:id', requireAuth, requireAdmin, async (req,res)=>{
  const r = await Repair.findByPk(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  await r.destroy();
  res.json({ ok:true });
});

export default router;
