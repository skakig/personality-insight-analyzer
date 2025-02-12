
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface Purchase {
  id: string;
  name: string;
  location: string;
  product_type: string;
  purchase_time: string;
}

export const PurchaseNotification = () => {
  const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchRandomPurchase = async () => {
      // Using random() directly in the select query
      const { data, error } = await supabase
        .from('purchase_notifications')
        .select('*')
        .limit(1)
        .order('id', { ascending: false }) // Order by id first to ensure consistent results
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        // Transform product_type if it's "detailed analysis"
        const purchase = {
          ...data,
          product_type: data.product_type.toLowerCase() === "detailed analysis" ? "Full Report" : data.product_type
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

  return (
    <AnimatePresence>
      {isVisible && (
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
                  {currentPurchase.name} from {currentPurchase.location}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  just purchased a {currentPurchase.product_type}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(currentPurchase.purchase_time), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
