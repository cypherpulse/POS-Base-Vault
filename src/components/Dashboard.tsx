import { useState } from 'react';
import { ConnectKitButton } from 'connectkit';
import { CreditCard, Wallet, Shield, Info, Menu, X } from 'lucide-react';
import { useUserRole, useContractEvents, useContractPaused } from '@/hooks/usePOSVault';
import { POSSection } from './POSSection';
import { MerchantSection } from './MerchantSection';
import { AdminSection } from './AdminSection';
import { InfoSection } from './InfoSection';
import { Button } from '@/components/ui/button';

type TabType = 'pos' | 'merchant' | 'admin' | 'info';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('pos');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isConnected, isOwner, isMerchant, role, address } = useUserRole();
  const { data: isPaused } = useContractPaused();
  
  // Listen to contract events
  useContractEvents();

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; access: 'all' | 'merchant' | 'owner' }[] = [
    { id: 'pos', label: 'Payment POS', icon: CreditCard, access: 'all' },
    { id: 'merchant', label: 'Merchant', icon: Wallet, access: 'merchant' },
    { id: 'admin', label: 'Admin', icon: Shield, access: 'owner' },
    { id: 'info', label: 'Contract Info', icon: Info, access: 'all' },
  ];

  const visibleTabs = tabs.filter((tab) => {
    if (tab.access === 'all') return true;
    if (tab.access === 'merchant') return isMerchant || isOwner;
    if (tab.access === 'owner') return isOwner;
    return false;
  });

  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="glass-card p-12 text-center animate-fade-in">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto pulse-glow">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Connect your wallet to access the POS dashboard and interact with the POSVault contract on Base Sepolia.
            </p>
            <ConnectKitButton.Custom>
              {({ show }) => (
                <Button onClick={show} size="lg" className="text-lg px-8">
                  Connect Wallet
                </Button>
              )}
            </ConnectKitButton.Custom>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'pos':
        return <POSSection />;
      case 'merchant':
        return <MerchantSection />;
      case 'admin':
        return <AdminSection />;
      case 'info':
        return <InfoSection />;
      default:
        return <POSSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold gradient-text">BasePOS</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Decentralized POS on Base</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {isConnected && (
                <div className="hidden lg:flex items-center gap-2">
                  <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                    isPaused ? 'bg-destructive/20 text-destructive' : 'bg-success/20 text-success'
                  }`}>
                    {isPaused ? 'Paused' : 'Live'}
                  </div>
                  <div className="px-2 sm:px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium capitalize">
                    {role}
                  </div>
                </div>
              )}

              <ConnectKitButton />

              {isConnected && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && isConnected && (
            <div className="lg:hidden absolute left-0 right-0 top-full bg-background/95 backdrop-blur-xl border-b border-border/50 p-4 animate-fade-in">
              <div className="flex flex-col gap-2">
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar - Desktop */}
          {isConnected && (
            <aside className="hidden xl:block w-64 xl:w-72 shrink-0">
              <nav className="glass-card p-4 sticky top-24 space-y-2">
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}

                {address && (
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Connected</p>
                    <p className="font-mono text-sm text-foreground truncate">
                      {address.slice(0, 8)}...{address.slice(-6)}
                    </p>
                  </div>
                )}
              </nav>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-xl mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-semibold text-foreground">BasePOS</p>
                <p className="text-xs text-muted-foreground">Decentralized Payment System</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-xs text-muted-foreground">
              <a 
                href="https://basescan.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Base Network
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                GitHub
              </a>
              <a 
                href="#" 
                className="hover:text-primary transition-colors"
              >
                Documentation
              </a>
            </div>

            <div className="text-center sm:text-right">
              <p className="text-xs text-muted-foreground">© 2026 BasePOS</p>
              <p className="text-xs text-muted-foreground">All rights reserved</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
