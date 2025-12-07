'use client';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
}

export default function Slider({ value, min, max, step = 1, onChange, className }: SliderProps) {
  const progress = Math.min(100, Math.max(0, ((value - min) * 100) / (max - min)));
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`modern-slider ${className || ''}`}
      style={{ ['--slider-progress' as any]: `${progress}%` }}
    />
  );
}

