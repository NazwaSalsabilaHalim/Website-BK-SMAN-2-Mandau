<?php

namespace Database\Seeders;

use App\Models\GuruBk;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class GuruBkSeeder extends Seeder
{
    public function run(): void
    {
        $password = env('SEED_GURU_PASSWORD');

        if (!$password) {
            return;
        }

        $guruData = [
            [
                'name' => 'Guru BK Demo 1',
                'username' => 'guru_bk_demo1',
                'penugasan' => 'Koordinator BK',
            ],
            [
                'name' => 'Guru BK Demo 2',
                'username' => 'guru_bk_demo2',
                'penugasan' => 'Guru BK',
            ],
            [
                'name' => 'Guru BK Demo 3',
                'username' => 'guru_bk_demo3',
                'penugasan' => 'Guru BK',
            ],
        ];

        foreach ($guruData as $entry) {
            if (User::where('username', $entry['username'])->exists()) {
                continue;
            }

            $user = User::create([
                'name' => $entry['name'],
                'username' => $entry['username'],
                'password' => Hash::make($password),
                'role' => 'guru_bk',
                'email' => null,
            ]);

            GuruBk::create([
                'nip' => null,
                'no_hp' => null,
                'penugasan' => $entry['penugasan'],
                'aktif' => true,
                'user_id' => $user->id,
            ]);
        }
    }
}