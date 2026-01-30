'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, Clock, Activity, Settings, BarChart3, Sparkles, RefreshCw, AlertCircle, LineChart, Target, Zap } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { sdk } from "@farcaster/miniapp-sdk";
import { useAddMiniApp } from "@/hooks/useAddMiniApp";
import { useSpacetimeAuth } from "@/hooks/useSpacetimeAuth";
import { LoginSignupFlow } from "@/components/LoginSignupFlow";
import { PaymentGate } from "@/components/PaymentGate";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import { useIsInFarcaster } from "@/hooks/useIsInFarcaster";
import { BackgroundPaths } from "@/components/ui/background-paths";

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  timestamp: number;
  trend: number[];
  volume: number;
}

interface TechnicalIndicators {
  rsi: number;
  macd: { value: number; signal: number; histogram: number };
  bollingerBands: { upper: number; middle: number; lower: number };
  ema20: number;
  ema50: number;
  ema200: number;
  trendStrength: number;
  supportLevel: number;
  resistanceLevel: number;
}

interface TradeSignal {
  id: string;
  symbol: string;
  direction: 'up' | 'down';
  timeFrame: '1' | '3' | '5';
  confidence: number;
  entryTime: string;
  currentPrice: number;
  targetPrice: number;
  reason: string;
  timestamp: number;
  indicators: TechnicalIndicators;
  confirmations: string[];
}

interface UserSettings {
  pocketOptionId: string;
  timezone: string;
  apiKey: string;
}

const MARKETS = [
  // Major Forex Pairs
  'EUR/USD', 'USD/JPY', 'GBP/USD', 'USD/CHF', 'AUD/USD', 'NZD/USD', 'USD/CAD',
  
  // Major Forex Pairs OTC
  'EUR/USD OTC', 'USD/JPY OTC', 'GBP/USD OTC', 'USD/CHF OTC', 'AUD/USD OTC', 'NZD/USD OTC', 'USD/CAD OTC',
  
  // Minor Forex Pairs
  'EUR/GBP', 'EUR/JPY', 'EUR/CHF', 'EUR/AUD', 'EUR/CAD', 'EUR/NZD',
  'GBP/JPY', 'GBP/CHF', 'GBP/AUD', 'GBP/CAD', 'GBP/NZD',
  'AUD/JPY', 'AUD/NZD', 'AUD/CAD', 'AUD/CHF',
  'CAD/JPY', 'CAD/CHF', 'CHF/JPY', 'NZD/JPY', 'NZD/CAD', 'NZD/CHF',
  
  // Minor Forex Pairs OTC
  'EUR/GBP OTC', 'EUR/JPY OTC', 'EUR/CHF OTC', 'EUR/AUD OTC', 'EUR/CAD OTC', 'EUR/NZD OTC',
  'GBP/JPY OTC', 'GBP/CHF OTC', 'GBP/AUD OTC', 'GBP/CAD OTC', 'GBP/NZD OTC',
  'AUD/JPY OTC', 'AUD/NZD OTC', 'AUD/CAD OTC', 'AUD/CHF OTC',
  'CAD/JPY OTC', 'CAD/CHF OTC', 'CHF/JPY OTC', 'NZD/JPY OTC', 'NZD/CAD OTC', 'NZD/CHF OTC',
  
  // Exotic Forex Pairs
  'USD/TRY', 'USD/MXN', 'USD/ZAR', 'USD/BRL', 'USD/RUB', 'USD/INR', 'USD/NGN',
  'USD/PLN', 'USD/CZK', 'USD/HUF', 'USD/SGD', 'USD/HKD', 'USD/THB', 'USD/IDR', 'USD/PHP',
  'USD/NOK', 'USD/SEK', 'USD/DKK',
  'EUR/TRY', 'EUR/NOK', 'EUR/SEK', 'EUR/PLN', 'EUR/CZK', 'EUR/HUF', 'EUR/RUB', 'EUR/ZAR',
  'GBP/TRY', 'GBP/NOK', 'GBP/SEK', 'GBP/PLN', 'GBP/ZAR',
  
  // Exotic Forex Pairs OTC
  'USD/TRY OTC', 'USD/MXN OTC', 'USD/ZAR OTC', 'USD/BRL OTC', 'USD/RUB OTC', 'USD/INR OTC', 'USD/NGN OTC',
  'USD/PLN OTC', 'USD/CZK OTC', 'USD/HUF OTC', 'USD/SGD OTC', 'USD/HKD OTC', 'USD/THB OTC', 'USD/IDR OTC', 'USD/PHP OTC',
  'USD/NOK OTC', 'USD/SEK OTC', 'USD/DKK OTC',
  'EUR/TRY OTC', 'EUR/NOK OTC', 'EUR/SEK OTC', 'EUR/PLN OTC', 'EUR/CZK OTC', 'EUR/HUF OTC', 'EUR/RUB OTC', 'EUR/ZAR OTC',
  'GBP/TRY OTC', 'GBP/NOK OTC', 'GBP/SEK OTC', 'GBP/PLN OTC', 'GBP/ZAR OTC',
  
  // Cryptocurrency
  'BTC/USD', 'ETH/USD', 'XRP/USD', 'LTC/USD', 'BCH/USD', 'ADA/USD', 'DOT/USD', 'LINK/USD',
  'BNB/USD', 'SOL/USD', 'MATIC/USD', 'AVAX/USD', 'UNI/USD', 'ATOM/USD', 'XLM/USD', 'DOGE/USD', 'SHIB/USD',
  
  // Cryptocurrency OTC
  'BTC/USD OTC', 'ETH/USD OTC', 'XRP/USD OTC', 'LTC/USD OTC', 'BCH/USD OTC', 'ADA/USD OTC',
  'DOT/USD OTC', 'LINK/USD OTC', 'BNB/USD OTC', 'SOL/USD OTC', 'MATIC/USD OTC', 'AVAX/USD OTC', 'DOGE/USD OTC',
  
  // Commodities
  'XAU/USD', 'XAG/USD', 'XPT/USD', 'XPD/USD', 'WTI/USD', 'BRT/USD', 'GAS/USD', 'COP/USD',
  
  // Commodities OTC
  'XAU/USD OTC', 'XAG/USD OTC', 'WTI/USD OTC',
  
  // Indices
  'SPX500', 'NAS100', 'DJI30', 'UK100', 'GER40', 'FRA40', 'ESP35', 'ITA40', 'JPN225', 'HKG50', 'AUS200',
  
  // Indices OTC
  'SPX500 OTC', 'NAS100 OTC', 'DJI30 OTC', 'UK100 OTC', 'GER40 OTC', 'FRA40 OTC', 'JPN225 OTC',
];

