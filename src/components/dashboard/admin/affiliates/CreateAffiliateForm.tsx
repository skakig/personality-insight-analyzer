
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";

interface CreateAffiliateFormProps {
  onCreateAffiliate: (name: string, email: string) => Promise<void>;
}

export const CreateAffiliateForm = ({ onCreateAffiliate }: CreateAffiliateFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email) return;
    
    setCreating(true);
    try {
      await onCreateAffiliate(name, email);
      setName("");
      setEmail("");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Create New Affiliate</h3>
      <div className="flex flex-col space-y-2">
        <Input
          placeholder="Affiliate Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button 
          onClick={handleSubmit} 
          disabled={creating || !name || !email}
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
