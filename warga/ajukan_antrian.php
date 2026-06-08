<?php
// warga/ajukan_antrian.php - Halaman Ambil Antrian Pelayanan
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'warga') {
    header('Location: ../login.php?error=1');
    exit;
}

require_once '../config/db.php';

$nik = $_SESSION['nik'];
$nama = $_SESSION['nama'];

$success = $error = '';

// Daftar jenis layanan antrian
$jenis_layanan_options = [
    'Pengurusan Kartu Keluarga (KK)',
    'Pengurusan Kartu Tanda Penduduk (KTP)',
    'Pengurusan Akta Kelahiran',
    'Pengurusan Akta Kematian',
    'Pengurusan Akta Perkawinan',
    'Surat Pengantar Umum',
    'Pelayanan Administrasi Lainnya'
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tanggal = $_POST['tanggal'];
    $jenis_layanan = trim($_POST['jenis_layanan']);

    // Validasi tanggal (tidak boleh tanggal lalu & bukan hari libur nasional sederhana)
    $today = date('Y-m-d');
    if ($tanggal < $today) {
        $error = "Tanggal yang dipilih tidak boleh hari ini atau masa lalu!";
    } elseif (empty($jenis_layanan)) {
        $error = "Jenis layanan wajib dipilih!";
    } else {
        try {
            // Cek apakah sudah ada pengajuan antrian di tanggal yang sama
            $check = $pdo->prepare("SELECT id FROM pengajuan_antrian WHERE nik = ? AND tanggal = ? AND status = 'Pending'");
            $check->execute([$nik, $tanggal]);
            if ($check->rowCount() > 0) {
                $error = "Anda sudah memiliki pengajuan antrian untuk tanggal tersebut!";
            } else {
                $stmt = $pdo->prepare("INSERT INTO pengajuan_antrian 
                    (nik, nama_lengkap, tanggal, jenis_layanan, status) 
                    VALUES (?, ?, ?, ?, 'Pending')");

                $stmt->execute([$nik, $nama, $tanggal, $jenis_layanan]);

                $success = "Pengajuan antrian berhasil! Silakan tunggu konfirmasi dan nomor antrian dari admin desa.";
            }
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
    <title>Ambil Antrian Pelayanan - Desa Cemara</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .card-header {
            background: linear-gradient(135deg, #28a745, #20c997);
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
        .form-control:disabled {
            background-color: #e9ecef;
        }
    </style>
</head>
<body class="bg-light">

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-9">
            <div class="card shadow-lg border-0">
                <div class="card-header text-center py-4 rounded-top">
                    <h3 class="mb-0 fw-bold"><i class="bi bi-people me-3"></i>Ambil Antrian Pelayanan</h3>
                    <p class="mb-0 mt-2 text-white-50">Pilih tanggal dan jenis layanan yang diinginkan</p>
                </div>

                <div class="card-body p-5">

                    <?php if ($success): ?>
                    <div class="alert alert-success text-center py-4">
                        <i class="bi bi-check-circle-fill display-4 text-success mb-3"></i>
                        <h4><?= $success ?></h4>
                        <p class="mb-4">Nomor antrian akan dikirim melalui notifikasi atau bisa dicek di riwayat pengajuan.</p>
                        <a href="home.php" class="btn btn-success mt-3 rounded-pill px-5">Kembali ke Beranda</a>
                    </div>
                    <?php elseif ($error): ?>
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i><?= $error ?>
                    </div>
                    <?php endif; ?>

                    <?php if (!$success): ?>
                    <form method="POST">

                        <!-- Informasi Pemohon -->
                        <div class="row mb-4 p-4 bg-light rounded">
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">NIK</label>
                                <input type="text" class="form-control form-control-lg" value="<?= htmlspecialchars($nik) ?>" disabled>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Nama Lengkap</label>
                                <input type="text" class="form-control form-control-lg" value="<?= htmlspecialchars($nama) ?>" disabled>
                            </div>
                        </div>

                        <!-- Pilih Tanggal -->
                        <div class="mb-4">
                            <label for="tanggal" class="form-label fw-semibold">Pilih Tanggal Kunjungan <span class="text-danger">*</span></label>
                            <input type="date" class="form-control form-control-lg" id="tanggal" name="tanggal" 
                                   min="<?= date('Y-m-d', strtotime('+1 day')) ?>" required>
                            <div class="form-text">
                                <i class="bi bi-info-circle"></i> Pilih tanggal mulai besok. Hari libur nasional & akhir pekan tidak tersedia secara otomatis.
                            </div>
                        </div>

                        <!-- Jenis Layanan -->
                        <div class="mb-4">
                            <label for="jenis_layanan" class="form-label fw-semibold">Jenis Pelayanan <span class="text-danger">*</span></label>
                            <select class="form-select form-select-lg" id="jenis_layanan" name="jenis_layanan" required>
                                <option value="">-- Pilih Jenis Pelayanan --</option>
                                <?php foreach ($jenis_layanan_options as $opt): ?>
                                <option value="<?= $opt ?>" <?= (isset($_POST['jenis_layanan']) && $_POST['jenis_layanan'] === $opt) ? 'selected' : '' ?>>
                                    <?= $opt ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <!-- Informasi Tambahan -->
                        <div class="alert alert-info">
                            <i class="bi bi-clock-history me-2"></i>
                            <strong>Jam Pelayanan:</strong> Senin–Jumat, pukul 08:00–15:00 WIB<br>
                            <strong>Catatan:</strong> Datang tepat waktu sesuai nomor antrian yang diberikan. Bawa dokumen pendukung asli.
                        </div>

                        <!-- Submit -->
                        <div class="d-grid gap-3 mt-5">
                            <button type="submit" class="btn btn-success btn-lg rounded-pill">
                                <i class="bi bi-calendar-check me-2"></i>Ajukan Antrian
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
<a href="home.php" class="btn btn-success btn-lg btn-back d-flex align-items-center justify-content-center">
    <i class="bi bi-house fs-4"></i>
</a>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
// Set tanggal minimal ke besok
document.getElementById('tanggal').min = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
</script>
</body>
</html>