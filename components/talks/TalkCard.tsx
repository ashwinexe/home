"use client";

import { motion } from "framer-motion";
import { Talk } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

interface TalkCardProps {
  talk: Talk;
}

export function TalkCard({ talk }: TalkCardProps) {
  const hasImage = Boolean(talk.image);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative rounded-te overflow-hidden border-2 border-te-gray hover:border-te-dark transition-colors"
    >
      {/* Background Image with Overlay */}
      {hasImage ? (
        <>
          <div className="absolute inset-0">
            <Image
              src={talk.image!}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-te-dark/90 via-te-dark/50 to-te-dark/20" />
        </>
      ) : (
        <div className="absolute inset-0 bg-te-light-gray" />
      )}

      {/* Content Layer */}
      <div
        className={`relative z-10 p-6 h-full flex flex-col justify-end min-h-[220px] ${
          hasImage ? "text-te-beige" : "text-te-dark"
        }`}
      >
        {/* Badge Row */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={talk.type === "upcoming" ? "orange" : "default"}>
            {talk.type === "upcoming" ? "Upcoming" : "Past"}
          </Badge>
          <span
            className={`text-sm ${
              hasImage ? "text-te-beige/70" : "text-te-dark/50"
            }`}
          >
            {talk.location}
          </span>
        </div>

        {/* Title & Event */}
        <h3 className="text-lg font-bold group-hover:text-te-orange transition-colors">
          {talk.title}
        </h3>
        <p className={`${hasImage ? "text-te-beige/80" : "text-te-dark/60"}`}>
          {talk.event}
        </p>
        <p
          className={`text-sm mt-1 ${
            hasImage ? "text-te-beige/60" : "text-te-dark/50"
          }`}
        >
          {formatDate(talk.date)}
        </p>

        {/* Action Links */}
        {(talk.video || talk.slides) && (
          <div className="mt-4 flex gap-4">
            {talk.video && (
              <a
                href={talk.video}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-te-orange hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Watch
              </a>
            )}
            {talk.slides && (
              <a
                href={talk.slides}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 text-sm ${
                  hasImage
                    ? "text-te-beige/70 hover:text-te-beige"
                    : "text-te-dark/60 hover:text-te-dark"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-4 h-4"
                  strokeWidth={2}
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
                Slides
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
