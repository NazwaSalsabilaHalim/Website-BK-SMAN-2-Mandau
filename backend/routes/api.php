<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BeritaController;
use App\Http\Controllers\GuruBkController;
use App\Http\Controllers\KonselingController;
use App\Http\Controllers\SiswaController;
use Illuminate\Support\Facades\Route;

// Publik
Route::post('/login', [AuthController::class, 'login']);
Route::get('/berita', [BeritaController::class, 'index']);
Route::get('/berita/{berita}', [BeritaController::class, 'show']);

// Wajib login
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Data siswa dan guru BK (admin saja)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('guru-bk', GuruBkController::class);
        Route::apiResource('siswa', SiswaController::class);
    });

    // Berita (admin kelola)
    Route::middleware('role:admin')->group(function () {
        Route::post('/berita', [BeritaController::class, 'store']);
        Route::put('/berita/{berita}', [BeritaController::class, 'update']);
        Route::delete('/berita/{berita}', [BeritaController::class, 'destroy']);
    });

    // Konseling
    Route::get('/konseling', [KonselingController::class, 'index']);
    Route::get('/konseling/{konseling}', [KonselingController::class, 'show']);

    Route::post('/konseling', [KonselingController::class, 'store'])
        ->middleware('role:siswa');
    Route::get('/guru-bk-pilihan', [KonselingController::class, 'guruPilihan'])
        ->middleware('role:siswa');

    Route::middleware('role:guru_bk')->group(function () {
        Route::patch('/konseling/{konseling}/status', [KonselingController::class, 'updateStatus']);
        Route::patch('/konseling/{konseling}/hasil', [KonselingController::class, 'isiHasil']);
    });
});