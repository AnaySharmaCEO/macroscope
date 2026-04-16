/**
 * MACROSCOPE PERFORMANCE OS - ACTION BUTTON COMPONENT
 * Triggers hook functions
 */

interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
}

export function ActionButton({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false,
  fullWidth = false,
}: ActionButtonProps) {
  const baseClasses = 'px-4 py-2.5 text-sm rounded transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  
  const variantClasses = {
    primary: 'bg-[#3b82f6] text-white hover:bg-[#2563eb] border border-[#3b82f6]',
    secondary: 'border border-[#262626] bg-[#1a1a1a] text-[#e5e5e5] hover:border-[#404040]',
    danger: 'bg-[#dc2626] text-white hover:bg-[#b91c1c] border border-[#dc2626]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass}`}
    >
      {children}
    </button>
  );
}