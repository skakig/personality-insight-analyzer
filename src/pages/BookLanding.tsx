
import { toast } from "@/components/ui/use-toast";
import { HeroSection } from "@/components/book/HeroSection";
import { MoralLevelsSection } from "@/components/book/MoralLevelsSection";
import { PreOrderBenefits } from "@/components/book/PreOrderBenefits";
import { PreOrderCTA } from "@/components/book/PreOrderCTA";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const BookLanding = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Success!",
        description: "Thank you for pre-ordering. You'll receive a confirmation email shortly.",
      });
    } else if (searchParams.get('canceled') === 'true') {
      toast({
        title: "Cancelled",
        description: "Your pre-order was cancelled. Feel free to try again when you're ready.",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  const handlePreOrder = () => {
    // Scroll to the PreOrderCTA section
    const preOrderSection = document.getElementById('pre-order-section');
    if (preOrderSection) {
      preOrderSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white overflow-x-hidden">
      <HeroSection onPreOrder={handlePreOrder} />
      <MoralLevelsSection />
      <PreOrderBenefits />
      <div id="pre-order-section">
        <PreOrderCTA />
      </div>
    </div>
  );
};

export default BookLanding;
