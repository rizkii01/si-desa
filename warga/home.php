<?php
// warga/home.php - Dashboard / Home Warga
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'warga') {
    header('Location: ../login.php?error=1');
    exit;
}

$nama = $_SESSION['nama'] ?? 'Warga';
$nik = $_SESSION['nik'] ?? '';

// Optional: Ambil data terbaru dari database jika perlu
// require_once '../config/db.php';
// $stmt = $pdo->prepare("SELECT * FROM warga WHERE nik = ?");
// $stmt->execute([$nik]);
// $warga = $stmt->fetch();
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selamat Datang - Layanan Desa Cemara</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>

    </style>
</head>

<body>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
        <div class="container d-flex justify-content-between align-items-center">
            <!-- Brand (kiri) -->
            <a class="navbar-brand fw-bold" href="home.php">
                <img src="../assets/images/desa_cemara.jpg" alt="Logo Desa Cemara" height="50" class="me-2">
                Desa Cemara
            </a>

            <!-- Dropdown User (kanan, tidak pernah collapse) -->
            <div class="dropdown">
                <button class="btn btn-light dropdown-toggle rounded-pill px-4 d-flex align-items-center"
                    type="button"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false">
                    <i class="bi bi-person-circle me-2"></i>
                    <?= htmlspecialchars($nama) ?>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="profil.php"><i class="bi bi-person-circle me-2"></i>Profil Saya</a></li>
                    <li><a class="dropdown-item" href="riwayat.php"><i class="bi bi-clock-history me-2"></i>Riwayat Pengajuan</a></li>
                    <li>
                        <hr class="dropdown-divider">
                    </li>
                    <li><a class="dropdown-item text-danger" href="../logout.php"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section dengan Background Pemandangan Desa -->
    <section class="hero-bg d-flex align-items-center text-white">
        <div class="container position-relative">
            <div class="text-center mt-5">
                <h1 class="display-4 fw-bold">Selamat Datang, <?= htmlspecialchars($nama) ?></h1>
                <p class="lead mt-3">Butuh pelayanan apa hari ini?</p>
            </div>
        </div>
    </section>

    <!-- Layanan Utama -->
    <section class="py-5 bg-light">
        <div class="container">
            <div class="row g-4 justify-content-center">
                <div class="col-md-4">
                    <a href="ajukan_surat.php" class="text-decoration-none text-dark">
                        <div class="card shadow-sm border-0 text-center p-5 h-100 hover-lift">
                            <i class="bi bi-file-earmark-text card-icon text-primary"></i>
                            <h4>Pengajuan Surat Pengantar</h4>
                            <p class="text-muted">SKCK, Domisili, Usaha, dll</p>
                        </div>
                    </a>
                </div>

                <div class="col-md-4">
                    <a href="ajukan_antrian.php" class="text-decoration-none text-dark">
                        <div class="card shadow-sm border-0 text-center p-5 h-100 hover-lift">
                            <i class="bi bi-people card-icon text-success"></i>
                            <h4>Ambil Antrian Pelayanan</h4>
                            <p class="text-muted">Pengurusan KK, KTP, Akta, dll</p>
                        </div>
                    </a>
                </div>

                <div class="col-md-4">
                    <a href="ajukan_pengaduan.php" class="text-decoration-none text-dark">
                        <div class="card shadow-sm border-0 text-center p-5 h-100 hover-lift">
                            <i class="bi bi-flag card-icon text-warning"></i>
                            <h4>Aduan Masyarakat Desa</h4>
                            <p class="text-muted">Sampaikan keluhan atau saran</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer Sederhana -->
    <footer class="bg-dark text-white py-4 text-center">
        <p>&copy; <?= date('Y') ?> Pemerintah Desa Cemara. Layanan Online untuk Masyarakat.</p>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Efek hover lift pada card
        document.querySelectorAll('.hover-lift').forEach(card => {
            card.addEventListener('mouseenter', () => card.classList.add('shadow-lg', 'translate-y-2'));
            card.addEventListener('mouseleave', () => card.classList.remove('shadow-lg', 'translate-y-2'));
        });
    </script>
</body>

</html>