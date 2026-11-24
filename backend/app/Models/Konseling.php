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
        'hasil_konseling',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
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
