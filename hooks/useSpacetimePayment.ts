'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Identity, Timestamp } from 'spacetimedb';
import type { DbConnection, UserPayment } from '../spacetime_module_bindings';
import * as moduleBindings from '../spacetime_module_bindings';

interface SpacetimePaymentState {
  connected: boolean;
  identity: Identity | null;
  hasPaid: boolean;
  loading: boolean;
  error: string | null;
  userPayment: UserPayment | null;
}

interface SpacetimePaymentActions {
  registerUser: (pocketOptionId: string) => void;
  markAsPaid: (paymentReference: string, amount: number) => void;
}

export function useSpacetimePayment(): SpacetimePaymentState & SpacetimePaymentActions {
  const [connected, setConnected] = useState<boolean>(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [hasPaid, setHasPaid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userPayment, setUserPayment] = useState<UserPayment | null>(null);
  
  const connectionRef = useRef<DbConnection | null>(null);

  // Register table callbacks
  const registerTableCallbacks = useCallback((currentIdentity: Identity) => {
    if (!connectionRef.current) return;
    
    console.log('Registering payment table callbacks...');

    // Listen for user payment insertions
    connectionRef.current.db.userPayment.onInsert((_ctx, payment: UserPayment) => {
      console.log('Payment record inserted:', payment.identity.toHexString());
      
      if (currentIdentity && payment.identity.toHexString() === currentIdentity.toHexString()) {
        setUserPayment(payment);
        setHasPaid(payment.hasPaid);
        setLoading(false);
      }
    });

    // Listen for user payment updates
    connectionRef.current.db.userPayment.onUpdate((_ctx, _oldPayment: UserPayment, newPayment: UserPayment) => {
      console.log('Payment record updated:', newPayment.identity.toHexString());
      
      if (currentIdentity && newPayment.identity.toHexString() === currentIdentity.toHexString()) {
        setUserPayment(newPayment);
        setHasPaid(newPayment.hasPaid);
      }
    });
  }, []);

  // Subscribe to payment table
  const subscribeToPayments = useCallback(() => {
    if (!connectionRef.current) return;
    
    console.log('Subscribing to user_payment table...');
    
    connectionRef.current
      .subscriptionBuilder()
      .onApplied(() => {
        console.log('Subscription applied for user_payment');
        
        // Check if user already has a payment record
        if (identity && connectionRef.current) {
          const existingPayment = connectionRef.current.db.userPayment.identity().find(identity);
          if (existingPayment) {
            console.log('Found existing payment record:', existingPayment);
            setUserPayment(existingPayment);
            setHasPaid(existingPayment.hasPaid);
          } else {
            console.log('No payment record found for user');
          }
          setLoading(false);
        }
      })
      .onError((err: Error) => {
        console.error('Subscription error:', err);
        setError(err.message);
        setLoading(false);
      })
      .subscribe(['SELECT * FROM user_payment']);
  }, [identity]);

  // Initialize SpacetimeDB connection
  useEffect(() => {
    if (connectionRef.current) {
      console.log('Connection already established, skipping setup.');
      return;
    }

    const dbHost = 'wss://maincloud.spacetimedb.com';
    const dbName = process.env.NEXT_PUBLIC_SPACETIME_MODULE_NAME || 'default_module';

    const onConnect = (connection: DbConnection, id: Identity, _token: string): void => {
      console.log('Connected to SpacetimeDB!', id.toHexString());
      connectionRef.current = connection;
      setIdentity(id);
      setConnected(true);
      setError(null);
      
      // Register callbacks and subscribe
      registerTableCallbacks(id);
      
      // Small delay to ensure callbacks are registered before subscription
      setTimeout(() => {
        subscribeToPayments();
      }, 100);
    };

    const onDisconnect = (_ctx: unknown, reason?: Error | null): void => {
      const reasonStr = reason ? reason.message : 'No reason given';
      console.log('Disconnected from SpacetimeDB:', reasonStr);
      setConnected(false);
      setError(reasonStr);
      connectionRef.current = null;
      setIdentity(null);
    };

    console.log('Setting up SpacetimeDB connection...');
    moduleBindings.DbConnection.builder()
      .withUri(dbHost)
      .withModuleName(dbName)
      .onConnect(onConnect)
      .onDisconnect(onDisconnect)
      .build();
  }, [registerTableCallbacks, subscribeToPayments]);

  // Register user with Pocket Option ID
  const registerUser = useCallback((pocketOptionId: string): void => {
    if (!connectionRef.current || !identity) {
      console.error('Cannot register: not connected');
      setError('Not connected to database');
      return;
    }

    console.log('Registering user with Pocket Option ID:', pocketOptionId);
    connectionRef.current.reducers.registerUser({ pocketOptionId });
  }, [identity]);

  // Mark user as paid after payment verification
  const markAsPaid = useCallback((paymentReference: string, amount: number): void => {
    if (!connectionRef.current || !identity) {
      console.error('Cannot mark as paid: not connected');
      setError('Not connected to database');
      return;
    }

    console.log('Marking user as paid. Reference:', paymentReference);
    const paymentAmount = BigInt(amount * 100); // Convert to cents
    const paymentTimestamp = Timestamp.now();
    
    connectionRef.current.reducers.markUserPaid({ paymentReference, paymentAmount, paymentTimestamp });
  }, [identity]);

  return {
    connected,
    identity,
    hasPaid,
    loading,
    error,
    userPayment,
    registerUser,
    markAsPaid,
  };
}
