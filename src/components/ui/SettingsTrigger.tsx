"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { useAuthStore } from "@/stores/authStore";
import { useMapStyleStore } from "@/stores/mapStyleStore";
import { Spinner } from "./Spinner";
import { UserInfoModal } from "../modal/UserInfoModal";

interface SettingsTriggerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  className?: string;
}

export function SettingsTrigger({ isOpen, onOpen, onClose, className = "" }: SettingsTriggerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [toggleMyInfo, setToggleMyInfo] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { mapDarkMode, toggleMapDarkMode } = useMapStyleStore();

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMypage = () => {
    setToggleMyInfo(true);
    onClose();
  };

  const handleLogout = () => {
    onClose();
    logout();
    router.push("/login");
  };

  const handleToggleMapDarkMode = () => {
    setIsLoading(true);
    toggleMapDarkMode();
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const handleToggle = () => {
    if (isOpen) onClose();
    else onOpen();
  };

  return (
    <>
      {isLoading && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          aria-live="polite"
          aria-busy="true"
        >
          <Spinner size="lg" />
        </div>
      )}
      <div
        ref={settingsRef}
        className={cn("fixed bottom-6 right-4 z-40 flex flex-col items-end gap-2", className)}
      >
        {isOpen && (
          <div
            className="animate-list-item-in w-[180px] rounded-2xl border border-white/40 bg-white/80 py-2 shadow-xl backdrop-blur-md"
            role="menu"
          >
            <Button
              variant="ghost"
              onClick={handleToggleMapDarkMode}
              className="w-full rounded-none px-4 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-[#6f62cb]/10 focus:ring-2 focus:ring-[#6f62cb] focus:ring-inset focus:ring-offset-0 focus:outline-none"
              role="menuitem"
            >
              지도 {mapDarkMode ? "밝게" : "어둡게"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleMypage}
              className="w-full rounded-none px-4 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-[#6f62cb]/10 focus:ring-2 focus:ring-[#6f62cb] focus:ring-inset focus:ring-offset-0 focus:outline-none"
              role="menuitem"
            >
              내 정보
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full rounded-none px-4 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-[#6f62cb]/10 focus:ring-2 focus:ring-[#6f62cb] focus:ring-inset focus:ring-offset-0 focus:outline-none"
              role="menuitem"
            >
              로그아웃
            </Button>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleToggle}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all p-0",
            "bg-white/60 backdrop-blur-md border border-white/50",
            "hover:bg-white/80 active:scale-95",
            "focus:ring-2 focus:ring-[#6f62cb] focus:ring-inset focus:ring-offset-0 focus:outline-none",
            isOpen ? "text-[#6f62cb]" : "text-gray-500 hover:text-[#6f62cb]"
          )}
          aria-label="설정"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </Button>
      </div>
      {toggleMyInfo && (
        <UserInfoModal isOpen={toggleMyInfo} onClose={() => setToggleMyInfo(false)} />
      )}
    </>
  );
}
