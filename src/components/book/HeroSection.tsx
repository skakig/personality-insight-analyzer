import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export interface HeroSectionProps {
  onPreOrder: () => void;
}

export const HeroSection = ({ onPreOrder }: HeroSectionProps) => {
  const [loading, setLoading] = useState(false);

  const handleDirectPreOrder = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-book-checkout', {
        body: { 
          returnUrl: `${window.location.origin}/book?success=true`
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create checkout session');
      }
      
      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      window.location.href = data.url;
    } catch (error: any) {
      console.error('Pre-order error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process pre-order. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto px-4 pt-12 md:pt-20 pb-16 md:pb-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary leading-tight">
          The Moral Hierarchy
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 md:mb-8 px-4">
          A Groundbreaking Framework for Understanding and Developing Moral Leadership
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8 md:mb-12 px-4">
          <Button 
            size="lg"
            onClick={handleDirectPreOrder}
            disabled={loading}
            className="w-full md:w-auto text-base md:text-lg px-8 py-6 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pre-order Now - $29.99
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            size="lg"
            className="w-full md:w-auto text-base md:text-lg px-8 py-6 rounded-full hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            Learn More
            <BookOpen className="ml-2 h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-gray-600 px-4">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500 h-5 w-5" />
            <span className="text-sm md:text-base">Early Bird Discount</span>
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500 h-5 w-5" />
            <span className="text-sm md:text-base">Exclusive Pre-launch Content</span>
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500 h-5 w-5" />
            <span className="text-sm md:text-base">Digital + Physical Copy</span>
          </span>
        </div>
      </motion.div>
    </section>
  );
};
