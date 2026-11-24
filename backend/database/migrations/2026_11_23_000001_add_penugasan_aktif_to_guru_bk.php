<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guru_bk', function (Blueprint $table) {
            $table->string('penugasan')->default('Guru BK')->after('no_hp');
            $table->boolean('aktif')->default(true)->after('penugasan');
        });
    }

    public function down(): void
    {
        Schema::table('guru_bk', function (Blueprint $table) {
            $table->dropColumn(['penugasan', 'aktif']);
        });
    }
};
