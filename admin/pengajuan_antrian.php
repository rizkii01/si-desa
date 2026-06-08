<?php
// admin/pengajuan_antrian.php - Halaman Pengelolaan Pengajuan Antrian oleh Admin
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header('Location: ../login.php?error=1');
    exit;
}

require_once '../config/db.php';

// Proses Beri Nomor Antrian / Ubah Status
if (isset($_POST['beri_antrian'])) {
    $id = (int)$_POST['id'];
    $nomor_antrian = (int)$_POST['nomor_antrian'];
    $status_baru = $_POST['status']; // Terverifikasi atau Selesai

    if ($nomor_antrian < 1) {
        $_SESSION['error_message'] = "Nomor antrian harus lebih dari 0!";
    } elseif (!in_array($status_baru, ['Pending', 'Terverifikasi', 'Selesai'])) {
        $_SESSION['error_message'] = "Status tidak valid!";
    } else {
        // Cek apakah nomor antrian sudah dipakai di tanggal yang sama
        $check_stmt = $pdo->prepare("SELECT id FROM pengajuan_antrian WHERE nomor_antrian = ? AND tanggal = (SELECT tanggal FROM pengajuan_antrian WHERE id = ?)");
        $check_stmt->execute([$nomor_antrian, $id]);
        if ($check_stmt->rowCount() > 0) {
            $_SESSION['error_message'] = "Nomor antrian $nomor_antrian sudah digunakan pada tanggal tersebut!";
        } else {
            $stmt = $pdo->prepare("UPDATE pengajuan_antrian SET nomor_antrian = ?, status = ? WHERE id = ?");
            $stmt->execute([$nomor_antrian, $status_baru, $id]);
            $_SESSION['success_message'] = "Nomor antrian berhasil diberikan dan status diubah!";
        }
    }
    header('Location: pengajuan_antrian.php');
    exit;
}

// Ambil semua pengajuan antrian
$stmt = $pdo->prepare("SELECT pa.*, w.nama_lengkap, w.no_hp 
                       FROM pengajuan_antrian pa 
                       JOIN warga w ON pa.nik = w.nik 
                       ORDER BY pa.tanggal ASC, pa.created_at DESC");
$stmt->execute();
$antrians = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Antrian Pelayanan - Admin Desa Cemara</title>
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
            <li class="nav-item"><a href="pengajuan_antrian.php" class="nav-link text-white bg-success py-3 px-4 rounded active"><i class="bi bi-clock-history me-3"></i> Antrian Pelayanan</a></li>
            <li class="nav-item"><a href="pengaduan.php" class="nav-link text-white py-3 px-4 rounded"><i class="bi bi-flag me-3"></i> Aduan Masyarakat</a></li>
        </ul>
        <div class="mt-auto p-4">
            <a href="../logout.php" class="btn btn-danger w-100 rounded-pill"><i class="bi bi-box-arrow-left me-2"></i> Keluar</a>
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex-grow-1" style="margin-left: 280px;">
        <nav class="navbar navbar-light bg-white shadow-sm px-4 py-3">
            <span class="navbar-brand h5 mb-0">Antrian Pelayanan</span>
            <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item text-muted">Admin</li>
                <li class="breadcrumb-item active">Antrian Pelayanan</li>
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
                <div class="card-header bg-success text-white py-3">
                    <h5 class="mb-0"><i class="bi bi-people me-2"></i>Daftar Pengajuan Antrian Pelayanan</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>No</th>
                                    <th>Tanggal Kunjungan</th>
                                    <th>NIK</th>
                                    <th>Nama Pemohon</th>
                                    <th>Jenis Pelayanan</th>
                                    <th>Nomor Antrian</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($antrians)): ?>
                                <tr>
                                    <td colspan="8" class="text-center text-muted py-5">Belum ada pengajuan antrian</td>
                                </tr>
                                <?php else: ?>
                                    <?php foreach ($antrians as $i => $a): ?>
                                    <tr>
                                        <td><?= $i + 1 ?></td>
                                        <td><strong><?= date('d-m-Y', strtotime($a['tanggal'])) ?></strong><br>
                                            <small class="text-muted">Diajukan: <?= date('H:i', strtotime($a['created_at'])) ?></small>
                                        </td>
                                        <td><?= htmlspecialchars($a['nik']) ?></td>
                                        <td><?= htmlspecialchars($a['nama_lengkap']) ?><br>
                                            <small class="text-muted"><?= htmlspecialchars($a['no_hp'] ?? '-') ?></small>
                                        </td>
                                        <td><?= htmlspecialchars($a['jenis_layanan']) ?></td>
                                        <td>
                                            <?php if ($a['nomor_antrian']): ?>
                                                <span class="badge bg-primary fs-6"><?= sprintf('%03d', $a['nomor_antrian']) ?></span>
                                            <?php else: ?>
                                                <span class="text-muted">-</span>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <?php
                                            $badge_class = match($a['status']) {
                                                'Pending' => 'bg-secondary',
                                                'Terverifikasi' => 'bg-info',
                                                'Selesai' => 'bg-success',
                                                default => 'bg-secondary'
                                            };
                                            ?>
                                            <span class="badge <?= $badge_class ?>"><?= $a['status'] ?></span>
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-success" data-bs-toggle="modal" data-bs-target="#modalAntrian<?= $a['id'] ?>">
                                                <i class="bi bi-ticket-perforated"></i> Beri Nomor Antrian
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

<!-- Modal Beri Nomor Antrian untuk setiap pengajuan -->
<?php foreach ($antrians as $a): ?>
<div class="modal fade" id="modalAntrian<?= $a['id'] ?>" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form method="POST">
                <div class="modal-header bg-success text-white">
                    <h5 class="modal-title">Beri Nomor Antrian</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" name="id" value="<?= $a['id'] ?>">
                    <p><strong>Pemohon:</strong> <?= htmlspecialchars($a['nama_lengkap']) ?> (<?= $a['nik'] ?>)</p>
                    <p><strong>Tanggal Kunjungan:</strong> <?= date('d F Y', strtotime($a['tanggal'])) ?></p>
                    <p><strong>Jenis Pelayanan:</strong> <?= htmlspecialchars($a['jenis_layanan']) ?></p>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Nomor Antrian</label>
                        <input type="number" name="nomor_antrian" class="form-control form-control-lg text-center" 
                               min="1" value="<?= $a['nomor_antrian'] ?? '' ?>" placeholder="Contoh: 5" required>
                        <div class="form-text">Nomor akan ditampilkan sebagai 001, 002, dst</div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Status</label>
                        <select name="status" class="form-select" required>
                            <option value="Pending" <?= $a['status'] === 'Pending' ? 'selected' : '' ?>>Pending</option>
                            <option value="Terverifikasi" <?= $a['status'] === 'Terverifikasi' ? 'selected' : '' ?>>Terverifikasi</option>
                            <option value="Selesai" <?= $a['status'] === 'Selesai' ? 'selected' : '' ?>>Selesai</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" name="beri_antrian" class="btn btn-success">Simpan & Konfirmasi</button>
                </div>
            </form>
        </div>
    </div>
</div>
<?php endforeach; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>