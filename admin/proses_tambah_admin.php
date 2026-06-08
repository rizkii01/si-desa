<?php
// admin/proses_tambah_admin.php
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header('Location: ../login.php?error=1');
    exit;
}

require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nik = trim($_POST['nik']);
    $nama_lengkap = trim($_POST['nama_lengkap']);
    $email = trim($_POST['email']);
    $no_hp = trim($_POST['no_hp']);
    $tanggal_lahir = $_POST['tanggal_lahir'];
    $jenis_kelamin = $_POST['jenis_kelamin'];

    if (empty($nik) || empty($nama_lengkap) || empty($tanggal_lahir) || empty($jenis_kelamin)) {
        $_SESSION['error_message'] = "Field wajib harus diisi!";
    } elseif (strlen($nik) !== 16 || !ctype_digit($nik)) {
        $_SESSION['error_message'] = "NIK harus 16 digit angka!";
    } else {
        // Cek NIK unik
        $check = $pdo->prepare("SELECT id FROM warga WHERE nik = ?");
        $check->execute([$nik]);
        if ($check->rowCount() > 0) {
            $_SESSION['error_message'] = "NIK sudah terdaftar!";
        } else {
            $stmt = $pdo->prepare("INSERT INTO warga 
                (nik, nama_lengkap, email, no_hp, tanggal_lahir, jenis_kelamin, role) 
                VALUES (?, ?, ?, ?, ?, ?, 'admin')");

            $stmt->execute([$nik, $nama_lengkap, $email ?: null, $no_hp ?: null, $tanggal_lahir, $jenis_kelamin]);

            $_SESSION['success_message'] = "Admin desa baru berhasil ditambahkan!";
        }
    }
    header('Location: admin_desa.php');
    exit;
}
?>