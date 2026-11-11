import 'dotenv/config'; import 'express-async-errors'; import express from 'express'; import cors from 'cors'; import helmet from 'helmet'; import auth from './routes/auth.js'; import readings from './routes/readings.js'; import reports from './routes/reports.js'; import { errorHandler } from './utils/errors.js';
const app=express(); app.use(helmet()); app.use(cors({origin:process.env.CLIENT_ORIGIN||'http://localhost:5173'})); app.use(express.json());
const wrap=router=>(req,res,next)=>Promise.resolve(router(req,res,next)).catch(next);
app.get('/health',(req,res)=>res.json({ok:true})); app.use('/auth',auth); app.use('/readings',readings); app.use('/reports',reports); app.use((err,req,res,next)=>errorHandler(err,req,res,next));
const port=Number(process.env.PORT)||3000; if(process.env.NODE_ENV!=='test') app.listen(port,()=>process.stdout.write(`Sweety API listening on ${port}\n`)); export default app;
