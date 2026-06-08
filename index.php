<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Layanan Desa Cemara</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
        <div class="container">
            <a class="navbar-brand fw-bold" href="#">
                <img src="assets/images/desa_cemara.jpg" alt="" height="50" class="me-2"> desa cemara
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-center">
                    <li class="nav-item"><a class="nav-link" href="#profil">Profil Desa</a></li>
                    <li class="nav-item"><a class="nav-link" href="#layanan">Layanan</a></li>
                    <li class="nav-item"><a class="nav-link" href="#kontak">Kontak</a></li>
                    <li class="nav-item ms-3">
                        <a href="login.php" class="btn btn-primary px-4 rounded-pill">
                            <i class="bi bi-box-arrow-in-right me-2"></i>Login
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="hero" class="min-vh-100 d-flex align-items-center bg-light">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6 text-center text-lg-start">
                    <h1 class="display-4 fw-bold mb-4">
                        SELAMAT DATANG DI<br>
                        <span class="text-primary">LAYANAN DESA CEMARA</span>
                    </h1>
                    <p class="lead mb-4">
                        Platform pelayanan administrasi desa yang cepat, transparan, dan mudah diakses oleh seluruh masyarakat.
                    </p>
                    <a href="login.php" class="btn btn-primary btn-lg rounded-pill px-5">
                        Masuk ke Layanan <i class="bi bi-arrow-right ms-2"></i>
                    </a>
                </div>
                <div class="col-lg-6 text-center mt-5 mt-lg-0">
                    <img src="assets/images/image1.jpeg" alt="Pegawai Desa" class="img-fluid" style="max-height: 450px;">
                </div>
            </div>
        </div>
    </section>

    <!-- Profil Desa -->
    <section id="profil" class="py-5 bg-white">
        <div class="container">
            <h2 class="text-center mb-5 fw-bold">Profil Desa Cemara</h2>
            <div class="row text-center">
                <div class="col-md-6 mb-4">
                    <h4>Visi</h4>
                    <p class="lead">"Terwujudnya Desa Cemara yang Mandiri, Sejahtera, Berakhlak Mulia dan Berdaya Saing"</p>
                </div>
                <div class="col-md-6 mb-4">
                    <h4>Misi</h4>
                    <ul class="list-unstyled lead">
                        <li>✓ Pelayanan publik cepat, mudah dan profesional</li>
                        <li>✓ Tata kelola pemerintahan yang transparan dan akuntabel</li>
                        <li>✓ Pemberdayaan ekonomi masyarakat melalui UMKM dan BUMDes</li>
                        <li>✓ Pelestarian budaya dan lingkungan hidup</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Layanan -->
    <section id="layanan" class="py-5 bg-light">
        <div class="container">
            <h2 class="text-center mb-5 fw-bold">Layanan Kami</h2>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm border-0 text-center p-4">
                        <i class="bi bi-file-earmark-text display-4 text-primary mb-3"></i>
                        <h5>Pengajuan Surat Pengantar</h5>
                        <p>SKCK, Domisili, Usaha, Keterangan Tidak Mampu, dll</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm border-0 text-center p-4">
                        <i class="bi bi-people display-4 text-success mb-3"></i>
                        <h5>Ambil Antrian Pelayanan</h5>
                        <p>Pengurusan KK, KTP, Akta Kelahiran, dan layanan lainnya</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm border-0 text-center p-4">
                        <i class="bi bi-chat-square-text display-4 text-warning mb-3"></i>
                        <h5>Aduan & Aspirasi Masyarakat</h5>
                        <p>Sampaikan keluhan atau saran untuk perbaikan desa</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Kontak & Lokasi -->
    <section id="kontak" class="py-5 bg-white">
        <div class="container">
            <h2 class="text-center mb-5 fw-bold">Kontak & Lokasi</h2>
            <div class="row">
                <div class="col-lg-6 mb-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">
                            <h5 class="card-title"><i class="bi bi-telephone-fill text-primary me-2"></i>Kontak Kami</h5>
                            <p><strong>Alamat:</strong><br>Jl. Raya Cemara No. 1, Desa Cemara</p>
                            <p><strong>Telepon:</strong> (0338) 123-456</p>
                            <p><strong>Email:</strong> info@desacemara.desa.id</p>
                            <p><strong>Jam Kerja:</strong> Senin–Jumat, 08:00–16:00 WIB</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="ratio ratio-16x9">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.123456789!2d113.800000!3d-7.800000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNDgnMDAuMCJTIDExM8KwNDgnMDAuMCJF!5e0!3m2!1sid!2sid!4v1730000000000"
                                allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4">
        <div class="container text-center">
            <p>&copy; <?= date('Y') ?> Pemerintah Desa Cemara. All Rights Reserved.</p>
            <p class="small">Dibuat untuk mempermudah pelayanan masyarakat</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/script.js"></script>
</body>
</html>