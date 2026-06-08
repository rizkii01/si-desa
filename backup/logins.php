<?php
// login.php - Halaman Login sesuai design screenshot kedua
session_start(); // Jika nanti ada session login

// Proses login sederhana (contoh, sesuaikan dengan database Anda)
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nik = $_POST['nik'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // Contoh validasi sederhana (ganti dengan query database real)
    if ($nik === 'admin' && $password === 'tanggallahiradmin') { // contoh
        $_SESSION['user'] = 'Admin';
        header('Location: dashboard.php'); // redirect ke dashboard
        exit;
    } else {
        $error = "NIK atau Password salah!";
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Layanan Desa Cemara</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="bg-light">

    <div class="container min-vh-100 d-flex align-items-center justify-content-center">
        <div class="card shadow-lg border-0" style="max-width: 900px; width: 100%;">
            <div class="row g-0">
                <!-- Bagian Kiri: Logo dan Form Login -->
                <div class="col-lg-6 bg-white p-5 d-flex flex-column justify-content-center">
                    <div class="text-center mb-4">
                        <img src="assets/images/image1.jpeg" alt="Logo Desa Cemara" class="mb-4" height="120">
                        <h3 class="fw-bold">Login</h3>
                    </div>

                    <?php if (isset($error)): ?>
                        <div class="alert alert-danger"><?php echo $error; ?></div>
                    <?php endif; ?>

                    <form method="POST">
                        <div class="mb-3">
                            <label for="nik" class="form-label">NIK</label>
                            <input type="text" class="form-control form-control-lg rounded-pill" id="nik" name="nik" required placeholder="Masukkan NIK Anda">
                        </div>

                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control form-control-lg rounded-pill" id="password" name="password" required placeholder="Masukkan Password">
                        </div>

                        <div class="alert alert-info small rounded-pill d-flex align-items-center">
                            <svg class="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                <path d="M8.5 4a.5.5 0 0 0-1 0v5.793L5.354 7.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 9.793V4z"/>
                            </svg>
                            Gunakan tanggal lahir sebagai password (tanpa menggunakan spasi dan '.' )
                        </div>

                        <div class="d-flex gap-3 mt-4">
                            <a href="index.php" class="btn btn-outline-secondary btn-lg rounded-pill flex-fill">Halaman Utama</a>
                            <button type="submit" class="btn btn-primary btn-lg rounded-pill flex-fill">Login</button>
                        </div>
                    </form>
                </div>

                <!-- Bagian Kanan: Ilustrasi Pegawai -->
                <div class="col-lg-6 bg-light d-none d-lg-flex align-items-center justify-content-center p-5">
                    <img src="assets/images/image1.jpeg" alt="Ilustrasi Pegawai Desa" class="img-fluid" style="max-height: 500px;">
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Custom JS -->
    <script src="assets/js/script.js"></script>
</body>
</html>