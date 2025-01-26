import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface PreOrderCTAProps {
  onPreOrder: () => void;
}

export const PreOrderCTA = ({ onPreOrder }: PreOrderCTAProps) => {
  return (
    <section className="py-24 bg-gradient-to-br from-primary to-secondary text-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold mb-6">Secure Your Copy Today</h2>
          <p className="text-xl mb-8 text-white/90">
            Pre-order now and receive exclusive access to supplementary materials and exercises.
          </p>
          <Button 
            size="lg"
            onClick={onPreOrder}
            className="text-lg px-8 py-6 rounded-full bg-white text-primary hover:bg-white/90 transition-all duration-300"
          >
            Pre-order for $29.99
            <ArrowRight className="ml-2" />
          </Button>
          <p className="mt-6 text-white/80">
            Limited time offer - Price will increase after launch
          </p>
        </motion.div>
      </div>
    </section>
  );
};