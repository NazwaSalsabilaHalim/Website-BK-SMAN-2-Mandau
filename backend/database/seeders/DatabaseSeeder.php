<?php

namespace Database\Seeders;

use App\Models\GuruBk;
use App\Models\Siswa;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed data nyata SMAN 2 Mandau.
     * Password default: bk_sman2_2025
     * Semua idempotent — aman dijalankan ulang.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            GuruBkSeeder::class,
        ]);

        $password = env('SEED_DEMO_PASSWORD');

        if (!$password) {
            return;
        }

        $guruDemo = User::updateOrCreate(
            ['username' => 'guru1'],
            [
                'name' => 'Guru BK Demo',
                'password' => Hash::make($password),
                'role' => 'guru_bk',
                'email' => null,
            ]
        );

        $guru = GuruBk::updateOrCreate(
            ['user_id' => $guruDemo->id],
            [
                'nip' => null,
                'no_hp' => null,
                'penugasan' => 'Guru BK',
                'aktif' => true,
            ]
        );

        $siswaDemo = User::updateOrCreate(
            ['username' => 'siswa1'],
            [
                'name' => 'Siswa Demo',
                'password' => Hash::make($password),
                'role' => 'siswa',
                'email' => null,
            ]
        );

        Siswa::updateOrCreate(
            ['user_id' => $siswaDemo->id],
            [
                'nis' => '2024001',
                'kelas' => 'XI IPA 1',
                'no_hp' => null,
                'guru_bk_id' => $guru->id,
            ]
        );
    }
}