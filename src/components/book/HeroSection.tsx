
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface HeroSectionProps {
  onPreOrder: () => void;
}

export const HeroSection = ({ onPreOrder }: HeroSectionProps) => {
  const handlePreOrder = async () => {
    try {
      // Create checkout session for book purchase
      const { data, error } = await supabase.functions.invoke('create-book-checkout', {
        body: {
          metadata: {
            productType: 'book',
            returnUrl: `${window.location.origin}/book?success=true`
          }
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to create checkout session');
      }
      
      if (!data?.url) {
        throw new Error('No checkout URL received');
      }
      
      // Redirect to Stripe
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error creating book checkout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process your pre-order. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="bg-white py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-gray-900">
              The Moral Hierarchy
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              A groundbreaking guide to understanding and elevating your moral development through scientific assessment and practical wisdom.
            </p>
            <div className="space-y-4">
              <p className="text-gray-700">
                <span className="font-medium">Pre-order Now</span> and get exclusive access to bonus content, early digital chapters, and special reader-only webinars.
              </p>
              <Button
                onClick={handlePreOrder}
                size="lg"
                className="w-full sm:w-auto rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 transform hover:scale-105"
              >
                Pre-Order Now
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-30"></div>
            <div className="relative bg-white p-6 rounded-lg shadow-xl">
              <img 
                src="/placeholder.svg" 
                alt="The Moral Hierarchy Book Cover" 
                className="w-full h-auto rounded shadow-md"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
