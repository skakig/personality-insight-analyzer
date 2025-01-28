import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const NoSubscriptionCard = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>No Active Subscription</CardTitle>
        <CardDescription>
          Purchase a subscription to access detailed analysis features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => navigate("/pricing")}>View Plans</Button>
      </CardContent>
    </Card>
  );
};