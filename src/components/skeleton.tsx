import type { HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      className={twMerge('animate-pulse rounded-lg bg-zinc-300', className)}
      {...rest}
    />
  )
}
