<?php
session_start();

// Cek apakah user sudah login
if (!isset($_SESSION['user_logged_in'])) {
    header('Location: login.php');
    exit;
}

 $user_name = $_SESSION['user_name'] ?? 'Pengguna';
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pengajuan Surat - Desa Sukamaju</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
        }
        .navbar {
            background-color: #0d6efd;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .navbar-brand {
            font-weight: bold;
        }
        .form-container {
            max-width: 800px;
            margin: 50px auto;
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .form-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #0d6efd;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .btn-submit {
            background-color: #0d6efd;
            color: white;
            padding: 12px 30px;
            font-weight: bold;
            border-radius: 8px;
        }
        .btn-cancel {
            background-color: #6c757d;
            color: white;
            padding: 12px 30px;
            font-weight: bold;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark">
        <div class="container">
            <a class="navbar-brand" href="dashboard-warga.php">desa SUKAMAJU</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                            <i class="fas fa-user-circle"></i> <?php echo $user_name; ?>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="dashboard-warga.php"><i class="fas fa-home"></i> Dashboard</a></li>
                            <li><a class="dropdown-item" href="#"><i class="fas fa-bell"></i> Notifikasi</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Form Container -->
    <div class="container">
        <div class="form-container">
            <h2 class="form-title">Pengajuan Surat Pengantar</h2>
            <p>Isi form berikut untuk mengajukan surat pengantar</p>
            
            <form>
                <div class="form-group">
                    <label for="jenis_surat" class="form-label">Jenis Surat</label>
                    <select class="form-select" id="jenis_surat" required>
                        <option value="" selected disabled>Pilih jenis surat</option>
                        <option value="surat_keterangan_domisili">Surat Keterangan Domisili</option>
                        <option value="surat_keterangan_usaha">Surat Keterangan Usaha</option>
                        <option value="surat_keterangan_tidak_mampu">Surat Keterangan Tidak Mampu</option>
                        <option value="surat_keterangan_kelakuan_baik">Surat Keterangan Kelakuan Baik</option>
                        <option value="surat_pengantar_nikah">Surat Pengantar Nikah</option>
                        <option value="surat_keterangan_lahir">Surat Keterangan Lahir</option>
                        <option value="surat_keterangan_kematian">Surat Keterangan Kematian</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="nama_lengkap" class="form-label">Nama Lengkap</label>
                    <input type="text" class="form-control" id="nama_lengkap" required>
                </div>
                
                <div class="form-group">
                    <label for="nik" class="form-label">NIK</label>
                    <input type="text" class="form-control" id="nik" required>
                </div>
                
                <div class="form-group">
                    <label for="tempat_lahir" class="form-label">Tempat Lahir</label>
                    <input type="text" class="form-control" id="tempat_lahir" required>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="tanggal_lahir" class="form-label">Tanggal Lahir</label>
                            <input type="date" class="form-control" id="tanggal_lahir" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="jenis_kelamin" class="form-label">Jenis Kelamin</label>
                            <select class="form-select" id="jenis_kelamin" required>
                                <option value="" selected disabled>Pilih jenis kelamin</option>
                                <option value="laki-laki">Laki-laki</option>
                                <option value="perempuan">Perempuan</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="alamat" class="form-label">Alamat</label>
                    <textarea class="form-control" id="alamat" rows="3" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="keperluan" class="form-label">Keperluan</label>
                    <textarea class="form-control" id="keperluan" rows="3" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="keterangan" class="form-label">Keterangan Tambahan (Opsional)</label>
                    <textarea class="form-control" id="keterangan" rows="3"></textarea>
                </div>
                
                <div class="d-flex justify-content-between">
                    <button type="button" class="btn btn-cancel" onclick="window.location.href='dashboard-warga.php'">Batal</button>
                    <button type="submit" class="btn btn-submit">Ajukan Surat</button>
                </div>
            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>