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
      <label className="text-xs text-[var(--text-2)] font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                px-4 py-2 text-sm font-medium transition-all duration-150 cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
                ${isSelected 
                  ? 'border border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)] font-semibold shadow-xs' 
                  : 'border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-2)] hover:border-[var(--border-strong)] hover:text-[var(--text-1)]'
                }
              `}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}