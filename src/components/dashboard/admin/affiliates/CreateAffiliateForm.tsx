
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
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
      <h3 className="text-lg font-medium">Create New Affiliate</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Affiliate Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={creating}
        />
        <Input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={creating}
        />
        <Select 
          value={status} 
          onValueChange={setStatus}
          disabled={creating}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={handleSubmit} 
          disabled={creating || !name || !email}
          className="h-10"
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
  );
};
