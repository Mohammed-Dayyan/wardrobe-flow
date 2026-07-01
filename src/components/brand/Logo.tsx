import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "tile";
}

const sizeClasses = {
  sm: {
    icon: "size-8",
    logo: "h-8 w-auto",
  },
  md: {
    icon: "size-9",
    logo: "h-9 w-auto",
  },
  lg: {
    icon: "size-10",
    logo: "h-10 w-auto",
  },
} as const;

export function Logo({
  className,
  href,
  showText = true,
  size = "md",
  variant = "default",
}: LogoProps) {
  const sizes = sizeClasses[size];
  const useIconOnly = !showText || variant === "tile";

  const image = useIconOnly ? (
    <Image
      src="/brand/icon.png"
      alt="WardrobeFlow"
      width={128}
      height={128}
      className={cn("shrink-0", sizes.icon)}
      priority
    />
  ) : (
    <Image
      src="/brand/logo.png"
      alt="WardrobeFlow"
      width={540}
      height={128}
      className={cn("shrink-0 max-w-none", sizes.logo)}
      priority
    />
  );

  const wrapperClass = cn("inline-flex items-center justify-center", className);

  if (href) {
    return (
      <Link href={href} className={wrapperClass}>
        {image}
      </Link>
    );
  }

  return <div className={wrapperClass}>{image}</div>;
}
