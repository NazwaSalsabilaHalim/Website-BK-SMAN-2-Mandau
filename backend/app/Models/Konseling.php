<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Konseling extends Model
{
    protected $table = 'konseling';

    protected $fillable = [
        'siswa_id',
        'guru_bk_id',
        'jenis_layanan',
        'topik',
        'deskripsi',
        'tanggal',
        'waktu',
        'status',
        'alasan_penolakan',
        'deskripsi_kegiatan',
        'hasil_konseling',
        'evaluasi',
        'rencana_tindak_lanjut',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'rencana_tindak_lanjut' => 'array',
        ];
    }

    public function siswa(): BelongsTo
    {
        return $this->belongsTo(Siswa::class);
    }

    public function guruBk(): BelongsTo
    {
        return $this->belongsTo(GuruBk::class);
    }
}