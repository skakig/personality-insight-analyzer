
import React from 'react';
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PricingPlanProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  priceId: string;
  highlight?: boolean;
  loading: string;
  paymentType?: "payment" | "subscription";
  onSubscribe: (priceId: string) => void;
}

export const PricingPlan = ({
  name,
  price,
  description,
  features,
  priceId,
  highlight,
  loading,
  paymentType = "subscription",
  onSubscribe
}: PricingPlanProps) => {
  return (
    <Card 
      className={`flex flex-col relative ${
        highlight 
          ? 'border-primary shadow-lg scale-105 z-10' 
          : 'border-gray-200'
      }`}
    >
      {highlight && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>
          <div className="mt-2">
            <span className="text-4xl font-bold">{price}</span>
            <span className="text-gray-500">{paymentType === "subscription" ? "/month" : " one-time"}</span>
          </div>
          <p className="mt-2 text-gray-600">{description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <ul className="space-y-3 mb-8 flex-grow">
          {features.map((feature) => (
            <li key={feature} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          onClick={() => onSubscribe(priceId)}
          disabled={loading === priceId}
          className={`w-full ${
            highlight 
              ? 'bg-primary hover:bg-primary/90' 
              : ''
          }`}
        >
          {loading === priceId ? "Processing..." : "Get Started"}
        </Button>
      </CardContent>
    </Card>
  );
};
