import { motion } from 'framer-motion';

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  formatValue?: (value: number) => string;
};

export function Slider({
  value,
  onChange,
  min = 50,
  max = 1000,
  step = 10,
  label,
  formatValue = (v) => `$${v}`,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          <motion.span
            key={value}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold text-eco-green"
          >
            {formatValue(value)}
          </motion.span>
        </div>
      )}
      <div className="relative">
        <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-eco-green to-eco-cyan rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <motion.input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
          whileHover={{ scale: 1.02 }}
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg shadow-eco-green/30 border-2 border-eco-green"
          style={{ left: `calc(${percentage}% - 12px)` }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
