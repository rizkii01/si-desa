<?php
// warga/riwayat.php - Halaman Riwayat Pengajuan Warga
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'warga') {
    header('Location: ../login.php?error=1');
    exit;
}

require_once '../config/db.php';

$nik = $_SESSION['nik'];
$nama = $_SESSION['nama'];

// Ambil semua riwayat pengajuan warga ini
// 1. Pengajuan Surat
$stmt_surat = $pdo->prepare("SELECT * FROM pengajuan_surat WHERE nik = ? ORDER BY tanggal_pengajuan DESC");
$stmt_surat->execute([$nik]);
$surats = $stmt_surat->fetchAll(PDO::FETCH_ASSOC);

// 2. Pengajuan Antrian
$stmt_antrian = $pdo->prepare("SELECT * FROM pengajuan_antrian WHERE nik = ? ORDER BY tanggal DESC, created_at DESC");
$stmt_antrian->execute([$nik]);
$antrians = $stmt_antrian->fetchAll(PDO::FETCH_ASSOC);

// 3. Pengaduan
$stmt_aduan = $pdo->prepare("SELECT * FROM pengaduan WHERE nik = ? ORDER BY tanggal_pengaduan DESC");
$stmt_aduan->execute([$nik]);
$aduans = $stmt_aduan->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Riwayat Pengajuan - <?= htmlspecialchars($nama) ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .timeline {
            position: relative;
            padding-left: 40px;
        }
        .timeline::before {
            content: '';
            position: absolute;
            left: 20px;
            top: 0;
            bottom: 0;
            width: 4px;
            background: #e9ecef;
        }
        .timeline-item {
            position: relative;
            margin-bottom: 30px;
        }
        .timeline-icon {
            position: absolute;
            left: -40px;
            top: 0;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
        }
        .badge-status {
            font-size: 0.9rem;
        }
    </style>
</head>
<body class="bg-light admin-layout">

<!-- Header dengan Background -->
<section class="bg-primary text-white py-5 mb-5">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-8">
                <h1 class="display-5 fw-bold">Riwayat Pengajuan</h1>
                <p class="lead mb-0">Lihat status semua layanan yang pernah Anda ajukan</p>
            </div>
            <div class="col-lg-4 text-lg-end">
                <a href="home.php" class="btn btn-light btn-lg rounded-pill">
                    <i class="bi bi-house me-2"></i>Kembali ke Beranda
                </a>
            </div>
        </div>
    </div>
</section>

