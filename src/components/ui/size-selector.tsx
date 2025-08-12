"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  min: number;
  max: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  className?: string;
  disabled?: boolean;
  label?: string;
  step?: number;
}

export function SizeSelector({
  min,
  max,
  defaultValue = min,
  onChange,
  className,
  disabled = false,
  label = "Width",
  step = 1,
}: SizeSelectorProps) {
  const [value, setValue] = useState(defaultValue);
  const [inputValue, setInputValue] = useState(defaultValue.toString());
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setValue(defaultValue);
    setInputValue(defaultValue.toString());
  }, [defaultValue]);

  // Update when external changes occur (like unit changes)
  useEffect(() => {
    if (Math.abs(value - defaultValue) > 0.001) {
      setValue(defaultValue);
      setInputValue(defaultValue.toString());
    }
  }, [defaultValue, value]);

  const triggerAnimation = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setIsAnimating(true);
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      animationTimeoutRef.current = null;
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const updateValue = (newValue: number) => {
    const clampedValue = Math.min(Math.max(newValue, min), max);
    setValue(clampedValue);
    setInputValue(clampedValue.toString());
    onChange?.(clampedValue);
    triggerAnimation();
  };

  const increment = () => {
    if (disabled) return;
    updateValue(value + step);
  };

  const decrement = () => {
    if (disabled) return;
    updateValue(value - step);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newInputValue = e.target.value;

    if (newInputValue === "" || newInputValue === "-") {
      setInputValue(newInputValue);
      return;
    }

    // Allow decimal numbers if step is not 1
    const regex = step === 1 ? /^-?\d*$/ : /^-?\d*\.?\d*$/;
    if (!regex.test(newInputValue)) {
      return;
    }

    setInputValue(newInputValue);

    const numericValue =
      step === 1
        ? Number.parseInt(newInputValue, 10)
        : Number.parseFloat(newInputValue);
    if (!isNaN(numericValue)) {
      const clampedValue = Math.min(Math.max(numericValue, min), max);
      setValue(clampedValue);
      onChange?.(clampedValue);
    }
  };

  const handleInputBlur = () => {
    if (inputValue === "" || inputValue === "-") {
      setInputValue(value.toString());
    } else {
      const numericValue =
        step === 1
          ? Number.parseInt(inputValue, 10)
          : Number.parseFloat(inputValue);
      if (!isNaN(numericValue)) {
        const clampedValue = Math.min(Math.max(numericValue, min), max);
        setValue(clampedValue);
        setInputValue(clampedValue.toString());
        onChange?.(clampedValue);
      } else {
        setInputValue(value.toString());
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      increment();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      decrement();
    } else if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <label className="text-xs text-gray-600 dark:text-gray-300 mb-1 font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            "w-full h-8 px-2 pr-8 text-xs font-medium",
            "bg-white/60 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600 rounded-md",
            "text-gray-900 dark:text-gray-100 placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "transition-all duration-200",
            "hover:border-gray-400 dark:hover:border-gray-500",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            "selection:bg-blue-200 dark:selection:bg-blue-800 selection:text-gray-900 dark:selection:text-gray-100",
            disabled &&
              "bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-600 cursor-not-allowed",
            isAnimating && "scale-105"
          )}
        />

        <div
          className={cn(
            "absolute right-0 top-0 h-full flex flex-col border-l border-gray-300 dark:border-gray-600 transition-all duration-200",
            isAnimating && "scale-105 scale-x-110"
          )}
        >
          <button
            type="button"
            onClick={increment}
            disabled={disabled || value >= max}
            className={cn(
              "flex-1 px-1.5 flex items-center justify-center transition-all duration-150 border-b border-gray-300 dark:border-gray-600 rounded-tr-md",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus:outline-none",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              "active:opacity-75",
              isAnimating && "scale-105 scale-x-110"
            )}
            aria-label="Increase value"
          >
            <ChevronUp className="w-3 h-3 text-gray-600 dark:text-gray-400 hover:stroke-[3] transition-all duration-150" />
          </button>

          <button
            type="button"
            onClick={decrement}
            disabled={disabled || value <= min}
            className={cn(
              "flex-1 px-1.5 flex items-center justify-center transition-all duration-150 rounded-br-md",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus:outline-none",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              "active:opacity-75",
              isAnimating && "scale-105 scale-x-110"
            )}
            aria-label="Decrease value"
          >
            <ChevronDown className="w-3 h-3 text-gray-600 dark:text-gray-400 hover:stroke-[3] transition-all duration-150" />
          </button>
        </div>
      </div>
    </div>
  );
}
