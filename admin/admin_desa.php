<?php
// admin/admin_desa.php - Halaman Kelola Admin Desa
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header('Location: ../login.php?error=1');
    exit;
}

require_once '../config/db.php';

// Proses Hapus Admin (kecuali diri sendiri)
if (isset($_GET['hapus'])) {
    $id_hapus = (int)$_GET['hapus'];
    if ($id_hapus === $_SESSION['user_id']) {
        $_SESSION['error_message'] = "Tidak dapat menghapus akun sendiri!";
    } else {
        $stmt = $pdo->prepare("DELETE FROM warga WHERE id = ? AND role = 'admin'");
        $stmt->execute([$id_hapus]);
        $_SESSION['success_message'] = "Admin berhasil dihapus!";
    }
    header('Location: admin_desa.php');
    exit;
}

// Ambil semua data admin (role = 'admin')
$stmt = $pdo->prepare("SELECT id, nik, nama_lengkap, email, no_hp, created_at FROM warga WHERE role = 'admin' ORDER BY created_at DESC");
$stmt->execute();
$admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Desa - Kelola Pengguna Admin</title>
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
                <li class="nav-item"><a href="admin_desa.php" class="nav-link text-white bg-primary py-3 px-4 rounded active"><i class="bi bi-person-gear me-3"></i> Admin Desa</a></li>
                <li class="nav-item"><a href="warga_desa.php" class="nav-link text-white py-3 px-4 rounded"><i class="bi bi-people me-3"></i> Warga Desa</a></li>
                <hr class="my-4 border-secondary">
                <h6 class="px-4 text-uppercase text-muted small">Layanan</h6>
                <li class="nav-item"><a href="pengajuan_surat.php" class="nav-link text-white py-3 px-4 rounded"><i class="bi bi-envelope me-3"></i> Pengajuan Surat</a></li>
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
                <span class="navbar-brand h5 mb-0">Admin Desa</span>
                <ol class="breadcrumb mb-0">
                    <li class="breadcrumb-item text-muted">Admin</li>
                    <li class="breadcrumb-item active">Admin Desa</li>
                </ol>
            </nav>

            <div class="container-fluid p-4">
                <!-- Pesan Sukses / Error -->
                <?php if (isset($_SESSION['success_message'])): ?>
                    <div class="alert alert-success alert-dismissible fade show">
                        <i class="bi bi-check-circle me-2"></i><?= $_SESSION['success_message'] ?>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                <?php unset($_SESSION['success_message']);
                endif; ?>

                <?php if (isset($_SESSION['error_message'])): ?>
                    <div class="alert alert-danger alert-dismissible fade show">
                        <i class="bi bi-exclamation-triangle me-2"></i><?= $_SESSION['error_message'] ?>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                <?php unset($_SESSION['error_message']);
                endif; ?>

                <!-- Tombol Tambah Admin -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4 class="mb-0">List Admin Desa</h4>
                    <button class="btn btn-primary rounded-pill px-4" data-bs-toggle="modal" data-bs-target="#modalTambahAdmin">
                        <i class="bi bi-plus-lg me-2"></i> Tambah Admin Desa
                    </button>
                </div>

                <!-- Tabel Admin -->
                <div class="card shadow-sm">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th>No</th>
                                        <th>NIK</th>
                                        <th>Nama Lengkap</th>
                                        <th>Email</th>
                                        <th>Nomor Handphone</th>
                                        <th>Tanggal Dibuat</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (empty($admins)): ?>
                                        <tr>
                                            <td colspan="7" class="text-center text-muted py-5">Belum ada admin lain selain Anda</td>
                                        </tr>
                                    <?php else: ?>
                                        <?php foreach ($admins as $i => $a): ?>
                                            <tr>
                                                <td><?= $i + 1 ?></td>
                                                <td><?= htmlspecialchars($a['nik']) ?></td>
                                                <td><?= htmlspecialchars($a['nama_lengkap']) ?></td>
                                                <td><?= htmlspecialchars($a['email'] ?? '-') ?></td>
                                                <td><?= htmlspecialchars($a['no_hp'] ?? '-') ?></td>
                                                <td><?= date('d-m-Y H:i', strtotime($a['created_at'])) ?></td>
                                                <td>
                                                    <a href="detail_admin.php?id=<?= $a['id'] ?>" class="btn btn-sm btn-info text-white"><i class="bi bi-eye"></i> Detail</a>
                                                    <a href="?hapus=<?= $a['id'] ?>" class="btn btn-sm btn-danger"
                                                        onclick="return confirm('Yakin hapus admin <?= htmlspecialchars($a['nama_lengkap']) ?>? Akses login akan hilang!')">
                                                        <i class="bi bi-trash"></i> Hapus
                                                    </a>
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

    <!-- Modal Tambah Admin -->
    <div class="modal fade" id="modalTambahAdmin" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <form action="proses_tambah_admin.php" method="POST">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title"><i class="bi bi-person-plus-fill me-2"></i>Tambah Admin Desa Baru</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle me-2"></i>
                            Admin baru akan bisa login menggunakan <strong>NIK</strong> dan <strong>Tanggal Lahir</strong> sesuai data yang diisi.
                        </div>
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">NIK <span class="text-danger">*</span></label>
                                <input type="text" name="nik" class="form-control" maxlength="16" required placeholder="16 digit NIK">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Nama Lengkap <span class="text-danger">*</span></label>
                                <input type="text" name="nama_lengkap" class="form-control" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Email</label>
                                <input type="email" name="email" class="form-control">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">No Handphone</label>
                                <input type="text" name="no_hp" class="form-control">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Tanggal Lahir <span class="text-danger">*</span></label>
                                <input type="date" name="tanggal_lahir" class="form-control" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Jenis Kelamin <span class="text-danger">*</span></label>
                                <select name="jenis_kelamin" class="form-select" required>
                                    <option value="">Pilih</option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-primary">Simpan Admin Baru</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>