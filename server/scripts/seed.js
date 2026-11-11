import 'dotenv/config'; import bcrypt from 'bcrypt'; import { pool } from '../src/config/db.js'; import { todayInTimezone } from '../src/utils/dateRanges.js';
const slots=['morning','after_breakfast','after_lunch','after_dinner'];
try {
 const hash=await bcrypt.hash('Demo@1234',10);
 const u=await pool.query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name RETURNING id',['Demo User','demo@sweety.app',hash]);
 const id=u.rows[0].id, today=todayInTimezone(process.env.APP_TIMEZONE||'Asia/Kolkata');
 const anchor=new Date(`${today}T12:00:00Z`);
 const days=Array.from({length:35},(_,i)=>{const d=new Date(anchor);d.setUTCDate(d.getUTCDate()-(34-i));return d.toISOString().slice(0,10)});
 const values={morning:103,after_breakfast:154,after_lunch:148,after_dinner:142};
 for(let i=0;i<days.length;i++){
  if(i%7===3)continue;
  for(let j=0;j<slots.length;j++){
   if((i%7===1&&j===3)||(i%9===4&&j===2))continue;
   const slot=slots[j], value=i===8&&j===0?65:i===21&&j===2?213:values[slot]+((i*7+j*11)%19)-9;
   await pool.query('INSERT INTO readings(user_id,reading_date,slot,value) VALUES($1,$2,$3,$4) ON CONFLICT(user_id,reading_date,slot) DO NOTHING',[id,days[i],slot,value]);
  }
 }
 process.stdout.write('Demo account and recent readings are ready.\n');
} finally { await pool.end(); }
