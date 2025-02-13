interface FinalReflectionProps {
  email?: string;
}

export const FinalReflection = ({ email }: FinalReflectionProps) => {
  return (
    <section className="bg-secondary/5 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Final Reflection</h2>
      <p className="text-gray-600">
        Your journey in moral development is unique and valuable. Each step you take toward higher understanding
        and awareness contributes to both your personal growth and the betterment of those around you. Continue
        to embrace this path of growth while maintaining balance and compassion for yourself and others.
      </p>
      {email && (
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            A copy of this report has been sent to {email} for future reference.
          </p>
        </div>
      )}
    </section>
  );
};