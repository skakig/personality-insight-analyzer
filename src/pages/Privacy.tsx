
export const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
        <p className="mb-6">
          We collect information that you provide directly to us, including when you:
          take our assessment, create an account, subscribe to our newsletter, or
          contact us for support.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
        <p className="mb-6">
          We use the information we collect to provide, maintain, and improve our
          services, to develop new features, and to protect our users.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Information Sharing</h2>
        <p className="mb-6">
          We do not sell, rent, or share your personal information with third
          parties without your consent, except as necessary to provide our services
          or as required by law.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
