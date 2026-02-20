"use client";

import React from "react";
import { Lock, X } from "lucide-react";

interface SubscriptionPaywallProps {
  requiredTier: string;
  onClose: () => void;
  onSkip?: () => void;
}

const PLANS = [
  {
    name: "Discover",
    price: 100,
    features: [
      "Basic flow creation",
      "Standard templates",
      "Community support",
      "Export capabilities"
    ]
  },
  {
    name: "Navigate",
    price: 250,
    features: [
      "Advanced flow builder",
      "Premium templates",
      "Priority support",
      "Team collaboration",
      "Advanced analytics"
    ]
  },
  {
    name: "Activate",
    price: 500,
    features: [
      "Full enterprise features",
      "Custom integrations",
      "White-label options",
      "Dedicated support",
      "Advanced security"
    ]
  }
];

export const SubscriptionPaywall: React.FC<SubscriptionPaywallProps> = ({ 
  requiredTier, 
  onClose,
  onSkip 
}) => {
  const selectedPlan = PLANS.find(plan => plan.name === requiredTier);

  const handleSubscribe = (planName: string) => {
    console.log(`Subscribe to ${planName} clicked`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#0a0a0a] border border-white/10 rounded p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="sticky top-0 float-right text-white/40 hover:text-white/80 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex justify-center">
          <Lock className="w-12 h-12 text-white/70" />
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Upgrade Required</h2>
          <p className="text-white/40">
            Access to {requiredTier} requires an active subscription.
          </p>
        </div>

        <div className="space-y-4">
          {PLANS.map((plan) => {
            const isSelected = plan.name === requiredTier;
            return (
              <div
                key={plan.name}
                className={`p-4 rounded transition-all ${
                  isSelected 
                    ? "border-white/30 bg-white/5 border" 
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-bold text-white">{plan.name}</h3>
                    <p className="text-white/40 text-sm">${plan.price}/month</p>
                  </div>
                  {isSelected && (
                    <div className="bg-white/20 text-white text-xs px-2 py-1 rounded">
                      Required
                    </div>
                  )}
                </div>
                <ul className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-white/60 text-xs">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {selectedPlan && (
          <button
            onClick={() => handleSubscribe(selectedPlan.name)}
            className="w-full border border-white/30 text-white font-bold py-3 px-6 rounded hover:border-white/50 transition-colors"
          >
            Subscribe to {selectedPlan.name}
          </button>
        )}

        <div className="text-center space-y-2">
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/50 text-sm cursor-pointer transition-colors"
          >
            Maybe Later
          </button>
          {onSkip && (
            <div>
              <button
                onClick={onSkip}
                className="text-white/30 hover:text-white/50 text-xs cursor-pointer transition-colors font-mono"
              >
                [TEST] Skip Subscription →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};