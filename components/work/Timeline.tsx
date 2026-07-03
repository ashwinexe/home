"use client";

import { motion } from "framer-motion";
import { WorkExperience } from "@/types";
import Image from "next/image";

interface TimelineProps {
  experiences: WorkExperience[];
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export function Timeline({ experiences }: TimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-te-gray md:-translate-x-1/2" />

      <div className="space-y-12">
        {experiences.map((exp, index) => (
          <motion.div
            key={exp.id}
            variants={itemVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className={`relative flex flex-col md:flex-row gap-8 ${
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            {/* Timeline dot */}
            <div className="absolute left-0 md:left-1/2 w-4 h-4 bg-te-orange rounded-full border-4 border-te-beige -translate-x-1/2 md:-translate-x-1/2 z-10" />

            {/* Content */}
            <div
              className={`flex-1 ml-8 md:ml-0 ${
                index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
              }`}
            >
              <div
                className={`inline-block ${
                  index % 2 === 0 ? "md:float-right" : ""
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white border-2 border-te-gray rounded-te p-6 max-w-md hover:border-te-dark transition-colors"
                >
                  {/* Company logo/image */}
                  <div className="w-12 h-12 rounded-te mb-4 overflow-hidden flex-shrink-0">
                    {exp.image ? (
                      <Image
                        src={exp.image}
                        alt={`${exp.company} logo`}
                        width={48}
                        height={48}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-te-gray flex items-center justify-center text-2xl">
                        {exp.company.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-te-orange font-medium mb-1">
                    {exp.period}
                  </div>
                  <h3 className="text-xl font-bold">{exp.company}</h3>
                  <p className="text-te-dark/60 font-medium">{exp.role}</p>
                  <p className="text-sm text-te-dark/50">{exp.location}</p>

                  <p className="mt-4 text-sm text-te-dark/80 leading-relaxed">
                    {exp.description}
                  </p>

                  {exp.highlights.length > 0 && (
                    <ul className="mt-4 space-y-1">
                      {exp.highlights.map((highlight, i) => (
                        <li
                          key={i}
                          className="text-sm text-te-dark/60 flex items-start gap-2"
                        >
                          <span className="text-te-orange">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  )}

                  {exp.url && (
                    <a
                      href={exp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-4 text-sm text-te-orange hover:underline"
                    >
                      Visit website →
                    </a>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Spacer for the other side */}
            <div className="hidden md:block flex-1" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
