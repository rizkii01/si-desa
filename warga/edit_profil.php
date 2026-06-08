<?php
// warga/edit_profil.php - Update dengan Upload Foto Profil
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'warga') {
    header('Location: ../login.php?error=1');
    exit;
}

require_once '../config/db.php';

$nik = $_SESSION['nik'];

// Folder untuk foto profil
$upload_dir = '../uploads/profil/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Ambil data warga
$stmt = $pdo->prepare("SELECT * FROM warga WHERE nik = ?");
$stmt->execute([$nik]);
$warga = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$warga) {
    header('Location: home.php');
    exit;
}

$success = $error = '';

// Proses Update Profil + Upload Foto
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email']);
    $no_hp = trim($_POST['no_hp']);
    $alamat = trim($_POST['alamat']);
    $foto_profil = $warga['foto_profil'] ?? null; // default foto lama

    // Validasi email
    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Format email tidak valid!";
    } elseif (strlen($no_hp) > 15) {
        $error = "Nomor handphone terlalu panjang!";
    } else {
        // Proses Upload Foto Profil
        if (isset($_FILES['foto_profil']) && $_FILES['foto_profil']['error'] === 0) {
            $allowed = ['jpg', 'jpeg', 'png'];
            $filename = $_FILES['foto_profil']['name'];
            $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

            if (!in_array($ext, $allowed)) {
                $error = "Hanya file JPG, JPEG, atau PNG yang diizinkan!";
            } elseif ($_FILES['foto_profil']['size'] > 2 * 1024 * 1024) { // maks 2MB
                $error = "Ukuran foto maksimal 2MB!";
            } else {
                // Hapus foto lama jika ada
                if ($foto_profil && file_exists($upload_dir . $foto_profil)) {
                    unlink($upload_dir . $foto_profil);
                }

                // Simpan foto baru dengan nama unik
                $new_filename = 'profil_' . $nik . '_' . time() . '.' . $ext;
                $destination = $upload_dir . $new_filename;

                if (move_uploaded_file($_FILES['foto_profil']['tmp_name'], $destination)) {
                    $foto_profil = $new_filename;
                } else {
                    $error = "Gagal mengunggah foto. Coba lagi.";
                }
            }
        }

        if (empty($error)) {
            try {
                $stmt = $pdo->prepare("UPDATE warga SET email = ?, no_hp = ?, alamat = ?, foto_profil = ? WHERE nik = ?");
                $stmt->execute([$email ?: null, $no_hp ?: null, $alamat ?: null, $foto_profil, $nik]);

                $success = "Profil berhasil diperbarui!";

                // Refresh data warga
                $stmt = $pdo->prepare("SELECT * FROM warga WHERE nik = ?");
                $stmt->execute([$nik]);
                $warga = $stmt->fetch(PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                $error = "Terjadi kesalahan saat menyimpan data.";
            }
        }
    }
}

