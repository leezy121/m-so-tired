'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Identity, Timestamp } from 'spacetimedb';
import type { DbConnection, UserPayment } from '../spacetime_module_bindings';
import * as moduleBindings from '../spacetime_module_bindings';

interface SpacetimeAuthState {
  connected: boolean;
  identity: Identity | null;
  hasPaid: boolean;
  loading: boolean;
  error: string | null;
  userPayment: UserPayment | null;
  allPayments: UserPayment[];
}

interface SpacetimeAuthActions {
  registerUser: (pocketOptionId: string) => void;
  markAsPaid: (pocketOptionId: string, paymentReference: string, amount: number) => void;
  logout: () => void;
}

export function useSpacetimeAuth(): SpacetimeAuthState & SpacetimeAuthActions {
  const [connected, setConnected] = useState<boolean>(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [hasPaid, setHasPaid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userPayment, setUserPayment] = useState<UserPayment | null>(null);
  const [allPayments, setAllPayments] = useState<UserPayment[]>([]);
  
  const connectionRef = useRef<DbConnection | null>(null);
  const isInitializing = useRef<boolean>(false);

  // Initialize SpacetimeDB connection only once
  useEffect(() => {
    if (connectionRef.current || isInitializing.current) {
      console.log('Connection already established or initializing, skipping setup.');
      return;
    }

    isInitializing.current = true;

    const dbHost = 'wss://maincloud.spacetimedb.com';
    const dbName = process.env.NEXT_PUBLIC_SPACETIME_MODULE_NAME || 'default_module';

    // Set timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Connection timeout - setting loading to false');
        setLoading(false);
        setError('Connection timeout. Please refresh the page.');
      }
    }, 10000); // 10 second timeout

    const onConnect = (connection: DbConnection, id: Identity, _token: string): void => {
      console.log('Connected to SpacetimeDB!', id.toHexString());
      clearTimeout(loadingTimeout);
      connectionRef.current = connection;
      setIdentity(id);
      setConnected(true);
      setError(null);
      
      // Register table callbacks
      console.log('Registering payment table callbacks...');
      
      // Listen for user payment insertions
      connection.db.userPayment.onInsert((_ctx, payment: UserPayment) => {
        console.log('Payment record inserted:', payment.pocketOptionId);
        setAllPayments(prev => {
          const exists = prev.some(p => p.pocketOptionId === payment.pocketOptionId);
          if (exists) return prev;
          return [...prev, payment];
        });
      });

      // Listen for user payment updates
      connection.db.userPayment.onUpdate((_ctx, _oldPayment: UserPayment, newPayment: UserPayment) => {
        console.log('Payment record updated:', newPayment.pocketOptionId);
        setAllPayments(prev => 
          prev.map(p => p.pocketOptionId === newPayment.pocketOptionId ? newPayment : p)
        );
        
        // Update current user payment if it matches
        setUserPayment(current => {
          if (current && current.pocketOptionId === newPayment.pocketOptionId) {
            setHasPaid(newPayment.hasPaid);
            return newPayment;
          }
          return current;
        });
      });
      
      // Subscribe to payments
      console.log('Subscribing to user_payment table...');
      
      connection
        .subscriptionBuilder()
        .onApplied(() => {
          console.log('Subscription applied for user_payment');
          
          try {
            // Get all payments from the table
            const payments = Array.from(connection.db.userPayment.iter());
            console.log(`Found ${payments.length} payment records`);
            setAllPayments(payments);
            setLoading(false);
          } catch (err) {
            console.error('Error loading payments:', err);
            setLoading(false);
          }
        })
        .onError((err: Error) => {
          console.error('Subscription error:', err);
          setError(err.message);
          setLoading(false);
        })
        .subscribe(['SELECT * FROM user_payment']);
    };

    const onDisconnect = (_ctx: unknown, reason?: Error | null): void => {
      const reasonStr = reason ? reason.message : 'No reason given';
      console.log('Disconnected from SpacetimeDB:', reasonStr);
      clearTimeout(loadingTimeout);
      setConnected(false);
      setError(reasonStr);
      connectionRef.current = null;
      setIdentity(null);
      isInitializing.current = false;
    };

    console.log('Setting up SpacetimeDB connection...');
    try {
      moduleBindings.DbConnection.builder()
        .withUri(dbHost)
        .withModuleName(dbName)
        .onConnect(onConnect)
        .onDisconnect(onDisconnect)
        .build();
    } catch (err) {
      console.error('Failed to setup connection:', err);
      setLoading(false);
      setError('Failed to connect to database');
      clearTimeout(loadingTimeout);
      isInitializing.current = false;
    }

    return () => {
      clearTimeout(loadingTimeout);
    };
  }, []); // Empty dependency array - only run once

  // Register user with Pocket Option ID
  const registerUser = useCallback((pocketOptionId: string): void => {
    if (!connectionRef.current || !identity) {
      console.error('Cannot register: not connected');
      setError('Not connected to database');
      return;
    }

    console.log('Registering user with Pocket Option ID:', pocketOptionId);
    try {
      connectionRef.current.reducers.registerUser({ pocketOptionId });
    } catch (err) {
      console.error('Failed to register user:', err);
      setError('Failed to register user');
    }
  }, [identity]);

  // Mark user as paid after payment verification (using Pocket Option ID)
  const markAsPaid = useCallback((pocketOptionId: string, paymentReference: string, amount: number): void => {
    if (!connectionRef.current || !identity) {
      console.error('Cannot mark as paid: not connected');
      setError('Not connected to database');
      return;
    }

    console.log('Marking user as paid. Pocket Option ID:', pocketOptionId, 'Reference:', paymentReference);
    try {
      const paymentAmount = BigInt(amount * 100); // Convert to cents
      const paymentTimestamp = Timestamp.now();
      
      connectionRef.current.reducers.markUserPaidByPocketOptionId({
        pocketOptionId,
        paymentReference,
        paymentAmount,
        paymentTimestamp
      });
    } catch (err) {
      console.error('Failed to mark as paid:', err);
      setError('Failed to update payment status');
    }
  }, [identity]);

  // Logout function
  const logout = useCallback((): void => {
    setUserPayment(null);
    setHasPaid(false);
    console.log('User logged out');
  }, []);

  return {
    connected,
    identity,
    hasPaid,
    loading,
    error,
    userPayment,
    allPayments,
    registerUser,
    markAsPaid,
    logout,
  };
}
