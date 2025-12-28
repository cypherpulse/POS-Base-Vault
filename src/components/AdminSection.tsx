import { useState } from 'react';
import { Shield, UserPlus, UserMinus, Pause, Play, AlertTriangle, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useAddMerchant,
  useRemoveMerchant,
  usePauseContract,
  useUnpauseContract,
  useEmergencyWithdraw,
  useTransferOwnership,
  useRenounceOwnership,
  useContractPaused,
  useUserRole,
} from '@/hooks/usePOSVault';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function AdminSection() {
  const { isOwner } = useUserRole();
  const { data: isPaused } = useContractPaused();

  const [merchantAddress, setMerchantAddress] = useState('');
  const [removeMerchantAddress, setRemoveMerchantAddress] = useState('');
  const [emergencyTo, setEmergencyTo] = useState('');
  const [emergencyAmount, setEmergencyAmount] = useState('');
  const [newOwner, setNewOwner] = useState('');

  const { addMerchant, isPending: isAddingMerchant } = useAddMerchant();
  const { removeMerchant, isPending: isRemovingMerchant } = useRemoveMerchant();
  const { pause, isPending: isPausing } = usePauseContract();
  const { unpause, isPending: isUnpausing } = useUnpauseContract();
  const { emergencyWithdraw, isPending: isEmergencyWithdrawing } = useEmergencyWithdraw();
  const { transferOwnership, isPending: isTransferring } = useTransferOwnership();
  const { renounceOwnership, isPending: isRenouncing } = useRenounceOwnership();

  const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const handleAddMerchant = () => {
    if (isValidAddress(merchantAddress)) {
      addMerchant(merchantAddress as `0x${string}`);
      setMerchantAddress('');
    }
  };

  const handleRemoveMerchant = () => {
    if (isValidAddress(removeMerchantAddress)) {
      removeMerchant(removeMerchantAddress as `0x${string}`);
      setRemoveMerchantAddress('');
    }
  };

  const handleEmergencyWithdraw = () => {
    if (isValidAddress(emergencyTo) && emergencyAmount) {
      emergencyWithdraw(emergencyTo as `0x${string}`, emergencyAmount);
      setEmergencyTo('');
      setEmergencyAmount('');
    }
  };

  const handleTransferOwnership = () => {
    if (isValidAddress(newOwner)) {
      transferOwnership(newOwner as `0x${string}`);
      setNewOwner('');
    }
  };

  if (!isOwner) {
    return (
      <div className="glass-card p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground">Admin Access Required</h3>
          <p className="text-muted-foreground max-w-sm text-sm sm:text-base">
            Only the contract owner can access admin functions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Admin Controls</h2>
          <p className="text-muted-foreground text-sm">Owner-only contract management</p>
        </div>
      </div>

      {/* Merchant Management */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
          <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Merchant Management
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Add Merchant</label>
            <div className="flex gap-2">
              <Input
                placeholder="0x..."
                value={merchantAddress}
                onChange={(e) => setMerchantAddress(e.target.value)}
                className="font-mono text-sm sm:text-base"
              />
              <Button
                onClick={handleAddMerchant}
                disabled={!isValidAddress(merchantAddress) || isAddingMerchant}
                size="icon"
                className="shrink-0 w-10 h-10 sm:w-11 sm:h-11"
              >
                {isAddingMerchant ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Remove Merchant</label>
            <div className="flex gap-2">
              <Input
                placeholder="0x..."
                value={removeMerchantAddress}
                onChange={(e) => setRemoveMerchantAddress(e.target.value)}
                className="font-mono text-sm sm:text-base"
              />
              <Button
                onClick={handleRemoveMerchant}
                disabled={!isValidAddress(removeMerchantAddress) || isRemovingMerchant}
                variant="destructive"
                size="icon"
                className="shrink-0 w-10 h-10 sm:w-11 sm:h-11"
              >
                {isRemovingMerchant ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <UserMinus className="w-3 h-3 sm:w-4 sm:h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contract State */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
          {isPaused ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 text-success" />}
          Contract State
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base ${isPaused ? 'bg-destructive/20 text-destructive' : 'bg-success/20 text-success'}`}>
            {isPaused ? 'Paused' : 'Active'}
          </div>

          {isPaused ? (
            <Button onClick={() => unpause()} disabled={isUnpausing} variant="outline" className="w-full sm:w-auto">
              {isUnpausing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Resume Contract
            </Button>
          ) : (
            <Button onClick={() => pause()} disabled={isPausing} variant="destructive" className="w-full sm:w-auto">
              {isPausing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Pause className="w-4 h-4 mr-2" />}
              Pause Contract
            </Button>
          )}
        </div>
      </div>

      {/* Emergency Withdraw */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
          Emergency Withdraw
        </h3>

        <div className="p-3 sm:p-4 rounded-xl bg-warning/10 border border-warning/30 text-sm text-warning mb-4">
          Warning: This will bypass normal withdrawal flow. Use only in emergencies.
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Recipient Address</label>
            <Input
              placeholder="0x..."
              value={emergencyTo}
              onChange={(e) => setEmergencyTo(e.target.value)}
              className="font-mono text-sm sm:text-base"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Amount (ETH)</label>
            <Input
              type="number"
              step="0.001"
              placeholder="0.0"
              value={emergencyAmount}
              onChange={(e) => setEmergencyAmount(e.target.value)}
              className="font-mono text-sm sm:text-base"
            />
          </div>
        </div>

        <Button
          onClick={handleEmergencyWithdraw}
          disabled={!isValidAddress(emergencyTo) || !emergencyAmount || isEmergencyWithdrawing}
          variant="destructive"
          className="w-full h-10 sm:h-11 text-sm sm:text-base"
        >
          {isEmergencyWithdrawing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
          Emergency Withdraw
        </Button>
      </div>

      {/* Ownership */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
          <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Ownership Management
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Transfer Ownership</label>
            <div className="flex gap-2">
              <Input
                placeholder="New owner address (0x...)"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className="font-mono text-sm sm:text-base"
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={!isValidAddress(newOwner) || isTransferring}
                    variant="outline"
                    className="shrink-0"
                  >
                    {isTransferring ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Transfer'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Transfer Ownership?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will transfer contract ownership to {newOwner}. You will lose all admin privileges. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleTransferOwnership}>
                      Transfer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={isRenouncing}>
                {isRenouncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                Renounce Ownership
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Renounce Ownership?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove your ownership of the contract. There will be no owner after this action. This is irreversible!
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => renounceOwnership()} className="bg-destructive hover:bg-destructive/90">
                  Renounce
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
