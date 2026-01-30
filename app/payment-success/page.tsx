'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSpacetimeAuth } from '@/hooks/useSpacetimeAuth';

export default function PaymentSuccessPage(): JSX.Element {
  const router = useRouter();
  const [pocketOptionId, setPocketOptionId] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');

  const { markAsPaid, connected, loading } = useSpacetimeAuth();

  useEffect(() => {
    // Get stored Pocket Option ID and email from localStorage
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('pending_payment_pocket_id');
      const storedEmail = localStorage.getItem('pending_payment_email');
      
      if (storedId) {
        setPocketOptionId(storedId);
      }
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, []);

  const handleComplete = async (): Promise<void> => {
    if (!pocketOptionId.trim()) {
      toast.error('Please enter your Pocket Option ID');
      return;
    }

    if (!connected) {
      toast.error('Not connected to database. Please wait...');
      return;
    }

    setIsSaving(true);

    try {
      // Mark user as paid in SpacetimeDB
      markAsPaid(pocketOptionId.trim(), 'selar-payment', 300); // 300 cents = $3.00
      
      toast.success('Payment confirmed! Welcome to the app!');
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pending_payment_pocket_id');
        localStorage.removeItem('pending_payment_email');
      }
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error('Error saving payment:', error);
      toast.error('Failed to save payment. Please try again.');
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
              <p className="text-muted-foreground">Connecting to database...</p>
              <p className="text-xs text-muted-foreground">Please wait a moment</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-center">Payment Successful!</CardTitle>
          <CardDescription className="text-center">
            Please confirm your Pocket Option ID to complete setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="space-y-2">
              <p className="font-semibold text-sm text-green-500">Payment Confirmed</p>
              <div className="text-sm space-y-1">
                {email && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Email:</span> {email}
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

          <div className="space-y-2">
            <Label htmlFor="pocketOptionId">Confirm Your Pocket Option ID</Label>
            <Input
              id="pocketOptionId"
              type="text"
              placeholder="Enter your Pocket Option ID"
              value={pocketOptionId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPocketOptionId(e.target.value)}
              disabled={isSaving || !connected}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  handleComplete();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              This will be saved to your account for login access
            </p>
          </div>

          <Button
            onClick={handleComplete}
            disabled={isSaving || !connected}
            className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Complete Setup & Access App'
            )}
          </Button>

          {!connected && (
            <div className="flex items-center justify-center gap-2 text-sm text-yellow-500">
              <AlertCircle className="h-4 w-4" />
              <span>Connecting to database...</span>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>After completing setup, you can login anytime</p>
            <p className="mt-1">using your Pocket Option ID</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
