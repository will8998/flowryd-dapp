"use client";

import React, { useState } from "react";
import { Receipt, Loader2, Check, X, Crown } from "lucide-react";
import { usePlans, useSubscription, useInvoices } from "@/hooks/use-subscription";

export const BillingPanel: React.FC = () => {
  const { plans, isLoading: plansLoading } = usePlans();
  const { subscription, createSubscription, cancelSubscription } = useSubscription();
  const { invoices } = useInvoices();
  const [showPlans, setShowPlans] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: "bg-white/10", text: "text-white/60", icon: Check },
      trial: { bg: "bg-white/10", text: "text-white/60", icon: Crown },
      past_due: { bg: "bg-white/10", text: "text-white/40", icon: X },
      cancelled: { bg: "bg-white/10", text: "text-white/40", icon: X },
      paid: { bg: "bg-white/10", text: "text-white/60", icon: Check },
      draft: { bg: "bg-white/10", text: "text-white/40", icon: Receipt },
      void: { bg: "bg-white/10", text: "text-white/40", icon: X }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  const handleSubscribe = async (planId: string) => {
    try {
      await createSubscription({ planId });
      setShowPlans(false);
    } catch (error) {
      console.error("Subscription failed:", error);
    }
  };

  const handleCancel = async () => {
    if (!subscription?.id) return;
    try {
      await cancelSubscription(subscription.id);
    } catch (error) {
      console.error("Cancellation failed:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border border-white/10 bg-black/30 rounded p-8">
        <h2 className="text-lg font-bold text-white mb-6">Current Plan</h2>
        
        {subscription ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">{subscription.plan?.name || "Unknown Plan"}</h3>
                <div className="flex items-center gap-3">
                  {subscription.status && getStatusBadge(subscription.status)}
                  <span className="text-white/60">{formatCurrency(subscription.plan?.priceAmount || 0)}/month</span>
                </div>
              </div>
              <Crown className="w-8 h-8 text-white/70" />
            </div>

            <div className="text-white/40 text-sm">
              Current period: {subscription.currentPeriodStart ? formatDate(subscription.currentPeriodStart) : "—"} — {subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : "—"}
            </div>

            <button
              onClick={handleCancel}
              className="text-white/60 hover:bg-white/10 px-4 py-2 rounded text-sm transition-colors"
            >
              Cancel Subscription
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-white/40">No active subscription</p>
            <button
              onClick={() => setShowPlans(!showPlans)}
              className="border border-white/20 text-white rounded hover:border-white/40 font-bold py-2 px-4 text-sm transition-colors"
            >
              Choose a Plan
            </button>
          </div>
        )}

        {showPlans && (
          <div className="mt-8 pt-8 border-t border-white/10">
            {plansLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-white/40" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans?.map((plan) => (
                  <div key={plan.id} className="bg-white/5 border border-white/10 rounded p-6 space-y-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                      <p className="text-2xl font-bold text-white">{formatCurrency(plan.priceAmount)}</p>
                      <p className="text-white/40 text-sm">/{plan.interval}</p>
                    </div>
                    
                    <ul className="space-y-2">
                      {plan.features?.map((feature, index) => (
                        <li key={index} className="text-white/60 text-sm flex items-center gap-2">
                           <Check className="w-4 h-4 text-white/40 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      className="w-full border border-white/30 text-white rounded hover:border-white/50 font-bold py-2 px-4 text-sm transition-colors"
                    >
                      Subscribe
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border border-white/10 bg-black/30 rounded p-8">
        <h2 className="text-lg font-bold text-white mb-6">Invoice History</h2>
        
        {invoices ? (
          invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/60 font-medium py-3">Date</th>
                    <th className="text-left text-white/60 font-medium py-3">Amount</th>
                    <th className="text-left text-white/60 font-medium py-3">Status</th>
                    <th className="text-left text-white/60 font-medium py-3">Paid At</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-white/5">
                      <td className="py-4 text-white">{formatDate(invoice.createdAt)}</td>
                      <td className="py-4 text-white">{formatCurrency(invoice.amountDue)}</td>
                      <td className="py-4">{invoice.status && getStatusBadge(invoice.status)}</td>
                      <td className="py-4 text-white/60">
                        {invoice.paidAt ? formatDate(invoice.paidAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">No invoices yet</p>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
};