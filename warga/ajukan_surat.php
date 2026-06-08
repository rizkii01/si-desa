<?php
// warga/ajukan_surat.php - Halaman Pengajuan Surat Pengantar
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'warga') {
    header('Location: ../login.php?error=1');
    exit;
}

require_once '../config/db.php';

$nik = $_SESSION['nik'];
$nama = $_SESSION['nama'];

// Ambil data warga untuk autofill (opsional)
$stmt = $pdo->prepare("SELECT * FROM warga WHERE nik = ?");
$stmt->execute([$nik]);
$warga = $stmt->fetch();

$success = $error = '';

// Daftar jenis layanan yang tersedia
$jenis_layanan_options = [
    'Surat Pengantar SKCK',
    'Surat Keterangan Domisili',
    'Surat Pengantar Usaha',
    'Surat Keterangan Tidak Mampu',
    'Surat Pengantar Nikah',
    'Surat Keterangan Usaha (SKU)',
    'Surat Pengantar Pindah Domisili',
    'Surat Keterangan Penghasilan',
    'Lainnya'
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $jenis_layanan = trim($_POST['jenis_layanan']);
    $keperluan = trim($_POST['keperluan']);
    $berkas = $_FILES['berkas'];

    // Validasi
    if (empty($jenis_layanan) || empty($keperluan)) {
        $error = "Jenis layanan dan keperluan wajib diisi!";
    } else {
        // Proses upload berkas pendukung
        $upload_dir = '../uploads/';
        $allowed_types = ['jpg', 'jpeg', 'png', 'pdf'];
        $max_size = 5 * 1024 * 1024; // 5MB
        $uploaded_files = [];

        if (!empty($berkas['name'][0])) {
            foreach ($berkas['name'] as $key => $name) {
                if ($berkas['error'][$key] === 0) {
                    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
                    $size = $berkas['size'][$key];

                    if (!in_array($ext, $allowed_types)) {
                        $error = "Tipe file $name tidak diizinkan. Hanya JPG, PNG, PDF.";
                        break;
                    }
                    if ($size > $max_size) {
                        $error = "File $name terlalu besar (maks 5MB).";
                        break;
                    }

                    $new_name = uniqid('berkas_') . '.' . $ext;
                    $destination = $upload_dir . $new_name;

                    if (move_uploaded_file($berkas['tmp_name'][$key], $destination)) {
                        $uploaded_files[] = $new_name;
                    }
                }
            }
        }

        if (empty($error)) {
            $berkas_string = implode(',', $uploaded_files);

            try {
                $stmt = $pdo->prepare("INSERT INTO pengajuan_surat 
                    (nik, nama_lengkap, jenis_layanan, keperluan, berkas_pendukung, status) 
                    VALUES (?, ?, ?, ?, ?, 'Pending')");

                $stmt->execute([$nik, $nama, $jenis_layanan, $keperluan, $berkas_string]);

                $success = "Pengajuan surat berhasil dikirim! Silakan tunggu verifikasi dari admin desa.";
            } catch (PDOException $e) {
                $error = "Terjadi kesalahan sistem. Silakan coba lagi.";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pengajuan Surat Pengantar - Desa Cemara</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .card-header {
            background: linear-gradient(135deg, #0d6efd, #0dcaf0);
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
    </style>
</head>
<body class="bg-light">

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-10">
            <div class="card shadow-lg border-0">
                <div class="card-header text-center py-4 rounded-top">
                    <h3 class="mb-0 fw-bold"><i class="bi bi-file-earmark-text me-3"></i>Pengajuan Surat Pengantar</h3>
                    <p class="mb-0 mt-2 text-white-50">Lengkapi form di bawah ini dengan benar</p>
                </div>

                <div class="card-body p-5">

                    <?php if ($success): ?>
                    <div class="alert alert-success text-center py-4">
                        <i class="bi bi-check-circle display-4 text-success mb-3"></i>
                        <h4><?= $success ?></h4>
                        <a href="home.php" class="btn btn-primary mt-3 rounded-pill px-5">Kembali ke Beranda</a>
                    </div>
                    <?php elseif ($error): ?>
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i><?= $error ?>
                    </div>
                    <?php endif; ?>

                    <?php if (!$success): ?>
                    <form method="POST" enctype="multipart/form-data">

                        <!-- Informasi Pemohon (Autofill) -->
                        <div class="row mb-4 p-4 bg-light rounded">
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">NIK</label>
                                <input type="text" class="form-control form-control-lg" value="<?= htmlspecialchars($nik) ?>" readonly>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Nama Lengkap</label>
                                <input type="text" class="form-control form-control-lg" value="<?= htmlspecialchars($nama) ?>" readonly>
                            </div>
                        </div>

                        <!-- Jenis Layanan -->
                        <div class="mb-4">
                            <label for="jenis_layanan" class="form-label fw-semibold">Jenis Surat yang Diajukan <span class="text-danger">*</span></label>
                            <select class="form-select form-select-lg" id="jenis_layanan" name="jenis_layanan" required>
                                <option value="">-- Pilih Jenis Surat --</option>
                                <?php foreach ($jenis_layanan_options as $opt): ?>
                                <option value="<?= $opt ?>" <?= (isset($_POST['jenis_layanan']) && $_POST['jenis_layanan'] === $opt) ? 'selected' : '' ?>>
                                    <?= $opt ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <!-- Keperluan -->
                        <div class="mb-4">
                            <label for="keperluan" class="form-label fw-semibold">Keperluan / Keterangan <span class="text-danger">*</span></label>
                            <textarea class="form-control" id="keperluan" name="keperluan" rows="5" placeholder="Jelaskan keperluan pengajuan surat ini secara lengkap..." required><?= isset($_POST['keperluan']) ? htmlspecialchars($_POST['keperluan']) : '' ?></textarea>
                        </div>

                        <!-- Upload Berkas Pendukung -->
                        <div class="mb-4">
                            <label class="form-label fw-semibold">Berkas Pendukung (Opsional)</label>
                            <p class="text-muted small">Unggah dokumen pendukung seperti KTP, KK, foto, dll (JPG, PNG, PDF - maks 5MB)</p>
                            <input type="file" class="form-control" name="berkas[]" multiple accept=".jpg,.jpeg,.png,.pdf">
                        </div>

                        <!-- Submit -->
                        <div class="d-grid gap-3 mt-5">
                            <button type="submit" class="btn btn-primary btn-lg rounded-pill">
                                <i class="bi bi-send me-2"></i>Ajukan Surat
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
<a href="home.php" class="btn btn-primary btn-lg btn-back d-flex align-items-center justify-content-center">
    <i class="bi bi-house fs-4"></i>
</a>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>