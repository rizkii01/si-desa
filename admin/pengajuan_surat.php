<?php
// admin/pengajuan_surat.php - Halaman Pengelolaan Pengajuan Surat oleh Admin
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header('Location: ../login.php?error=1');
    exit;
}

require_once '../config/db.php';

// Proses Ubah Status
if (isset($_POST['ubah_status'])) {
    $id = (int)$_POST['id'];
    $status_baru = $_POST['status'];
    $catatan = trim($_POST['catatan_admin'] ?? '');

    $allowed_status = ['Pending', 'Diproses', 'Selesai', 'Ditolak'];
    if (in_array($status_baru, $allowed_status)) {
        $stmt = $pdo->prepare("UPDATE pengajuan_surat SET status = ?, catatan_admin = ? WHERE id = ?");
        $stmt->execute([$status_baru, $catatan, $id]);
        $_SESSION['success_message'] = "Status pengajuan berhasil diubah menjadi $status_baru!";
    }
    header('Location: pengajuan_surat.php');
    exit;
}

// Ambil semua pengajuan surat, urutkan dari terbaru
$stmt = $pdo->prepare("SELECT ps.*, w.nama_lengkap, w.no_hp 
                       FROM pengajuan_surat ps 
                       JOIN warga w ON ps.nik = w.nik 
                       ORDER BY ps.tanggal_pengajuan DESC");
$stmt->execute();
$pengajuans = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pengajuan Surat - Admin Desa Cemara</title>
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
            <li class="nav-item"><a href="pengajuan_surat.php" class="nav-link text-white bg-primary py-3 px-4 rounded active"><i class="bi bi-envelope me-3"></i> Pengajuan Surat</a></li>
            <li class="nav-item"><a href="pengajuan_antrian.php" class="nav-link text-white py-3 px-4 rounded"><i class="bi bi-clock-history me-3"></i> Antrian Pelayanan</a></li>
            <li class="nav-item"><a href="pengaduan.php" class="nav-link text-white py-3 px-4 rounded"><i class="bi bi-flag me-3"></i> Aduan Masyarakat</a></li>
        </ul>
        <div class="mt-auto p-4">
            <a href="../logout.php" class="btn btn-danger w-100 rounded-pill"><i class="bi bi-box-arrow-left me-2"></i> Keluar</a>
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex-grow-1" style="margin-left: 280px;">
        <nav class="navbar navbar-light bg-white shadow-sm px-4 py-3">
            <span class="navbar-brand h5 mb-0">Pengajuan Surat Pengantar</span>
            <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item text-muted">Admin</li>
                <li class="breadcrumb-item active">Pengajuan Surat</li>
            </ol>
        </nav>

        <div class="container-fluid p-4">

            <?php if (isset($_SESSION['success_message'])): ?>
            <div class="alert alert-success alert-dismissible fade show">
                <i class="bi bi-check-circle me-2"></i><?= $_SESSION['success_message'] ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            <?php unset($_SESSION['success_message']); endif; ?>

            <div class="card shadow-sm">
                <div class="card-header bg-primary text-white py-3">
                    <h5 class="mb-0"><i class="bi bi-envelope-open me-2"></i>Daftar Pengajuan Surat dari Warga</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>No</th>
                                    <th>Tanggal Pengajuan</th>
                                    <th>NIK</th>
                                    <th>Nama Pemohon</th>
                                    <th>Jenis Surat</th>
                                    <th>Keperluan</th>
                                    <th>Berkas</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($pengajuans)): ?>
                                <tr>
                                    <td colspan="9" class="text-center text-muted py-5">Belum ada pengajuan surat</td>
                                </tr>
                                <?php else: ?>
                                    <?php foreach ($pengajuans as $i => $p): ?>
                                    <tr>
                                        <td><?= $i + 1 ?></td>
                                        <td><?= date('d-m-Y H:i', strtotime($p['tanggal_pengajuan'])) ?></td>
                                        <td><?= htmlspecialchars($p['nik']) ?></td>
                                        <td><?= htmlspecialchars($p['nama_lengkap']) ?><br>
                                            <small class="text-muted"><?= htmlspecialchars($p['no_hp'] ?? '-') ?></small>
                                        </td>
                                        <td><strong><?= htmlspecialchars($p['jenis_layanan']) ?></strong></td>
                                        <td><?= nl2br(htmlspecialchars(substr($p['keperluan'], 0, 100))) ?>
                                            <?= strlen($p['keperluan']) > 100 ? '...' : '' ?></td>
                                        <td>
                                            <?php if ($p['berkas_pendukung']): ?>
                                                <?php $files = explode(',', $p['berkas_pendukung']); ?>
                                                <?php foreach ($files as $file): ?>
                                                    <a href="../uploads/<?= trim($file) ?>" target="_blank" class="badge bg-info text-white me-1">
                                                        <i class="bi bi-file-earmark"></i> <?= pathinfo(trim($file), PATHINFO_EXTENSION) ?>
                                                    </a>
                                                <?php endforeach; ?>
                                            <?php else: ?>
                                                <span class="text-muted">-</span>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <?php
                                            $badge_class = match($p['status']) {
                                                'Pending' => 'bg-secondary',
                                                'Diproses' => 'bg-warning',
                                                'Selesai' => 'bg-success',
                                                'Ditolak' => 'bg-danger',
                                                default => 'bg-secondary'
                                            };
                                            ?>
                                            <span class="badge <?= $badge_class ?>"><?= $p['status'] ?></span>
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modalStatus<?= $p['id'] ?>">
                                                <i class="bi bi-pencil"></i> Ubah Status
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

<!-- Modal Ubah Status untuk setiap pengajuan -->
<?php foreach ($pengajuans as $p): ?>
<div class="modal fade" id="modalStatus<?= $p['id'] ?>" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form method="POST">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">Ubah Status Pengajuan</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" name="id" value="<?= $p['id'] ?>">
                    <p><strong>Pemohon:</strong> <?= htmlspecialchars($p['nama_lengkap']) ?> (<?= $p['nik'] ?>)</p>
                    <p><strong>Jenis Surat:</strong> <?= htmlspecialchars($p['jenis_layanan']) ?></p>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Status Baru</label>
                        <select name="status" class="form-select" required>
                            <option value="Pending" <?= $p['status'] === 'Pending' ? 'selected' : '' ?>>Pending</option>
                            <option value="Diproses" <?= $p['status'] === 'Diproses' ? 'selected' : '' ?>>Diproses</option>
                            <option value="Selesai" <?= $p['status'] === 'Selesai' ? 'selected' : '' ?>>Selesai</option>
                            <option value="Ditolak" <?= $p['status'] === 'Ditolak' ? 'selected' : '' ?>>Ditolak</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Catatan untuk Pemohon (Opsional)</label>
                        <textarea name="catatan_admin" class="form-control" rows="4" placeholder="Contoh: Silakan datang ke kantor desa dengan membawa berkas asli..."><?= htmlspecialchars($p['catatan_admin'] ?? '') ?></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" name="ubah_status" class="btn btn-primary">Simpan Perubahan</button>
                </div>
            </form>
        </div>
    </div>
</div>
<?php endforeach; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>