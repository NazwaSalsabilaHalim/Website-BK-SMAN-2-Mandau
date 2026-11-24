<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class SiswaController extends Controller
{
    /** GET /api/siswa */
    public function index(): JsonResponse
    {
        $siswa = Siswa::with(['user', 'guruBk.user'])
            ->get()
            ->map(fn($s) => $this->format($s));

        return response()->json($siswa);
    }

    /** POST /api/siswa */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nama'       => ['required', 'string', 'max:255'],
            'nis'        => ['required', 'string', 'max:20', 'unique:siswa,nis'],
            'username'   => ['required', 'string', 'min:4', 'max:30', 'regex:/^[a-z0-9._]+$/', 'unique:users,username'],
            'password'   => ['required', 'string', 'min:8'],
            'kelas'      => ['required', 'string', 'max:30'],
            'no_hp'      => ['nullable', 'string', 'max:20'],
            'guru_bk_id' => ['nullable', 'exists:guru_bk,id'],
        ]);

        $siswa = DB::transaction(function () use ($data) {
            $user = User::create([
                'name'     => $data['nama'],
                'username' => $data['username'],
                'password' => Hash::make($data['password']),
                'role'     => 'siswa',
                'email'    => null,
            ]);

            return Siswa::create([
                'user_id'    => $user->id,
                'nis'        => $data['nis'],
                'kelas'      => $data['kelas'],
                'no_hp'      => $data['no_hp'] ?? null,
                'guru_bk_id' => $data['guru_bk_id'] ?? null,
            ]);
        });

        return response()->json($this->format($siswa->load(['user', 'guruBk.user'])), 201);
    }

    /** PUT /api/siswa/{id} */
    public function update(Request $request, Siswa $siswa): JsonResponse
    {
        $data = $request->validate([
            'nama'       => ['required', 'string', 'max:255'],
            'nis'        => ['required', 'string', 'max:20', Rule::unique('siswa', 'nis')->ignore($siswa->id)],
            'username'   => ['required', 'string', 'min:4', 'max:30', 'regex:/^[a-z0-9._]+$/', Rule::unique('users', 'username')->ignore($siswa->user_id)],
            'password'   => ['nullable', 'string', 'min:8'],
            'kelas'      => ['required', 'string', 'max:30'],
            'no_hp'      => ['nullable', 'string', 'max:20'],
            'guru_bk_id' => ['nullable', 'exists:guru_bk,id'],
        ]);

        DB::transaction(function () use ($data, $siswa) {
            $userUpdate = ['name' => $data['nama'], 'username' => $data['username']];
            if (!empty($data['password'])) {
                $userUpdate['password'] = Hash::make($data['password']);
            }
            $siswa->user->update($userUpdate);

            $siswa->update([
                'nis'        => $data['nis'],
                'kelas'      => $data['kelas'],
                'no_hp'      => $data['no_hp'] ?? null,
                'guru_bk_id' => $data['guru_bk_id'] ?? null,
            ]);
        });

        return response()->json($this->format($siswa->fresh()->load(['user', 'guruBk.user'])));
    }

    /** DELETE /api/siswa/{id} */
    public function destroy(Siswa $siswa): JsonResponse
    {
        $siswa->user->delete();

        return response()->json(['message' => 'Data siswa berhasil dihapus.']);
    }

    private function format(Siswa $s): array
    {
        return [
            'id'       => $s->id,
            'nis'      => $s->nis,
            'nama'     => $s->user->name ?? '',
            'username' => $s->user->username ?? '',
            'kelas'    => $s->kelas,
            'no_hp'    => $s->no_hp ?? '',
            'wali'     => $s->guruBk?->user?->name ?? '',
            'guru_bk_id' => $s->guru_bk_id,
        ];
    }
}
