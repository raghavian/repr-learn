import React, { useEffect, useRef, useState } from 'react';


<div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
<input
value={axis.x}
onChange={e => setAxis(a => ({ ...a, x: e.target.value }))}
placeholder="Name X axis"
style={{ border: '1px solid #ccc', borderRadius: 8, padding: '8px 10px' }}
/>
<input
value={axis.y}
onChange={e => setAxis(a => ({ ...a, y: e.target.value }))}
placeholder="Name Y axis"
style={{ border: '1px solid #ccc', borderRadius: 8, padding: '8px 10px' }}
/>
</div>


<div
ref={containerRef}
style={{ position: 'relative', width: '90vw', height: '70vh', maxWidth: 1200, border: '1px solid #ddd', background: '#f7f7f7', borderRadius: 12, overflow: 'hidden' }}
>
{/* Grid */}
<svg className="grid" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
{Array.from({ length: 40 }).map((_, i) => (
<line key={'v' + i} x1={i * 50} y1={0} x2={i * 50} y2="100%" stroke="rgba(0,0,0,0.06)" />
))}
{Array.from({ length: 30 }).map((_, i) => (
<line key={'h' + i} x1={0} y1={i * 50} x2="100%" y2={i * 50} stroke="rgba(0,0,0,0.06)" />
))}
<line x1="50%" y1={0} x2="50%" y2="100%" stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
<line x1={0} y1="50%" x2="100%" y2="50%" stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
</svg>


{/* Items */}
{items.map(it => (
<motion.img
key={it.src}
src={it.src}
alt={it.label}
drag
dragMomentum={false}
dragElastic={0}
dragConstraints={bounds}
initial={{ x: it.x, y: it.y }}
onDrag={(e, info) => {
const { x, y } = info.point;
setItems(prev => prev.map(p => (p.src === it.src ? { ...p, x, y, z: 999 } : p)));
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


<div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
<button onClick={exportCSV} style={{ background: '#2563eb', color: '#fff', padding: '8px 12px', borderRadius: 8 }}>Export CSV</button>
<button onClick={resetLayout} style={{ background: '#6b7280', color: '#fff', padding: '8px 12px', borderRadius: 8 }}>Reset Layout</button>
<button onClick={reshuffle} style={{ background: '#16a34a', color: '#fff', padding: '8px 12px', borderRadius: 8 }}>New Random Subset</button>
</div>
</div>
);
}
