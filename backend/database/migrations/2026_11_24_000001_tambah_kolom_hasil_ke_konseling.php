<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('konseling', function (Blueprint $table) {
            $table->text('deskripsi_kegiatan')->nullable()->after('hasil_konseling');
            $table->text('evaluasi')->nullable()->after('deskripsi_kegiatan');
            $table->json('rencana_tindak_lanjut')->nullable()->after('evaluasi');
        });

        DB::statement("ALTER TABLE konseling MODIFY status ENUM('menunggu','disetujui','ditolak','selesai','perlu_pertemuan_lanjutan') NOT NULL DEFAULT 'menunggu'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE konseling MODIFY status ENUM('menunggu','disetujui','ditolak','selesai') NOT NULL DEFAULT 'menunggu'");

        Schema::table('konseling', function (Blueprint $table) {
            $table->dropColumn(['deskripsi_kegiatan', 'evaluasi', 'rencana_tindak_lanjut']);
        });
    }
};