// Path foto profil (default jika belum ada)
$foto_path = $warga['foto_profil']
    ? '../uploads/profil/' . $warga['foto_profil']
    : '../images/avatar-default.png';
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Profil - <?= htmlspecialchars($warga['nama_lengkap']) ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .profile-header {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
        }

        .current-photo {
            width: 150px;
            height: 150px;
            object-fit: cover;
            border: 5px solid white;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
    </style>
</head>

<body class="bg-light admin-layout">

    <!-- Header -->
    <section class="profile-header text-white py-5 mb-5">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-4 text-center mb-4 mb-lg-0">
                    <img src="<?= $foto_path ?>?t=<?= time() ?>" alt="Foto Profil" class="rounded-circle current-photo">
                    <p class="mt-3 mb-0 opacity-75">Foto Profil Saat Ini</p>
                </div>
                <div class="col-lg-8">
                    <h1 class="display-5 fw-bold mb-2">Edit Profil</h1>
                    <p class="lead mb-0">Perbarui informasi dan foto profil Anda</p>
                </div>
            </div>
        </div>
    </section>

    <div class="container pb-5">
        <div class="row justify-content-center">
            <div class="col-lg-9">
                <div class="card shadow-lg border-0">
                    <div class="card-body p-5">

                        <?php if ($success): ?>
                            <div class="alert alert-success alert-dismissible fade show">
                                <i class="bi bi-check-circle me-2"></i><?= $success ?>
                                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        <?php endif; ?>

                        <?php if ($error): ?>
                            <div class="alert alert-danger">
                                <i class="bi bi-exclamation-triangle me-2"></i><?= $error ?>
                            </div>
                        <?php endif; ?>

                        <form method="POST" enctype="multipart/form-data">

                            <hr class="my-5">

                            <!-- Data yang Tidak Bisa Diubah -->
                            <h5 class="fw-bold mb-4 text-muted">Data Identitas (Hanya Admin yang Bisa Ubah)</h5>
                            <div class="row mb-4 p-4 bg-light rounded">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold text-muted">NIK</label>
                                    <input type="text" class="form-control form-control-lg bg-white" value="<?= htmlspecialchars($warga['nik']) ?>" readonly>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold text-muted">Nama Lengkap</label>
                                    <input type="text" class="form-control form-control-lg bg-white" value="<?= htmlspecialchars($warga['nama_lengkap']) ?>" readonly>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold text-muted">Jenis Kelamin</label>
                                    <input type="text" class="form-control form-control-lg bg-white" value="<?= htmlspecialchars($warga['jenis_kelamin']) ?>" readonly>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold text-muted">Tanggal Lahir</label>
                                    <input type="text" class="form-control form-control-lg bg-white" value="<?= date('d F Y', strtotime($warga['tanggal_lahir'])) ?>" readonly>
                                </div>
                            </div>

                            <!-- Data yang Bisa Diubah -->
                            <h5 class="fw-bold mb-4 text-primary"><i class="bi bi-pencil-square me-2"></i>Informasi yang Dapat Diubah</h5>
                            <div class="row g-4">
                                <div class="col-md-6">
                                    <label for="email" class="form-label fw-semibold">Email</label>
                                    <input type="email" name="email" id="email" class="form-control form-control-lg"
                                        value="<?= htmlspecialchars($warga['email'] ?? '') ?>" placeholder="contoh@email.com">
                                </div>
                                <div class="col-md-6">
                                    <label for="no_hp" class="form-label fw-semibold">Nomor Handphone</label>
                                    <input type="text" name="no_hp" id="no_hp" class="form-control form-control-lg"
                                        value="<?= htmlspecialchars($warga['no_hp'] ?? '') ?>" placeholder="08xxxxxxxxxx">
                                </div>
                                <div class="col-12">
                                    <label for="alamat" class="form-label fw-semibold">Alamat Lengkap</label>
                                    <textarea name="alamat" id="alamat" class="form-control" rows="4"><?= htmlspecialchars($warga['alamat'] ?? '') ?></textarea>
                                </div>
                                <!-- Upload Foto Profil -->
                                <div class="text-center mb-5">
                                    <h5 class="fw-bold text-primary mb-4"><i class="bi bi-camera me-2"></i>Ubah Foto Profil</h5>
                                    <div class="mb-3">
                                        <img src="<?= $foto_path ?>?t=<?= time() ?>" alt="Preview" class="rounded-circle" width="120" height="120" id="preview">
                                    </div>
                                    <input type="file" name="foto_profil" id="foto_profil" class="form-control form-control-lg" accept="image/jpeg,image/jpg,image/png">
                                    <div class="form-text mt-2">
                                        Maksimal 2MB • Format: JPG, JPEG, PNG<br>
                                        Foto akan ditampilkan di profil dan riwayat pengajuan
                                    </div>
                                </div>

                            </div>

                            <div class="d-grid gap-3 mt-5">
                                <button type="submit" class="btn btn-success btn-lg rounded-pill">
                                    <i class="bi bi-save me-2"></i>Simpan Semua Perubahan
                                </button>
                                <a href="profil.php" class="btn btn-outline-secondary btn-lg rounded-pill">
                                    <i class="bi bi-arrow-left me-2"></i>Kembali ke Profil
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Preview foto saat dipilih
        document.getElementById('foto_profil').addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('preview').src = e.target.result;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    </script>
</body>

</html>