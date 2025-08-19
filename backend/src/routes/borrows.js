
import { Router } from 'express';
import Borrow from '../models/Borrow.js';
import Machine from '../models/Machine.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req,res)=>{
  const list = await Borrow.findAll({ include: [Machine], order:[['id','DESC']] });
  res.json(list);
});

router.post('/', requireAuth, requireAdmin, async (req,res)=>{
  const b = await Borrow.create(req.body);
  // update machine status
  const m = await Machine.findByPk(b.MachineId);
  if (m) { m.status = 'borrowed'; await m.save(); }
  res.status(201).json(b);
});

router.put('/:id', requireAuth, requireAdmin, async (req,res)=>{
  const b = await Borrow.findByPk(req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  Object.assign(b, req.body);
  await b.save();
  res.json(b);
});

router.delete('/:id', requireAuth, requireAdmin, async (req,res)=>{
  const b = await Borrow.findByPk(req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  await b.destroy();
  res.json({ ok:true });
});

export default router;
