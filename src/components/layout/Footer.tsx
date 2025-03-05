import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Twitter, Instagram, Linkedin, Youtube, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!email) {
      return "Please enter your email address";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address (e.g., name@example.com)";
    }
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(validateEmail(newEmail));
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      toast({
        title: "Invalid Email",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: existingSubscriber } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingSubscriber) {
        setIsSubscribed(true);
        setIsAlreadySubscribed(true);
        toast({
          title: "Already Subscribed",
          description: "This email is already subscribed to our newsletter.",
          variant: "default",
        });
        setEmail("");
        return;
      }

      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (insertError) {
        if (insertError.code === '23505') {
          setIsSubscribed(true);
          setIsAlreadySubscribed(true);
          toast({
            title: "Already Subscribed",
            description: "This email is already subscribed to our newsletter.",
            variant: "default",
          });
          setEmail("");
          return;
        }
        throw insertError;
      }

      const { data: { session } } = await supabase.auth.getSession();

      try {
        console.log('Sending welcome email to:', email);
        const response = await fetch(
          "https://caebnpbdprrptogirxky.supabase.co/functions/v1/send-welcome-email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ email }),
          }
        );

        const responseData = await response.json();
        if (!response.ok) {
          console.error('Welcome email error:', responseData);
          throw new Error('Failed to send welcome email');
        }
        console.log('Welcome email sent successfully:', responseData);
      } catch (emailError) {
        console.error('Welcome email error:', emailError);
      }

      setIsSubscribed(true);
      setIsAlreadySubscribed(false);
      toast({
        title: "Successfully Subscribed! 🎉",
        description: "Thank you for joining our newsletter. Watch your inbox for updates!",
        variant: "default",
      });
      setEmail("");
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Failed",
        description: "We couldn't subscribe you at this moment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartJourney = () => {
    navigate('/');
  };

  return (
    <footer className="border-t bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><button onClick={() => navigate("/")} className="text-gray-600 hover:text-primary transition-colors">Home</button></li>
              <li><button onClick={() => navigate("/")} className="text-gray-600 hover:text-primary transition-colors">Take the Test</button></li>
              <li><button onClick={() => navigate("/about")} className="text-gray-600 hover:text-primary transition-colors">About</button></li>
              <li><button onClick={() => navigate("/contact")} className="text-gray-600 hover:text-primary transition-colors">Contact</button></li>
              <li><button onClick={() => navigate("/faq")} className="text-gray-600 hover:text-primary transition-colors">FAQ</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><button onClick={() => navigate("/privacy")} className="text-gray-600 hover:text-primary transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => navigate("/terms")} className="text-gray-600 hover:text-primary transition-colors">Terms of Service</button></li>
              <li><button onClick={() => navigate("/refund")} className="text-gray-600 hover:text-primary transition-colors">Refund Policy</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Stay Updated</h3>
            {isSubscribed ? (
              <div className="bg-green-50 rounded-lg p-4 text-green-800 flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <p>
                  {isAlreadySubscribed 
                    ? "You've already subscribed to our newsletter!"
                    : "Thank you for subscribing! Check your email for updates."}
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">Subscribe for insights on self-improvement & moral growth!</p>
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="space-y-1">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={handleEmailChange}
                      className={`bg-white ${emailError ? 'border-red-500 focus:ring-red-500' : ''}`}
                      aria-invalid={!!emailError}
                    />
                    {emailError && (
                      <p className="text-sm text-red-500">{emailError}</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || !!emailError}
                  >
                    {loading ? "Subscribing..." : "Subscribe"}
                  </Button>
                </form>
              </>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Connect With Us</h3>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t">
          <div className="text-center space-y-6">
            <p className="text-gray-600">TheMoralHierarchy.com © {new Date().getFullYear()} – All Rights Reserved.</p>
            <div className="space-y-4">
              <p className="text-gray-900 font-medium">Strive for moral clarity. Take the test today.</p>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="group"
              >
                Start Your Moral Journey
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
