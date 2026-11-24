<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BeritaController;
use App\Http\Controllers\GuruBkController;
use App\Http\Controllers\KonselingController;
use App\Http\Controllers\SiswaController;
use Illuminate\Support\Facades\Route;

// ─── Publik ─────────────────────────────────────────────────────────────────
Route::post('/login',  [AuthController::class, 'login']);
Route::get('/berita',  [BeritaController::class, 'index']); // Publik (landing page)
Route::get('/berita/{berita}', [BeritaController::class, 'show']); // Publik detail berita

// ─── Autentikasi wajib ──────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // ── Guru BK (admin only) ──────────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('guru-bk', GuruBkController::class);
        Route::apiResource('siswa',   SiswaController::class);
    });

    // ── Berita (admin kelola) ─────────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::post('/berita',          [BeritaController::class, 'store']);
        Route::put('/berita/{berita}',  [BeritaController::class, 'update']);
        Route::delete('/berita/{berita}', [BeritaController::class, 'destroy']);
    });

    // ── Konseling ─────────────────────────────────────────────────────────
    Route::get('/konseling', [KonselingController::class, 'index']);  // admin/guru/siswa (difilter di controller)
    Route::middleware('role:siswa')->group(function () {
        Route::post('/konseling', [KonselingController::class, 'store']);
    });
    Route::middleware('role:admin,guru_bk')->group(function () {
        Route::patch('/konseling/{konseling}/status', [KonselingController::class, 'updateStatus']);
    });
});
