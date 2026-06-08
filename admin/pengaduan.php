<?php
// admin/pengaduan.php - Halaman Pengelolaan Pengaduan Masyarakat oleh Admin
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header('Location: ../login.php?error=1');
    exit;
}

require_once '../config/db.php';

// Proses Balas / Ubah Status Pengaduan
if (isset($_POST['balas_pengaduan'])) {
    $id = (int)$_POST['id'];
    $status_baru = $_POST['status'];
    $balasan = trim($_POST['balasan_admin']);

    $allowed_status = ['Baru', 'Diproses', 'Selesai'];
    if (!in_array($status_baru, $allowed_status)) {
        $_SESSION['error_message'] = "Status tidak valid!";
    } else {
        $stmt = $pdo->prepare("UPDATE pengaduan SET status = ?, balasan_admin = ? WHERE id = ?");
        $stmt->execute([$status_baru, $balasan, $id]);
        $_SESSION['success_message'] = "Pengaduan berhasil diproses dan balasan telah dikirim!";
    }
    header('Location: pengaduan.php');
    exit;
}

// Ambil semua pengaduan, urutkan dari terbaru
$stmt = $pdo->prepare("SELECT p.*, w.nama_lengkap AS nama_warga, w.no_hp 
                       FROM pengaduan p 
                       LEFT JOIN warga w ON p.nik = w.nik 
                       ORDER BY p.tanggal_pengaduan DESC");
$stmt->execute();
$pengaduans = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aduan Masyarakat - Admin Desa Cemara</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body class="admin-layout">

<div class="d-flex" id="wrapper">
    <!-- Sidebar -->
    <div class="bg-dark text-white vh-100 position-fixed" style="width: 280px;">
        <div class="p-4 text-center border-bottom border-secondary">
            <img src="../assets/images/desa_cemara.jpg" alt="Logo" height="80" class="mb-3">
            <h5>Desa Cemara</h5>
        </div>
        <div class="p-3">
            <div class="d-flex align-items-center mb-4">
                <img src="../assets/images/desa_cemara.jpg" alt="Admin" class="rounded-circle me-3" width="50">
                <div>
                    <strong><?= htmlspecialchars($_SESSION['nama']) ?></strong><br>
                    <small>Administrator</small>
                </div>
            </div>
        </div>
        <ul class="nav flex-column px-3">
            <li class="nav-item"><a href="dashboard.php" class="nav-link text-white py-3 px-4 rounded"><i class="bi bi-speedometer2 me-3"></i> Dashboard</a></li>
            <li class="nav-item"><a href="admin_desa.php" class="nav-link text-white py-3 px-4 rounded"><i class="bi bi-person-gear me-3"></i> Admin Desa</a></li>
            <li class="nav-item"><a href="warga_desa.php" class="nav-link text-white py-3 px-4 rounded"><i class="bi bi-people me-3"></i> Warga Desa</a></li>
            <hr class="my-4 border-secondary">
            <h6 class="px-4 text-uppercase text-muted small">Layanan</h6>
            <li class="nav-item"><a href="pengajuan_surat.php" class="nav-link text-white py-3 px-4 rounded"><i class="bi bi-envelope me-3"></i> Pengajuan Surat</a></li>
            <li class="nav-item"><a href="pengajuan_antrian.php" class="nav-link text-white py-3 px-4 rounded"><i class="bi bi-clock-history me-3"></i> Antrian Pelayanan</a></li>
            <li class="nav-item"><a href="pengaduan.php" class="nav-link text-white bg-warning py-3 px-4 rounded active"><i class="bi bi-flag me-3"></i> Aduan Masyarakat</a></li>
        </ul>
        <div class="mt-auto p-4">
            <a href="../logout.php" class="btn btn-danger w-100 rounded-pill"><i class="bi bi-box-arrow-left me-2"></i> Keluar</a>
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex-grow-1" style="margin-left: 280px;">
        <nav class="navbar navbar-light bg-white shadow-sm px-4 py-3">
            <span class="navbar-brand h5 mb-0">Aduan & Aspirasi Masyarakat</span>
            <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item text-muted">Admin</li>
                <li class="breadcrumb-item active">Aduan Masyarakat</li>
            </ol>
        </nav>

        <div class="container-fluid p-4">

            <?php if (isset($_SESSION['success_message'])): ?>
            <div class="alert alert-success alert-dismissible fade show">
                <i class="bi bi-check-circle me-2"></i><?= $_SESSION['success_message'] ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            <?php unset($_SESSION['success_message']); endif; ?>

            <?php if (isset($_SESSION['error_message'])): ?>
            <div class="alert alert-danger alert-dismissible fade show">
                <i class="bi bi-exclamation-triangle me-2"></i><?= $_SESSION['error_message'] ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            <?php unset($_SESSION['error_message']); endif; ?>

            <div class="card shadow-sm">
                <div class="card-header bg-warning text-dark py-3">
                    <h5 class="mb-0"><i class="bi bi-chat-square-text me-2"></i>Daftar Pengaduan & Aspirasi Masyarakat</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>No</th>
                                    <th>Tanggal</th>
                                    <th>Pengadu</th>
                                    <th>Isi Aduan</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($pengaduans)): ?>
                                <tr>
                                    <td colspan="6" class="text-center text-muted py-5">Belum ada pengaduan masuk</td>
                                </tr>
                                <?php else: ?>
                                    <?php foreach ($pengaduans as $i => $p): ?>
                                    <tr>
                                        <td><?= $i + 1 ?></td>
                                        <td><?= date('d-m-Y H:i', strtotime($p['tanggal_pengaduan'])) ?></td>
                                        <td>
                                            <strong><?= htmlspecialchars($p['nama_lengkap']) ?></strong><br>
                                            <small class="text-muted">
                                                <?= $p['nik'] ? 'NIK: ' . htmlspecialchars($p['nik']) : 'Anonim' ?><br>
                                                <?= htmlspecialchars($p['no_hp'] ?? '-') ?>
                                            </small>
                                        </td>
                                        <td class="text-wrap" style="max-width: 400px;">
                                            <?= nl2br(htmlspecialchars($p['isi_aduan'])) ?>
                                        </td>
                                        <td>
                                            <?php
                                            $badge_class = match($p['status']) {
                                                'Baru' => 'bg-danger',
                                                'Diproses' => 'bg-warning',
                                                'Selesai' => 'bg-success',
                                                default => 'bg-secondary'
                                            };
                                            ?>
                                            <span class="badge <?= $badge_class ?>"><?= $p['status'] ?></span>
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-warning" data-bs-toggle="modal" data-bs-target="#modalBalas<?= $p['id'] ?>">
                                                <i class="bi bi-reply"></i> Balas / Proses
                                            </button>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal Balas Pengaduan untuk setiap item -->
