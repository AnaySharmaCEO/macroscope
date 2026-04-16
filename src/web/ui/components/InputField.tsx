/**
 * MACROSCOPE PERFORMANCE OS - INPUT FIELD COMPONENT
 * Controlled text/number input
 */

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
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
    <div className="flex flex-col gap-2">
      <label className="text-xs tracking-wider uppercase text-[#737373]">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 bg-[#0a0a0a] border border-[#262626] rounded px-3 py-2.5 text-sm text-[#e5e5e5] focus:outline-none focus:border-[#00D4FF] transition-colors duration-150"
        />
        {unit && <span className="text-sm text-[#737373]">{unit}</span>}
      </div>
    </div>
  );
}