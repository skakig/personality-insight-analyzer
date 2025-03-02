
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, CheckCircle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  socialMedia: z.string().optional(),
  experience: z.string().min(10, "Please provide more information about your experience"),
  referralSource: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const AffiliateSignup = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      website: "",
      socialMedia: "",
      experience: "",
      referralSource: ""
    }
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    
    try {
      // Check if user already exists in affiliate_applications
      const { data: existingApplication } = await supabase
        .from('affiliate_applications')
        .select('id')
        .eq('email', values.email)
        .maybeSingle();
        
      if (existingApplication) {
        toast({
          title: "Application already exists",
          description: "You have already submitted an application with this email address.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Submit application
      const { error } = await supabase
        .from('affiliate_applications')
        .insert([
          {
            name: values.name,
            email: values.email,
            website: values.website || null,
            social_media: values.socialMedia || null,
            experience: values.experience,
            referral_source: values.referralSource || null,
            status: 'pending'
          }
        ]);
        
      if (error) throw error;
      
      // Send notification email (optional edge function)
      try {
        await supabase.functions.invoke('affiliate-application-notification', {
          body: {
            email: values.email,
            name: values.name
          }
        });
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Continue anyway, this is not critical
      }
      
      setSubmitted(true);
      form.reset();
      
      toast({
        title: "Application Submitted",
        description: "Your affiliate application has been received. We'll review it and get back to you soon.",
      });
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit your application. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Become an Affiliate Partner</h1>
          <p className="mt-4 text-gray-600">Join our affiliate program and earn commissions for every sale you refer.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Program Benefits</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Earn up to 20% commission on each sale</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Custom discount codes for your audience</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Real-time tracking dashboard and analytics</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Monthly payouts with no minimum threshold</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Premium marketing materials and resources</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Dedicated affiliate manager for personalized support</span>
              </li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Who Can Apply?</h2>
            <p className="text-gray-600">
              We welcome content creators, coaches, consultants, publishers, and organizations 
              in the personal development, ethics, leadership, and psychology spaces.
            </p>
          </div>
          
          <div>
            {submitted ? (
              <Card className="p-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold">Application Submitted!</h3>
                  <p className="mt-2 text-gray-600">
                    Thank you for your interest in our affiliate program. We'll review your application 
                    and get back to you within 2-3 business days.
                  </p>
                  <Button 
                    className="mt-6" 
                    onClick={() => setSubmitted(false)}
                  >
                    Submit Another Application
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Apply Now</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="youremail@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourwebsite.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="socialMedia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Social Media Profiles (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Instagram, YouTube, Twitter, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tell us about your audience and experience</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What is your audience size? What topics do you cover? How do you plan to promote our products?"
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="referralSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How did you hear about us? (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Google, social media, friend, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </form>
                </Form>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateSignup;
