# Panduan Koneksi Supabase

## Masalah Saat Ini

DNS resolution untuk `db.mjbgkyzzsbrroghtswrw.supabase.co` gagal di jaringan Anda (DNS server `192.168.1.1`).

## Solusi

### Opsi 1: Gunakan DNS Publik (Recommended)

Ganti DNS server Anda ke Google DNS atau Cloudflare:

**Windows:**
1. Buka Control Panel → Network and Sharing Center
2. Klik "Change adapter settings"
3. Klik kanan network yang digunakan → Properties
4. Pilih "Internet Protocol Version 4 (TCP/IPv4)" → Properties
5. Gunakan DNS:
   - **Google DNS:** 8.8.8.8 dan 8.8.4.4
   - **Cloudflare DNS:** 1.1.1.1 dan 1.0.0.1

Setelah itu restart network dan test:
```bash
nslookup db.mjbgkyzzsbrroghtswrw.supabase.co
```

### Opsi 2: Gunakan IP Address Langsung

1. Dapatkan IP address Supabase:
```bash
nslookup db.mjbgkyzzsbrroghtswrw.supabase.co
# Atau
ping db.mjbgkyzzsbrroghtswrw.supabase.co
```

2. Update `.env` dengan IP address:
```env
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@2406:da1a:82a:9d02:f39a:6f99:c6ed:294a:5432/postgres
```

**Catatan:** Jika menggunakan IPv6, pastikan jaringan Anda support IPv6.

### Opsi 3: Gunakan Session Pooler dengan IPv4

Jika DNS publik belum bekerja, gunakan Session Pooler:

1. Buka Supabase Dashboard → Project Settings → Database
2. Cari "Connection string" → Session Pooler
3. Copy URL dengan format:
```
postgresql://postgres:PASSWORD@aws-0-[region].pooler.supabase.com:5432/postgres
```

4. Update `.env`:
```env
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**Catatan:** Session Pooler memerlukan SNI hostname yang benar untuk routing.

## Verifikasi Koneksi

Setelah update `.env`, test koneksi:
```bash
cd server
node test-db.js
```

## Check DNS Server Anda

```bash
# Windows
ipconfig /all

# Cari "DNS Servers" - jika 192.168.1.1, kemungkinan provider local memblokir
```

## Jika Masih Gagal

1. **Check firewall** - pastikan tidak memblokir port 5432
2. **Check internet** - pastikan bisa akses Supabase dashboard: https://supabase.com
3. **Test DNS** - pastikan `nslookup db.mjbgkyzzsbrroghtswrw.supabase.co` berhasil
