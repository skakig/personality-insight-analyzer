import { motion } from "framer-motion";

export const MoralLevelsSection = () => {
  const levels = [
    {
      level: "Level 1: Self-Preservation",
      description: "Understanding survival morality and its impact on decision-making."
    },
    {
      level: "Level 2: Self-Interest",
      description: "Exploring pragmatic morality and personal success."
    },
    {
      level: "Level 3: Social Contract",
      description: "Building cooperative morality and mutual benefit."
    },
    {
      level: "Level 4: Fairness",
      description: "Developing justice-based moral reasoning."
    },
    {
      level: "Level 5: Empathy",
      description: "Cultivating relational morality and emotional connection."
    },
    {
      level: "Level 6: Altruism",
      description: "Embracing sacrificial morality for the greater good."
    },
    {
      level: "Level 7: Integrity",
      description: "Living with principled morality and authenticity."
    },
    {
      level: "Level 8: Virtue",
      description: "Aspiring to moral excellence and goodness."
    },
    {
      level: "Level 9: Self-Actualization",
      description: "Achieving transcendent morality and alignment with universal truths."
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center mb-12">Discover the Nine Levels of Moral Development</h2>
          <div className="space-y-8">
            {levels.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold text-primary mb-2">{item.level}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};