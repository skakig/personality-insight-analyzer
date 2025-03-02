
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle,  } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface CreateAffiliateFormProps {
  onCreateAffiliate: (name: string, email: string) => Promise<void>;
}

export const CreateAffiliateForm = ({ onCreateAffiliate }: CreateAffiliateFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("active");
  const [creating, setCreating] = useState(false);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async () => {
    if (!name || !email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setCreating(true);
    try {
      await onCreateAffiliate(name, email);
      setName("");
      setEmail("");
      setStatus("active");
      
      toast({
        title: "Success",
        description: "Affiliate partner created successfully",
      });
    } catch (error: any) {
      console.error("Error creating affiliate:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create affiliate partner",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Create New Affiliate</h3>
        <p className="text-sm text-gray-500">
          Add a new affiliate partner to your program. They will receive a welcome email with their unique referral code.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Affiliate Name
            <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            placeholder="Enter full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={creating}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
            <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={creating}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <Select 
            value={status} 
            onValueChange={setStatus}
            disabled={creating}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 flex items-end">
          <Button 
            onClick={handleSubmit} 
            disabled={creating || !name || !email}
            className="w-full h-10"
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Affiliate
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mt-4">
        <p>
          <span className="font-medium">Note:</span> New affiliates will be automatically assigned a unique referral code and commission rate based on your program settings.
        </p>
      </div>
    </div>
  );
};