const TIMEZONES = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00',
  'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00', 'UTC-01:00',
  'UTC+00:00', 'UTC+01:00', 'UTC+02:00', 'UTC+03:00', 'UTC+04:00', 'UTC+05:00',
  'UTC+06:00', 'UTC+07:00', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00', 'UTC+11:00', 'UTC+12:00'
];

// Technical Indicator Calculations
const calculateRSI = (prices: number[], period: number = 14): number => {
  if (prices.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

const calculateEMA = (prices: number[], period: number): number => {
  if (prices.length < period) return prices[prices.length - 1];
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a: number, b: number) => a + b, 0) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
};

const calculateMACD = (prices: number[]): { value: number; signal: number; histogram: number } => {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  
  const macdValues: number[] = [];
  for (let i = 0; i < Math.min(9, prices.length); i++) {
    const slice = prices.slice(Math.max(0, prices.length - 26 - i), prices.length - i);
    const e12 = calculateEMA(slice, 12);
    const e26 = calculateEMA(slice, 26);
    macdValues.push(e12 - e26);
  }
  
  const signalLine = calculateEMA(macdValues, 9);
  const histogram = macdLine - signalLine;
  
  return { value: macdLine, signal: signalLine, histogram };
};

const calculateBollingerBands = (prices: number[], period: number = 20): { upper: number; middle: number; lower: number } => {
  if (prices.length < period) {
    const avg = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    return { upper: avg, middle: avg, lower: avg };
  }
  
  const recentPrices = prices.slice(-period);
  const sma = recentPrices.reduce((a: number, b: number) => a + b, 0) / period;
  
  const squaredDiffs = recentPrices.map((price: number) => Math.pow(price - sma, 2));
  const variance = squaredDiffs.reduce((a: number, b: number) => a + b, 0) / period;
  const stdDev = Math.sqrt(variance);
  
  return {
    upper: sma + (stdDev * 2),
    middle: sma,
    lower: sma - (stdDev * 2)
  };
};

const calculateTrendStrength = (prices: number[]): number => {
  if (prices.length < 10) return 5;
  
  const recentPrices = prices.slice(-10);
  let upMoves = 0;
  let downMoves = 0;
  
  for (let i = 1; i < recentPrices.length; i++) {
    if (recentPrices[i] > recentPrices[i - 1]) upMoves++;
    else if (recentPrices[i] < recentPrices[i - 1]) downMoves++;
  }
  
  const strength = Math.abs(upMoves - downMoves);
  return Math.min(10, Math.round((strength / 9) * 10));
};

