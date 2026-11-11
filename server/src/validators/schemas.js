import { z } from 'zod';
const email = z.string().trim().email().transform(v => v.toLowerCase());
export const registerSchema = z.object({ name: z.string().trim().min(1), email, password: z.string().min(8) });
export const loginSchema = z.object({ email, password: z.string().min(1) });
const validDate = value => { if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const date = new Date(`${value}T00:00:00Z`); return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value; };
export const readingSchema = z.object({ date: z.string().refine(validDate, 'Please enter a valid date.'), slot: z.enum(['morning','after_breakfast','after_lunch','after_dinner']), value: z.union([z.number(),z.string()]).optional() });
export const idSchema = z.coerce.number().int().positive();
export const idParamsSchema = z.object({ id: idSchema });
