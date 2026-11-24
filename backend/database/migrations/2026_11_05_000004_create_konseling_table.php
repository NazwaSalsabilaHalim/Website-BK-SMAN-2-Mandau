<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('konseling', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->cascadeOnDelete();
            $table->foreignId('guru_bk_id')->constrained('guru_bk')->cascadeOnDelete();

            // Diisi siswa saat mengajukan (KF02)
            $table->string('jenis_layanan');
            $table->string('topik');
            $table->text('deskripsi');
            $table->date('tanggal');
            $table->time('waktu');

            // Diisi guru BK (KF09, KF10)
            $table->enum('status', ['menunggu', 'disetujui', 'ditolak', 'selesai'])->default('menunggu');
            $table->text('alasan_penolakan')->nullable();
            $table->text('hasil_konseling')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('konseling');
    }
};
