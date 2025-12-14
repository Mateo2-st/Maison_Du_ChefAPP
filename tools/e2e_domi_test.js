import http from 'http';
import { URL } from 'url';
import pool from '../backend/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const API = 'http://localhost:3000';

function request(path, method='GET', data=null, token=null){
  return new Promise((resolve, reject)=>{
    const url = new URL(API+path);
    const opts = { method, hostname: url.hostname, port: url.port, path: url.pathname+url.search, headers: {} };
    if (data){
      const body = JSON.stringify(data);
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(body);
      opts._body = body;
    }
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(opts, res => {
      let b='';
      res.setEncoding('utf8');
      res.on('data', c=>b+=c);
      res.on('end', ()=>{
        try{ const json = b ? JSON.parse(b) : null; resolve({status: res.statusCode, body: json}); }
        catch(e){ resolve({status: res.statusCode, body: b}); }
      });
    });
    req.on('error', reject);
    if (opts._body) req.write(opts._body);
    req.end();
  });
}

(async ()=>{
  try{
    console.log('Registering test domiciliario...');
    const email = 'test_domi@example.com';
    const pass = 'Password123!';
    await request('/api/auth/register','POST',{ nombre:'Domi Test', correo: email, contrasena: pass, role: 'domiciliario' });

    console.log('Logging in...');
    const login = await request('/api/auth/login','POST',{ correo: email, contrasena: pass });
    if (login.status !== 200){ console.error('Login failed', login); process.exit(1); }
    const token = login.body.token;
    console.log('Token obtained');

    console.log('Listing pedidos for domiciliario');
    const pedidosRes = await request('/api/domiciliario/pedidos','GET',null,token);
    console.log('Pedidos status', pedidosRes.status);
    const pedidos = pedidosRes.body || [];
    if (!pedidos.length){ console.log('No pedidos to accept. Done.'); process.exit(0); }

    const firstId = pedidos[0].id;
    console.log('First pedido id:', firstId);

    console.log('Accepting pedido', firstId);
    const acc = await request(`/api/domiciliario/aceptar/${firstId}`,'POST',null,token);
    console.log('Aceptar status', acc.status, acc.body);

    console.log('Marking as entregado', firstId);
    const ent = await request(`/api/domiciliario/entregado/${firstId}`,'POST',null,token);
    console.log('Entregado status', ent.status, ent.body);

    // Verify DB
    const [rows] = await pool.query('SELECT idPedido, id_domiciliario, estado FROM pedidos WHERE idPedido = ?', [firstId]);
    console.log('DB row:', rows[0]);

    process.exit(0);
  }catch(err){
    console.error('ERROR TEST:', err);
    process.exit(1);
  }
})();
