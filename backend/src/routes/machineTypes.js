
import { Router } from 'express';
import MachineType from '../models/MachineType.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req,res)=>{
  res.json(await MachineType.findAll({ order:[['id','ASC']] }));
});

router.post('/', requireAuth, requireAdmin, async (req,res)=>{
  const mt = await MachineType.create(req.body);
  res.status(201).json(mt);
});

router.put('/:id', requireAuth, requireAdmin, async (req,res)=>{
  const mt = await MachineType.findByPk(req.params.id);
  if (!mt) return res.status(404).json({ error: 'Not found' });
  Object.assign(mt, req.body);
  await mt.save();
  res.json(mt);
});

router.delete('/:id', requireAuth, requireAdmin, async (req,res)=>{
  const mt = await MachineType.findByPk(req.params.id);
  if (!mt) return res.status(404).json({ error: 'Not found' });
  await mt.destroy();
  res.json({ ok:true });
});

export default router;
