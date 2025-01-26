import { motion } from "framer-motion";
import { ChartBar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <Card className="mt-8">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ChartBar className="h-16 w-16 text-primary mb-4" />
        </motion.div>
        <p className="text-xl text-gray-600 mb-6">No assessments taken yet.</p>
        <Button 
          onClick={() => navigate("/dashboard/quiz")}
          className="hover:scale-105 transition-transform"
        >
          Take Your First Assessment
        </Button>
      </CardContent>
    </Card>
  );
};