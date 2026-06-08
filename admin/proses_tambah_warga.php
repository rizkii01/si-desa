<?php
// admin/proses_tambah_warga.php - Proses Tambah Data Warga
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header('Location: ../login.php?error=1');
    exit;
}

require_once '../config/db.php';

$success = $error = '';

// Validasi input
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nik = trim($_POST['nik']);
    $nama_lengkap = trim($_POST['nama_lengkap']);
    $email = trim($_POST['email']);
    $no_hp = trim($_POST['no_hp']);
    $tempat_lahir = trim($_POST['tempat_lahir']);
    $tanggal_lahir = $_POST['tanggal_lahir'];
    $jenis_kelamin = $_POST['jenis_kelamin'];
    $alamat = trim($_POST['alamat']);

    // Validasi wajib
    if (empty($nik) || empty($nama_lengkap) || empty($tanggal_lahir) || empty($jenis_kelamin)) {
        $error = "NIK, Nama Lengkap, Tanggal Lahir, dan Jenis Kelamin wajib diisi!";
    } elseif (strlen($nik) !== 16 || !ctype_digit($nik)) {
        $error = "NIK harus 16 digit angka!";
    } elseif (!in_array($jenis_kelamin, ['Laki-laki', 'Perempuan'])) {
        $error = "Jenis kelamin tidak valid!";
    } else {
        // Cek apakah NIK sudah terdaftar
        try {
            $check = $pdo->prepare("SELECT id FROM warga WHERE nik = ?");
            $check->execute([$nik]);
            if ($check->rowCount() > 0) {
                $error = "NIK sudah terdaftar di sistem!";
            } else {
                // Insert data warga baru (role default 'warga')
                $stmt = $pdo->prepare("INSERT INTO warga 
                    (nik, nama_lengkap, email, no_hp, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin, role) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'warga')");

                $stmt->execute([
                    $nik,
                    $nama_lengkap,
                    $email ?: null,
                    $no_hp ?: null,
                    $alamat ?: null,
                    $tempat_lahir ?: null,
                    $tanggal_lahir,
                    $jenis_kelamin
                ]);

                // Redirect dengan pesan sukses
                header('Location: warga_desa.php?success=1');
                exit;
            }
        } catch (PDOException $e) {
            $error = "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.";
            // Log error jika di production: error_log($e->getMessage());
        }
    }
}

// Jika ada error, kembali ke halaman sebelumnya dengan pesan
if ($error) {
    $_SESSION['error_message'] = $error;
    header('Location: warga_desa.php');
    exit;
}
?>