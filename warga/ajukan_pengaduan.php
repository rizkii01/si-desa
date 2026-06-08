<?php
// warga/ajukan_pengaduan.php - Halaman Aduan / Pengaduan Masyarakat
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'warga') {
    header('Location: ../login.php?error=1');
    exit;
}

require_once '../config/db.php';

$nik = $_SESSION['nik'] ?? null; // Boleh null (opsional untuk anonim)
$nama = $_SESSION['nama'];

$success = $error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $isi_aduan = trim($_POST['isi_aduan']);
    $nama_pengadu = trim($_POST['nama_pengadu']);

    if (empty($isi_aduan)) {
        $error = "Isi aduan wajib diisi!";
    } elseif (strlen($isi_aduan) < 20) {
        $error = "Isi aduan minimal 20 karakter.";
    } elseif (empty($nama_pengadu)) {
        $error = "Nama pengadu wajib diisi (bisa nama samaran untuk anonim).";
    } else {
        try {
            $stmt = $pdo->prepare("INSERT INTO pengaduan 
                (nik, nama_lengkap, isi_aduan, status) 
                VALUES (?, ?, ?, 'Baru')");

            $stmt->execute([$nik, $nama_pengadu, $isi_aduan]);

            $success = "Pengaduan berhasil dikirim! Terima kasih atas masukan Anda. Admin desa akan segera menindaklanjuti.";
        } catch (PDOException $e) {
            $error = "Terjadi kesalahan sistem. Silakan coba lagi nanti.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aduan Masyarakat - Desa Cemara</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .card-header {
            background: linear-gradient(135deg, #fd7e14, #ffc107);
            color: white;
        }
        .btn-back {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 100;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .form-control:focus, .form-select:focus {
            border-color: #fd7e14;
            box-shadow: 0 0 0 0.25rem rgba(253, 126, 20, 0.25);
        }
    </style>
</head>
<body class="bg-light">

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-10">
            <div class="card shadow-lg border-0">
                <div class="card-header text-center py-4 rounded-top">
                    <h3 class="mb-0 fw-bold"><i class="bi bi-flag me-3"></i>Aduan & Aspirasi Masyarakat</h3>
                    <p class="mb-0 mt-2 text-white-50">Sampaikan keluhan, saran, atau laporan Anda secara aman</p>
                </div>

                <div class="card-body p-5">

                    <?php if ($success): ?>
                    <div class="alert alert-success text-center py-5">
                        <i class="bi bi-check-circle-fill display-4 text-success mb-4"></i>
                        <h4 class="mb-3"><?= $success ?></h4>
                        <p class="text-muted">Anda dapat melihat status pengaduan di menu Riwayat Pengajuan.</p>
                        <a href="home.php" class="btn btn-warning mt-3 rounded-pill px-5 text-white">
                            <i class="bi bi-house me-2"></i>Kembali ke Beranda
                        </a>
                    </div>
                    <?php elseif ($error): ?>
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i><?= $error ?>
                    </div>
                    <?php endif; ?>

                    <?php if (!$success): ?>
                    <form method="POST">

                        <!-- Informasi Pengadu -->
                        <div class="row mb-4 p-4 bg-light rounded">
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">NIK (Opsional)</label>
                                <input type="text" class="form-control form-control-lg" 
                                       value="<?= $nik ? htmlspecialchars($nik) : 'Anonim' ?>" disabled>
                                <div class="form-text">NIK tidak akan ditampilkan jika Anda ingin anonim</div>
                            </div>
                            <div class="col-md-6">
                                <label for="nama_pengadu" class="form-label fw-semibold">Nama Pengadu <span class="text-danger">*</span></label>
                                <input type="text" class="form-control form-control-lg" id="nama_pengadu" name="nama_pengadu"
                                       value="<?= isset($_POST['nama_pengadu']) ? htmlspecialchars($_POST['nama_pengadu']) : htmlspecialchars($nama) ?>"
                                       placeholder="Bisa nama asli atau samaran" required>
                                <div class="form-text">Nama ini akan ditampilkan kepada admin (tetap rahasia dari publik)</div>
                            </div>
                        </div>

                        <!-- Isi Aduan -->
                        <div class="mb-4">
                            <label for="isi_aduan" class="form-label fw-semibold">Isi Aduan / Keluhan / Saran <span class="text-danger">*</span></label>
                            <textarea class="form-control" id="isi_aduan" name="isi_aduan" rows="10" 
                                      placeholder="Jelaskan secara lengkap dan jelas mengenai aduan Anda. Sertakan lokasi, waktu kejadian, dan detail lain jika diperlukan..." 
                                      required><?= isset($_POST['isi_aduan']) ? htmlspecialchars($_POST['isi_aduan']) : '' ?></textarea>
                            <div class="form-text mt-2">
                                <i class="bi bi-info-circle"></i> Minimal 20 karakter. Semakin detail semakin cepat ditindaklanjuti.
                            </div>
                        </div>

                        <!-- Informasi Privasi -->
                        <div class="alert alert-warning">
                            <i class="bi bi-shield-lock me-2"></i>
                            <strong>Privasi Terjamin:</strong> Identitas Anda (NIK & nama asli) hanya dilihat oleh admin desa dan tidak dipublikasikan. 
                            Anda tetap bisa melaporkan secara anonim dengan mengosongkan nama asli.
                        </div>

                        <!-- Submit -->
                        <div class="d-grid gap-3 mt-5">
                            <button type="submit" class="btn btn-warning btn-lg rounded-pill text-white">
                                <i class="bi bi-send me-2"></i>Kirim Pengaduan
                            </button>
                            <a href="home.php" class="btn btn-outline-secondary btn-lg rounded-pill">
                                <i class="bi bi-arrow-left me-2"></i>Kembali
                            </a>
                        </div>
                    </form>
                    <?php endif; ?>

                </div>
            </div>
        </div>
    </div>
</div>

<!-- Tombol Kembali Cepat -->
<a href="home.php" class="btn btn-warning btn-lg btn-back d-flex align-items-center justify-content-center text-white">
    <i class="bi bi-house fs-4"></i>
</a>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
// Hitung karakter textarea
const textarea = document.getElementById('isi_aduan');
if (textarea) {
    textarea.addEventListener('input', function() {
        const length = this.value.length;
        if (length < 20) {
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid');
        }
    });
}
</script>
</body>
</html>