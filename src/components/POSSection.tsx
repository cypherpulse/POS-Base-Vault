import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, QrCode, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDeposit, useMinDeposit, useContractPaused } from '@/hooks/usePOSVault';
import { POS_VAULT_ADDRESS } from '@/config/contract';

export function POSSection() {
  const [amount, setAmount] = useState('');
  const [showQR, setShowQR] = useState(false);
  const { deposit, isPending, isConfirming, isSuccess, hash } = useDeposit();
  const { data: minDeposit } = useMinDeposit();
  const { data: isPaused } = useContractPaused();

  const minDepositEth = minDeposit ? formatEther(minDeposit) : '0.001';
  const isValidAmount = amount && parseFloat(amount) >= parseFloat(minDepositEth);

  const handleGenerateQR = () => {
    if (isValidAmount) {
      setShowQR(true);
    }
  };

  const handlePay = () => {
    if (isValidAmount) {
      deposit(amount);
    }
  };

  const resetPayment = () => {
    setAmount('');
    setShowQR(false);
  };

  if (isSuccess) {
    return (
      <div className="glass-card p-8 animate-fade-in">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground">
              {amount} ETH has been deposited
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
          <Button onClick={resetPayment} variant="outline" className="mt-4">
            New Payment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Payment Terminal</h2>
          <p className="text-muted-foreground text-sm">Accept ETH payments on Base Sepolia</p>
        </div>
      </div>

      {isPaused && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive text-sm">
          Contract is currently paused. Payments are temporarily disabled.
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Amount (ETH)
          </label>
          <div className="relative">
            <Input
              type="number"
              step="0.001"
              min={minDepositEth}
              placeholder={`Min: ${minDepositEth} ETH`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono text-lg h-14 pr-16"
              disabled={isPaused || isPending || isConfirming}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              ETH
            </span>
          </div>
          {amount && !isValidAmount && (
            <p className="text-destructive text-sm mt-2">
              Amount must be at least {minDepositEth} ETH
            </p>
          )}
        </div>

        {!showQR ? (
          <Button
            onClick={handleGenerateQR}
            disabled={!isValidAmount || isPaused}
            className="w-full h-14 text-lg font-semibold"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Generate Payment QR
          </Button>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center p-6 bg-background/50 rounded-xl border border-border/50">
              <div className="p-4 bg-foreground rounded-xl mb-4">
                <QRCodeSVG
                  value={`ethereum:${POS_VAULT_ADDRESS}@84532?value=${parseFloat(amount) * 1e18}`}
                  size={200}
                  bgColor="hsl(210 40% 98%)"
                  fgColor="hsl(222 47% 6%)"
                  level="H"
                />
              </div>
              <p className="text-muted-foreground text-sm text-center">
                Scan with your wallet or click below to pay
              </p>
              <div className="font-mono text-2xl font-bold text-primary mt-2">
                {amount} ETH
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => setShowQR(false)}
                disabled={isPending || isConfirming}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePay}
                disabled={isPending || isConfirming || isPaused}
                className="relative"
              >
                {(isPending || isConfirming) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isPending ? 'Confirm in wallet...' : 'Processing...'}
                  </>
                ) : (
                  'Pay Now'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Contract: <span className="font-mono">{POS_VAULT_ADDRESS.slice(0, 10)}...{POS_VAULT_ADDRESS.slice(-8)}</span>
        </p>
      </div>
    </div>
  );
}
