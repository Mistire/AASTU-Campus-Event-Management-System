"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

interface DiscoveryCarouselProps {
  children: React.ReactNode;
}

export function DiscoveryCarousel({ children }: DiscoveryCarouselProps) {
  const childrenArray = React.Children.toArray(children);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 30 });

  const updateStats = () => {
    if (containerRef.current && innerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const innerWidth = innerRef.current.scrollWidth;
      const currentX = x.get();
      
      setCanScrollLeft(currentX < -10);
      setCanScrollRight(currentX > containerWidth - innerWidth + 10);
      
      const totalScrollable = innerWidth - containerWidth;
      if (totalScrollable > 0) {
        const progress = Math.abs(currentX) / totalScrollable;
        setScrollProgress(Math.min(1, Math.max(0, progress)));
      }
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current && innerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const innerWidth = innerRef.current.scrollWidth;
      
      const moveAmount = containerWidth * 0.7;
      let newX = x.get() + (direction === "left" ? moveAmount : -moveAmount);
      
      const minX = containerWidth - innerWidth - 32;
      newX = Math.min(0, Math.max(newX, minX));
      
      x.set(newX);
    }
  };

  useEffect(() => {
    updateStats();
    const unsubscribe = springX.on("change", updateStats);
    window.addEventListener("resize", updateStats);
    const timer = setTimeout(updateStats, 100);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", updateStats);
      clearTimeout(timer);
    };
  }, [children]);

  return (
    <div className="relative w-full group" ref={containerRef}>
      <div className="overflow-hidden py-8 px-1">
        <motion.div
          ref={innerRef}
          style={{ x: springX }}
          drag="x"
          dragConstraints={containerRef}
          onDrag={updateStats}
          className="flex gap-8 cursor-grab active:cursor-grabbing"
        >
          {childrenArray.map((child, i) => (
            <div key={i} className="shrink-0 select-none pointer-events-none sm:pointer-events-auto">
              {child}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Buttons - Balanced "Goldilocks" Design: Visible, Elegant, Premium */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-4 sm:-mx-8 z-20">
        <AnimatePresence>
          {canScrollLeft && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="pointer-events-auto"
            >
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                className="rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 text-gray-900 transition-all duration-300 w-14 h-14 hover:border-brand hover:text-brand hover:scale-110 active:scale-95"
              >
                <ChevronLeft size={24} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {canScrollRight && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="pointer-events-auto ml-auto"
            >
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                className="rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 text-gray-900 transition-all duration-300 w-14 h-14 hover:border-brand hover:text-brand hover:scale-110 active:scale-95"
              >
                <ChevronRight size={24} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar - Minimal context */}
      <div className="mt-6 flex flex-col items-center">
        <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-brand"
            initial={{ width: 0 }}
            animate={{ width: `${scrollProgress * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>
    </div>
  );
}
