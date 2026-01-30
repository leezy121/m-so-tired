'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Lock, LogIn, UserPlus, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import type { UserPayment } from '@/spacetime_module_bindings';
import { BackgroundPaths } from '@/components/ui/background-paths';

interface LoginSignupFlowProps {
  onLoginSuccess: (pocketOptionId: string, userPayment: UserPayment | null) => void;
  onNeedPayment: (pocketOptionId: string, email: string) => void;
  userPayments: UserPayment[];
  connected: boolean;
  loading: boolean;
}

export function LoginSignupFlow({ 
  onLoginSuccess, 
  onNeedPayment, 
  userPayments,
  connected,
  loading 
}: LoginSignupFlowProps): JSX.Element {
  const [pocketOptionId, setPocketOptionId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    if (!pocketOptionId.trim()) {
      toast.error('Please enter your Pocket Option ID');
      return;
    }

    if (!connected) {
      toast.error('Not connected to database. Please wait...');
      return;
    }

    setIsChecking(true);

    try {
      // Check if user exists in database
      const existingUser = Array.isArray(userPayments) 
        ? userPayments.find(
            (payment: UserPayment) => payment?.pocketOptionId === pocketOptionId.trim()
          )
        : null;

      if (existingUser) {
        if (existingUser.hasPaid) {
          // User exists and has paid - allow login
          toast.success('Welcome back! Logging you in...');
          setTimeout(() => {
            onLoginSuccess(pocketOptionId.trim(), existingUser);
          }, 500);
        } else {
          // User exists but hasn't paid - redirect to signup to enter email
          toast.error('Payment required. Please use the Sign Up tab to complete registration with your email.');
        }
      } else {
        // User doesn't exist - redirect to signup tab
        toast.error('Account not found. Please use the Sign Up tab to create an account.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignup = async (): Promise<void> => {
    if (!pocketOptionId.trim()) {
      toast.error('Please enter your Pocket Option ID');
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!connected) {
      toast.error('Not connected to database. Please wait...');
      return;
    }

    setIsChecking(true);

    try {
      // Check if user already exists
      const existingUser = Array.isArray(userPayments)
        ? userPayments.find(
            (payment: UserPayment) => payment?.pocketOptionId === pocketOptionId.trim()
          )
        : null;

      if (existingUser) {
        if (existingUser.hasPaid) {
          toast.info('Account already exists! Logging you in...');
          setTimeout(() => {
            onLoginSuccess(pocketOptionId.trim(), existingUser);
          }, 500);
        } else {
          toast.info('Account exists but payment incomplete. Proceeding to payment...');
          setTimeout(() => {
            onNeedPayment(pocketOptionId.trim(), email.trim());
          }, 500);
        }
      } else {
        // New user - proceed to payment
        toast.info('Creating new account. Proceeding to payment...');
        setTimeout(() => {
          onNeedPayment(pocketOptionId.trim(), email.trim());
        }, 500);
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4">
        <BackgroundPaths title="AI Trading Signals" />
        <Card className="w-full max-w-md relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
              <p className="text-muted-foreground">Connecting to database...</p>
              <p className="text-xs text-muted-foreground">This may take a few moments</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 pt-20 md:pt-4">
      <BackgroundPaths title="AI Trading Signals" />
      <Card className="w-full max-w-sm md:max-w-md relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl mt-6 md:mt-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-center mb-3">
            <Lock className="h-14 w-14 sm:h-16 sm:w-16 text-blue-500" />
          </div>
          <CardTitle className="text-2xl sm:text-2xl text-center font-bold">Trading AI App</CardTitle>
          <CardDescription className="text-center text-sm">
            Login or create a new account to access real-time trading signals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-11">
              <TabsTrigger value="login" className="text-base">Login</TabsTrigger>
              <TabsTrigger value="signup" className="text-base">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="login-id" className="text-sm font-medium">Pocket Option ID</Label>
                <Input
                  id="login-id"
                  type="text"
                  placeholder="Enter your Pocket Option ID"
                  value={pocketOptionId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPocketOptionId(e.target.value)}
                  disabled={isChecking || !connected}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                  className="h-12 text-base"
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter the Pocket Option ID you used during signup
                </p>
              </div>

              <Button
                onClick={handleLogin}
                disabled={isChecking || !connected}
                className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {isChecking ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}
                <span className="text-base font-semibold">Login</span>
              </Button>

              {!connected && (
                <div className="text-center">
                  <Badge variant="outline" className="text-yellow-500">
                    Connecting...
                  </Badge>
                </div>
              )}
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  disabled={isChecking || !connected}
                  className="h-12 text-base"
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This email will be used for payment processing
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-id" className="text-sm font-medium">Pocket Option ID</Label>
                <Input
                  id="signup-id"
                  type="text"
                  placeholder="Enter your Pocket Option ID"
                  value={pocketOptionId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPocketOptionId(e.target.value)}
                  disabled={isChecking || !connected}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      handleSignup();
                    }
                  }}
                  className="h-12 text-base"
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your unique Pocket Option account identifier
                </p>
              </div>

              <div className="bg-amber-500/20 border-2 border-amber-500/60 rounded-lg p-3.5">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-black leading-relaxed">
                      Our trading signals have a 70-85% win rate. For best results, never use 100% of your funds on any single signal. Always practice proper risk management.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-1">One-Time Payment</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Access fee: $3.00 USD</li>
                      <li>• Secure payment via Selar</li>
                      <li>• Instant access after payment</li>
                      <li>• Login anytime with your ID</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSignup}
                disabled={isChecking || !connected}
                className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                size="lg"
              >
                {isChecking ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-5 w-5" />
                )}
                <span className="text-base font-semibold">Sign Up & Pay $3.00</span>
              </Button>

              {!connected && (
                <div className="text-center">
                  <Badge variant="outline" className="text-yellow-500">
                    Connecting...
                  </Badge>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t space-y-3">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
              <a 
                href="/privacy-policy" 
                className="text-blue-500 hover:text-blue-600 hover:underline transition-colors"
              >
                Privacy Policy
              </a>
              <span className="text-muted-foreground">•</span>
              <a 
                href="/terms-of-service" 
                className="text-blue-500 hover:text-blue-600 hover:underline transition-colors"
              >
                Terms of Service
              </a>
              <span className="text-muted-foreground">•</span>
              <a 
                href="/contact" 
                className="text-blue-500 hover:text-blue-600 hover:underline transition-colors"
              >
                Contact Us
              </a>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">
                Secure payments powered by Selar
              </p>
              <p className="text-xs text-muted-foreground">
                📧 leezmike320@gmail.com
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
