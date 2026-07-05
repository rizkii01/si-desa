const { validateSmartLetterFields } = require('../letterValidation');

describe('validateSmartLetterFields', () => {
  describe('SKD - Surat Keterangan Domisili', () => {
    it('should return empty array for valid SKD data', () => {
      const formData = {
        tujuan_domisili: 'PT Maju Mundur',
        lama_tinggal: '5 tahun',
        keperluan: 'Untuk keperluan pendirian perusahaan'
      };
      const errors = validateSmartLetterFields('SKD', formData);
      expect(errors).toEqual([]);
    });

    it('should return errors for all required fields when SKD data is empty', () => {
      const formData = {};
      const errors = validateSmartLetterFields('SKD', formData);
      expect(errors).toContain("Field 'Tujuan Domisili' wajib diisi");
      expect(errors).toContain("Field 'Lama Tinggal' wajib diisi");
      expect(errors).toContain("Field 'Keperluan Pengajuan' wajib diisi");
    });
  });

  describe('SKK - Surat Keterangan Kelahiran/Kematian', () => {
    describe('sub_jenis: Kelahiran', () => {
      it('should return errors when Kelahiran fields are missing', () => {
        const formData = {
          sub_jenis: 'Kelahiran'
        };
        const errors = validateSmartLetterFields('SKK', formData);
        expect(errors).toContain("Field 'Nama Bayi' wajib diisi");
        expect(errors).toContain("Field 'Tanggal Lahir' wajib diisi");
        expect(errors).toContain("Field 'Tempat Lahir' wajib diisi");
        expect(errors).toContain("Field 'Jenis Kelamin Bayi' wajib diisi");
        expect(errors).toContain("Field 'Nama Ayah' wajib diisi");
        expect(errors).toContain("Field 'Nama Ibu' wajib diisi");
        expect(errors).toContain("Field 'Nama Saksi' wajib diisi");
        expect(errors).toContain("Field 'Nama Bayi' wajib diisi untuk Kelahiran");
        expect(errors).toContain("Field 'Tanggal Lahir' wajib diisi untuk Kelahiran");
        expect(errors).toContain("Field 'Tempat Lahir' wajib diisi untuk Kelahiran");
        expect(errors).toContain("Field 'Jenis Kelamin Bayi' wajib diisi untuk Kelahiran");
        expect(errors).toContain("Field 'Nama Ayah' wajib diisi untuk Kelahiran");
        expect(errors).toContain("Field 'Nama Ibu' wajib diisi untuk Kelahiran");
      });

      it('should return empty array for valid Kelahiran data', () => {
        const formData = {
          sub_jenis: 'Kelahiran',
          nama_bayi: 'Ahmad Budi',
          tanggal_lahir_bayi: '2026-07-15',
          tempat_lahir_bayi: 'RSUD Cemara',
          jenis_kelamin_bayi: 'Laki-laki',
          nama_ayah: 'Sugianto',
          nama_ibu: 'Lintang',
          nama_saksi: 'Kepala Desa'
        };
        const errors = validateSmartLetterFields('SKK', formData);
        expect(errors).toEqual([]);
      });
    });

    describe('sub_jenis: Kematian', () => {
      it('should return errors when Kematian fields are missing', () => {
        const formData = {
          sub_jenis: 'Kematian'
        };
        const errors = validateSmartLetterFields('SKK', formData);
        expect(errors).toContain("Field 'Nama Almarhum/ah' wajib diisi");
        expect(errors).toContain("Field 'Tanggal Meninggal' wajib diisi");
        expect(errors).toContain("Field 'Tempat Meninggal' wajib diisi");
        expect(errors).toContain("Field 'Penyebab Kematian' wajib diisi");
        expect(errors).toContain("Field 'Hubungan Pelapor' wajib diisi");
        expect(errors).toContain("Field 'Nama Almarhum/ah' wajib diisi untuk Kematian");
        expect(errors).toContain("Field 'Tanggal Meninggal' wajib diisi untuk Kematian");
        expect(errors).toContain("Field 'Tempat Meninggal' wajib diisi untuk Kematian");
        expect(errors).toContain("Field 'Penyebab Kematian' wajib diisi untuk Kematian");
        expect(errors).toContain("Field 'Hubungan Pelapor' wajib diisi untuk Kematian");
      });

      it('should return empty array for valid Kematian data', () => {
        const formData = {
          sub_jenis: 'Kematian',
          nama_almarhum: 'Sukarni',
          tanggal_meninggal: '2026-07-10',
          tempat_meninggal: 'RSUD Cemara',
          penyebab_kematian: 'Koma',
          hubungan_pelapor: 'Anak'
        };
        const errors = validateSmartLetterFields('SKK', formData);
        expect(errors).toEqual([]);
      });
    });

    it('should return error when sub_jenis is missing or invalid', () => {
      const formData1 = {};
      const formData2 = { sub_jenis: 'Invalid' };
      const errors1 = validateSmartLetterFields('SKK', formData1);
      const errors2 = validateSmartLetterFields('SKK', formData2);
      expect(errors1).toContain("Field 'Jenis Keterangan' harus 'Kelahiran' atau 'Kematian'");
      expect(errors2).toContain("Field 'Jenis Keterangan' harus 'Kelahiran' atau 'Kematian'");
    });
  });

  describe('Unknown jenis_surat', () => {
    it('should return error when jenis_surat is not recognized', () => {
      const formData = {};
      const errors = validateSmartLetterFields('INVALID', formData);
      expect(errors).toEqual(["Jenis surat 'INVALID' tidak dikenal"]);
    });
  });
});
