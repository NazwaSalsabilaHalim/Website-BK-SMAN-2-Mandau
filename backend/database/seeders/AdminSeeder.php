<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $username = env('SEED_ADMIN_USERNAME');
        $password = env('SEED_ADMIN_PASSWORD');

        if (!$username || !$password) {
            return;
        }

        if (User::where('username', $username)->exists()) {
            return;
        }

        User::create([
            'name'     => 'Administrator BK',
            'username' => $username,
            'password' => Hash::make($password),
            'role'     => 'admin',
            'email'    => null,
        ]);
    }
}