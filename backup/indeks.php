<?php
// index.php - File utama landing page
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Layanan Desa Cemara</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-blue fixed-top">
        <div class="container">
            <a class="navbar-brand" href="#">
                <img src="assets/images/image1.jpeg" alt="Logo Desa Cemara" height="50">
                Desa Cemara
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="#hero">Beranda</a></li>
                    <li class="nav-item"><a class="nav-link" href="#profil">Profil Desa</a></li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">Layanan</a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#">Pengajuan Surat Pengantar</a></li>
                            <li><a class="dropdown-item" href="#">Antrian Pelayanan</a></li>
                            <li><a class="dropdown-item" href="#">Aduan Masyarakat</a></li>
                        </ul>
                    </li>
                    <li class="nav-item"><a class="nav-link" href="#kontak">Kontak</a></li>
                    <li class="nav-item"><a class="nav-link btn btn-primary text-black px-4 ms-3" href="login.php">Login</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section (mirip screenshot pertama) -->
    <section id="hero" class="d-flex align-items-center min-vh-100 bg-light">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6 text-center text-lg-start">
                    <h1 class="display-4 fw-bold">SELAMAT DATANG DI<br>LAYANAN DESA CEMARA</h1>
                    <p class="lead mt-4">Profil Desa Cemara menyediakan layanan administrasi dan informasi desa secara cepat, transparan, dan mudah diakses oleh masyarakat.</p>
                </div>
                <div class="col-lg-6 text-center">
                    <img src="assets/images/image1.jpeg" alt="Ilustrasi Pegawai Desa" class="img-fluid" style="max-height: 400px;">
                </div>
            </div>
        </div>
    </section>

    <!-- Profil Desa Section (Visi Misi) -->
    <section id="profil" class="py-5 bg-white">
        <div class="container">
            <h2 class="text-center mb-5">Profil Desa Cemara</h2>
            <div class="row">
                <div class="col-lg-6">
                    <h3>Visi</h3>
                    <p class="lead">"Mewujudkan Desa Cemara yang Mandiri, Sejahtera, Berbudaya, dan Berakhlak Mulia"</p>
                </div>
                <div class="col-lg-6">
                    <h3>Misi</h3>
                    <ul class="list-group">
                        <li class="list-group-item">Meningkatkan tata kelola pemerintahan desa yang bersih, transparan, dan akuntabel</li>
                        <li class="list-group-item">Meningkatkan pelayanan publik yang cepat, mudah, dan profesional</li>
                        <li class="list-group-item">Mengembangkan potensi ekonomi masyarakat melalui BUMDes dan UMKM</li>
                        <li class="list-group-item">Mewujudkan masyarakat yang sehat, cerdas, dan berdaya saing</li>
                        <li class="list-group-item">Melestarikan budaya dan lingkungan hidup yang berkelanjutan</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Kontak Section -->
    <section id="kontak" class="py-5 bg-light">
        <div class="container">
            <h2 class="text-center mb-5">Kontak Kami</h2>
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="card shadow">
                        <div class="card-body">
                            <p><strong>Alamat Kantor Desa:</strong><br>
                            Jl. Raya Cemara No. 1, Desa Cemara, Kecamatan Suboh, Kabupaten Situbondo, Jawa Timur 68354</p>
                            <p><strong>Telepon:</strong> (0338) 123456<br>
                            <strong>Email:</strong> info@desacemara.desa.id</p>
                            <p><strong>Jam Kerja:</strong> Senin - Jumat, 08:00 - 16:00 WIB</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Lokasi Section (Google Maps Embed) -->
    <section class="py-5 bg-white">
        <div class="container">
            <h2 class="text-center mb-5">Lokasi Desa Cemara</h2>
            <div class="ratio ratio-21x9">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.123456789!2d113.800000!3d-7.800000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNDgnMDAuMCJTIDExM8KwNDgnMDAuMCJF!5e0!3m2!1sid!2sid!4v1730000000000" 
                        width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
            </div>
            <p class="text-center mt-3"><small>Catatan: Koordinat di atas adalah contoh. Ganti dengan koordinat sebenarnya Desa Cemara.</small></p>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4">
        <div class="container text-center">
            <p>&copy; <?php echo date('Y'); ?> Pemerintah Desa Cemara. All Rights Reserved.</p>
            <p>Dibuat dengan ❤️ untuk masyarakat Desa Cemara</p>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Custom JS (jika ada) -->
    <script src="assets/js/script.js"></script>
</body>
</html>