const API='http://localhost:8080/api';
export async function get<T>(path:string):Promise<T>{const r=await fetch(API+path); if(!r.ok) throw new Error(await r.text()); return r.json();}
export async function post<T>(path:string,body:unknown):Promise<T>{const r=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error(await r.text());return r.json();}
export async function patch<T>(path:string):Promise<T>{const r=await fetch(API+path,{method:'PATCH'});if(!r.ok)throw new Error(await r.text());return r.json();}
