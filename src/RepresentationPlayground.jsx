import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SAMPLE_SIZE = 20;

export default function RepresentationPlayground() {
  const [images, setImages] = useState([]);
  const [positions, setPositions] = useState({});
  const [axisNames, setAxisNames] = useState({ x: "", y: "" });

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => {
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        const subset = shuffled.slice(0, SAMPLE_SIZE);
        setImages(subset);
        const initialPositions = {};
        subset.forEach((img) => {
          initialPositions[img.src] = { x: Math.random() * 400, y: Math.random() * 400 };
        });
        setPositions(initialPositions);
      });
  }, []);

  const handleDrag = (e, info, src) => {
    setPositions((prev) => ({
      ...prev,
      [src]: { x: info.point.x, y: info.point.y }
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
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "student_mapping.csv";
    link.click();
  };

  const resetLayout = () => {
    const resetPositions = {};
    images.forEach((img) => {
      resetPositions[img.src] = { x: Math.random() * 400, y: Math.random() * 400 };
    });
    setPositions(resetPositions);
    setAxisNames({ x: "", y: "" });
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-xl font-bold">Representation Learning Playground</h1>

      <div className="flex gap-4">
        <input
          className="border p-2"
          placeholder="Name X axis"
          value={axisNames.x}
          onChange={(e) => handleAxisChange("x", e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Name Y axis"
          value={axisNames.y}
          onChange={(e) => handleAxisChange("y", e.target.value)}
        />
      </div>

      <div className="relative w-[600px] h-[600px] border bg-gray-100 overflow-hidden">
        {images.map((img) => (
          <motion.img
            key={img.src}
            src={img.src}
            alt={img.label}
            drag
            dragMomentum={false}
            onDrag={(e, info) => handleDrag(e, info, img.src)}
            initial={{ x: positions[img.src]?.x || 0, y: positions[img.src]?.y || 0 }}
            style={{
              width: 80,
              height: 80,
              position: "absolute",
              top: positions[img.src]?.y || 0,
              left: positions[img.src]?.x || 0,
              cursor: "grab",
              borderRadius: "12px"
            }}
          />
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={exportCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>
        <button
          onClick={resetLayout}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Reset Layout
        </button>
      </div>
    </div>
  );
}

