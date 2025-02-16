
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const FinalCTA = ({ onStart }: { onStart: () => void }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-secondary">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Ready to Begin Your Journey?</h2>
          <p className="text-xl text-white/90 mb-12">
            Take the first step towards understanding and improving your moral development level.
          </p>
          <div className="space-y-6">
            <Button 
              onClick={onStart}
              size="lg"
              className="text-lg px-8 py-6 rounded-full bg-white text-primary hover:bg-white/90 hover:text-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              Start Free Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-white/80 text-sm">Your data is private & secure</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
