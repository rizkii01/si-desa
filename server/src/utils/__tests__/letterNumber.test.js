const { generateLetterNumber } = require('../letterNumber');

describe('generateLetterNumber', () => {
  let mockConn;
  let mockQuery;

  beforeEach(() => {
    mockQuery = jest.fn();
    mockConn = { query: mockQuery };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate format 005/SKD/VII/2026 for fifth sequence', async () => {
    // Mock: first query inserts/updates, second query returns sequence 5
    mockQuery.mockResolvedValueOnce([{}]) // INSERT/UPDATE
      .mockResolvedValueOnce([[{ sequence_number: 5 }]]); // SELECT sequence

    const result = await generateLetterNumber(mockConn, 'SKD', new Date('2026-07-15'));

    expect(result).toBe('005/SKD/VII/2026');
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it('should generate format 001/SKTM/I/2026 for first sequence in January', async () => {
    mockQuery.mockResolvedValueOnce([{}]) // INSERT/UPDATE
      .mockResolvedValueOnce([[{ sequence_number: 1 }]]); // SELECT sequence

    const result = await generateLetterNumber(mockConn, 'SKTM', new Date('2026-01-15'));

    expect(result).toBe('001/SKTM/I/2026');
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it('should generate format with Roman month VII (July)', async () => {
    mockQuery.mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[{ sequence_number: 1 }]]);

    const result = await generateLetterNumber(mockConn, 'SKD', new Date('2026-07-15'));

    expect(result).toBe('001/SKD/VII/2026');
  });

  it('should generate format with Roman month I (January)', async () => {
    mockQuery.mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[{ sequence_number: 1 }]]);

    const result = await generateLetterNumber(mockConn, 'SKTM', new Date('2026-01-15'));

    expect(result).toBe('001/SKTM/I/2026');
  });

  it('should generate format with Roman month XII (December)', async () => {
    mockQuery.mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[{ sequence_number: 1 }]]);

    const result = await generateLetterNumber(mockConn, 'SKD', new Date('2026-12-15'));

    expect(result).toBe('001/SKD/XII/2026');
  });

  it('should handle sequence increment correctly', async () => {
    // First call returns sequence 5, second call should return sequence 6
    mockQuery.mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[{ sequence_number: 6 }]]);

    const result = await generateLetterNumber(mockConn, 'SKD', new Date('2026-07-15'));

    expect(result).toBe('006/SKD/VII/2026');
  });

  it('should validate jenis_surat types', async () => {
    const validTypes = ['SKD', 'SP', 'SKK', 'SKTM', 'SKU', 'SPN', 'SPORADIK'];
    const invalidTypes = ['INVALID', 'SK', 'SKDT', ''];
    
    // Test valid types
    for (const jenis of validTypes) {
      mockQuery.mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([[{ sequence_number: 1 }]]);

      const result = await generateLetterNumber(mockConn, jenis, new Date('2026-07-15'));
      expect(result).toBe(`001/${jenis}/VII/2026`);
    }
    
    // Test invalid types
    for (const jenis of invalidTypes) {
      await expect(generateLetterNumber(mockConn, jenis, new Date('2026-07-15')))
        .rejects.toThrow(`Invalid letter type: ${jenis}`);
    }
  });

  it('should pass correct parameters to database queries', async () => {
    mockQuery.mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[{ sequence_number: 1 }]]);

    await generateLetterNumber(mockConn, 'SKD', new Date('2026-07-15'));

    // First call: INSERT/UPDATE with jenis_surat, bulan, tahun
    expect(mockQuery).nthCalledWith(1, 
      'INSERT INTO letter_number_sequences (jenis_surat, bulan, tahun, sequence_number)\n     VALUES ($1, $2, $3, 1)\n     ON CONFLICT (jenis_surat, bulan, tahun) \n     DO UPDATE SET sequence_number = letter_number_sequences.sequence_number + 1',
      ['SKD', 7, 2026]
    );

    // Second call: SELECT sequence_number
    expect(mockQuery).nthCalledWith(2,
      'SELECT sequence_number FROM letter_number_sequences\n     WHERE jenis_surat = $1 AND bulan = $2 AND tahun = $3',
      ['SKD', 7, 2026]
    );
  });
});