<?php foreach ($pengaduans as $p): ?>
<div class="modal fade" id="modalBalas<?= $p['id'] ?>" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <form method="POST">
                <div class="modal-header bg-warning text-dark">
                    <h5 class="modal-title">Balas & Proses Pengaduan</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" name="id" value="<?= $p['id'] ?>">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <strong>Pengadu:</strong> <?= htmlspecialchars($p['nama_lengkap']) ?>
                            <?= $p['nik'] ? ' (NIK: ' . htmlspecialchars($p['nik']) . ')' : ' (Anonim)' ?>
                        </div>
                        <div class="col-md-6 text-end">
                            <strong>Tanggal:</strong> <?= date('d F Y H:i', strtotime($p['tanggal_pengaduan'])) ?>
                        </div>
                    </div>
                    <hr>
                    <div class="mb-4">
                        <strong>Isi Aduan:</strong>
                        <div class="p-3 bg-light rounded">
                            <?= nl2br(htmlspecialchars($p['isi_aduan'])) ?>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Status Pengaduan</label>
                        <select name="status" class="form-select" required>
                            <option value="Baru" <?= $p['status'] === 'Baru' ? 'selected' : '' ?>>Baru</option>
                            <option value="Diproses" <?= $p['status'] === 'Diproses' ? 'selected' : '' ?>>Diproses</option>
                            <option value="Selesai" <?= $p['status'] === 'Selesai' ? 'selected' : '' ?>>Selesai</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Balasan untuk Pengadu</label>
                        <textarea name="balasan_admin" class="form-control" rows="6" placeholder="Tulis balasan atau tindak lanjut yang akan dilihat oleh pengadu..."><?= htmlspecialchars($p['balasan_admin'] ?? '') ?></textarea>
                        <div class="form-text">Balasan ini akan terlihat oleh warga di riwayat pengaduan mereka.</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" name="balas_pengaduan" class="btn btn-warning text-white">Kirim Balasan & Simpan</button>
                </div>
            </form>
        </div>
    </div>
</div>
<?php endforeach; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>