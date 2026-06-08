<?php
// admin/edit_warga.php - Halaman Edit Data Warga
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header('Location: ../login.php?error=1');
    exit;
}

require_once '../config/db.php';

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    header('Location: warga_desa.php');
    exit;
}

// Ambil data warga
$stmt = $pdo->prepare("SELECT * FROM warga WHERE id = ? AND role = 'warga'");
$stmt->execute([$id]);
$warga = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$warga) {
    $_SESSION['error_message'] = "Data warga tidak ditemukan!";
    header('Location: warga_desa.php');
    exit;
}

$success = $error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nik = trim($_POST['nik']);
    $nama_lengkap = trim($_POST['nama_lengkap']);
    $email = trim($_POST['email']);
    $no_hp = trim($_POST['no_hp']);
    $tempat_lahir = trim($_POST['tempat_lahir']);
    $tanggal_lahir = $_POST['tanggal_lahir'];
    $jenis_kelamin = $_POST['jenis_kelamin'];
    $alamat = trim($_POST['alamat']);

    // Validasi
    if (empty($nik) || empty($nama_lengkap) || empty($tanggal_lahir) || empty($jenis_kelamin)) {
        $error = "NIK, Nama Lengkap, Tanggal Lahir, dan Jenis Kelamin wajib diisi!";
    } elseif (strlen($nik) !== 16 || !ctype_digit($nik)) {
        $error = "NIK harus 16 digit angka!";
    } elseif (!in_array($jenis_kelamin, ['Laki-laki', 'Perempuan'])) {
        $error = "Jenis kelamin tidak valid!";
    } else {
        // Cek NIK unik (kecuali untuk data saat ini)
        $check = $pdo->prepare("SELECT id FROM warga WHERE nik = ? AND id != ?");
        $check->execute([$nik, $id]);
        if ($check->rowCount() > 0) {
            $error = "NIK sudah digunakan oleh warga lain!";
        } else {
            try {
                $stmt = $pdo->prepare("UPDATE warga SET 
                    nik = ?, nama_lengkap = ?, email = ?, no_hp = ?, alamat = ?, 
                    tempat_lahir = ?, tanggal_lahir = ?, jenis_kelamin = ?
                    WHERE id = ?");

                $stmt->execute([
                    $nik,
                    $nama_lengkap,
                    $email ?: null,
                    $no_hp ?: null,
                    $alamat ?: null,
                    $tempat_lahir ?: null,
                    $tanggal_lahir,
                    $jenis_kelamin,
                    $id
                ]);

                $_SESSION['success_message'] = "Data warga berhasil diperbarui!";
                header('Location: warga_desa.php');
                exit;
            } catch (PDOException $e) {
                $error = "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.";
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
    <title>Edit Warga - Desa Cemara</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body class="bg-light">

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-10">
            <div class="card shadow-lg border-0">
                <div class="card-header bg-warning text-white text-center py-4">
                    <h3 class="mb-0"><i class="bi bi-pencil-square me-3"></i>Edit Data Warga</h3>
                </div>
                <div class="card-body p-5">

                    <?php if ($error): ?>
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i><?= htmlspecialchars($error) ?>
                    </div>
                    <?php endif; ?>

                    <form method="POST">
                        <div class="row g-4">
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">NIK <span class="text-danger">*</span></label>
                                <input type="text" name="nik" class="form-control form-control-lg" maxlength="16" 
                                       value="<?= htmlspecialchars($warga['nik']) ?>" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Nama Lengkap <span class="text-danger">*</span></label>
                                <input type="text" name="nama_lengkap" class="form-control form-control-lg" 
                                       value="<?= htmlspecialchars($warga['nama_lengkap']) ?>" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Email</label>
                                <input type="email" name="email" class="form-control form-control-lg" 
                                       value="<?= htmlspecialchars($warga['email'] ?? '') ?>">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">No Handphone</label>
                                <input type="text" name="no_hp" class="form-control form-control-lg" 
                                       value="<?= htmlspecialchars($warga['no_hp'] ?? '') ?>">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Tempat Lahir</label>
                                <input type="text" name="tempat_lahir" class="form-control form-control-lg" 
                                       value="<?= htmlspecialchars($warga['tempat_lahir'] ?? '') ?>">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Tanggal Lahir <span class="text-danger">*</span></label>
                                <input type="date" name="tanggal_lahir" class="form-control form-control-lg" 
                                       value="<?= $warga['tanggal_lahir'] ?>" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Jenis Kelamin <span class="text-danger">*</span></label>
                                <select name="jenis_kelamin" class="form-select form-select-lg" required>
                                    <option value="Laki-laki" <?= $warga['jenis_kelamin'] === 'Laki-laki' ? 'selected' : '' ?>>Laki-laki</option>
                                    <option value="Perempuan" <?= $warga['jenis_kelamin'] === 'Perempuan' ? 'selected' : '' ?>>Perempuan</option>
                                </select>
                            </div>
                            <div class="col-12">
                                <label class="form-label fw-semibold">Alamat</label>
                                <textarea name="alamat" class="form-control" rows="4"><?= htmlspecialchars($warga['alamat'] ?? '') ?></textarea>
                            </div>
                        </div>

                        <div class="d-grid gap-3 mt-5">
                            <button type="submit" class="btn btn-warning btn-lg rounded-pill text-white">
                                <i class="bi bi-save me-2"></i>Simpan Perubahan
                            </button>
                            <a href="warga_desa.php" class="btn btn-outline-secondary btn-lg rounded-pill">
                                <i class="bi bi-arrow-left me-2"></i>Kembali ke Daftar Warga
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>