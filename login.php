<?php
// session_start();
// if (isset($_SESSION['role'])) {
//     if ($_SESSION['role'] === 'admin') {
//         header('Location: admin/dashboard.php');
//     } else {
//         header('Location: warga/home.php');
//     }
//     exit;
// }
include "config/db.php"
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Layanan Desa Cemara</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <link rel="stylesheet" href="assets/css/style.css">
</head>

<body class="bg-light">

    <div class="container min-vh-100 d-flex align-items-center justify-content-center">
        <div class="card shadow-lg border-0" style="max-width: 960px; width: 100%;">
            <div class="row g-0">
                <!-- Form Login -->
                <div class="col-lg-6 bg-white p-5 d-flex flex-column justify-content-center">
                    <div class="text-center mb-5">
                        <img src="assets/images/desa_cemara.jpg" alt="Logo Desa Cemara" height="100" class="mb-4">
                        <h3 class="fw-bold">Login ke Sistem</h3>
                        <p class="text-muted">Masuk menggunakan NIK dan Tanggal Lahir</p>
                    </div>

                    <?php if (isset($_GET['error'])): ?>
                        <div class="alert alert-danger">
                            <?php
                            $error = $_GET['error'];
                            switch ($error) {
                                case 'invalid_nik':
                                    echo "NIK harus 16 digit angka (tanpa spasi, titik, atau tanda baca).";
                                    break;
                                case 'invalid_date':
                                    echo "Format tanggal lahir tidak valid. Contoh: <code>01011990</code> atau <code>01-01-1990</code>.";
                                    break;
                                case 'auth_failed':
                                    echo "NIK atau Tanggal Lahir tidak ditemukan. Pastikan sesuai data di KTP.";
                                    break;
                                case '1':
                                    echo "Silakan login terlebih dahulu.";
                                    break;
                                default:
                                    echo "Terjadi kesalahan saat login.";
                            }
                            ?>
                        </div>
                    <?php endif; ?>

                    <form action="proses_login.php" method="POST">
                        <div class="mb-4">
                            <label for="nik" class="form-label fw-semibold">NIK</label>
                            <input type="text" class="form-control form-control-lg rounded-pill" id="nik" name="nik"
                                placeholder="Masukkan 16 digit NIK" maxlength="16" required>
                        </div>

                        <div class="mb-4">
                            <label for="password" class="form-label fw-semibold">Tanggal Lahir</label>
                            <input type="text" class="form-control form-control-lg rounded-pill" id="password" name="password"
                                placeholder="Contoh: 01011990 atau 01-01-1990" required>
                        </div>

                        <div class="alert alert-info small rounded-pill py-2">
                            <i class="bi bi-info-circle me-2"></i>
                            Gunakan tanggal lahir sesuai KTP (tanpa spasi atau titik jika memilih format 8 digit)
                        </div>

                        <div class="d-grid gap-3 mt-4">
                            <button type="submit" class="btn btn-primary btn-lg rounded-pill">
                                <i class="bi bi-box-arrow-in-right me-2"></i>Login
                            </button>
                            <a href="index.php" class="btn btn-outline-secondary btn-lg rounded-pill">
                                <i class="bi bi-house me-2"></i>Kembali ke Beranda
                            </a>
                        </div>
                    </form>

                    <div class="text-center mt-4">
                        <small class="text-muted">
                            Khusus Admin: Gunakan akun yang telah diberikan oleh pengelola sistem
                        </small>
                    </div>
                </div>

                <!-- Ilustrasi -->
                <div class="col-lg-6 bg-gradient-primary d-none d-lg-flex align-items-center justify-content-center p-5 rounded-end">
                    <img src="assets/images/image1.jpeg" alt="Selamat Datang" class="img-fluid" style="max-height: 500px;">
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>