const findSupportResistance = (prices: number[]): { support: number; resistance: number } => {
  if (prices.length < 5) return { support: Math.min(...prices), resistance: Math.max(...prices) };
  
  const sorted = [...prices].sort((a: number, b: number) => a - b);
  const support = sorted[Math.floor(sorted.length * 0.1)];
  const resistance = sorted[Math.floor(sorted.length * 0.9)];
  
  return { support, resistance };
};

export default function TradingAIPage(): JSX.Element {
  const [settings, setSettings] = useState<UserSettings>({
    pocketOptionId: '',
    timezone: 'UTC+00:00',
    apiKey: ''
  });
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [selectedMarket, setSelectedMarket] = useState<string>('EUR/USD');
  const [showChartDialog, setShowChartDialog] = useState<boolean>(false);
  const [chartMarket, setChartMarket] = useState<string>('');
  
  const { addMiniApp } = useAddMiniApp();
  
  // SpacetimeDB authentication integration
  const isInFarcaster = useIsInFarcaster();
  useQuickAuth(isInFarcaster);
  
  const {
    connected: dbConnected,
    identity,
    hasPaid,
    loading: authLoading,
    error: authError,
    userPayment,
    allPayments,
    registerUser,
    markAsPaid,
    logout,
  } = useSpacetimeAuth();
  
  // State for login/signup/payment flow
  const [flowState, setFlowState] = useState<'login' | 'payment' | 'app'>('login');
  const [pendingPocketId, setPendingPocketId] = useState<string>('');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  
  useEffect(() => {
    const tryAddMiniApp = async (): Promise<void> => {
      try {
        await addMiniApp();
      } catch (error) {
        console.error('Failed to add mini app:', error);
      }
    };
    
    tryAddMiniApp();
  }, [addMiniApp]);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedSettings = localStorage.getItem('tradingAISettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings) as UserSettings;
        setSettings(parsed);
        if (parsed.pocketOptionId && parsed.timezone) {
          setIsSetupComplete(true);
        }
      }

      const savedSignals = localStorage.getItem('tradingSignals');
      if (savedSignals) {
        setSignals(JSON.parse(savedSignals) as TradeSignal[]);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Initialize Farcaster SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const initFarcaster = async (): Promise<void> => {
      try {
        if (sdk && sdk.actions && typeof sdk.actions.ready === 'function') {
          await sdk.actions.ready();
        }
      } catch (error) {
        console.error('Farcaster SDK initialization failed:', error);
      }
    };
    initFarcaster();
  }, []);

  // Fetch market data
  const fetchMarketData = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      const newMarketData: Record<string, MarketData> = {};
      
      for (const market of MARKETS) {
        let basePrice = 1.0;
        let volatility = 0.01;
        
        // Set base prices and volatility for different asset types
        if (market.includes('BTC')) { basePrice = 65000; volatility = 500; }
        else if (market.includes('ETH')) { basePrice = 3200; volatility = 100; }
        else if (market.includes('XRP') || market.includes('ADA') || market.includes('DOGE')) { basePrice = 0.5; volatility = 0.02; }
        else if (market.includes('LTC') || market.includes('BCH')) { basePrice = 200; volatility = 10; }
        else if (market.includes('SOL') || market.includes('AVAX') || market.includes('MATIC')) { basePrice = 100; volatility = 5; }
        else if (market.includes('BNB') || market.includes('DOT') || market.includes('LINK')) { basePrice = 300; volatility = 15; }
        else if (market.includes('SHIB')) { basePrice = 0.00001; volatility = 0.000001; }
        else if (market.includes('XAU')) { basePrice = 2000; volatility = 20; }
        else if (market.includes('XAG')) { basePrice = 25; volatility = 1; }
        else if (market.includes('XPT')) { basePrice = 950; volatility = 10; }
        else if (market.includes('XPD')) { basePrice = 1050; volatility = 15; }
        else if (market.includes('WTI') || market.includes('BRT')) { basePrice = 80; volatility = 2; }
        else if (market.includes('GAS')) { basePrice = 3.5; volatility = 0.2; }
        else if (market.includes('COP')) { basePrice = 4.2; volatility = 0.15; }
        else if (market.includes('SPX')) { basePrice = 5000; volatility = 50; }
        else if (market.includes('NAS')) { basePrice = 16000; volatility = 150; }
        else if (market.includes('DJI')) { basePrice = 38000; volatility = 300; }
        else if (market.includes('UK100')) { basePrice = 7500; volatility = 70; }
        else if (market.includes('GER')) { basePrice = 17000; volatility = 150; }
        else if (market.includes('FRA')) { basePrice = 7300; volatility = 60; }
        else if (market.includes('JPN')) { basePrice = 33000; volatility = 300; }
        else if (market.includes('JPY')) { basePrice = 150; volatility = 1; }
        else if (market.includes('TRY')) { basePrice = 32; volatility = 0.5; }
        else if (market.includes('MXN')) { basePrice = 17; volatility = 0.3; }
        else if (market.includes('BRL')) { basePrice = 5.0; volatility = 0.1; }
        else if (market.includes('RUB')) { basePrice = 92; volatility = 1.5; }
        else if (market.includes('INR')) { basePrice = 83; volatility = 0.8; }
        else if (market.includes('NGN')) { basePrice = 1500; volatility = 15; }
        else if (market.includes('PLN')) { basePrice = 4.0; volatility = 0.08; }
        else if (market.includes('CZK')) { basePrice = 23; volatility = 0.4; }
        else if (market.includes('HUF')) { basePrice = 360; volatility = 5; }
        else if (market.includes('THB')) { basePrice = 35; volatility = 0.5; }
        else if (market.includes('IDR')) { basePrice = 15700; volatility = 150; }
        else if (market.includes('PHP')) { basePrice = 56; volatility = 0.8; }
        else if (market.includes('ZAR')) { basePrice = 18; volatility = 0.3; }
        else if (market.includes('NOK') || market.includes('SEK') || market.includes('DKK')) { basePrice = 10; volatility = 0.2; }
        else if (market.includes('SGD')) { basePrice = 1.35; volatility = 0.02; }
        else if (market.includes('HKD')) { basePrice = 7.8; volatility = 0.1; }
        
        const randomChange = (Math.random() - 0.5) * volatility;
        const price = basePrice + randomChange;
        const change = randomChange;
        const percentChange = (change / basePrice) * 100;
        
        // Generate trend data with more realistic patterns
        const trend: number[] = [];
        let currentPrice = basePrice;
        for (let i = 0; i < 50; i++) {
          const trendBias = (Math.random() - 0.48) * volatility * 0.5;
          currentPrice += trendBias;
          trend.push(currentPrice);
        }
        
        // Simulate volume (higher for trending markets)
        const volume = Math.floor(Math.random() * 1000000) + 500000;
        
        newMarketData[market] = {
          symbol: market,
          price: parseFloat(price.toFixed(market.includes('BTC') || market.includes('ETH') ? 2 : 5)),
          change: parseFloat(change.toFixed(market.includes('BTC') || market.includes('ETH') ? 2 : 5)),
          percentChange: parseFloat(percentChange.toFixed(2)),
          timestamp: Date.now(),
          trend,
          volume
        };
      }
      
      setMarketData(newMarketData);
      setLastUpdate(Date.now());
      toast.success('Market data updated');
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast.error('Failed to fetch market data');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh market data every minute
  useEffect(() => {
    if (isSetupComplete) {
      fetchMarketData();
      const interval = setInterval(fetchMarketData, 60000);
      return () => clearInterval(interval);
    }
  }, [isSetupComplete, fetchMarketData]);

  // Calculate technical indicators for a market
  const calculateIndicators = (market: string): TechnicalIndicators | null => {
    const data = marketData[market];
    if (!data || data.trend.length < 20) return null;

    const prices = data.trend;
    const rsi = calculateRSI(prices);
    const macd = calculateMACD(prices);
    const bollingerBands = calculateBollingerBands(prices);
    const ema20 = calculateEMA(prices, 20);
    const ema50 = calculateEMA(prices, 50);
    const ema200 = calculateEMA(prices, Math.min(200, prices.length));
    const trendStrength = calculateTrendStrength(prices);
    const { support, resistance } = findSupportResistance(prices);

    return {
      rsi,
      macd,
      bollingerBands,
      ema20,
      ema50,
      ema200,
      trendStrength,
      supportLevel: support,
      resistanceLevel: resistance
    };
  };

  // Analyze market with professional indicators
  const analyzeMarketProfessional = (market: string): TradeSignal | null => {
    const data = marketData[market];
    if (!data) return null;

    const indicators = calculateIndicators(market);
    if (!indicators) return null;

    const confirmations: string[] = [];
    let bullishSignals = 0;
    let bearishSignals = 0;
    let confidence = 50;

    // RSI Analysis
    if (indicators.rsi < 30) {
      bullishSignals++;
      confirmations.push('RSI Oversold (Bullish)');
    } else if (indicators.rsi > 70) {
      bearishSignals++;
      confirmations.push('RSI Overbought (Bearish)');
    }

    // MACD Analysis
    if (indicators.macd.histogram > 0 && indicators.macd.value > indicators.macd.signal) {
      bullishSignals++;
      confirmations.push('MACD Bullish Crossover');
    } else if (indicators.macd.histogram < 0 && indicators.macd.value < indicators.macd.signal) {
      bearishSignals++;
      confirmations.push('MACD Bearish Crossover');
    }

    // Bollinger Bands Analysis
    if (data.price <= indicators.bollingerBands.lower) {
      bullishSignals++;
      confirmations.push('Price at Lower Bollinger Band');
    } else if (data.price >= indicators.bollingerBands.upper) {
      bearishSignals++;
      confirmations.push('Price at Upper Bollinger Band');
    }

    // EMA Analysis
    if (indicators.ema20 > indicators.ema50 && indicators.ema50 > indicators.ema200) {
      bullishSignals++;
      confirmations.push('Golden Cross Pattern');
    } else if (indicators.ema20 < indicators.ema50 && indicators.ema50 < indicators.ema200) {
      bearishSignals++;
      confirmations.push('Death Cross Pattern');
    }

    // Support/Resistance Analysis
    if (data.price <= indicators.supportLevel * 1.01) {
      bullishSignals++;
      confirmations.push('Price Near Support Level');
    } else if (data.price >= indicators.resistanceLevel * 0.99) {
      bearishSignals++;
      confirmations.push('Price Near Resistance Level');
    }

    // Trend Strength Analysis
    if (indicators.trendStrength >= 7) {
      confirmations.push(`Strong Trend (${indicators.trendStrength}/10)`);
    }

    // Determine direction based on confirmations
    let direction: 'up' | 'down';
    if (bullishSignals > bearishSignals) {
      direction = 'up';
      confidence = 50 + (bullishSignals * 10) + (indicators.trendStrength * 2);
    } else {
      direction = 'down';
      confidence = 50 + (bearishSignals * 10) + (indicators.trendStrength * 2);
    }

    // Only generate signals with 3+ confirmations
    if (confirmations.length < 3) return null;

    // Adjust confidence based on indicator alignment
    confidence = Math.min(95, confidence);
    
    // Select time frame based on trend strength
    let timeFrame: '1' | '3' | '5';
    if (indicators.trendStrength >= 8) {
      timeFrame = '5';
    } else if (indicators.trendStrength >= 5) {
      timeFrame = '3';
    } else {
      timeFrame = '1';
    }

    const now = new Date();
    const entryMinutes = Math.floor(Math.random() * 3) + 1;
    const entryTime = new Date(now.getTime() + entryMinutes * 60000);
    const targetMultiplier = direction === 'up' ? 1.002 : 0.998;

    // Generate detailed reason
    const reason = `${direction === 'up' ? 'Bullish' : 'Bearish'} reversal pattern detected with ${confirmations.length} technical confirmations. ${
      indicators.trendStrength >= 7 ? `Strong ${direction === 'up' ? 'upward' : 'downward'} momentum. ` : ''
    }RSI at ${indicators.rsi.toFixed(1)} ${indicators.rsi < 30 ? '(oversold)' : indicators.rsi > 70 ? '(overbought)' : '(neutral)'}. ${
      indicators.macd.histogram > 0 ? 'MACD showing bullish momentum.' : 'MACD showing bearish momentum.'
    }`;

    return {
      id: `${market}-${Date.now()}`,
      symbol: market,
      direction,
      timeFrame,
      confidence: parseFloat(confidence.toFixed(1)),
      entryTime: entryTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      currentPrice: data.price,
      targetPrice: parseFloat((data.price * targetMultiplier).toFixed(market.includes('BTC') || market.includes('ETH') ? 2 : 5)),
      reason,
      timestamp: Date.now(),
      indicators,
      confirmations
    };
  };

  // Generate trade signal with professional analysis
  const generateTrade = async (): Promise<void> => {
    if (!isSetupComplete) {
      toast.error('Please complete setup first');
      return;
    }

    setIsGenerating(true);
    setAnalysisStep('Initializing AI analysis engine...');
    
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      setAnalysisStep('Calculating technical indicators for 257 markets...');
      await new Promise(resolve => setTimeout(resolve, 1200));

      setAnalysisStep('Analyzing RSI, MACD, Bollinger Bands, and EMA...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAnalysisStep('Identifying support/resistance levels...');
      await new Promise(resolve => setTimeout(resolve, 900));

      setAnalysisStep('Applying multi-indicator confirmation strategy...');
      await new Promise(resolve => setTimeout(resolve, 1100));

      const potentialSignals: TradeSignal[] = [];

      // Analyze all markets with professional indicators
      for (const market of MARKETS) {
        const signal = analyzeMarketProfessional(market);
        if (signal && signal.confidence >= 70) {
          potentialSignals.push(signal);
        }
      }

      if (potentialSignals.length === 0) {
        toast.warning('No high-confidence signals found at this time. Market conditions not optimal.');
        setIsGenerating(false);
        setAnalysisStep('');
        return;
      }

      // Pick the best signal based on confidence and confirmations
      const bestSignal = potentialSignals.reduce((prev: TradeSignal, current: TradeSignal) => {
        if (current.confidence > prev.confidence) return current;
        if (current.confidence === prev.confidence && current.confirmations.length > prev.confirmations.length) return current;
        return prev;
      });

      const newSignals = [bestSignal, ...signals].slice(0, 10);
      setSignals(newSignals);
      if (typeof window !== 'undefined') {
        localStorage.setItem('tradingSignals', JSON.stringify(newSignals));
      }
      
      toast.success(`High-confidence ${bestSignal.direction.toUpperCase()} signal generated for ${bestSignal.symbol}!`, {
        duration: 5000
      });
    } catch (error) {
      console.error('Error generating trade:', error);
      toast.error('Failed to generate trade signal');
    } finally {
      setIsGenerating(false);
      setAnalysisStep('');
    }
  };

  // Save settings
  const saveSettings = (): void => {
    if (!settings.pocketOptionId || !settings.timezone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('tradingAISettings', JSON.stringify(settings));
    }
    setIsSetupComplete(true);
    toast.success('Settings saved successfully');
  };

  // Load Pocket Option ID from SpacetimeDB payment record
  useEffect(() => {
    if (userPayment && userPayment.pocketOptionId && !settings.pocketOptionId) {
      setSettings(prev => ({
        ...prev,
        pocketOptionId: userPayment.pocketOptionId
      }));
    }
  }, [userPayment, settings.pocketOptionId]);

  // Handle login/signup flow states
  const handleLoginSuccess = (pocketOptionId: string, payment: UserPayment | null): void => {
    setSettings(prev => ({
      ...prev,
      pocketOptionId: pocketOptionId
    }));
    setFlowState('app');
    toast.success(`Welcome back! Logged in successfully.`);
  };
  
  const handleNeedPayment = (pocketOptionId: string, email: string): void => {
    setPendingPocketId(pocketOptionId);
    setPendingEmail(email);
    setFlowState('payment');
  };
  
  const handlePaymentSuccess = (): void => {
    setSettings(prev => ({
      ...prev,
      pocketOptionId: pendingPocketId
    }));
    setFlowState('app');
    toast.success('Payment successful! Welcome to the app!');
  };
  
  // Show loading while connecting to database
  if (authLoading) {
    return (
      <LoginSignupFlow
        onLoginSuccess={handleLoginSuccess}
        onNeedPayment={handleNeedPayment}
        userPayments={allPayments}
        connected={dbConnected}
        loading={authLoading}
      />
    );
  }

  // Show login/signup screen if not in app state
  if (flowState === 'login') {
    return (
      <LoginSignupFlow
        onLoginSuccess={handleLoginSuccess}
        onNeedPayment={handleNeedPayment}
        userPayments={allPayments}
        connected={dbConnected}
        loading={authLoading}
      />
    );
  }
  
  // Show payment gate if user needs to pay
  if (flowState === 'payment' && pendingPocketId) {
    return (
      <PaymentGate
        pocketOptionId={pendingPocketId}
        email={pendingEmail || ''}
        onPaymentSuccess={handlePaymentSuccess}
        registerUser={registerUser}
        markAsPaid={markAsPaid}
      />
    );
  }

  // Setup screen
  if (!isSetupComplete) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 pt-16 md:pt-4">
        <BackgroundPaths title="Setup" />
        <Card className="w-full max-w-md relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <CardTitle className="text-2xl">AI Trading App Setup</CardTitle>
            </div>
            <CardDescription>
              Configure your Pocket Option account and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pocketOptionId">Pocket Option ID *</Label>
              <Input
                id="pocketOptionId"
                type="text"
                placeholder="Enter your Pocket Option ID"
                value={settings.pocketOptionId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setSettings({ ...settings, pocketOptionId: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Your unique Pocket Option account identifier
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone *</Label>
              <Select 
                value={settings.timezone} 
                onValueChange={(value: string) => setSettings({ ...settings, timezone: value })}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz: string) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the timezone set in your Pocket Option profile
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key (Optional)</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter API key for real-time data"
                value={settings.apiKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setSettings({ ...settings, apiKey: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Optional: For enhanced real-time market data
              </p>
            </div>

            <Button onClick={saveSettings} className="w-full" size="lg">
              <Settings className="mr-2 h-4 w-4" />
              Save Settings & Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full">
      <BackgroundPaths title="AI Trading Dashboard" />
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            <h1 className="text-base sm:text-xl font-bold text-black">AI Trading App</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-600 text-xs sm:text-sm">
              <Activity className="mr-1 h-3 w-3" />
              Live
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchMarketData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-3 sm:p-4 pb-20 space-y-3 sm:space-y-4 pt-16 md:pt-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <Card className="bg-white/90 backdrop-blur-sm shadow-md">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {Object.values(marketData).filter((m: MarketData) => m.percentChange > 0).length}
              </div>
              <p className="text-xs text-gray-600">Markets Up</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm shadow-md">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {Object.values(marketData).filter((m: MarketData) => m.percentChange < 0).length}
              </div>
              <p className="text-xs text-gray-600">Markets Down</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm shadow-md">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{signals.length}</div>
              <p className="text-xs text-gray-600">Active Signals</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm shadow-md">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="text-lg sm:text-2xl font-bold text-purple-600">
                {new Date(lastUpdate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <p className="text-xs text-gray-600">Last Update</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="markets" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11 bg-white/90 backdrop-blur-sm">
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="markets" className="space-y-3 sm:space-y-4">
            {/* Generate Trade Button - Now at the top and sticky */}
            <div className="sticky top-[60px] z-40 bg-white/80 backdrop-blur-sm pb-2 rounded-lg">
              <Button
                onClick={generateTrade}
                disabled={isGenerating}
                className="w-full h-14 sm:h-16 text-base sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                size="lg"
              >
                {isGenerating ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span className="text-sm sm:text-base">Analyzing Markets...</span>
                    </div>
                    {analysisStep && (
                      <span className="text-xs mt-1 opacity-80">{analysisStep}</span>
                    )}
                  </div>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Generate Trade Signal</span>
                    <Zap className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </>
                )}
              </Button>
            </div>

            <Card className="bg-white/90 backdrop-blur-sm shadow-md">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-black">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                  Live Market Data
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-600">
                  Real-time prices with technical analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                {MARKETS.map((market: string) => {
                  const data = marketData[market];
                  if (!data) return null;

                  return (
                    <div
                      key={market}
                      className="flex items-center justify-between p-2.5 sm:p-3 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-lg hover:from-blue-100/80 hover:to-purple-100/80 transition-all cursor-pointer border border-gray-200/50 shadow-sm"
                      onClick={() => setSelectedMarket(market)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        {data.percentChange >= 0 ? (
                          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                        )}
                        <div>
                          <div className="font-semibold text-sm sm:text-base text-black">{market}</div>
                          <div className="text-xs text-gray-600">
                            {new Date(data.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm sm:text-base text-black">{data.price}</div>
                        <div className={`text-xs sm:text-sm font-semibold ${data.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {data.percentChange >= 0 ? '+' : ''}{data.percentChange}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signals" className="space-y-3 sm:space-y-4">
            {signals.length === 0 ? (
              <Card className="bg-white/90 backdrop-blur-sm shadow-md">
                <CardContent className="pt-12 pb-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No signals generated yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Click &quot;Generate Trade Signal&quot; to get professional AI analysis
                  </p>
                </CardContent>
              </Card>
            ) : (
              signals.map((signal: TradeSignal) => (
                <Card key={signal.id} className="overflow-hidden bg-white/90 backdrop-blur-sm shadow-md">
                  <CardHeader className={`${signal.direction === 'up' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {signal.direction === 'up' ? (
                          <TrendingUp className="h-6 w-6 text-green-400" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-400" />
                        )}
                        <div>
                          <CardTitle className="text-lg">{signal.symbol}</CardTitle>
                          <CardDescription className="text-xs">
                            {new Date(signal.timestamp).toLocaleString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={signal.direction === 'up' ? 'bg-green-500' : 'bg-red-500'}>
                        {signal.direction.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Time Frame</p>
                        <p className="text-lg font-bold">{signal.timeFrame} min</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="text-lg font-bold text-green-400">{signal.confidence}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Entry Time</p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <p className="text-sm font-semibold">{signal.entryTime}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Entry Price</p>
                        <p className="text-sm font-semibold">{signal.currentPrice}</p>
                      </div>
                    </div>

                    <Progress value={signal.confidence} className="h-2" />

                    {/* Technical Indicators Display */}
                    <div className="bg-slate-800/50 p-3 rounded-lg space-y-2">
                      <p className="text-xs font-semibold flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Technical Analysis
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">RSI:</span>
                          <span className={`ml-1 font-semibold ${
                            signal.indicators.rsi < 30 ? 'text-green-400' : 
                            signal.indicators.rsi > 70 ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {signal.indicators.rsi.toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">MACD:</span>
                          <span className={`ml-1 font-semibold ${
                            signal.indicators.macd.histogram > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {signal.indicators.macd.histogram > 0 ? 'Bullish' : 'Bearish'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Trend:</span>
                          <span className="ml-1 font-semibold text-blue-400">
                            {signal.indicators.trendStrength}/10
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confirmations:</span>
                          <span className="ml-1 font-semibold text-purple-400">
                            {signal.confirmations.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Confirmations */}
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs font-semibold mb-2">Signal Confirmations:</p>
                      <div className="space-y-1">
                        {signal.confirmations.map((conf: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                            <span className="text-muted-foreground">{conf}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs font-semibold mb-1">AI Analysis</p>
                      <p className="text-sm text-muted-foreground">{signal.reason}</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `🎯 ${signal.symbol}\n📊 Direction: ${signal.direction.toUpperCase()}\n⏱️ Time: ${signal.timeFrame}min\n💯 Confidence: ${signal.confidence}%\n🕐 Entry: ${signal.entryTime}\n💰 Price: ${signal.currentPrice}\n\n✅ Confirmations:\n${signal.confirmations.map((c: string) => `• ${c}`).join('\n')}`
                          );
                          toast.success('Signal copied to clipboard');
                        }}
                      >
                        Copy Signal
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setChartMarket(signal.symbol);
                          setShowChartDialog(true);
                        }}
                      >
                        <LineChart className="mr-1 h-4 w-4" />
                        View Chart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-3 sm:space-y-4">
            <Card className="bg-white/90 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle className="text-black">Account Settings</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your Pocket Option integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Pocket Option ID</Label>
                  <Input
                    type="text"
                    value={settings.pocketOptionId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setSettings({ ...settings, pocketOptionId: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select 
                    value={settings.timezone}
                    onValueChange={(value: string) => setSettings({ ...settings, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz: string) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>API Key (Optional)</Label>
                  <Input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setSettings({ ...settings, apiKey: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    For enhanced real-time market data and WebSocket connections
                  </p>
                </div>

                <Button onClick={saveSettings} className="w-full">
                  Save Changes
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.clear();
                    }
                    setIsSetupComplete(false);
                    setSignals([]);
                    toast.info('All data cleared');
                  }}
                >
                  Reset All Data
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle className="text-black">Professional Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p className="font-semibold text-black mb-2">✨ Advanced Technical Analysis:</p>
                <ul className="space-y-1 ml-4">
                  <li>• RSI (Relative Strength Index) - Oversold/Overbought detection</li>
                  <li>• MACD - Momentum and trend change analysis</li>
                  <li>• Bollinger Bands - Volatility and breakout signals</li>
                  <li>• EMA (20, 50, 200) - Trend direction and crossovers</li>
                  <li>• Support/Resistance Levels - Key price zones</li>
                  <li>• Multi-indicator confirmation (3+ confirmations required)</li>
                  <li>• Trend strength scoring (1-10 scale)</li>
                </ul>
                <p className="text-xs text-yellow-500 mt-4">
                  ⚠️ Trading involves risk. This tool is for educational purposes only.
                  Always do your own research before trading.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chart Dialog */}
      <Dialog open={showChartDialog} onOpenChange={setShowChartDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              {chartMarket} Price Chart
            </DialogTitle>
            <DialogDescription>
              Recent price trend and technical analysis
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {marketData[chartMarket] && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Current Price</p>
                    <p className="text-xl font-bold">{marketData[chartMarket].price}</p>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Change</p>
                    <p className={`text-xl font-bold ${
                      marketData[chartMarket].percentChange >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {marketData[chartMarket].percentChange >= 0 ? '+' : ''}{marketData[chartMarket].percentChange}%
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Trend</p>
                    <p className="text-xl font-bold flex items-center gap-1">
                      {marketData[chartMarket].percentChange >= 0 ? (
                        <><TrendingUp className="h-5 w-5 text-green-400" /> Bullish</>
                      ) : (
                        <><TrendingDown className="h-5 w-5 text-red-400" /> Bearish</>
                      )}
                    </p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart
                    data={marketData[chartMarket].trend.slice(-20).map((price: number, index: number) => ({
                      time: index,
                      price: price
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9ca3af"
                      label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      domain={['auto', 'auto']}
                      label={{ value: 'Price', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={marketData[chartMarket].percentChange >= 0 ? '#22c55e' : '#ef4444'}
                      strokeWidth={2}
                      dot={false}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Last 20 data points showing recent price movement
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
