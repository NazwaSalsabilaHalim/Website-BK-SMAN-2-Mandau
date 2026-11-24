import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** Warna dasar fallback kalau gambar gagal dimuat */
  fallbackFrom?: string;
  fallbackTo?: string;
  /** Teks inisial atau label fallback */
  fallbackText?: string;
};

/**
 * Tampilkan gambar dari /public. Kalau file belum ada,
 * tampil blok gradien (atau inisial) supaya layout tetap utuh.
 */
export default function SafeImage({
  src,
  alt,
  className = "",
  fallbackFrom = "#dbeafe",
  fallbackTo = "#bfdbfe",
  fallbackText,
}: Props) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={className}
        style={{
          background: `linear-gradient(135deg, ${fallbackFrom}, ${fallbackTo})`,
          display: fallbackText ? "flex" : undefined,
          alignItems: fallbackText ? "center" : undefined,
          justifyContent: fallbackText ? "center" : undefined,
          fontWeight: 700,
          color: "#1e40af",
        }}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
