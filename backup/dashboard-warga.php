<?php
session_start();

// Cek apakah user sudah login
if (!isset($_SESSION['user_logged_in'])) {
    header('Location: login.php');
    exit;
}

// Dapatkan waktu saat ini untuk sapaan
 $hour = date('H');
if ($hour < 10) {
    $greeting = "Selamat Pagi";
} elseif ($hour < 15) {
    $greeting = "Selamat Siang";
} elseif ($hour < 18) {
    $greeting = "Selamat Sore";
} else {
    $greeting = "Selamat Malam";
}

 $user_name = $_SESSION['user_name'] ?? 'Pengguna';
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Warga - Desa Sukamaju</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://img.freepik.com/free-photo/beautiful-landscape-green-field-blue-sky_23-2149431013.jpg');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            min-height: 100vh;
        }
        .navbar {
            background-color: rgba(255,255,255,0.9);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .navbar-brand {
            font-weight: bold;
            color: #0d6efd;
        }
        .dashboard-container {
            max-width: 1000px;
            margin: 50px auto;
        }
        .welcome-card {
            background-color: rgba(255,255,255,0.9);
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            margin-bottom: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .welcome-title {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #0d6efd;
        }
        .welcome-subtitle {
            font-size: 20px;
            color: #6c757d;
            margin-bottom: 30px;
        }
        .service-card {
            background-color: rgba(255,255,255,0.9);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            margin-bottom: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s, box-shadow 0.3s;
            height: 100%;
            cursor: pointer;
        }
        .service-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .service-icon {
            font-size: 64px;
            margin-bottom: 20px;
            color: #0d6efd;
        }
        .service-title {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .service-description {
            color: #6c757d;
            margin-bottom: 20px;
        }
        .btn-service {
            background-color: #0d6efd;
            color: white;
            border-radius: 50px;
            padding: 10px 25px;
            font-weight: bold;
        }
        .user-menu {
            position: relative;
        }
        .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: #dc3545;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg">
        <div class="container">
            <a class="navbar-brand" href="#">desa SUKAMAJU</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item user-menu">
                        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                            <i class="fas fa-user-circle"></i> <?php echo $user_name; ?>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="#"><i class="fas fa-user"></i> Profil</a></li>
                            <li><a class="dropdown-item" href="#"><i class="fas fa-bell"></i> Notifikasi <span class="notification-badge">3</span></a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Dashboard Content -->
    <div class="dashboard-container">
        <!-- Welcome Section -->
        <div class="welcome-card">
            <h1 class="welcome-title"><?php echo $greeting; ?>, <?php echo $user_name; ?></h1>
            <p class="welcome-subtitle">Butuh layanan apa hari ini?</p>
        </div>

        <!-- Service Cards -->
        <div class="row">
            <div class="col-md-4 mb-4">
                <div class="service-card" onclick="window.location.href='pengajuan-surat.php'">
                    <div class="service-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <h3 class="service-title">Pengajuan Surat Pengantar</h3>
                    <p class="service-description">Ajukan berbagai surat keperluan administrasi secara online</p>
                    <button class="btn btn-service">Ajukan Sekarang</button>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="service-card" onclick="window.location.href='antrian-pelayanan.php'">
                    <div class="service-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3 class="service-title">Ambil Antrian Pelayanan</h3>
                    <p class="service-description">Ambil nomor antrian untuk layanan di kantor desa</p>
                    <button class="btn btn-service">Ambil Antrian</button>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="service-card" onclick="window.location.href='aduan-masyarakat.php'">
                    <div class="service-icon">
                        <i class="fas fa-desktop"></i>
                    </div>
                    <h3 class="service-title">Aduan Masyarakat Desa</h3>
                    <p class="service-description">Sampaikan pengaduan atau aspirasi Anda</p>
                    <button class="btn btn-service">Buat Aduan</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>