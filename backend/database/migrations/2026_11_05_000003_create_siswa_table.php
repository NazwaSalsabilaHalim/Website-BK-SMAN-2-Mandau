<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('siswa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('nis')->unique();
            $table->string('kelas');
            $table->string('no_hp')->nullable();
            // Guru BK pembimbing. Opsional: kosong berarti siswa memilih guru lewat form pengajuan.
            $table->foreignId('guru_bk_id')->nullable()->constrained('guru_bk')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('siswa');
    }
};
