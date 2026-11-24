<?php

namespace App\Http\Controllers;

use App\Models\GuruBk;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class GuruBkController extends Controller
{
    /** GET /api/guru-bk */
    public function index(): JsonResponse
    {
        $guru = GuruBk::with('user')
            ->withCount('siswa')
            ->get()
            ->map(fn($g) => $this->format($g));

        return response()->json($guru);
    }

    /** POST /api/guru-bk */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nama'      => ['required', 'string', 'max:255'],
            'nip'       => ['nullable', 'string', 'digits:18', 'unique:guru_bk,nip'],
            'username'  => ['required', 'string', 'min:4', 'max:30', 'regex:/^[a-z0-9._]+$/', 'unique:users,username'],
            'password'  => ['required', 'string', 'min:8'],
            'penugasan' => ['required', 'string', 'max:100'],
            'no_hp'     => ['nullable', 'string', 'max:20'],
            'aktif'     => ['boolean'],
        ]);

        $guru = DB::transaction(function () use ($data) {
            $user = User::create([
                'name'     => $data['nama'],
                'username' => $data['username'],
                'password' => Hash::make($data['password']),
                'role'     => 'guru_bk',
                'email'    => null,
            ]);

            return GuruBk::create([
                'user_id'   => $user->id,
                'nip'       => $data['nip'] ?? null,
                'no_hp'     => $data['no_hp'] ?? null,
                'penugasan' => $data['penugasan'],
                'aktif'     => $data['aktif'] ?? true,
            ]);
        });

        return response()->json($this->format($guru->load('user')->loadCount('siswa')), 201);
    }

    /** PUT /api/guru-bk/{id} */
    public function update(Request $request, GuruBk $guruBk): JsonResponse
    {
        $data = $request->validate([
            'nama'      => ['required', 'string', 'max:255'],
            'nip'       => ['nullable', 'string', 'digits:18', Rule::unique('guru_bk', 'nip')->ignore($guruBk->id)],
            'username'  => ['required', 'string', 'min:4', 'max:30', 'regex:/^[a-z0-9._]+$/', Rule::unique('users', 'username')->ignore($guruBk->user_id)],
            'password'  => ['nullable', 'string', 'min:8'],
            'penugasan' => ['required', 'string', 'max:100'],
            'no_hp'     => ['nullable', 'string', 'max:20'],
            'aktif'     => ['boolean'],
        ]);

        DB::transaction(function () use ($data, $guruBk) {
            $userUpdate = ['name' => $data['nama'], 'username' => $data['username']];
            if (!empty($data['password'])) {
                $userUpdate['password'] = Hash::make($data['password']);
            }
            $guruBk->user->update($userUpdate);

            $guruBk->update([
                'nip'       => $data['nip'] ?? null,
                'no_hp'     => $data['no_hp'] ?? null,
                'penugasan' => $data['penugasan'],
                'aktif'     => $data['aktif'] ?? $guruBk->aktif,
            ]);
        });

        return response()->json($this->format($guruBk->fresh()->load('user')->loadCount('siswa')));
    }

    /** DELETE /api/guru-bk/{id} */
    public function destroy(GuruBk $guruBk): JsonResponse
    {
        // Cascade: user delete -> guru_bk cascade
        $guruBk->user->delete();

        return response()->json(['message' => 'Guru BK berhasil dihapus.']);
    }

    private function format(GuruBk $g): array
    {
        return [
            'id'          => $g->id,
            'nip'         => $g->nip ?? '',
            'nama'        => $g->user->name ?? '',
            'username'    => $g->user->username ?? '',
            'penugasan'   => $g->penugasan ?? '',
            'no_hp'       => $g->no_hp ?? '',
            'aktif'       => (bool) ($g->aktif ?? true),
            'jumlahSiswa' => $g->siswa_count ?? 0,
        ];
    }
}
