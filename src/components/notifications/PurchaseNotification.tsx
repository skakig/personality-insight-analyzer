
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Purchase {
  id: string;
  name: string;
  location: string;
  product_type: string;
  purchase_time: string;
}

// Fixed time intervals for social proof
const TIME_INTERVALS = [
  "2 minutes ago",
  "5 minutes ago",
  "8 minutes ago",
  "12 minutes ago",
  "15 minutes ago"
];

// Function to mask the last name
const maskName = (fullName: string) => {
  const parts = fullName.trim().split(" ");
  if (parts.length < 2) return fullName; // Return as is if no space found
  
  const firstName = parts[0];
  const lastNameInitial = parts[parts.length - 1][0];
  const maskedLastName = lastNameInitial + "*".repeat(Math.min(5, parts[parts.length - 1].length - 1));
  
  return `${firstName} ${maskedLastName}`;
};

export const PurchaseNotification = () => {
  const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchRandomPurchase = async () => {
      const { data, error } = await supabase
        .rpc('get_random_purchase_notification')
        .maybeSingle();

      if (data && !error) {
        // Transform product_type if it's "detailed analysis"
        const purchase = {
          ...data,
          product_type: data.product_type.toLowerCase() === "detailed analysis" ? "Full Report" : data.product_type,
          // Mask the name for privacy
          name: maskName(data.name)
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

  // Randomly select a time interval for each notification
  const randomTimeInterval = TIME_INTERVALS[Math.floor(Math.random() * TIME_INTERVALS.length)];

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
                  {randomTimeInterval}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
