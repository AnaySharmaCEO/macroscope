/**
 * MACROSCOPE PERFORMANCE OS - SEGMENTED CONTROL COMPONENT
 * Modern minimal segmented control for options
 */

interface Option {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

export function SegmentedControl({ label, value, onChange, options }: SegmentedControlProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs tracking-wider uppercase text-[#737373]">
          {label}
        </label>
      )}
      <div
        className="
          flex flex-wrap bg-[#0a0a0a] border border-[#262626] rounded p-1
        "
      >
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              flex-grow flex-shrink basis-0 min-w-[80px] px-4 py-2 text-sm rounded transition-all duration-150
              ${value === option.value
                ? 'bg-[#00D4FF] text-black'
                : 'text-[#737373] hover:text-[#e5e5e5]'
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
