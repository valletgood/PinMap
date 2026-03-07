"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Checkbox 컴포넌트
 *
 * 폼 체크박스를 위한 재사용 가능한 컴포넌트
 *
 * @example
 * ```tsx
 * <Checkbox
 *   id="terms"
 *   label="이용약관에 동의합니다"
 *   checked={checked}
 *   onChange={handleChange}
 * />
 * ```
 */
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  helperText?: string;
  onChange?: (checked: boolean) => void;
}

export const Checkbox = React.memo<CheckboxProps>(
  ({ label, helperText, className = "", id, onChange, ...props }) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <div className="flex items-start space-x-3">
        <div className="flex items-center h-5">
          <input
            id={checkboxId}
            type="checkbox"
            className={cn(
              "w-4 h-4 text-[#6938D3] border-gray-300 rounded focus:ring-2 focus:ring-[#6938D3] focus:ring-offset-0 cursor-pointer transition-colors",
              "disabled:bg-gray-100 disabled:border-gray-300 disabled:cursor-not-allowed",
              className
            )}
            onChange={handleOnChange}
            {...props}
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor={checkboxId}
            className="text-sm font-medium text-gray-700 cursor-pointer select-none"
          >
            {label}
          </label>
          {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
