<?php

namespace App\Http\Controllers;

use App\Models\Konseling;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KonselingController extends Controller
{
    /** GET /api/konseling  — admin: semua, guru_bk: miliknya, siswa: miliknya */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Konseling::with(['siswa.user', 'guruBk.user']);

        if ($user->role === 'guru_bk') {
            $query->where('guru_bk_id', $user->guruBk?->id);
        } elseif ($user->role === 'siswa') {
            $query->where('siswa_id', $user->siswa?->id);
        }
        // admin: tanpa filter

        $konseling = $query->orderByDesc('created_at')->get()->map(fn($k) => $this->format($k));

        return response()->json($konseling);
    }

    /** POST /api/konseling  — siswa mengajukan */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'guru_bk_id'    => ['required', 'exists:guru_bk,id'],
            'jenis_layanan' => ['required', 'string', 'max:100'],
            'topik'         => ['required', 'string', 'max:255'],
            'deskripsi'     => ['required', 'string'],
            'tanggal'       => ['required', 'date', 'after_or_equal:today'],
            'waktu'         => ['required', 'date_format:H:i'],
        ]);

        $siswaId = $request->user()->siswa?->id;
        if (!$siswaId) {
            return response()->json(['message' => 'Profil siswa tidak ditemukan.'], 403);
        }

        $konseling = Konseling::create([
            'siswa_id'      => $siswaId,
            'guru_bk_id'    => $data['guru_bk_id'],
            'jenis_layanan' => $data['jenis_layanan'],
            'topik'         => $data['topik'],
            'deskripsi'     => $data['deskripsi'],
            'tanggal'       => $data['tanggal'],
            'waktu'         => $data['waktu'],
            'status'        => 'menunggu',
        ]);

        return response()->json($this->format($konseling->load(['siswa.user', 'guruBk.user'])), 201);
    }

    /** PATCH /api/konseling/{id}/status  — guru BK memperbarui status */
    public function updateStatus(Request $request, Konseling $konseling): JsonResponse
    {
        $data = $request->validate([
            'status'           => ['required', Rule::in(['menunggu', 'disetujui', 'ditolak', 'selesai'])],
            'alasan_penolakan' => ['nullable', 'string'],
            'hasil_konseling'  => ['nullable', 'string'],
        ]);

        $konseling->update($data);

        return response()->json($this->format($konseling->fresh()->load(['siswa.user', 'guruBk.user'])));
    }

    private function format(Konseling $k): array
    {
        return [
            'id'               => $k->id,
            'siswa'            => $k->siswa?->user?->name ?? '',
            'kelas'            => $k->siswa?->kelas ?? '',
            'guru'             => $k->guruBk?->user?->name ?? '',
            'jenis_layanan'    => $k->jenis_layanan,
            'topik'            => $k->topik,
            'deskripsi'        => $k->deskripsi,
            'tanggal'          => $k->tanggal?->toDateString() ?? '',
            'waktu'            => $k->waktu,
            'status'           => $k->status,
            'alasan_penolakan' => $k->alasan_penolakan ?? '',
            'hasil_konseling'  => $k->hasil_konseling ?? '',
            'dibuat'           => $k->created_at?->toDateTimeString() ?? '',
        ];
    }
}
