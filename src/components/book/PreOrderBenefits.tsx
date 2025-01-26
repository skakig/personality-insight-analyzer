import { motion } from "framer-motion";

export const PreOrderBenefits = () => {
  const benefits = [
    {
      title: "Early Access",
      description: "Get the book before the official release date"
    },
    {
      title: "Exclusive Content",
      description: "Access to pre-launch workshops and materials"
    },
    {
      title: "Special Pricing",
      description: "Save 25% off the regular retail price"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold mb-12">Pre-order Benefits</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gray-50 rounded-xl"
              >
                <h3 className="text-xl font-semibold mb-2 text-primary">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};