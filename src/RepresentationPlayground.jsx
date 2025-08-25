import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Default number of images sampled per view
const DEFAULT_SAMPLE_SIZE = 25;
const randomOffset = (r = 40) => (Math.random() - 0.5) * r;

function sampleWithSeed(arr, n, seed) {
  // Mulberry32 PRNG for reproducible subsets
  function mulberry32(a) {
    return function () {
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rnd = mulberry32(seed >>> 0);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}

export default function RepresentationPlayground() {
  const [items, setItems] = useState([]);
  const [axis, setAxis] = useState({ x: 'X', y: 'Y' });
  const [sampleSize, setSampleSize] = useState(DEFAULT_SAMPLE_SIZE);
  const [seed, setSeed] = useState(42);
  const [allData, setAllData] = useState([]);
  const containerRef = useRef(null);
  const [bounds, setBounds] = useState(null);

  // Load and normalize manifest once
  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    fetch(base + 'data.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} for ${base + 'data.json'}`);
        return r.json();
      })
      .then(raw => {
        const normalized = raw.map(d => ({
          ...d,
          src: base + d.src.replace(/^\/+/, '')
        }));
        setAllData(normalized);
      })
      .catch(err => {
        console.error('Failed to load data.json', err);
      });
  }, []);

  // Build a subset whenever sampleSize/seed/allData changes
  useEffect(() => {
    if (!allData.length) return;
    const subset = sampleWithSeed(allData, sampleSize, seed).map((d, i) => ({
      ...d,
      x: 300 + randomOffset(40),
      y: 200 + randomOffset(40),
      z: i
    }));
    setItems(subset);
  }, [allData, sampleSize, seed]);

  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setBounds({
      left: 0,
      top: 0,
      right: rect.width - 100,
      bottom: rect.height - 100
    });
  }, []);

  const resetLayout = () => {
    setItems(prev =>
      prev.map((d, i) => ({
        ...d,
        x: 300 + randomOffset(40),
        y: 200 + randomOffset(40),
        z: i
      }))
    );
  };

  const exportCSV = () => {
    const rows = [['src', 'label', 'x', 'y', 'axis_x', 'axis_y', 'seed', 'sample_size']];
    items.forEach(it =>
      rows.push([it.src, it.label, it.x, it.y, axis.x, axis.y, seed, sampleSize])
    );
    const csv =
      'data:text/csv;charset=utf-8,' +
      rows.map(r => r.join(',')).join('\\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = 'placements.csv';
    a.click();
  };

  return (
    <div style={{ width: '100%', maxWidth: 1200 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
        Representation Learning Playground (Data Science Lab, UCPH.)
      </h1>
        <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8, marginBottom: 16, background: '#fafafa' }}>
          <strong>Instructions:</strong> Drag the images into the 2D space so that similar
          items are closer. Use the input boxes to name the X and Y axes. 
           <br />
           Contact: raghav@di.ku.dk
        </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 12
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ opacity: 0.7 }}>samples</span>
          <input
            type="number"
            min={4}
            max={allData.length || 500}
            value={sampleSize}
            onChange={e =>
              setSampleSize(
                Math.max(1, parseInt(e.target.value || '0', 10))
              )
            }
            style={{
              width: 90,
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: '6px 8px'
            }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ opacity: 0.7 }}>seed</span>
          <input
            type="number"
            value={seed}
            onChange={e =>
              setSeed(parseInt(e.target.value || '0', 10))
            }
            style={{
              width: 120,
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: '6px 8px'
            }}
          />
        </label>
        <button
          onClick={() => setSeed(s => s + 1)}
          style={{
            background: '#16a34a',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 8
          }}
        >
          new subset
        </button>
        <button
          onClick={resetLayout}
          style={{
            background: '#6b7280',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 8
          }}
        >
          reset view
        </button>
      </div>

      {/* Axis labels */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={axis.x}
          onChange={e => setAxis(a => ({ ...a, x: e.target.value }))}
          placeholder="Name X axis"
          style={{
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: '8px 10px'
          }}
        />
        <input
          value={axis.y}
          onChange={e => setAxis(a => ({ ...a, y: e.target.value }))}
          placeholder="Name Y axis"
          style={{
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: '8px 10px'
          }}
        />
      </div>

      {/* Space */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '90vw',
          height: '70vh',
          maxWidth: 1200,
          border: '1px solid #ddd',
          background: '#f7f7f7',
          borderRadius: 12,
          overflow: 'hidden'
        }}
      >
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <line
              key={'v' + i}
              x1={i * 50}
              y1={0}
              x2={i * 50}
              y2="100%"
              stroke="rgba(0,0,0,0.06)"
            />
          ))}
          {Array.from({ length: 30 }).map((_, i) => (
            <line
              key={'h' + i}
              x1={0}
              y1={i * 50}
              x2="100%"
              y2={i * 50}
              stroke="rgba(0,0,0,0.06)"
            />
          ))}
          <line
            x1="50%"
            y1={0}
            x2="50%"
            y2="100%"
            stroke="rgba(0,0,0,0.25)"
            strokeWidth={2}
          />
          <line
            x1={0}
            y1="50%"
            x2="100%"
            y2="50%"
            stroke="rgba(0,0,0,0.25)"
            strokeWidth={2}
          />
      {/* bold axes */}
          <line
            x1="50%"
            y1={0}
            x2="50%"
            y2="100%"
            stroke="rgba(0,0,0,0.25)"
            strokeWidth={2}
          />
          <line
            x1={0}
            y1="50%"
            x2="100%"
            y2="50%"
            stroke="rgba(0,0,0,0.25)"
            strokeWidth={2}
          />

          {/* origin label */}
          <text
            x="50%"
            y="50%"
            fontSize="20"
            textAnchor="start"
            alignmentBaseline="hanging"
            fill="black"
           >
            0
            </text>
        </svg>

        {items.map(it => (
          <motion.img
            key={it.src}
            src={it.src}
            alt={it.label}
            drag
            dragMomentum={false}
            dragElastic={0}
            //dragConstraints={bounds}
            initial={{ x: it.x, y: it.y }}
            onDrag={(e, info) => {
              const { x, y } = info.point;
              setItems(prev =>
                prev.map(p =>
                  p.src === it.src ? { ...p, x, y, z: 999 } : p
                )
              );
            }}
            onError={e => {
              console.error('image failed to load:', it.src);
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          />
        ))}
      </div>
    </div>
  );
}

