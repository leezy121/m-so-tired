'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2, AlertCircle, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSpacetimePayment } from '@/hooks/useSpacetimePayment';

export default function VerifyPaymentPage(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pocketOptionId, setPocketOptionId] = useState<string>('');

  const { markAsPaid } = useSpacetimePayment();

  const handleVerify = async (): Promise<void> => {
    if (!email.trim()) {
      setErrorMessage('Please enter your payment email');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('idle');
    setErrorMessage('');

    try {
      // Call API to verify payment with Selar
      const response = await fetch('/api/verify-selar-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.success && data.payment) {
        // Payment verified! Save to SpacetimeDB
        const paymentData = data.payment;
        const extractedPocketId = paymentData.pocketOptionId || paymentData.customerName || '';

        if (extractedPocketId) {
          setPocketOptionId(extractedPocketId);
          
          // Mark user as paid in SpacetimeDB
          markAsPaid(extractedPocketId, paymentData.reference, paymentData.amount);

          setVerificationStatus('success');

          // Redirect to app after 2 seconds
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setVerificationStatus('error');
          setErrorMessage('Could not extract Pocket Option ID from payment. Please contact support.');
        }
      } else {
        setVerificationStatus('error');
        setErrorMessage(data.message || 'Payment verification failed. Please check your email and try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            {verificationStatus === 'success' ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : verificationStatus === 'error' ? (
              <AlertCircle className="h-16 w-16 text-red-500" />
            ) : (
              <Mail className="h-16 w-16 text-blue-500" />
            )}
          </div>
          <CardTitle className="text-2xl text-center">
            {verificationStatus === 'success' 
              ? 'Payment Verified!' 
              : verificationStatus === 'error'
              ? 'Verification Failed'
              : 'Verify Your Payment'
            }
          </CardTitle>
          <CardDescription className="text-center">
            {verificationStatus === 'success'
              ? 'Your payment has been confirmed'
              : verificationStatus === 'error'
              ? 'We could not verify your payment'
              : 'Enter the email you used to pay on Selar'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {verificationStatus === 'idle' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Payment Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  disabled={isVerifying}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the email address you used when paying on Selar
                </p>
              </div>

              <Button
                onClick={handleVerify}
                disabled={isVerifying || !email.trim()}
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying Payment...
                  </>
                ) : (
                  'Verify Payment'
                )}
              </Button>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong className="text-blue-500">What happens next?</strong></p>
                  <p>• We'll check Selar to confirm your $3.00 payment</p>
                  <p>• If verified, you'll get instant access</p>
                  <p>• You can then login anytime with your Pocket Option ID</p>
                </div>
              </div>
            </>
          )}

          {verificationStatus === 'success' && (
            <>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="space-y-2">
                  <p className="font-semibold text-sm text-green-500">Access Granted!</p>
                  <div className="text-sm space-y-1">
                    {pocketOptionId && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Pocket Option ID:</span> {pocketOptionId}
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      <span className="font-medium">Amount Paid:</span> $3.00 USD
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Status:</span> Confirmed
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Redirecting you to the trading app...</p>
                <p className="mt-1">You can now login with your Pocket Option ID</p>
              </div>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="space-y-2">
                  <p className="font-semibold text-sm text-red-500">Verification Error</p>
                  <p className="text-sm text-muted-foreground">{errorMessage}</p>
                </div>
              </div>

              <Button
                onClick={() => {
                  setVerificationStatus('idle');
                  setErrorMessage('');
                  setEmail('');
                }}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong className="text-blue-500">Having trouble?</strong></p>
                  <p>• Make sure you entered the correct email</p>
                  <p>• Wait a few minutes after payment before verifying</p>
                  <p>• Check your Selar email confirmation for the correct email address</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
