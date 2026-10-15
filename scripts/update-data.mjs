import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {refresh} from './sources.mjs';
const filename=new URL('../data.json',import.meta.url);
const seed=JSON.parse(await readFile(filename,'utf8'));
const storage={
 async get(key){if(key!=='state/current.json')return null;const text=await readFile(filename,'utf8');return {json:async()=>JSON.parse(text)};},
 async put(key,text){if(key!=='state/current.json')throw Error('Destino no permitido');const pending=new URL('../data.pending.json',import.meta.url);await writeFile(pending,text);await rename(pending,filename);}
};
const result=await refresh({BUCKET:storage},seed,true);
await writeFile(filename,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({checkedAt:result.checkedAt,hydroDate:result.hydroDate,sources:result.sources.map(s=>({name:s.name,status:s.status,date:s.date,message:s.message}))},null,2));
if(result.sources.every(s=>s.status==='error'))throw Error('Todas las consultas fallaron: se conservan los valores anteriores y se registra la falla.');
