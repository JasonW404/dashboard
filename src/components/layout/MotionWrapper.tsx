"use client";
import { motion } from "framer-motion";

export const MotionContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={className}
        >
            {children}
        </motion.div>
    )
}

export const MotionItem = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div variants={item} className={className}>
            {children}
        </motion.div>
    )
}
