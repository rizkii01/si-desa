const data = JSON.stringify({nik:'1212121212121212',password:'password123'});
const https = require('http');
const req = https.request({hostname:'api.si-desa.my.id',port:80,path:'/api/auth/login',method:'POST',headers:{'Content-Type':'application/json','Content-Length':data.length}}, (res) => {
  let body = '';
  res.on('data', (c) => body += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try { const p = JSON.parse(body); if(p.token) { console.log('LOGIN VIA DOMAIN OK!'); console.log('User:', p.user.nama_lengkap, '- Role:', p.user.role); } else { console.log(body); } } catch(e) { console.log(body); }
  });
});
req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
