"use client";

import type { ReactNode } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}: ModalProps) {
  if (!isOpen) return null;

  const titleId = title ? "modal-title" : undefined;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-black/20 transition-opacity duration-300"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-2xl border border-white/50 bg-white/20 backdrop-blur-md ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            {title ? (
              <h2
                id={titleId}
                className="text-[20px] font-semibold leading-snug text-gray-800"
              >
                {title}
              </h2>
            ) : (
              <span className="flex-1" aria-hidden />
            )}
            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="shrink-0 rounded-full text-gray-400 transition-colors hover:bg-[#6f62cb]/10 hover:text-[#6f62cb]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