<div class="container">

    <?php if (empty($surats) && empty($antrians) && empty($aduans)): ?>
    <div class="text-center py-5">
        <i class="bi bi-inbox display-1 text-muted mb-4"></i>
        <h4 class="text-muted">Belum ada riwayat pengajuan</h4>
        <p class="text-muted">Mulai ajukan layanan dari menu utama</p>
        <a href="home.php" class="btn btn-primary rounded-pill px-5">Ajukan Sekarang</a>
    </div>
    <?php else: ?>

    <div class="timeline">

        <!-- Pengajuan Surat -->
        <?php foreach ($surats as $s): ?>
        <div class="timeline-item">
            <div class="timeline-icon bg-primary">
                <i class="bi bi-envelope"></i>
            </div>
            <div class="card shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="card-title mb-1">Pengajuan Surat Pengantar</h5>
                            <p class="text-muted mb-2">
                                <small><i class="bi bi-calendar"></i> <?= date('d F Y H:i', strtotime($s['tanggal_pengajuan'])) ?></small>
                            </p>
                            <p><strong>Jenis Surat:</strong> <?= htmlspecialchars($s['jenis_layanan']) ?></p>
                            <p><strong>Keperluan:</strong> <?= nl2br(htmlspecialchars($s['keperluan'])) ?></p>

                            <?php if ($s['berkas_pendukung']): ?>
                            <p><strong>Berkas Pendukung:</strong>
                                <?php $files = explode(',', $s['berkas_pendukung']); ?>
                                <?php foreach ($files as $file): ?>
                                <a href="../uploads/<?= trim($file) ?>" target="_blank" class="badge bg-info text-white me-1">
                                    <i class="bi bi-file-earmark"></i> <?= pathinfo(trim($file), PATHINFO_EXTENSION) ?>
                                </a>
                                <?php endforeach; ?>
                            </p>
                            <?php endif; ?>

                            <?php if ($s['catatan_admin']): ?>
                            <div class="alert alert-info mt-3">
                                <strong>Catatan dari Admin:</strong><br>
                                <?= nl2br(htmlspecialchars($s['catatan_admin'])) ?>
                            </div>
                            <?php endif; ?>
                        </div>
                        <div class="text-end">
                            <?php
                            $badge_class = match($s['status']) {
                                'Pending' => 'bg-secondary',
                                'Diproses' => 'bg-warning',
                                'Selesai' => 'bg-success',
                                'Ditolak' => 'bg-danger',
                                default => 'bg-secondary'
                            };
                            ?>
                            <span class="badge <?= $badge_class ?> badge-status py-2 px-3"><?= $s['status'] ?></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php endforeach; ?>

        <!-- Pengajuan Antrian -->
        <?php foreach ($antrians as $a): ?>
        <div class="timeline-item">
            <div class="timeline-icon bg-success">
                <i class="bi bi-people"></i>
            </div>
            <div class="card shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="card-title mb-1">Pengajuan Antrian Pelayanan</h5>
                            <p class="text-muted mb-2">
                                <small><i class="bi bi-calendar"></i> Diajukan: <?= date('d F Y H:i', strtotime($a['created_at'])) ?></small>
                            </p>
                            <p><strong>Tanggal Kunjungan:</strong> <?= date('d F Y', strtotime($a['tanggal'])) ?></p>
                            <p><strong>Jenis Pelayanan:</strong> <?= htmlspecialchars($a['jenis_layanan']) ?></p>

                            <?php if ($a['nomor_antrian']): ?>
                            <div class="alert alert-success mt-3">
                                <strong>Nomor Antrian Anda:</strong>
                                <h2 class="mb-0 text-center"><?= sprintf('%03d', $a['nomor_antrian']) ?></h2>
                                <p class="text-center mb-0">Silakan datang tepat waktu di kantor desa</p>
                            </div>
                            <?php endif; ?>
                        </div>
                        <div class="text-end">
                            <?php
                            $badge_class = match($a['status']) {
                                'Pending' => 'bg-secondary',
                                'Terverifikasi' => 'bg-info',
                                'Selesai' => 'bg-success',
                                default => 'bg-secondary'
                            };
                            ?>
                            <span class="badge <?= $badge_class ?> badge-status py-2 px-3"><?= $a['status'] ?></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php endforeach; ?>

        <!-- Pengaduan -->
        <?php foreach ($aduans as $ad): ?>
        <div class="timeline-item">
            <div class="timeline-icon bg-warning text-dark">
                <i class="bi bi-flag"></i>
            </div>
            <div class="card shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="card-title mb-1">Pengaduan / Aspirasi</h5>
                            <p class="text-muted mb-2">
                                <small><i class="bi bi-calendar"></i> <?= date('d F Y H:i', strtotime($ad['tanggal_pengaduan'])) ?></small>
                            </p>
                            <p><strong>Isi Pengaduan:</strong></p>
                            <div class="p-3 bg-light rounded mb-3">
                                <?= nl2br(htmlspecialchars($ad['isi_aduan'])) ?>
                            </div>

                            <?php if ($ad['balasan_admin']): ?>
                            <div class="alert alert-info">
                                <strong>Balasan dari Admin Desa:</strong><br>
                                <?= nl2br(htmlspecialchars($ad['balasan_admin'])) ?>
                            </div>
                            <?php elseif ($ad['status'] === 'Diproses'): ?>
                            <div class="alert alert-warning">
                                Pengaduan Anda sedang diproses oleh tim desa.
                            </div>
                            <?php endif; ?>
                        </div>
                        <div class="text-end">
                            <?php
                            $badge_class = match($ad['status']) {
                                'Baru' => 'bg-danger',
                                'Diproses' => 'bg-warning',
                                'Selesai' => 'bg-success',
                                default => 'bg-secondary'
                            };
                            ?>
                            <span class="badge <?= $badge_class ?> badge-status py-2 px-3"><?= $ad['status'] ?></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php endforeach; ?>

    </div>
    <?php endif; ?>

</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>