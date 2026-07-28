"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/Icon";
import { MaskIcon } from "@/components/ui/MaskIcon";
import { useSentinelStore } from "@/store/useSentinelStore";
import { DisconnectConfirmModal } from "@/components/wallet/DisconnectConfirmModal";

export function DocsHeader() {
  const [isDisconnectModalOpen, setDisconnectModalOpen] = React.useState(false);

  const wallet = useSentinelStore((state) => state.wallet);
  const isConnecting = useSentinelStore((state) => state.isConnecting);
  const setConnectModalOpen = useSentinelStore((state) => state.setConnectModalOpen);

  const walletLabel = wallet.isConnected
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : isConnecting
    ? "Connecting..."
    : "Connect Wallet";

  const handleWalletClick = () => {
    if (wallet.isConnected) {
      setDisconnectModalOpen(true);
    } else {
      setConnectModalOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#1E1E1E] bg-[#050505]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-black/40 border border-primary/30 shadow-red-glow group-hover:scale-105 transition-transform overflow-hidden">
            <img src="/logo.png" alt="Sentinel Logo" className="w-6 h-6 object-contain" />
          </div>
          <Image
            src="/Sentinel4.png"
            alt="SENTINEL"
            width={86}
            height={14}
            className="h-3.5 w-auto object-contain"
            unoptimized
            priority
          />
          <span className="hidden sm:inline-block ml-1 rounded-full border border-[#1E1E1E] bg-[#111111] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
            Docs
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/Xyrelix/Sentinel"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#1E1E1E] text-accent transition-colors hover:bg-[#111111] hover:text-white"
          >
            <MaskIcon name="github" className="w-4 h-4" />
          </a>
          <Button
            size="sm"
            onClick={handleWalletClick}
            disabled={isConnecting}
            className="flex items-center gap-2 text-xs font-bold bg-gradient-to-r from-primary to-red-600 text-white shadow-red-glow hover:shadow-red-glow-lg cursor-pointer"
          >
            <Icon name="wallet" className="w-3.5 h-3.5" />
            <span>{walletLabel}</span>
          </Button>
        </div>
      </div>

      <DisconnectConfirmModal
        isOpen={isDisconnectModalOpen}
        onClose={() => setDisconnectModalOpen(false)}
      />
    </header>
  );
}
