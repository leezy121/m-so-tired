'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, AlertCircle, Loader2, CreditCard, ExternalLink } from 'lucide-react';

interface PaymentGateProps {
  onPaymentSuccess: () => void;
  pocketOptionId: string;
  email: string;
  registerUser: (pocketOptionId: string) => void;
  markAsPaid: (pocketOptionId: string, reference: string, amount: number) => void;
}

export function PaymentGate({ onPaymentSuccess, pocketOptionId, email, registerUser }: PaymentGateProps): JSX.Element {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handlePayment = (): void => {
    setIsProcessing(true);

    // Register user in SpacetimeDB first
    registerUser(pocketOptionId);

    // Create Selar payment URL with user's email
    const selarProductUrl = 'https://selar.com/11164u6j77';
    
    // Add custom fields to Selar URL with user's real email
    const paymentUrl = `${selarProductUrl}?email=${encodeURIComponent(email)}&name=${encodeURIComponent(pocketOptionId)}&pocket_option_id=${encodeURIComponent(pocketOptionId)}`;

    // Store both Pocket Option ID and email in localStorage for when user returns
    if (typeof window !== 'undefined') {
      localStorage.setItem('pending_payment_pocket_id', pocketOptionId);
      localStorage.setItem('pending_payment_email', email);
    }

    // Redirect to Selar payment page
    window.location.href = paymentUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Lock className="h-16 w-16 text-blue-500" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Complete Payment</CardTitle>
          <CardDescription className="text-center">
            One-time payment to unlock full access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="space-y-2">
              <p className="font-semibold text-sm">Payment Details</p>
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  <span className="font-medium">Pocket Option ID:</span> {pocketOptionId}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Amount:</span> $3.00 USD
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Payment Method:</span> Selar (Secure)
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-5 w-5" />
            )}
            Pay $3.00 with Selar
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong className="text-green-500">Secure Payment:</strong> You'll be redirected to Selar's secure payment page.</p>
                <p>• Pay with card, bank transfer, or USSD</p>
                <p>• Instant access after successful payment</p>
                <p>• You'll be redirected back automatically</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 text-center">
            <Badge variant="outline">Powered by Selar</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
