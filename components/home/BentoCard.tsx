"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export type CardSize =
  | "1x1"
  | "1x2"
  | "2x1"
  | "2x2"
  | "2x3"
  | "3x2"
  | "4x2"
  | "4x1"
  | "4x3"
  | "2x4"
  | "4x4";

interface BentoCardProps {
  children: ReactNode;
  size?: CardSize;
  href?: string;
  className?: string;
  variant?: "default" | "highlight" | "subtle";
  backgroundImage?: string;
  overlayGradient?: "bottom" | "top" | "none";
}

// Responsive size classes: mobile (2-col grid) -> tablet (6-col) -> desktop (8-col)
const sizeClasses: Record<CardSize, string> = {
  "1x1": "col-span-1 row-span-1",
  "1x2": "col-span-1 row-span-2",
  "2x1": "col-span-2 md:col-span-2 row-span-1",
  "2x2": "col-span-2 md:col-span-2 row-span-2",
  "2x3": "col-span-2 md:col-span-2 row-span-3",
  "3x2": "col-span-2 md:col-span-3 row-span-2",
  "4x2": "col-span-2 md:col-span-4 row-span-3 md:row-span-2",
  "4x3": "col-span-2 md:col-span-4 row-span-3",
  "2x4": "col-span-2 md:col-span-2 row-span-4",
  "4x4": "col-span-2 md:col-span-4 row-span-4",
  "4x1": "col-span-2 md:col-span-4 row-span-1",
};

const variantClasses = {
  default: "bg-white border-te-gray hover:border-te-dark",
  highlight: "bg-te-dark text-te-beige border-te-dark",
  subtle: "bg-te-light-gray border-te-gray hover:border-te-dark",
};

const gradientClasses = {
  bottom: "bg-gradient-to-t from-te-dark/80 via-te-dark/40 to-transparent",
  top: "bg-gradient-to-b from-te-dark/80 via-te-dark/40 to-transparent",
  none: "",
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

export function BentoCard({
  children,
  size = "2x2",
  href,
  className = "",
  variant = "default",
  backgroundImage,
  overlayGradient = "bottom",
  ...motionProps
}: BentoCardProps & HTMLMotionProps<"div">) {
  const hasImage = Boolean(backgroundImage);

  const baseClasses = `
    ${sizeClasses[size]}
    ${hasImage ? "border-te-gray hover:border-te-dark" : variantClasses[variant]}
    border-2 rounded-te
    ${hasImage ? "p-0" : "p-4 md:p-6"}
    transition-all duration-300
    ${href ? "cursor-pointer" : ""}
    group relative overflow-hidden
  `;

  const content = (
    <>
      {hasImage && backgroundImage && (
        <>
          <div className="absolute inset-0">
            <Image
              src={backgroundImage}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          {overlayGradient !== "none" && (
            <div className={`absolute inset-0 ${gradientClasses[overlayGradient]}`} />
          )}
        </>
      )}
      <div className={`relative z-10 h-full ${hasImage ? "p-4 md:p-6 text-te-beige flex flex-col justify-end" : ""}`}>
        {children}
      </div>
    </>
  );

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        scale: href ? 1.02 : 1,
        boxShadow: href
          ? "0 10px 30px -10px rgba(26, 26, 26, 0.2)"
          : "none",
      }}
      className={`${baseClasses} ${className} h-full`}
      {...motionProps}
    >
      {href ? (
        <Link href={href} className="block h-full">
          {content}
        </Link>
      ) : (
        content
      )}
    </motion.div>
  );
}
