import type { FigureDiagram } from "../../types";
import styles from "./screens.module.css";

const SHAPE_STROKE = "rgba(255,255,255,0.5)";
const SHAPE_FILL = "rgba(230,126,34,0.08)";
const GOLD = "#FFD700";
const FONT = "'Rubik', sans-serif";

function ValueLabel({ x, y, value }: { x: number; y: number; value: number | null }) {
  if (value === null) {
    return (
      <g>
        <circle cx={x} cy={y} r={14} fill={GOLD} opacity={0.25} />
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fill={GOLD}
          fontSize={18}
          fontWeight={700}
          fontFamily={FONT}
        >
          ?
        </text>
      </g>
    );
  }
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fill="white"
      fontSize={16}
      fontWeight={600}
      fontFamily={FONT}
    >
      {value}
    </text>
  );
}

function Triangle({ cx, cy, values }: { cx: number; cy: number; values: (number | null)[] }) {
  // [top, bottomLeft, bottomRight]
  const top = { x: cx, y: cy - 45 };
  const bl = { x: cx - 45, y: cy + 35 };
  const br = { x: cx + 45, y: cy + 35 };
  return (
    <g>
      <polygon
        points={`${top.x},${top.y} ${bl.x},${bl.y} ${br.x},${br.y}`}
        fill={SHAPE_FILL}
        stroke={SHAPE_STROKE}
        strokeWidth={2}
      />
      <ValueLabel x={top.x} y={top.y} value={values[0]} />
      <ValueLabel x={bl.x} y={bl.y} value={values[1]} />
      <ValueLabel x={br.x} y={br.y} value={values[2]} />
    </g>
  );
}

function InvertedTriangle({ cx, cy, values }: { cx: number; cy: number; values: (number | null)[] }) {
  // [topLeft, topRight, bottom]
  const tl = { x: cx - 45, y: cy - 35 };
  const tr = { x: cx + 45, y: cy - 35 };
  const bot = { x: cx, y: cy + 45 };
  return (
    <g>
      <polygon
        points={`${tl.x},${tl.y} ${tr.x},${tr.y} ${bot.x},${bot.y}`}
        fill={SHAPE_FILL}
        stroke={SHAPE_STROKE}
        strokeWidth={2}
      />
      <ValueLabel x={tl.x} y={tl.y} value={values[0]} />
      <ValueLabel x={tr.x} y={tr.y} value={values[1]} />
      <ValueLabel x={bot.x} y={bot.y} value={values[2]} />
    </g>
  );
}

function Circle3({ cx, cy, values }: { cx: number; cy: number; values: (number | null)[] }) {
  // [top, bottomLeft, right]
  const r = 50;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={SHAPE_FILL} stroke={SHAPE_STROKE} strokeWidth={2} />
      {/* Divider lines from center to edges */}
      <line x1={cx} y1={cy} x2={cx} y2={cy - r} stroke={SHAPE_STROKE} strokeWidth={1} />
      <line x1={cx} y1={cy} x2={cx - r * 0.87} y2={cy + r * 0.5} stroke={SHAPE_STROKE} strokeWidth={1} />
      <line x1={cx} y1={cy} x2={cx + r * 0.87} y2={cy + r * 0.5} stroke={SHAPE_STROKE} strokeWidth={1} />
      <ValueLabel x={cx} y={cy - 28} value={values[0]} />
      <ValueLabel x={cx - 28} y={cy + 20} value={values[1]} />
      <ValueLabel x={cx + 28} y={cy + 20} value={values[2]} />
    </g>
  );
}

function Circle4({ cx, cy, values }: { cx: number; cy: number; values: (number | null)[] }) {
  // [top, right, bottom, left]
  const r = 50;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={SHAPE_FILL} stroke={SHAPE_STROKE} strokeWidth={2} />
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={SHAPE_STROKE} strokeWidth={1} />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={SHAPE_STROKE} strokeWidth={1} />
      <ValueLabel x={cx} y={cy - 25} value={values[0]} />
      <ValueLabel x={cx + 25} y={cy} value={values[1]} />
      <ValueLabel x={cx} y={cy + 25} value={values[2]} />
      <ValueLabel x={cx - 25} y={cy} value={values[3]} />
    </g>
  );
}

function Square3({ cx, cy, values }: { cx: number; cy: number; values: (number | null)[] }) {
  // [left, right, bottom]
  const s = 80;
  return (
    <g>
      <rect x={cx - s / 2} y={cy - s / 2} width={s} height={s} fill={SHAPE_FILL} stroke={SHAPE_STROKE} strokeWidth={2} rx={4} />
      <ValueLabel x={cx - 22} y={cy - 8} value={values[0]} />
      <ValueLabel x={cx + 22} y={cy - 8} value={values[1]} />
      <ValueLabel x={cx} y={cy + 22} value={values[2]} />
    </g>
  );
}

function Square5({ cx, cy, values }: { cx: number; cy: number; values: (number | null)[] }) {
  // [topLeft, topRight, bottomRight, bottomLeft, center]
  const s = 85;
  const half = s / 2;
  return (
    <g>
      <rect x={cx - half} y={cy - half} width={s} height={s} fill={SHAPE_FILL} stroke={SHAPE_STROKE} strokeWidth={2} rx={4} />
      <line x1={cx - half} y1={cy} x2={cx + half} y2={cy} stroke={SHAPE_STROKE} strokeWidth={1} />
      <line x1={cx} y1={cy - half} x2={cx} y2={cy + half} stroke={SHAPE_STROKE} strokeWidth={1} />
      <ValueLabel x={cx - 22} y={cy - 22} value={values[0]} />
      <ValueLabel x={cx + 22} y={cy - 22} value={values[1]} />
      <ValueLabel x={cx + 22} y={cy + 22} value={values[2]} />
      <ValueLabel x={cx - 22} y={cy + 22} value={values[3]} />
      <ValueLabel x={cx} y={cy} value={values[4]} />
    </g>
  );
}

function Figure({ cx, cy, type, values }: { cx: number; cy: number; type: string; values: (number | null)[] }) {
  switch (type) {
    case "triangle":
      return <Triangle cx={cx} cy={cy} values={values} />;
    case "invertedTriangle":
      return <InvertedTriangle cx={cx} cy={cy} values={values} />;
    case "circle":
      return values.length === 4
        ? <Circle4 cx={cx} cy={cy} values={values} />
        : <Circle3 cx={cx} cy={cy} values={values} />;
    case "square":
      return values.length === 5
        ? <Square5 cx={cx} cy={cy} values={values} />
        : <Square3 cx={cx} cy={cy} values={values} />;
    default:
      return null;
  }
}

export function NumberFigureDiagram({ diagram }: { diagram: FigureDiagram }) {
  const [ref, question] = diagram.figures;
  return (
    <div className={styles.diagramBlock}>
      <svg className={styles.diagramSvg} viewBox="0 0 440 200" xmlns="http://www.w3.org/2000/svg">
        {/* Reference figure (right side for RTL) */}
        <Figure cx={330} cy={100} type={diagram.type} values={ref.values} />
        {/* Arrow separator */}
        <g>
          <line x1={240} y1={100} x2={200} y2={100} stroke={SHAPE_STROKE} strokeWidth={2} markerEnd="url(#arrowhead)" />
          <defs>
            <marker id="arrowhead" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={SHAPE_STROKE} />
            </marker>
          </defs>
        </g>
        {/* Question figure (left side for RTL) */}
        <Figure cx={110} cy={100} type={diagram.type} values={question.values} />
      </svg>
    </div>
  );
}
