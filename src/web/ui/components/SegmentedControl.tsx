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
    <div className="flex flex-col gap-1.5">
      {label && (
        <label 
          className="font-medium"
          style={{ 
            color: 'var(--text-3)', 
            fontSize: 'var(--text-caption)'
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          backgroundColor: 'var(--surface-2)',
          borderColor: 'var(--border)',
          borderRadius: 'var(--radius-sm)',
        }}
        className="flex flex-wrap border p-1 gap-1 max-w-[500px]"
      >
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              style={
                isActive
                  ? {
                      backgroundColor: 'var(--accent)',
                      color: 'var(--accent-ink)',
                      borderRadius: 'calc(var(--radius-sm) - 2px)',
                      fontWeight: 'var(--weight-semibold)',
                    }
                  : {
                      backgroundColor: 'transparent',
                      color: 'var(--text-2)',
                      borderRadius: 'calc(var(--radius-sm) - 2px)',
                    }
              }
              className="flex-grow flex-shrink basis-0 min-w-[70px] h-8 px-3 text-xs transition-all duration-150 hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

