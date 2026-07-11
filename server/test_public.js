const http = require('http');

const data = JSON.stringify({
  nik: '1212121212121212',
  password: 'password123'
});

const options = {
  hostname: '157.10.161.159',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const parsed = JSON.parse(body);
      if (parsed.token) {
        console.log('LOGIN PUBLIC BERHASIL!');
        console.log('User:', parsed.user.nama_lengkap, '- Role:', parsed.user.role);
      } else {
        console.log('Response:', body);
      }
    } catch(e) {
      console.log('Raw:', body);
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
