
export const Refund = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Assessment Reports</h2>
        <p className="mb-6">
          Due to the instant delivery nature of our detailed assessment reports,
          all purchases are final and non-refundable once the report has been generated.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Subscription Services</h2>
        <p className="mb-6">
          For subscription services, you may cancel at any time. Refunds for partial
          months are not provided, but your subscription will remain active until
          the end of the current billing period.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Special Circumstances</h2>
        <p className="mb-6">
          If you believe you have special circumstances warranting a refund, please
          contact our support team within 7 days of your purchase. Each case will
          be reviewed individually.
        </p>
      </div>
    </div>
  );
};

export default Refund;
