/**
 * MACROSCOPE PERFORMANCE OS - ACTION BUTTON COMPONENT
 * Triggers hook functions
 */

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function ActionButton({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  className = '',
}: ActionButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-none';
  
  const variantStyles = {
    primary: {
      backgroundColor: 'var(--btn-primary-bg)',
      color: 'var(--btn-primary-text)',
      border: '1px solid var(--btn-primary-bg)',
      borderRadius: 'var(--btn-primary-radius)',
      padding: 'var(--btn-primary-padding)',
      fontWeight: 'var(--btn-primary-weight)' as any,
      fontSize: 'var(--btn-primary-size)',
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: 'var(--btn-ghost-border)',
      borderWidth: '1px',
      borderStyle: 'solid',
      color: 'var(--btn-ghost-text)',
      borderRadius: 'var(--btn-ghost-radius)',
      padding: 'var(--space-3) var(--space-4)',
      fontWeight: 'var(--btn-ghost-weight)' as any,
      fontSize: 'var(--btn-ghost-size)',
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'var(--btn-ghost-border)',
      borderWidth: '1px',
      borderStyle: 'solid',
      color: 'var(--btn-ghost-text)',
      borderRadius: 'var(--btn-ghost-radius)',
      padding: 'var(--space-3) var(--space-4)',
      fontWeight: 'var(--btn-ghost-weight)' as any,
      fontSize: 'var(--btn-ghost-size)',
    },
    danger: {
      backgroundColor: 'var(--btn-danger-bg)',
      color: 'var(--btn-danger-text)',
      border: '1px solid var(--btn-danger-bg)',
      borderRadius: 'var(--btn-danger-radius)',
      padding: 'var(--btn-primary-padding)',
      fontWeight: 'var(--btn-primary-weight)' as any,
      fontSize: 'var(--btn-primary-size)',
    },
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={variantStyles[variant]}
      className={`${baseClasses} ${widthClass} ${className} hover:brightness-105 active:brightness-95`}
    >
      {children}
    </button>
  );
}