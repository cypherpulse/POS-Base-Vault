import { useState } from 'react';
import { Info, Search, CheckCircle2, XCircle, Copy, ExternalLink } from 'lucide-react';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useContractBalance,
  useMinDeposit,
  useProtocolFeeBps,
  useTreasury,
  useContractOwner,
  useContractPaused,
  useIsMerchant,
} from '@/hooks/usePOSVault';
import { POS_VAULT_ADDRESS } from '@/config/contract';
import { useToast } from '@/hooks/use-toast';

export function InfoSection() {
  const [checkAddress, setCheckAddress] = useState('');
  const { toast } = useToast();
  
  const { data: balance } = useContractBalance();
  const { data: minDeposit } = useMinDeposit();
  const { data: feeBps } = useProtocolFeeBps();
  const { data: treasury } = useTreasury();
  const { data: owner } = useContractOwner();
  const { data: isPaused } = useContractPaused();
  const { data: isMerchantResult } = useIsMerchant(
    checkAddress && /^0x[a-fA-F0-9]{40}$/.test(checkAddress) 
      ? (checkAddress as `0x${string}`) 
      : undefined
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Address copied to clipboard',
    });
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const stats = [
    {
      label: 'Contract Balance',
      value: balance ? `${parseFloat(formatEther(balance)).toFixed(6)} ETH` : '...',
      highlight: true,
    },
    {
      label: 'Minimum Deposit',
      value: minDeposit ? `${formatEther(minDeposit)} ETH` : '...',
    },
    {
      label: 'Protocol Fee',
      value: feeBps ? `${Number(feeBps) / 100}%` : '...',
    },
    {
      label: 'Contract Status',
      value: isPaused === undefined ? '...' : isPaused ? 'Paused' : 'Active',
      status: isPaused === undefined ? 'neutral' : isPaused ? 'error' : 'success',
    },
  ];

  const addresses = [
    { label: 'Contract', value: POS_VAULT_ADDRESS },
    { label: 'Owner', value: owner || '...' },
    { label: 'Treasury', value: treasury || '...' },
  ];

  return (
    <div className="glass-card p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Info className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Contract Info</h2>
          <p className="text-muted-foreground text-sm">View contract state and constants</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl ${stat.highlight ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'}`}
          >
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-lg font-bold font-mono ${
              stat.status === 'success' ? 'text-success' : 
              stat.status === 'error' ? 'text-destructive' : 
              stat.highlight ? 'text-primary' : 'text-foreground'
            }`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Addresses */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Contract Addresses</h3>
        {addresses.map((addr, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-20">{addr.label}</span>
              <span className="font-mono text-sm">
                {typeof addr.value === 'string' && addr.value.startsWith('0x') 
                  ? formatAddress(addr.value) 
                  : addr.value}
              </span>
            </div>
            {typeof addr.value === 'string' && addr.value.startsWith('0x') && (
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(addr.value)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <a
                  href={`https://sepolia.basescan.org/address/${addr.value}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Merchant Check */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Check Merchant Status</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter address to check (0x...)"
            value={checkAddress}
            onChange={(e) => setCheckAddress(e.target.value)}
            className="font-mono"
          />
          <Button size="icon" variant="outline">
            <Search className="w-4 h-4" />
          </Button>
        </div>
        
        {checkAddress && /^0x[a-fA-F0-9]{40}$/.test(checkAddress) && (
          <div className={`flex items-center gap-3 p-4 rounded-lg ${
            isMerchantResult ? 'bg-success/10 border border-success/30' : 'bg-muted/50'
          }`}>
            {isMerchantResult ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="text-success font-medium">This address is a registered merchant</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">This address is not a merchant</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
