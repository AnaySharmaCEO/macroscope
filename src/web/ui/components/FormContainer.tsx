/**
 * MACROSCOPE PERFORMANCE OS - FORM CONTAINER COMPONENT
 * Groups inputs together
 */

interface FormContainerProps {
  title: string;
  children: React.ReactNode;
}

export function FormContainer({ title, children }: FormContainerProps) {
  return (
    <div 
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 'var(--card-padding-sm)',
      }}
      className="border"
    >
      <h3 
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-display-sm)',
          fontWeight: 'var(--weight-medium)',
          color: 'var(--text)',
          marginBottom: 'var(--space-5)',
        }}
      >
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}