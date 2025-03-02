
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Book, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function PreOrderCTA() {
  const [loading, setLoading] = useState(false);

  const handlePreOrder = async () => {
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
    <section className="py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Pre-Order Your Copy Today</h2>
        <p className="max-w-2xl mx-auto mb-8 text-gray-600">
          Be among the first to receive "The Moral Hierarchy" when it's released. 
          Pre-order now to secure your copy and get exclusive bonuses.
        </p>
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handlePreOrder} 
            className="w-full px-8 py-6 text-xl rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Book className="mr-2 h-5 w-5" />
                Pre-Order Now - $24.99
              </span>
            )}
          </Button>
          <p className="mt-4 text-sm text-gray-500">
            Shipping begins June 2026. You'll only be charged when the book ships.
          </p>
        </div>
      </div>
    </section>
  );
}
