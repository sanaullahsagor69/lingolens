import React from 'react';

interface IntensityMeterProps {
  value: number; // 1-10
}

const IntensityMeter: React.FC<IntensityMeterProps> = ({ value }) => {
  // Determine color based on intensity
  const getColor = (val: number) => {
    if (val < 4) return 'bg-emerald-400';
    if (val < 7) return 'bg-amber-400';
    return 'bg-rose-500';
  };

  const colorClass = getColor(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Intensity Level</span>
        <span className={`text-xl font-bold ${value >= 7 ? 'text-rose-400' : value >= 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {value}/10
        </span>
      </div>
      <div className="h-3 w-full bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
        <div 
          className={`h-full ${colorClass} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.3)]`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
        <span>Mild</span>
        <span>Moderate</span>
        <span>Intense</span>
      </div>
    </div>
  );
};

export default IntensityMeter;