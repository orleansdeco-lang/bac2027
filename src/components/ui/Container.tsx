import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Container({
  children,
  size = "lg",
  className,
  ...props
}: ContainerProps) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-3xl lg:max-w-4xl",
    lg: "max-w-5xl lg:max-w-6xl xl:max-w-7xl 3xl:max-w-[1720px]",
    xl: "max-w-6xl lg:max-w-7xl 2xl:max-w-[1800px] 3xl:max-w-[2100px]",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "w-full mx-auto px-3.5 sm:px-6 md:px-8 3xl:px-12",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
