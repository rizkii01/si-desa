<?php
// admin/dashboard.php - Dashboard Admin (Update dengan Statistik Real)
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header('Location: ../login.php?error=1');
    exit;
}

require_once '../config/db.php';

// Hitung Statistik Real dari Database
$stats = [];

// 1. Pengajuan Surat (total belum selesai: Pending + Diproses)
$stmt = $pdo->query("SELECT 
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN status = 'Diproses' THEN 1 ELSE 0 END) AS diproses
    FROM pengajuan_surat 
    WHERE status IN ('Pending', 'Diproses')");
$stats['surat'] = $stmt->fetch(PDO::FETCH_ASSOC);

// 2. Antrian Pelayanan (hanya yang Pending)
$stmt = $pdo->query("SELECT COUNT(*) AS total FROM pengajuan_antrian WHERE status = 'Pending'");
$stats['antrian'] = $stmt->fetchColumn();

// 3. Aduan Masyarakat (belum selesai: Baru + Diproses)
$stmt = $pdo->query("SELECT COUNT(*) AS total FROM pengaduan WHERE status IN ('Baru', 'Diproses')");
$stats['aduan'] = $stmt->fetchColumn();

// Total Warga Terdaftar
$stmt = $pdo->query("SELECT COUNT(*) AS total FROM warga WHERE role = 'warga'");
$stats['warga'] = $stmt->fetchColumn();

// Greeting otomatis berdasarkan waktu
$hour = date('H');
if ($hour < 11) {
    $greeting = "Selamat Pagi";
} elseif ($hour < 15) {
    $greeting = "Selamat Siang";
} elseif ($hour < 18) {
    $greeting = "Selamat Sore";
} else {
    $greeting = "Selamat Malam";
}
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Admin - Desa Cemara</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .stat-card {
            transition: transform 0.3s;
        }

        .stat-card:hover {
            transform: translateY(-10px);
        }
    </style>
</head>

