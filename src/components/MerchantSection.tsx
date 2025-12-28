import { useState, useEffect } from 'react';
import { Wallet, Calculator, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWithdraw, useContractBalance, useProtocolFeeBps, useContractPaused, useUserRole } from '@/hooks/usePOSVault';

export function MerchantSection() {
  const [amount, setAmount] = useState('');
  const { withdraw, isPending, isConfirming, isSuccess, hash } = useWithdraw();
  const { data: balance, refetch: refetchBalance } = useContractBalance();
  const { data: feeBps } = useProtocolFeeBps();
  const { data: isPaused } = useContractPaused();
  const { isMerchant, isOwner } = useUserRole();

  const balanceEth = balance ? formatEther(balance) : '0';
  const feePercentage = feeBps ? Number(feeBps) / 100 : 0;

  const amountNum = parseFloat(amount) || 0;
  const feeAmount = amountNum * (feePercentage / 100);
  const netAmount = amountNum - feeAmount;

  useEffect(() => {
    if (isSuccess) {
      refetchBalance();
    }
  }, [isSuccess, refetchBalance]);

  const handleWithdraw = () => {
    if (amount && parseFloat(amount) > 0) {
      withdraw(amount);
    }
  };

  const resetForm = () => {
    setAmount('');
  };

  if (!isMerchant && !isOwner) {
    return (
      <div className="glass-card p-8 animate-fade-in">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Wallet className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Merchant Access Required</h3>
          <p className="text-muted-foreground max-w-sm">
            Only registered merchants can withdraw funds. Contact the contract owner to get registered.
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="glass-card p-8 animate-fade-in">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Withdrawal Successful!</h3>
            <p className="text-muted-foreground">
              {netAmount.toFixed(6)} ETH has been sent to your wallet
            </p>
          </div>
          {hash && (
            <a
              href={`https://sepolia.basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-mono text-sm flex items-center gap-2"
            >
              View transaction <ArrowRight className="w-4 h-4" />
            </a>
          )}
          <Button onClick={resetForm} variant="outline" className="mt-4">
            New Withdrawal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center">
          <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Merchant Withdrawals</h2>
          <p className="text-muted-foreground text-sm">Withdraw your funds from the vault</p>
        </div>
      </div>

      {isPaused && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 sm:p-4 text-destructive text-sm">
          Contract is currently paused. Withdrawals are temporarily disabled.
        </div>
      )}

      <div className="p-3 sm:p-4 rounded-xl bg-primary/10 border border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-muted-foreground text-sm sm:text-base">Contract Balance</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-primary">{parseFloat(balanceEth).toFixed(6)} ETH</span>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Withdraw Amount (ETH)
          </label>
          <Input
            type="number"
            step="0.001"
            min="0"
            max={balanceEth}
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="font-mono text-base sm:text-lg h-12 sm:h-14"
            disabled={isPaused || isPending || isConfirming}
          />
        </div>

        {amount && parseFloat(amount) > 0 && (
          <div className="p-3 sm:p-4 rounded-xl bg-muted/50 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calculator className="w-4 h-4" />
              <span className="text-sm font-medium">Fee Calculation</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Amount</span>
                <span className="font-mono">{amountNum.toFixed(6)} ETH</span>
              </div>
              <div className="flex justify-between text-destructive">
                <span>Protocol Fee ({feePercentage}%)</span>
                <span className="font-mono">-{feeAmount.toFixed(6)} ETH</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span className="text-foreground">You Receive</span>
                <span className="font-mono text-success">{netAmount.toFixed(6)} ETH</span>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleWithdraw}
          disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(balanceEth) || isPaused || isPending || isConfirming}
          className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold"
        >
          {(isPending || isConfirming) ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isPending ? 'Confirm in wallet...' : 'Processing...'}
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Withdraw Funds
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
