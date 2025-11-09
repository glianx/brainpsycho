"use client";

import { Interest, INTERESTS_CONFIG } from "@/lib/ai/customize";
import { motion } from "framer-motion";

interface InterestBubbleProps {
    interest: Interest;
    isSelected: boolean;
    onToggle: () => void;
    initialX: number;
    initialY: number;
    animationDuration: number; // Pass duration from parent
}

export function InterestBubble({
    interest,
    isSelected,
    onToggle,
    initialX,
    initialY,
    animationDuration,
}: InterestBubbleProps) {
    const config = INTERESTS_CONFIG[interest];

    return (
        <motion.div
            drag
            dragConstraints={{
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
            }}
            dragElastic={0.2}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            whileDrag={{
                scale: 1.15,
                cursor: "grabbing",
                zIndex: 50,
            }}
            whileHover={{
                scale: 1.05,
            }}
            animate={{
                y: [0, -10, 0],
                scale: isSelected ? 1.1 : 1,
                backgroundColor: isSelected ? config.color : "#E5E7EB",
                boxShadow: isSelected
                    ? `0 10px 30px ${config.color}40`
                    : "0 4px 15px rgba(0, 0, 0, 0.1)",
            }}
            transition={{
                y: {
                    duration: animationDuration,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                },
                scale: { duration: 0.3 },
                backgroundColor: { duration: 0.3 },
                boxShadow: { duration: 0.3 },
            }}
            onClick={onToggle}
            style={{
                position: "absolute",
                left: `${initialX}%`,
                top: `${initialY}%`,
                transform: "translate(-50%, -50%)",
            }}
            className={`
                rounded-full px-6 py-4 cursor-grab
                select-none text-center
                transition-colors duration-300
                ${isSelected ? "text-white font-semibold" : "text-gray-700"}
            `}
        >
            <div className="flex flex-col items-center gap-1">
                <span className="text-3xl">{config.emoji}</span>
                <span className="text-sm sm:text-base whitespace-nowrap">{config.label}</span>
            </div>
        </motion.div>
    );
}
