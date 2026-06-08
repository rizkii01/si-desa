<?php
// warga/profil.php - Halaman Profil Warga
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'warga') {
    header('Location: ../login.php?error=1');
    exit;
}

require_once '../config/db.php';

$nik = $_SESSION['nik'];
$nama = $_SESSION['nama'];

// Ambil data lengkap warga
$stmt = $pdo->prepare("SELECT * FROM warga WHERE nik = ?");
$stmt->execute([$nik]);
$warga = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$warga) {
    // Jika data tidak ditemukan (jarang terjadi)
    header('Location: home.php');
    exit;
}

// Format tanggal lahir
$tanggal_lahir = $warga['tanggal_lahir'] ? date('d F Y', strtotime($warga['tanggal_lahir'])) : '-';
$umur = $warga['tanggal_lahir'] ? floor((time() - strtotime($warga['tanggal_lahir'])) / 31556926) : '-';
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profil Saya - <?= htmlspecialchars($nama) ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .profile-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .profile-img {
            width: 150px;
            height: 150px;
            object-fit: cover;
            border: 6px solid white;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .info-card {
            transition: transform 0.3s;
        }

        .info-card:hover {
            transform: translateY(-5px);
        }
    </style>
</head>

<body class="bg-light admin-layout">

    <!-- Header Profil -->
    <section class="profile-header text-white py-5">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-4 text-center mb-4 mb-lg-0">
                    <?php
                    $foto_path = $warga['foto_profil']
                        ? '../uploads/profil/' . $warga['foto_profil']
                        : '../images/avatar-default.png';
                    ?>
                    <img src="<?= $foto_path ?>?t=<?= time() ?>" alt="Foto Profil" class="rounded-circle profile-img">
                </div>
                <div class="col-lg-8">
                    <h1 class="display-5 fw-bold mb-2"><?= htmlspecialchars($warga['nama_lengkap']) ?></h1>
                    <p class="lead mb-3">Warga Desa Cemara</p>
                    <div class="d-flex flex-wrap gap-3">
                        <span class="badge bg-light text-dark py-2 px-3"><i class="bi bi-person-badge me-2"></i>NIK: <?= htmlspecialchars($warga['nik']) ?></span>
                        <span class="badge bg-light text-dark py-2 px-3"><i class="bi bi-calendar-heart me-2"></i>Umur: <?= $umur ?> tahun</span>
                        <span class="badge bg-light text-dark py-2 px-3"><i class="bi bi-gender-ambulatory me-2"></i><?= htmlspecialchars($warga['jenis_kelamin']) ?></span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <div class="container py-5">
        <div class="row g-4">
            <!-- Informasi Pribadi -->
            <div class="col-lg-6">
                <div class="card info-card shadow-sm border-0">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="bi bi-person-lines-fill me-2"></i>Informasi Pribadi</h5>
                    </div>
                    <div class="card-body">
                        <table class="table table-borderless mb-0">
                            <tr>
                                <th width="35%"><i class="bi bi-person me-2 text-muted"></i>Nama Lengkap</th>
                                <td>: <?= htmlspecialchars($warga['nama_lengkap']) ?></td>
                            </tr>
                            <tr>
                                <th><i class="bi bi-card-heading me-2 text-muted"></i>NIK</th>
                                <td>: <?= htmlspecialchars($warga['nik']) ?></td>
                            </tr>
                            <tr>
                                <th><i class="bi bi-gender-ambulatory me-2 text-muted"></i>Jenis Kelamin</th>
                                <td>: <?= htmlspecialchars($warga['jenis_kelamin']) ?></td>
                            </tr>
                            <tr>
                                <th><i class="bi bi-cake2 me-2 text-muted"></i>Tempat, Tanggal Lahir</th>
                                <td>: <?= htmlspecialchars($warga['tempat_lahir'] ?? '-') ?>, <?= $tanggal_lahir ?></td>
                            </tr>
                            <tr>
                                <th><i class="bi bi-house-door me-2 text-muted"></i>Alamat</th>
                                <td>: <?= nl2br(htmlspecialchars($warga['alamat'] ?? '-')) ?></td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Kontak & Sistem -->
            <div class="col-lg-6">
                <div class="card info-card shadow-sm border-0">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0"><i class="bi bi-telephone-inbound me-2"></i>Kontak & Akun</h5>
                    </div>
                    <div class="card-body">
                        <table class="table table-borderless mb-4">
                            <tr>
                                <th width="35%"><i class="bi bi-envelope me-2 text-muted"></i>Email</th>
                                <td>: <?= htmlspecialchars($warga['email'] ?? '') ?></td>
                            </tr>
                            <tr>
                                <th><i class="bi bi-phone me-2 text-muted"></i>No. Handphone</th>
                                <td>: <?= htmlspecialchars($warga['no_hp'] ?? '') ?></td>
                            </tr>
                        </table>

                        <hr>

                        <h6 class="fw-bold mb-3"><i class="bi bi-shield-lock me-2"></i>Informasi Login</h6>
                        <div class="alert alert-info">
                            <p class="mb-2"><strong>Cara Login:</strong></p>
                            <ul class="mb-0">
                                <li>Gunakan <strong>NIK</strong>: <?= htmlspecialchars($warga['nik']) ?></li>
                                <li>Password: <strong>Tanggal Lahir</strong> (contoh: <?= date('dmY', strtotime($warga['tanggal_lahir'])) ?> atau <?= date('d-m-Y', strtotime($warga['tanggal_lahir'])) ?>)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tombol Aksi -->
        <div class="text-center mt-5">
            <a href="riwayat.php" class="btn btn-primary btn-lg rounded-pill px-5 me-3 mt-2">
                <i class="bi bi-clock-history me-2"></i>Lihat Riwayat Pengajuan
            </a>
            <a href="home.php" class="btn btn-outline-secondary btn-lg rounded-pill px-5 mt-2">
                <i class="bi bi-house me-2"></i>Kembali ke Beranda
            </a>
            <a href="edit_profil.php" class="btn btn-success btn-lg rounded-pill px-5 me-3 mt-2">
                <i class="bi bi-pencil me-2"></i>Edit Profil
            </a>
        </div>

    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>