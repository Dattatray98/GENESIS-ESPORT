import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    width?: "fit-content" | "100%";
    delay?: number;
}

export const ScrollReveal = ({ children, className = "", width = "100%", delay = 0 }: ScrollRevealProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <div ref={ref} style={{ width }} className={className}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ duration: 0.5, delay, ease: "easeOut" }}
                className="h-full py-3"
            >
                {children}
            </motion.div>
        </div>
    );
};
