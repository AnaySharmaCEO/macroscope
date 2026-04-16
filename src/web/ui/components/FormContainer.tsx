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
    <div className="bg-[#1a1a1a] border border-[#262626] rounded p-6">
      <h3 className="text-xs tracking-wider uppercase text-[#737373] mb-6">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}