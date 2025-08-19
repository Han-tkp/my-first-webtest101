
import { Router } from 'express';
import Return from '../models/Return.js';
import Borrow from '../models/Borrow.js';
import Machine from '../models/Machine.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req,res)=>{
  const list = await Return.findAll({ include: [Borrow], order:[['id','DESC']] });
  res.json(list);
});

router.post('/', requireAuth, requireAdmin, async (req,res)=>{
  const r = await Return.create(req.body);
  const borrow = await Borrow.findByPk(r.BorrowId);
  if (borrow) {
    const m = await Machine.findByPk(borrow.MachineId);
    if (m) { m.status = 'idle'; await m.save(); }
  }
  res.status(201).json(r);
});

router.put('/:id', requireAuth, requireAdmin, async (req,res)=>{
  const r = await Return.findByPk(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  Object.assign(r, req.body);
  await r.save();
  res.json(r);
});

router.delete('/:id', requireAuth, requireAdmin, async (req,res)=>{
  const r = await Return.findByPk(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  await r.destroy();
  res.json({ ok:true });
});

export default router;
