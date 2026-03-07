"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Radio 컴포넌트
 *
 * 라디오 버튼을 위한 재사용 가능한 컴포넌트
 *
 * @example
 * ```tsx
 * <Radio
 *   id="male"
 *   name="gender"
 *   value="male"
 *   label="남성"
 *   checked={gender === "male"}
 *   onChange={handleChange}
 * />
 * ```
 */
interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
}

export const Radio = React.memo<RadioProps>(
  ({ label, helperText, className = "", id, ...props }) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-start space-x-3">
        <div className="flex items-center h-5">
          <input
            id={radioId}
            type="radio"
            className={cn(
              "w-4 h-4 text-[#6938D3] border-gray-300 focus:ring-2 focus:ring-[#6938D3] focus:ring-offset-0 cursor-pointer transition-colors",
              "disabled:bg-gray-100 disabled:border-gray-300 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor={radioId}
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

Radio.displayName = "Radio";
