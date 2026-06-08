<?php
// admin/detail_warga.php - Halaman Detail Data Warga
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header('Location: ../login.php?error=1');
    exit;
}

require_once '../config/db.php';

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    header('Location: warga_desa.php');
    exit;
}

// Ambil data warga
$stmt = $pdo->prepare("SELECT * FROM warga WHERE id = ? AND role = 'warga'");
$stmt->execute([$id]);
$warga = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$warga) {
    $_SESSION['error_message'] = "Data warga tidak ditemukan!";
    header('Location: warga_desa.php');
    exit;
}

// Format tanggal lahir
$tanggal_lahir = $warga['tanggal_lahir'] ? date('d F Y', strtotime($warga['tanggal_lahir'])) : '-';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Warga - <?= htmlspecialchars($warga['nama_lengkap']) ?> - Desa Cemara</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .profile-img {
            width: 150px;
            height: 150px;
            object-fit: cover;
            border: 5px solid #fff;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .card-header {
            background: linear-gradient(135deg, #0dcaf0, #17a2b8);
        }
    </style>
</head>
<body class="bg-light">

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-10">
            <div class="card shadow-lg border-0">
                <div class="card-header text-white text-center py-4 rounded-top">
                    <h3 class="mb-0"><i class="bi bi-person-badge me-3"></i>Detail Data Warga</h3>
                </div>
                <div class="card-body p-5">

                    <div class="text-center mb-5">
                        <!-- Placeholder foto profil (bisa diganti dengan upload foto nanti) -->
                        <img src="../images/avatar-default.png" alt="Foto Profil" class="rounded-circle profile-img mb-4">
                        <h2 class="fw-bold"><?= htmlspecialchars($warga['nama_lengkap']) ?></h2>
                        <p class="text-muted">Warga Desa Cemara</p>
                    </div>

                    <div class="row g-4">
                        <div class="col-md-6">
                            <div class="bg-light p-4 rounded shadow-sm">
                                <h5 class="fw-bold text-primary mb-3"><i class="bi bi-card-text me-2"></i>Informasi Pribadi</h5>
                                <table class="table table-borderless">
                                    <tr>
                                        <th width="30%">NIK</th>
                                        <td>: <?= htmlspecialchars($warga['nik']) ?></td>
                                    </tr>
                                    <tr>
                                        <th>Jenis Kelamin</th>
                                        <td>: <?= htmlspecialchars($warga['jenis_kelamin']) ?></td>
                                    </tr>
                                    <tr>
                                        <th>Tempat Lahir</th>
                                        <td>: <?= htmlspecialchars($warga['tempat_lahir'] ?? '-') ?></td>
                                    </tr>
                                    <tr>
                                        <th>Tanggal Lahir</th>
                                        <td>: <?= $tanggal_lahir ?></td>
                                    </tr>
                                    <tr>
                                        <th>Alamat</th>
                                        <td>: <?= nl2br(htmlspecialchars($warga['alamat'] ?? '-')) ?></td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="bg-light p-4 rounded shadow-sm">
                                <h5 class="fw-bold text-primary mb-3"><i class="bi bi-telephone me-2"></i>Kontak</h5>
                                <table class="table table-borderless">
                                    <tr>
                                        <th width="30%">Email</th>
                                        <td>: <?= htmlspecialchars($warga['email'] ?? '-') ?></td>
                                    </tr>
                                    <tr>
                                        <th>Nomor Handphone</th>
                                        <td>: <?= htmlspecialchars($warga['no_hp'] ?? '-') ?></td>
                                    </tr>
                                </table>

                                <h5 class="fw-bold text-primary mt-4 mb-3"><i class="bi bi-calendar-check me-2"></i>Informasi Sistem</h5>
                                <table class="table table-borderless">
                                    <tr>
                                        <th>Tanggal Registrasi</th>
                                        <td>: <?= date('d F Y H:i', strtotime($warga['created_at'])) ?></td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="d-grid gap-3 mt-5">
                        <a href="edit_warga.php?id=<?= $warga['id'] ?>" class="btn btn-warning btn-lg rounded-pill text-white">
                            <i class="bi bi-pencil me-2"></i>Edit Data Warga
                        </a>
                        <a href="warga_desa.php" class="btn btn-outline-secondary btn-lg rounded-pill">
                            <i class="bi bi-arrow-left me-2"></i>Kembali ke Daftar Warga
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>