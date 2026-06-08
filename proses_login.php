<?php
session_start();
require_once 'config/db.php';

// Hanya izinkan POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: login.php'); // atau index.php
    exit;
}

$nik = trim($_POST['nik'] ?? '');
$password = trim($_POST['password'] ?? ''); // ini tanggal lahir

// Validasi NIK: harus 16 digit angka
if (!ctype_digit($nik) || strlen($nik) !== 16) {
    header('Location: login.php?error=invalid_nik');
    exit;
}

// Coba parse tanggal lahir dari berbagai format
$formats_to_try = ['Y-m-d', 'd-m-Y', 'Y/m/d', 'd/m/Y', 'Ymd', 'dmY'];
$parsed_date = null;

foreach ($formats_to_try as $format) {
    $date = DateTime::createFromFormat($format, $password);
    if ($date && $date->format($format) === $password) {
        $parsed_date = $date->format('Y-m-d');
        break;
    }
}

// Jika tidak ada format yang cocok
if (!$parsed_date) {
    header('Location: login.php?error=invalid_date');
    exit;
}

// Cari user di database
$stmt = $pdo->prepare("SELECT * FROM warga WHERE nik = ? AND tanggal_lahir = ?");
$stmt->execute([$nik, $parsed_date]);
$user = $stmt->fetch();

if ($user) {
    // Login sukses
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['nik'] = $user['nik'];
    $_SESSION['nama'] = $user['nama_lengkap'];
    $_SESSION['role'] = $user['role'];

    if ($user['role'] === 'admin') {
        header('Location: admin/dashboard.php');
    } else {
        header('Location: warga/home.php');
    }
    exit;
} else {
    // Data tidak ditemukan
    header('Location: login.php?error=auth_failed');
    exit;
}
