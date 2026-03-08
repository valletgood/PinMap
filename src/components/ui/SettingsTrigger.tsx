"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
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
            className={cn(
              "animate-list-item-in w-[180px] rounded-2xl border py-2 shadow-xl backdrop-blur-md",
              mapDarkMode ? "bg-black/60 border-black" : "border-white/40 bg-white/80"
            )}
            role="menu"
          >
            <Button
              variant="ghost"
              onClick={handleToggleMapDarkMode}
              className={cn(
                "w-full rounded-none px-4 py-2.5 text-left text-sm font-medium focus:ring-2 focus:ring-[#6f62cb] focus:ring-inset focus:ring-offset-0 focus:outline-none",
                mapDarkMode
                  ? "text-white hover:bg-white/10 active:bg-white/20"
                  : "text-gray-800 hover:bg-[#6f62cb]/10 active:bg-[#6f62cb]/20"
              )}
              role="menuitem"
            >
              지도 {mapDarkMode ? "밝게" : "어둡게"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleMypage}
              className={cn(
                "w-full rounded-none px-4 py-2.5 text-left text-sm font-medium focus:ring-2 focus:ring-[#6f62cb] focus:ring-inset focus:ring-offset-0 focus:outline-none",
                mapDarkMode
                  ? "text-white hover:bg-white/10 active:bg-white/20"
                  : "text-gray-800 hover:bg-[#6f62cb]/10 active:bg-[#6f62cb]/20"
              )}
              role="menuitem"
            >
              내 정보
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                "w-full rounded-none px-4 py-2.5 text-left text-sm font-medium focus:ring-2 focus:ring-[#6f62cb] focus:ring-inset focus:ring-offset-0 focus:outline-none",
                mapDarkMode
                  ? "text-white hover:bg-white/10 active:bg-white/20"
                  : "text-gray-800 hover:bg-[#6f62cb]/10 active:bg-[#6f62cb]/20"
              )}
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
            "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all p-0 backdrop-blur-md border",
            mapDarkMode
              ? "bg-black/60 border-black hover:bg-black/70 active:bg-black/80"
              : "bg-white/60 border-white/50 hover:bg-white/80 active:bg-white/90",
            "active:scale-95",
            "focus:ring-2 focus:ring-[#6f62cb] focus:ring-inset focus:ring-offset-0 focus:outline-none",
            isOpen
              ? mapDarkMode
                ? "text-[#a89ce8]"
                : "text-[#6f62cb]"
              : mapDarkMode
                ? "text-white/80 hover:text-[#a89ce8]"
                : "text-gray-500 hover:text-[#6f62cb]"
          )}
          aria-label="설정"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <Image
            src="/icons/ico_setting.svg"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6"
            aria-hidden
          />
        </Button>
      </div>
      {toggleMyInfo && (
        <UserInfoModal isOpen={toggleMyInfo} onClose={() => setToggleMyInfo(false)} />
      )}
    </>
  );
}
