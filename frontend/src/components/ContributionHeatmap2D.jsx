import React, { useMemo } from 'react';

const ROWS = 7;
const COLS = 52;
const CELL_SIZE = 14;
const CELL_GAP = 4;

function getCellColor(count) {
  if (count <= 0) return '#0b120b';
  if (count <= 2) return '#1f7a1a';
  if (count <= 6) return '#28a522';
  if (count <= 12) return '#39FF14';
  return '#9bff64';
}

export default function ContributionHeatmap2D({ data }) {
  const cells = useMemo(() => {
    const days = data?.days || [];
    const total = ROWS * COLS;

    return Array.from({ length: total }, (_, index) => {
      const day = days[index];
      const count = Number(day?.count) || 0;
      return {
        key: `${index}-${count}`,
        count
      };
    });
  }, [data?.days]);

  return (
    <div className="heatmap-bg" aria-hidden>
      <div
        className="heatmap-grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
          gap: `${CELL_GAP}px`
        }}
      >
        {cells.map((cell) => (
          <div
            key={cell.key}
            className="heatmap-cell"
            style={{ backgroundColor: getCellColor(cell.count) }}
            title={cell.count > 0 ? `${cell.count} contributions` : 'No contributions'}
          />
        ))}
      </div>
    </div>
  );
}
