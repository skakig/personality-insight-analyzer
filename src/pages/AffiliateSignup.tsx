
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AffiliateSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Generate affiliate code from name (first letter + last name + random digits)
      const nameParts = name.split(' ');
      const baseName = nameParts.length > 1 
        ? (nameParts[0][0] + nameParts[nameParts.length - 1]).toUpperCase() 
        : nameParts[0].substring(0, 4).toUpperCase();
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const generatedCode = `${baseName}${randomDigits}`;

      // Create new affiliate record
      const { error } = await supabase
        .from('affiliates')
        .insert({
          name: name,
          email: email,
          code: generatedCode,
          commission_rate: 0.10, // Default 10%
          status: 'pending', // Pending admin approval
          earnings: 0,
          total_sales: 0
        });

      if (error) throw error;
      
      // Create corresponding coupon automatically
      await supabase
        .from('coupons')
        .insert({
          code: generatedCode,
          discount_type: 'percentage',
          discount_amount: 10, // Default 10% discount
          max_uses: 100,
          is_active: true,
          applicable_products: ['assessment'] // Default to apply to assessment reports
        });
      
      setIsSuccess(true);
      
      toast({
        title: "Application Submitted",
        description: "Thank you for applying to our affiliate program! We'll review your application and contact you soon.",
      });
    } catch (error: any) {
      console.error('Error creating affiliate:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Become an Affiliate</CardTitle>
          <CardDescription>
            Join our affiliate program and earn commissions on every sale you refer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-green-600 mb-2">Application Submitted!</h3>
              <p className="text-gray-600 mb-4">
                Thank you for your interest in our affiliate program. We'll review your application and contact you soon.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <a href="/">Return to Home</a>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Apply Now"
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground pt-2">
                By applying, you agree to our affiliate terms and conditions. Applications are subject to review.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateSignup;
