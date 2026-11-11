import { Router } from 'express'; import { requireAuth } from '../middleware/auth.js'; import { validate } from '../middleware/validate.js'; import { readingSchema,idSchema } from '../validators/schemas.js'; import { saveReading,listReadings,deleteReading } from '../services/readings.js';
const r=Router(); r.use(requireAuth);
r.get('/',async(req,res,next)=>{try{if(req.query.date&&!/^\d{4}-\d{2}-\d{2}$/.test(req.query.date))return res.status(400).json({error:{code:'VALIDATION_ERROR',message:'Please enter a valid date.',field:'date'}});res.json(await listReadings(req.user.id,req.query));}catch(e){next(e)}});
r.post('/',validate(readingSchema),async(req,res)=>res.status(201).json({reading:await saveReading(req.user.id,req.body)}));
r.put('/:id',async(req,res,next)=>{try{const id=idSchema.parse(req.params.id); const data=readingSchema.parse(req.body);res.json({reading:await saveReading(req.user.id,data,id)});}catch(e){next(e)}});
r.delete('/:id',async(req,res,next)=>{try{const id=idSchema.parse(req.params.id); await deleteReading(req.user.id,id);res.status(204).end();}catch(e){next(e)}}); export default r;
