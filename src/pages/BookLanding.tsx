import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HeroSection } from "@/components/book/HeroSection";
import { MoralLevelsSection } from "@/components/book/MoralLevelsSection";
import { PreOrderBenefits } from "@/components/book/PreOrderBenefits";
import { PreOrderCTA } from "@/components/book/PreOrderCTA";

const BookLanding = () => {
  const navigate = useNavigate();

  const handlePreOrder = async () => {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to pre-order the book",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process pre-order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <HeroSection onPreOrder={handlePreOrder} />
      <MoralLevelsSection />
      <PreOrderBenefits />
      <PreOrderCTA onPreOrder={handlePreOrder} />
    </div>
  );
};

export default BookLanding;