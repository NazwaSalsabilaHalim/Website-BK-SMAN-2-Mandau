<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GuruBk extends Model
{
    protected $table = 'guru_bk';

    protected $fillable = ['user_id', 'nip', 'no_hp'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function siswa(): HasMany
    {
        return $this->hasMany(Siswa::class);
    }

    public function konseling(): HasMany
    {
        return $this->hasMany(Konseling::class);
    }
}
