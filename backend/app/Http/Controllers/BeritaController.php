<?php

namespace App\Http\Controllers;

use App\Models\Berita;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BeritaController extends Controller
{
    /** GET /api/berita */
    public function index(Request $request): JsonResponse
    {
        $query = Berita::with('penulis')
            ->orderByDesc('published_at')
            ->orderByDesc('created_at');

        // Jika dipanggil oleh publik (bukan admin login), hanya tampilkan yang sudah published
        $user = $request->user('sanctum');
        if (!$user || $user->role !== 'admin') {
            $query->whereNotNull('published_at');
        }

        $berita = $query->get()->map(fn($b) => $this->format($b));

        return response()->json($berita);
    }

    /** GET /api/berita/{id} */
    public function show(Berita $berita): JsonResponse
    {
        return response()->json($this->format($berita->load('penulis')));
    }

    /** POST /api/berita */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'judul'     => ['required', 'string', 'min:5', 'max:255'],
            'kategori'  => ['required', Rule::in(['BK', 'PIK-R'])],
            'ringkasan' => ['required', 'string', 'max:300'],
            'isi'       => ['required', 'string', 'min:20'],
            'status'    => ['required', Rule::in(['draft', 'published'])],
            'tanggal'   => ['nullable', 'date'],
            'gambar'    => ['nullable', 'string'],
        ]);

        $berita = Berita::create([
            'user_id'      => $request->user()->id,
            'judul'        => $data['judul'],
            'slug'         => Str::slug($data['judul']) . '-' . Str::random(6),
            'kategori'     => $data['kategori'],
            'ringkasan'    => $data['ringkasan'],
            'isi'          => $data['isi'],
            'gambar'       => $data['gambar'] ?? null,
            'published_at' => $data['status'] === 'published' ? ($data['tanggal'] ?? now()) : null,
        ]);

        return response()->json($this->format($berita->load('penulis')), 201);
    }

    /** PUT /api/berita/{id} */
    public function update(Request $request, Berita $berita): JsonResponse
    {
        $data = $request->validate([
            'judul'     => ['required', 'string', 'min:5', 'max:255'],
            'kategori'  => ['required', Rule::in(['BK', 'PIK-R'])],
            'ringkasan' => ['required', 'string', 'max:300'],
            'isi'       => ['required', 'string', 'min:20'],
            'status'    => ['required', Rule::in(['draft', 'published'])],
            'tanggal'   => ['nullable', 'date'],
            'gambar'    => ['nullable', 'string'],
        ]);

        $berita->update([
            'judul'        => $data['judul'],
            'ringkasan'    => $data['ringkasan'],
            'kategori'     => $data['kategori'],
            'isi'          => $data['isi'],
            'gambar'       => $data['gambar'] ?? $berita->gambar,
            'published_at' => $data['status'] === 'published' ? ($data['tanggal'] ?? $berita->published_at ?? now()) : null,
        ]);

        return response()->json($this->format($berita->fresh()->load('penulis')));
    }

    /** DELETE /api/berita/{id} */
    public function destroy(Berita $berita): JsonResponse
    {
        $berita->delete();

        return response()->json(['message' => 'Berita berhasil dihapus.']);
    }

    private function format(Berita $b): array
    {
        $published = $b->published_at;

        return [
            'id'        => $b->id,
            'judul'     => $b->judul,
            'slug'      => $b->slug,
            'kategori'  => $b->kategori,
            'ringkasan' => $b->ringkasan,
            'isi'       => $b->isi,
            'gambar'    => $b->gambar ?? '',
            'status'    => $published ? 'published' : 'draft',
            'tanggal'   => $published ? $published->toDateString() : '',
            'tayangan'  => 0, // akan ditambah nanti dengan sistem view counter
        ];
    }
}
