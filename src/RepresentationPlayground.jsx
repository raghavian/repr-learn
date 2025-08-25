import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const SAMPLE_SIZE = 12;
const randomOffset = (r = 40) => (Math.random() - 0.5) * r;

function sample(arr, n) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

export default function RepresentationPlayground() {
  const [diagnostics, setDiagnostics] = useState({
    base: import.meta.env.BASE_URL,
    manifestOk: null,
    manifestLen: 0,
    error: null,
  });
  const [items, setItems] = useState([]);
  const [axis, setAxis] = useState({ x: 'X', y: 'Y' });
  const containerRef = useRef(null);
  const [bounds, setBounds] = useState(null);

  useEffect(() => {
    // 1) Fetch manifest relative to BASE_URL
    const base = import.meta.env.BASE_URL; // usually "/" in dev
    const url = base + 'data.json';
    console.log('[diag] BASE_URL =', base, 'fetching', url);

    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
        const raw = await r.json();

        // 2) Normalize each src ONCE: strip any leading slash, then prefix with BASE_URL
        const normalized = raw.map((d) => {
          const clean = d.src.replace(/^\/+/, '');
          const resolved = base + clean;
          return { ...d, src: resolved };
        });

        // Log a couple of example URLs so you can click them in devtools
        console.log('[diag] first 3 resolved image URLs:', normalized.slice(0, 3).map(d => d.src));

        const subset = sample(normalized, Math.min(SAMPLE_SIZE, normalized.length));
        setItems(
          subset.map((d, i) => ({
            ...d,
            x: 300 + randomOffset(40),
            y: 200 + randomOffset(40),
            z: i,
          }))
        );
        setDiagnostics((s) => ({ ...s, manifestOk: true, manifestLen: raw.length, error: null }));
      })
      .catch((e) => {
        console.error('[diag] manifest fetch failed:', e);
        setDiagnostics((s) => ({ ...s, manifestOk: false, error: String(e) }));
      });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setBounds({ left: 0, top: 0, right: rect.width - 100, bottom: rect.height - 100 });
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: 1200 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Representation Learning Playground</h1>

      {/* Diagnostics block */}
      <div style={{ fontFamily: 'monospace', fontSize: 13, background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: 8, padding: 10, marginBottom: 10 }}>
        <div>BASE_URL: {diagnostics.base}</div>
        <div>data.json: {diagnostics.manifestOk === null ? 'loading…' : diagnostics.manifestOk ? 'OK' : 'FAILED'}</div>
        <div>manifest entries: {diagnostics.manifestLen}</div>
        {diagnostics.error && <div style={{ color: '#b91c1c' }}>error: {diagnostics.error}</div>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={axis.x}
          onChange={(e) => setAxis((a) => ({ ...a, x: e.target.value }))}
          placeholder="Name X axis"
          style={{ border: '1px solid #ccc', borderRadius: 8, padding: '8px 10px' }}
        />
        <input
          value={axis.y}
          onChange={(e) => setAxis((a) => ({ ...a, y: e.target.value }))}
          placeholder="Name Y axis"
          style={{ border: '1px solid #ccc', borderRadius: 8, padding: '8px 10px' }}
        />
      </div>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '90vw',
          height: '70vh',
          maxWidth: 1200,
          border: '1px solid #ddd',
          background: '#fafafa',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {/* grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <line key={'v' + i} x1={i * 50} y1={0} x2={i * 50} y2="100%" stroke="rgba(0,0,0,0.06)" />
          ))}
          {Array.from({ length: 30 }).map((_, i) => (
            <line key={'h' + i} x1={0} y1={i * 50} x2="100%" y2={i * 50} stroke="rgba(0,0,0,0.06)" />
          ))}
          <line x1="50%" y1={0} x2="50%" y2="100%" stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
          <line x1={0} y1="50%" x2="100%" y2="50%" stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
        </svg>

        {items.map((it) => (
          <motion.img
            key={it.src}
            src={it.src}
            alt={it.label}
            drag
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={bounds}
            initial={{ x: it.x, y: it.y }}
            onError={(e) => {
              console.error('[diag] image failed to load:', it.src);
              e.currentTarget.style.opacity = 0.3;
              e.currentTarget.title = 'Failed to load: ' + it.src;
            }}
            style={{
              width: 100,
              height: 100,
              position: 'absolute',
              cursor: 'grab',
              borderRadius: 12,
              zIndex: it.z,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

