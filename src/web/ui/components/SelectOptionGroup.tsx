/**
 * MACROSCOPE PERFORMANCE OS - SELECT OPTION GROUP COMPONENT
 * Multiple options with single selection
 */

interface SelectOptionGroupProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function SelectOptionGroup({ 
  label, 
  options, 
  value, 
  onChange 
}: SelectOptionGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs tracking-wider uppercase text-[#737373]">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              px-4 py-2 text-sm rounded border transition-all duration-150 active:scale-[0.98]
              ${value === option.value 
                ? 'border-[#3b82f6] bg-[#3b82f6] text-white' 
                : 'border-[#262626] bg-[#1a1a1a] text-[#e5e5e5] hover:border-[#404040]'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}