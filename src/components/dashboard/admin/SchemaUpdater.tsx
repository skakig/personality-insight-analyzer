
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, CheckCircle, Loader2, RotateCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const SchemaUpdater = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migrations, setMigrations] = useState<string[]>([]);

  const runMigration = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      setMigrations([]);
      
      // Get session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }
      
      // Call the migration function
      const { data, error } = await supabase.functions.invoke('update-schema', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        setSuccess(true);
        setMigrations(data.migrations || []);
        toast({
          title: "Schema Updated",
          description: "Database schema has been successfully updated",
        });
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err: any) {
      console.error('Migration error:', err);
      setError(err.message || 'Failed to update database schema');
      toast({
        title: "Error",
        description: err.message || "Failed to update database schema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Database Schema</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runMigration}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RotateCw className="mr-2 h-4 w-4" />
              Update Schema
            </>
          )}
        </Button>
      </div>
      
      {success && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Schema Updated</AlertTitle>
          <AlertDescription>
            The database schema has been successfully updated.
            {migrations.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold text-sm">Migrations:</p>
                <ul className="text-sm list-disc pl-5 mt-1">
                  {migrations.map((migration, index) => (
                    <li key={index}>{migration}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <Alert variant="default" className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          This will update the database schema to support enhanced coupon functionality and affiliate marketing. 
          You should run this once to add the necessary database fields. This action is safe and won't affect existing data.
        </AlertDescription>
      </Alert>
    </div>
  );
};