<body class="admin-layout">

    <div class="d-flex" id="wrapper">
        <!-- Sidebar -->
        <div class="bg-dark text-white vh-100 position-fixed" style="width: 280px;">
            <div class="p-4 text-center border-bottom border-secondary">
                <img src="../assets/images/desa_cemara.jpg" alt="Logo" height="80" class="mb-3">
                <h5>Desa Cemara</h5>
            </div>
            <div class="p-3">
                <div class="d-flex align-items-center mb-4">
                    <img src="../assets/images/desa_cemara.jpg" alt="Admin" class="rounded-circle me-3" width="50">
                    <div>
                        <strong><?= htmlspecialchars($_SESSION['nama']) ?></strong><br>
                        <small>Administrator</small>
                    </div>
                </div>
            </div>
            <ul class="nav flex-column px-3">
                <li class="nav-item"><a href="dashboard.php" class="nav-link text-white bg-primary py-3 px-4 rounded active"><i class="bi bi-speedometer2 me-3"></i> Dashboard</a></li>
                <li class="nav-item"><a href="admin_desa.php" class="nav-link text-white py-3 px-4 rounded"><i class="bi bi-person-gear me-3"></i> Admin Desa</a></li>
                <li class="nav-item"><a href="warga_desa.php" class="nav-link text-white py-3 px-4 rounded"><i class="bi bi-people me-3"></i> Warga Desa</a></li>
                <hr class="my-4 border-secondary">
                <h6 class="px-4 text-uppercase text-muted small">Layanan</h6>
                <li class="nav-item"><a href="pengajuan_surat.php" class="nav-link text-white py-3 px-4 rounded"><i class="bi bi-envelope me-3"></i> Pengajuan Surat</a></li>
                <li class="nav-item"><a href="pengajuan_antrian.php" class="nav-link text-white py-3 px-4 rounded"><i class="bi bi-clock-history me-3"></i> Antrian Pelayanan</a></li>
                <li class="nav-item"><a href="pengaduan.php" class="nav-link text-white py-3 px-4 rounded"><i class="bi bi-flag me-3"></i> Aduan Masyarakat</a></li>
            </ul>
            <div class="mt-auto p-4">
                <a href="../logout.php" class="btn btn-danger w-100 rounded-pill"><i class="bi bi-box-arrow-left me-2"></i> Keluar</a>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-grow-1" style="margin-left: 280px;">
            <nav class="navbar navbar-light bg-white shadow-sm px-4 py-3">
                <span class="navbar-brand h5 mb-0">Dashboard</span>
                <ol class="breadcrumb mb-0">
                    <li class="breadcrumb-item text-muted">Admin</li>
                    <li class="breadcrumb-item active">Dashboard</li>
                </ol>
            </nav>

            <div class="container-fluid p-4">

                <!-- Statistik Cards -->
                <div class="row g-4 mb-5">
                    <!-- Pengajuan Surat -->
                    <div class="col-md-4">
                        <div class="card stat-card text-white bg-primary shadow border-0">
                            <div class="card-body d-flex align-items-center">
                                <i class="bi bi-envelope fs-1 me-4"></i>
                                <div>
                                    <h3 class="mb-0"><?= $stats['surat']['total'] ?? 0 ?></h3>
                                    <p class="mb-0">Pengajuan Surat Belum Selesai</p>
                                    <small><?= ($stats['surat']['pending'] ?? 0) ?> Pending | <?= ($stats['surat']['diproses'] ?? 0) ?> Diproses</small>
                                </div>
                                <a href="pengajuan_surat.php" class="ms-auto text-white">
                                    <i class="bi bi-arrow-right-circle fs-3"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Antrian Pelayanan -->
                    <div class="col-md-4">
                        <div class="card stat-card text-white bg-success shadow border-0">
                            <div class="card-body d-flex align-items-center">
                                <i class="bi bi-people fs-1 me-4"></i>
                                <div>
                                    <h3 class="mb-0"><?= $stats['antrian'] ?? 0 ?></h3>
                                    <p class="mb-0">Antrian Pelayanan Pending</p>
                                    <small>Perlu diberi nomor antrian</small>
                                </div>
                                <a href="pengajuan_antrian.php" class="ms-auto text-white">
                                    <i class="bi bi-arrow-right-circle fs-3"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Aduan Masyarakat -->
                    <div class="col-md-4">
                        <div class="card stat-card text-white bg-warning shadow border-0">
                            <div class="card-body d-flex align-items-center">
                                <i class="bi bi-flag fs-1 me-4"></i>
                                <div>
                                    <h3 class="mb-0"><?= $stats['aduan'] ?? 0 ?></h3>
                                    <p class="mb-0">Aduan Belum Ditindaklanjuti</p>
                                    <small>Baru atau sedang diproses</small>
                                </div>
                                <a href="pengaduan.php" class="ms-auto text-white">
                                    <i class="bi bi-arrow-right-circle fs-3"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Greeting Card + Info Warga -->
                <div class="row g-4">
                    <div class="col-lg-8">
                        <div class="card shadow border-0">
                            <div class="card-body p-5">
                                <h4 class="fw-bold"><?= $greeting ?></h4>
                                <p class="lead text-muted">
                                    Terwujudnya Desa Cemara yang aman, sehat, cerdas, berbudaya, berakhlak mulia dan berdaya saing menuju pelayanan yang cepat dan tepat.
                                </p>
                                <hr>
                                <p class="mb-0">Hallo, <strong><?= htmlspecialchars($_SESSION['nama']) ?></strong></p>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-4">
                        <div class="card shadow border-0 bg-info text-white">
                            <div class="card-body text-center p-5">
                                <i class="bi bi-person-heart fs-1 mb-3"></i>
                                <h3 class="mb-0"><?= $stats['warga'] ?></h3>
                                <p class="mb-0">Total Warga Terdaftar</p>
                                <a href="warga_desa.php" class="btn btn-light btn-sm mt-3 rounded-pill">Lihat Detail</a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>