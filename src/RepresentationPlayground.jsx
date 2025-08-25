import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SAMPLE_SIZE = 20;
const randomOffset = (range = 20) => (Math.random() - 0.5) * range;

export default function RepresentationPlayground() {
  const [images, setImages] = useState([]);
  const [positions, setPositions] = useState({});
  const [axisNames, setAxisNames] = useState({ x: "", y: "" });

  const loadSubset = async () => {
    const res = await fetch(import.meta.env.BASE_URL + "data.json");
    const raw = await res.json();
    const data = raw.map(d => ({
        ...d,
        src: import.meta.env.BASE_URL + d.src.replace(/^\/+/, '')
        }));
    setImages(dataSubset(data)); // however you sample

    const shuffled = [...data].sort(() => 0.5 - Math.random());
    const subset = shuffled.slice(0, SAMPLE_SIZE);
    setImages(subset);

    const initialPositions = {};
    subset.forEach((img, i) => {
      initialPositions[img.src] = {
        x: 300 + randomOffset(40),
        y: 200 + randomOffset(40),
        z: i
      };
    });
    setPositions(initialPositions);
  };

  useEffect(() => {
    loadSubset();
  }, []);

  const handleDrag = (e, info, src) => {
    setPositions((prev) => ({
      ...prev,
      [src]: { ...prev[src], x: info.point.x, y: info.point.y, z: 999 }
    }));
  };

  const handleAxisChange = (axis, value) => {
    setAxisNames((prev) => ({ ...prev, [axis]: value }));
  };

  const exportCSV = () => {
    const rows = [["src", "label", "x", "y", "axis_x", "axis_y"]];
    images.forEach((img) => {
      const pos = positions[img.src];
      rows.push([img.src, img.label, pos.x, pos.y, axisNames.x, axisNames.y]);
    });
    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "student_mapping.csv";
    link.click();
  };

  const resetLayout = () => {
    const resetPositions = {};
    images.forEach((img, i) => {
      resetPositions[img.src] = {
        x: 300 + randomOffset(40),
        y: 200 + randomOffset(40),
        z: i
      };
    });
    setPositions(resetPositions);
    setAxisNames({ x: "", y: "" });
  };

  const reshuffleSubset = () => {
    loadSubset();
    setAxisNames({ x: "", y: "" });
  };

  return (
    <div className="p-4 flex flex-col gap-4 items-center">
      <h1 className="text-2xl font-bold">Representation Learning Playground</h1>

      {/* Axis label controls */}
      <div className="flex gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Name X axis"
          value={axisNames.x}
          onChange={(e) => handleAxisChange("x", e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Name Y axis"
          value={axisNames.y}
          onChange={(e) => handleAxisChange("y", e.target.value)}
        />
      </div>

      {/* 2D space */}
      <div className="relative w-[90vw] h-[70vh] border bg-gray-100 overflow-hidden rounded-lg shadow-lg">
        {/* Grid lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        >
          {/* Vertical lines */}
          {Array.from({ length: 20 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 50}
              y1={0}
              x2={i * 50}
              y2="100%"
              stroke="rgba(0,0,0,0.05)"
            />
          ))}
          {/* Horizontal lines */}
          {Array.from({ length: 15 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={i * 50}
              x2="100%"
              y2={i * 50}
              stroke="rgba(0,0,0,0.05)"
            />
          ))}
          {/* Center axes */}
          <line
            x1="50%"
            y1={0}
            x2="50%"
            y2="100%"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth={2}
          />
          <line
            x1={0}
            y1="50%"
            x2="100%"
            y2="50%"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth={2}
          />
        </svg>

        {/* Images */}
        {images.map((img) => {
          const pos = positions[img.src] || { x: 300, y: 200, z: 0 };
          return (
              <motion.img
                  key={img.src}
                  src={img.src}
                  alt={img.label}
                  drag
                  dragElastic={0}      // ensures pointer sticks exactly to image
                  dragMomentum={false}
                  onDrag={(e, info) => handleDrag(e, info, img.src)}
                  initial={{ x: pos.x, y: pos.y }}
                  style={{
                    width: 100,
                    height: 100,
                    position: "absolute",  // keep absolute so it’s in the container
                    cursor: "grab",
                    borderRadius: "12px",
                    zIndex: pos.z,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                  }}
                />
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-2 flex-wrap justify-center">
        <button
          onClick={exportCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Export CSV
        </button>
        <button
          onClick={resetLayout}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Reset Layout
        </button>
        <button
          onClick={reshuffleSubset}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          New Random Subset
        </button>
      </div>
    </div>
  );
}

