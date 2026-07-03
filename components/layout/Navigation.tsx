"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/work", label: "Work" },
  { href: "/projects", label: "Projects" },
  { href: "/talks", label: "Talks" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      {/* Logo / Name */}
      <Link href="/" className="group">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2"
        >
          <span className="text-lg font-semibold">ashwinexe</span>
          <span className="text-te-orange group-hover:rotate-12 transition-transform">
            ↗
          </span>
        </motion.div>
      </Link>

      {/* Nav Links */}
      <ul className="flex flex-wrap items-center gap-1 sm:gap-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <li key={item.href}>
              <Link href={item.href}>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative px-3 py-1.5 text-sm font-medium rounded-md
                    transition-colors duration-200
                    ${
                      isActive
                        ? "text-te-beige bg-te-dark"
                        : "text-te-dark hover:bg-te-gray"
                    }
                  `}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-te-dark rounded-md -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
