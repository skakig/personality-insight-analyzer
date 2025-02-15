
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Purchase {
  id: string;
  name: string;
  location: string;
  product_type: string;
  time_ago_minutes: number;
}

export const PurchaseNotification = () => {
  const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchRandomPurchase = async () => {
      console.log('Fetching random purchase...');
      const { data, error } = await supabase
        .rpc('get_random_purchase_notification')
        .maybeSingle();

      console.log('Fetch result:', { data, error });

      if (data && !error) {
        // Transform product_type if it's "detailed analysis"
        const purchase = {
          ...data,
          product_type: data.product_type.toLowerCase() === "detailed analysis" ? "Full Report" : data.product_type,
          // Ensure time_ago_minutes is a number and has a valid default
          time_ago_minutes: Number.isInteger(data.time_ago_minutes) ? data.time_ago_minutes : 5
        };
        setCurrentPurchase(purchase);
        setIsVisible(true);

        // Hide notification after 5 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 5000);
      }
    };

    // Show a notification every 15-30 seconds
    const interval = setInterval(() => {
      fetchRandomPurchase();
    }, Math.random() * (30000 - 15000) + 15000);

    // Initial fetch
    fetchRandomPurchase();

    return () => clearInterval(interval);
  }, []);

  if (!currentPurchase) return null;

  // Mask the name by keeping first letter and replacing rest with asterisks
  const maskName = (name: string) => {
    if (!name) return ''; // Handle null or undefined names
    const parts = name.split(' ');
    if (parts.length === 1) return name; // If only one name, return as is
    const firstName = parts[0];
    const surname = parts[1];
    return `${firstName} ${surname[0]}${'*'.repeat(Math.max(0, surname.length - 1))}`;
  };

  return (
    <AnimatePresence>
      {isVisible && currentPurchase && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-lg shadow-lg p-4 max-w-sm border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {maskName(currentPurchase.name)} from {currentPurchase.location}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  just purchased a {currentPurchase.product_type}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {currentPurchase.time_ago_minutes} {currentPurchase.time_ago_minutes === 1 ? 'minute' : 'minutes'} ago
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
