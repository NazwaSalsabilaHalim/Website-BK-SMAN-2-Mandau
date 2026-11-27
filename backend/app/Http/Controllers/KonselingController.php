<?php

namespace App\Http\Controllers;

use App\Models\Konseling;
use App\Models\GuruBk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KonselingController extends Controller
{
    /** Kategori di tampilan => nilai jenis_layanan di database */
    private const KATEGORI_KE_LAYANAN = [
        'Akademik' => 'Layanan Belajar',
        'Pribadi'  => 'Layanan Pribadi',
        'Karier'   => 'Layanan Karier',
        'Sosial'   => 'Layanan Sosial',
    ];

    /** GET /api/konseling - admin: semua, guru_bk: miliknya, siswa: miliknya */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Konseling::with(['siswa.user', 'guruBk.user']);

        if ($user->role === 'guru_bk') {
            $query->where('guru_bk_id', $user->guruBk?->id ?? 0);
        } elseif ($user->role === 'siswa') {
            $query->where('siswa_id', $user->siswa?->id ?? 0);
        }

        return response()->json(
            $query->orderByDesc('tanggal')->orderByDesc('id')->get()
                ->map(fn ($k) => $this->format($k))
        );
    }

    /** GET /api/konseling/{id} - detail (hanya pemilik atau admin) */
    public function show(Request $request, Konseling $konseling): JsonResponse
    {
        $user = $request->user();

        $boleh = match ($user->role) {
            'admin'   => true,
            'guru_bk' => (int) $user->guruBk?->id === (int) $konseling->guru_bk_id,
            'siswa'   => (int) $user->siswa?->id === (int) $konseling->siswa_id,
            default   => false,
        };

        if (! $boleh) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        return response()->json($this->format($konseling->load(['siswa.user', 'guruBk.user'])));
    }

    /** POST /api/konseling - siswa mengajukan */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'guru_bk_id' => ['required', Rule::exists('guru_bk', 'id')->where('aktif', 1)],
            'kategori'   => ['required', Rule::in(array_keys(self::KATEGORI_KE_LAYANAN))],
            'topik'      => ['required', 'string', 'max:255'],
            'deskripsi'  => ['required', 'string'],
            'tanggal'    => ['required', 'date', 'after_or_equal:today'],
            'waktu'      => ['required', 'date_format:H:i'],
        ]);

        $siswaId = $request->user()->siswa?->id;
        if (! $siswaId) {
            return response()->json(['message' => 'Profil siswa tidak ditemukan.'], 403);
        }

        $konseling = Konseling::create([
            'siswa_id'      => $siswaId,
            'guru_bk_id'    => $data['guru_bk_id'],
            'jenis_layanan' => self::KATEGORI_KE_LAYANAN[$data['kategori']],
            'topik'         => $data['topik'],
            'deskripsi'     => $data['deskripsi'],
            'tanggal'       => $data['tanggal'],
            'waktu'         => $data['waktu'],
            'status'        => 'menunggu',
        ]);

        return response()->json($this->format($konseling->load(['siswa.user', 'guruBk.user'])), 201);
    }

    /** PATCH /api/konseling/{id}/status - guru menerima (boleh ubah jadwal) atau menolak */
    public function updateStatus(Request $request, Konseling $konseling): JsonResponse
    {
        if ($tolak = $this->bukanMilikGuru($request, $konseling)) {
            return $tolak;
        }

        if ($konseling->status !== 'menunggu') {
            return response()->json(
                ['message' => 'Hanya permohonan berstatus menunggu yang bisa diproses.'],
                422
            );
        }

        $data = $request->validate([
            'status'           => ['required', Rule::in(['disetujui', 'ditolak'])],
            'alasan_penolakan' => ['required_if:status,ditolak', 'nullable', 'string', 'max:1000'],
            'tanggal'          => ['nullable', 'date', 'after_or_equal:today'],
            'waktu'            => ['nullable', 'date_format:H:i'],
        ]);

        $ubah = [
            'status'           => $data['status'],
            'alasan_penolakan' => $data['status'] === 'ditolak' ? $data['alasan_penolakan'] : null,
        ];

        if ($data['status'] === 'disetujui') {
            if (! empty($data['tanggal'])) {
                $ubah['tanggal'] = $data['tanggal'];
            }
            if (! empty($data['waktu'])) {
                $ubah['waktu'] = $data['waktu'];
            }
        }

        $konseling->update($ubah);

        return response()->json($this->format($konseling->fresh()->load(['siswa.user', 'guruBk.user'])));
    }

    /** PATCH /api/konseling/{id}/hasil - guru mengisi hasil (dari disetujui / perlu pertemuan lanjutan) */
    public function isiHasil(Request $request, Konseling $konseling): JsonResponse
    {
        if ($tolak = $this->bukanMilikGuru($request, $konseling)) {
            return $tolak;
        }

        if (! in_array($konseling->status, ['disetujui', 'perlu_pertemuan_lanjutan'], true)) {
            return response()->json(
                ['message' => 'Hasil hanya bisa diisi untuk permohonan yang sudah disetujui.'],
                422
            );
        }

        $data = $request->validate([
            'status'                        => ['required', Rule::in(['selesai', 'perlu_pertemuan_lanjutan'])],
            'deskripsi_kegiatan'            => ['required', 'string'],
            'hasil_konseling'               => ['required', 'string'],
            'evaluasi'                      => ['required', 'string'],
            'rencana_tindak_lanjut'         => ['nullable', 'array', 'max:10'],
            'rencana_tindak_lanjut.*.judul' => ['required', 'string', 'max:150'],
            'rencana_tindak_lanjut.*.isi'   => ['required', 'string'],
        ]);

        $konseling->update($data);

        return response()->json($this->format($konseling->fresh()->load(['siswa.user', 'guruBk.user'])));
    }

        /** GET /api/guru-bk-pilihan - daftar Guru BK aktif untuk form pengajuan siswa */
    public function guruPilihan(): JsonResponse
    {
        $guru = GuruBk::with('user')->where('aktif', 1)->get()
            ->map(fn ($g) => [
                'id'        => $g->id,
                'nama'      => $g->user?->name ?? '',
                'penugasan' => $g->penugasan,
            ])
            ->sortBy('nama')
            ->values();

        return response()->json($guru);
    }
    
    /** 403 kalau konseling ini bukan milik guru yang login. */
    private function bukanMilikGuru(Request $request, Konseling $konseling): ?JsonResponse
    {
        $guruId = (int) $request->user()->guruBk?->id;

        if ($guruId === 0 || (int) $konseling->guru_bk_id !== $guruId) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        return null;
    }

    private function kategori(?string $jenis): string
    {
        $kunci = array_search($jenis, self::KATEGORI_KE_LAYANAN, true);

        return $kunci !== false ? $kunci : preg_replace('/^Layanan\s+/', '', (string) $jenis);
    }

    private function format(Konseling $k): array
    {
        return [
            'id'                    => $k->id,
            'siswa'                 => $k->siswa?->user?->name ?? '',
            'nis'                   => $k->siswa?->nis ?? '',
            'kelas'                 => $k->siswa?->kelas ?? '',
            'guru_bk_id'            => $k->guru_bk_id,
            'guru'                  => $k->guruBk?->user?->name ?? '',
            'kategori'              => $this->kategori($k->jenis_layanan),
            'jenis_layanan'         => $k->jenis_layanan,
            'topik'                 => $k->topik,
            'deskripsi'             => $k->deskripsi,
            'tanggal'               => $k->tanggal?->toDateString() ?? '',
            'waktu'                 => substr((string) $k->waktu, 0, 5),
            'status'                => $k->status,
            'alasan_penolakan'      => $k->alasan_penolakan ?? '',
            'deskripsi_kegiatan'    => $k->deskripsi_kegiatan ?? '',
            'hasil_konseling'       => $k->hasil_konseling ?? '',
            'evaluasi'              => $k->evaluasi ?? '',
            'rencana_tindak_lanjut' => $k->rencana_tindak_lanjut ?? [],
            'dibuat'                => $k->created_at?->toIso8601String() ?? '',
            'diperbarui'            => $k->updated_at?->toIso8601String() ?? '',
        ];
    }
}