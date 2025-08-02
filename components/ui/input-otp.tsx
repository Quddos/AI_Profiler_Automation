"use client"

import * as React from "react"
import { OTPInput, Slot, type OTPInputContext } from "input-otp"
import { Minus } from "lucide-react"

import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  ),
)
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center", className)} {...props} />,
)
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot> & { index: number }
>(({ index, className, ...props }, ref) => (
  <Slot
    ref={ref}
    index={index}
    className={cn(
      "relative flex h-10 w-10 items-center justify-center border border-input text-sm transition-all first:rounded-l-md last:rounded-r-md",
      "focus-within:z-10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-background",
      className,
    )}
    {...props}
  >
    {({ char, has }: OTPInputContext) => (
      <React.Fragment>
        {char}
        {has && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="h-4 w-4 animate-caret-blink rounded-full bg-foreground opacity-0" />
          </span>
        )}
      </React.Fragment>
    )}
  </Slot>
))
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-center", className)} {...props}>
      <Minus />
    </div>
  ),
)
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
