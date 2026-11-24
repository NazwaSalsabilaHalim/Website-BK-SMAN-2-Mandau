<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Siswa extends Model
{
    protected $table = 'siswa';

    protected $fillable = ['user_id', 'nis', 'kelas', 'no_hp', 'guru_bk_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function guruBk(): BelongsTo
    {
        return $this->belongsTo(GuruBk::class);
    }

    public function konseling(): HasMany
    {
        return $this->hasMany(Konseling::class);
    }
}
