
export const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p className="mb-6">
          By accessing and using The Moral Hierarchy, you accept and agree to be
          bound by the terms and provision of this agreement.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
        <p className="mb-6">
          The Moral Hierarchy provides moral assessment and development tools
          through its website and related services. We reserve the right to modify
          or discontinue the service at any time.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Conduct</h2>
        <p className="mb-6">
          You agree to use our services only for lawful purposes and in accordance
          with these Terms. You are responsible for maintaining the confidentiality
          of your account.
        </p>
      </div>
    </div>
  );
};

export default Terms;
