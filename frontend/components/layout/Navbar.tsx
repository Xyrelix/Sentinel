'use client';

import React from 'react';
import { Shield, Wallet, ChevronRight } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { cn } from '@/lib/utils';
import { useSentinelStore } from '@/store/useSentinelStore';
import { NavTab } from '@/types/sentinel';

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);

  const activeTab = useSentinelStore((state) => state.activeTab);
  const setActiveTab = useSentinelStore((state) => state.setActiveTab);
  const wallet = useSentinelStore((state) => state.wallet);
  const isConnecting = useSentinelStore((state) => state.isConnecting);
  const connectWallet = useSentinelStore((state) => state.connectWallet);
  const disconnectWallet = useSentinelStore((state) => state.disconnectWallet);

  const links: { id: NavTab; label: string }[] = wallet.isConnected
    ? [
        { id: 'landing', label: 'Overview' },
        { id: 'scanner', label: 'AI Scanner' },
        { id: 'wallet', label: 'Wallet Health' },
      ]
    : [];

  const walletLabel = wallet.isConnected
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : isConnecting
    ? 'Connecting...'
    : 'Connect Wallet';

  const handleWalletClick = () => {
    if (wallet.isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    setOpen(false);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 mx-auto w-full max-w-7xl border-b border-transparent transition-all duration-300 md:rounded-2xl md:border md:ease-out',
        {
          'bg-[#050505]/90 border-[#1E1E1E] backdrop-blur-xl md:top-3 md:max-w-6xl md:shadow-2xl':
            scrolled && !open,
          'bg-[#050505]/95': open,
        }
      )}
    >
      <nav
        className={cn(
          'flex h-16 w-full items-center justify-between px-4 md:h-14 md:transition-all md:ease-out',
          {
            'md:px-4': scrolled,
          }
        )}
      >
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-red-700 shadow-red-glow group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-black tracking-wider text-white group-hover:text-primary transition-colors flex items-center gap-1.5 leading-none">
              SENTINEL <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 uppercase">AI</span>
            </span>
          </div>
        </button>

        {/* Center Links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={cn(
                  buttonVariants({
                    variant: isActive ? 'default' : 'ghost',
                    size: 'sm',
                  }),
                  'text-xs font-semibold cursor-pointer rounded-lg px-3',
                  isActive ? 'bg-primary text-white' : 'text-accent hover:text-white'
                )}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Right Action Buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <Button
            size="sm"
            onClick={handleWalletClick}
            disabled={isConnecting}
            className="flex items-center gap-2 text-xs font-bold bg-gradient-to-r from-primary to-red-600 text-white shadow-red-glow hover:shadow-red-glow-lg cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{walletLabel}</span>
            <ChevronRight className="w-3 h-3 opacity-70" />
          </Button>
        </div>

        {/* Mobile Toggle Button */}
        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(!open)}
          className="md:hidden border-[#1E1E1E] text-accent hover:text-white bg-[#111111]"
        >
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>

      {/* Mobile Drawer Menu */}
      <div
        className={cn(
          'bg-[#0A0A0A]/95 fixed top-16 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y border-[#1E1E1E] md:hidden',
          open ? 'block' : 'hidden'
        )}
      >
        <div
          data-slot={open ? 'open' : 'closed'}
          className={cn(
            'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
            'flex h-full w-full flex-col justify-between gap-y-2 p-4'
          )}
        >
          <div className="grid gap-y-2">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={cn(
                  buttonVariants({
                    variant: activeTab === link.id ? 'default' : 'ghost',
                    className: 'justify-start text-sm font-bold',
                  })
                )}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-[#1E1E1E]">
            <Button
              onClick={() => {
                handleWalletClick();
                setOpen(false);
              }}
              disabled={isConnecting}
              className="w-full text-xs font-bold bg-gradient-to-r from-primary to-red-600 text-white shadow-red-glow"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {walletLabel}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
