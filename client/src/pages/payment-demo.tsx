import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PayPalButton from "@/components/PayPalButton";
import { useLocation } from "wouter";

export default function PaymentDemo() {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "basic",
      name: "Basic Plan",
      price: 9.99,
      description: "Perfect for getting started with parenting insights",
      features: [
        "Unlimited journal entries",
        "Basic AI mood analysis", 
        "Weekly progress reports",
        "Mobile-friendly access"
      ]
    },
    {
      id: "premium",
      name: "Premium Plan", 
      price: 19.99,
      description: "Advanced features for comprehensive parenting support",
      features: [
        "Everything in Basic",
        "Advanced AI insights & recommendations",
        "Child development tracking",
        "Priority customer support",
        "Detailed analytics dashboard"
      ],
      popular: true
    },
    {
      id: "family",
      name: "Family Plan",
      price: 29.99,
      description: "Complete solution for the whole family",
      features: [
        "Everything in Premium",
        "Multiple parent profiles",
        "Family milestone tracking",
        "Community access",
        "Expert consultation sessions"
      ]
    }
  ];

  const handleStripeCheckout = (plan: typeof plans[0]) => {
    setSelectedPlan(plan.id);
    setLocation("/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Parenting Journey Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock personalized insights, AI-powered analysis, and comprehensive 
            support for your parenting journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-2xl font-bold">{plan.name}</div>
                  <div className="text-4xl font-bold text-blue-600 mt-2">
                    ${plan.price}
                    <span className="text-lg text-gray-500">/month</span>
                  </div>
                </CardTitle>
                <p className="text-center text-gray-600">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleStripeCheckout(plan)}
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Pay with Stripe
                  </Button>
                  
                  <div className="text-center text-sm text-gray-500 mb-2">
                    or
                  </div>
                  
                  <div className="flex justify-center">
                    <PayPalButton 
                      amount={plan.price.toString()}
                      currency="USD"
                      intent="CAPTURE"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Payment Configuration Status</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-medium text-yellow-800">Stripe Integration</h4>
                <p className="text-yellow-700">
                  Ready for configuration. Set STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY 
                  environment variables to enable payments.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-medium text-yellow-800">PayPal Integration</h4>
                <p className="text-yellow-700">
                  Ready for configuration. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET 
                  environment variables to enable payments.
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>
              This is a demo implementation showing both Stripe and PayPal payment options.
              Your pricing model can be easily configured through environment variables 
              or the admin dashboard once payment credentials are provided.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}