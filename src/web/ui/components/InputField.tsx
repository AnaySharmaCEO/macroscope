/**
 * MACROSCOPE PERFORMANCE OS - INPUT FIELD COMPONENT
 * Controlled text/number input
 */

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  type?: 'text' | 'number' | 'time';
  placeholder?: string;
  unit?: string;
}

export function InputField({ 
  label, 
  value, 
  onChange, 
  type = 'text',
  placeholder,
  unit,
}: InputFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'number') {
      onChange(e.target.value === '' ? 0 : Number(e.target.value));
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label 
          className="font-medium"
          style={{ 
            color: 'var(--text-2)', 
            fontSize: 'var(--text-body-sm)',
            lineHeight: 'var(--leading-normal)'
          }}
        >
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          style={{
            backgroundColor: 'var(--input-bg)',
            borderColor: 'var(--input-border)',
            borderRadius: 'var(--input-radius)',
            color: 'var(--input-text)',
            fontSize: 'var(--input-font-size)',
            padding: 'var(--input-padding)',
          }}
          className="flex-1 border transition-colors duration-150 focus:outline-none focus:border-[var(--input-border-focus)] focus:ring-2 focus:ring-[var(--accent)]/30"
        />
        {unit && (
          <span 
            style={{ 
              color: 'var(--text-3)', 
              fontSize: 'var(--text-body-sm)' 
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}