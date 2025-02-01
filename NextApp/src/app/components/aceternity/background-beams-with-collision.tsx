"use client";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";

export const BackgroundBeamsWithCollision = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);

  // Added more beams and made them larger with h-20, h-24, etc.
  const beams = [
    {
      initialX: 10,
      translateX: 10,
      duration: 7,
      repeatDelay: 3,
      delay: 2,
      className: "h-24 w-1", // Made wider
    },
    {
      initialX: 600,
      translateX: 600,
      duration: 3,
      repeatDelay: 3,
      delay: 4,
      className: "h-20 w-1",
    },
    {
      initialX: 100,
      translateX: 100,
      duration: 7,
      repeatDelay: 7,
      className: "h-32 w-1", // Made larger
    },
    {
      initialX: 400,
      translateX: 400,
      duration: 5,
      repeatDelay: 14,
      delay: 4,
      className: "h-28 w-1",
    },
    {
      initialX: 800,
      translateX: 800,
      duration: 11,
      repeatDelay: 2,
      className: "h-24 w-1",
    },
    {
      initialX: 1000,
      translateX: 1000,
      duration: 4,
      repeatDelay: 2,
      className: "h-20 w-1",
    },
    {
      initialX: 1200,
      translateX: 1200,
      duration: 6,
      repeatDelay: 4,
      delay: 2,
      className: "h-28 w-1",
    },
    // Added more beams
    {
      initialX: 300,
      translateX: 300,
      duration: 8,
      repeatDelay: 3,
      delay: 1,
      className: "h-32 w-1",
    },
    {
      initialX: 700,
      translateX: 700,
      duration: 5,
      repeatDelay: 2,
      delay: 3,
      className: "h-24 w-1",
    },
    {
      initialX: 900,
      translateX: 900,
      duration: 6,
      repeatDelay: 4,
      className: "h-28 w-1",
    },
    {
      initialX: 1100,
      translateX: 1100,
      duration: 7,
      repeatDelay: 3,
      delay: 2,
      className: "h-20 w-1",
    },
    {
      initialX: 200,
      translateX: 200,
      duration: 9,
      repeatDelay: 4,
      delay: 1,
      className: "h-32 w-1",
    },
    {
      initialX: 500,
      translateX: 500,
      duration: 6,
      repeatDelay: 3,
      className: "h-24 w-1",
    },
    {
      initialX: 1300,
      translateX: 1300,
      duration: 8,
      repeatDelay: 2,
      delay: 3,
      className: "h-28 w-1",
    },
  ];

  return (
    <div
      ref={parentRef}
      className={cn(
        "h-96 md:h-[40rem] bg-black relative flex items-center w-full justify-center overflow-hidden",
        className
      )}
    >
      {beams.map((beam) => (
        <CollisionMechanism
          key={beam.initialX + "beam-idx"}
          beamOptions={beam}
          containerRef={containerRef}
          parentRef={parentRef}
        />
      ))}

      {children}
      <div
        ref={containerRef}
        className="absolute bottom-0 bg-black w-full inset-x-0 pointer-events-none"
        style={{
          boxShadow:
            "0 0 24px rgba(0, 0, 0, 0.3), 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.1), 0 0 4px rgba(0, 0, 0, 0.2), 0 16px 68px rgba(0, 0, 0, 0.15), 0 1px 0 rgba(255, 255, 255, 0.05) inset",
        }}
      ></div>
    </div>
  );
};

interface CollisionMechanismProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  parentRef: React.RefObject<HTMLDivElement | null>;
  beamOptions?: {
    initialX?: number;
    translateX?: number;
    initialY?: number;
    translateY?: number;
    rotate?: number;
    className?: string;
    duration?: number;
    delay?: number;
    repeatDelay?: number;
  };
}

const CollisionMechanism = React.forwardRef<HTMLDivElement, CollisionMechanismProps>(
  ({ parentRef, containerRef, beamOptions = {} }, ref) => {
    const beamRef = useRef<HTMLDivElement>(null);
    const [collision, setCollision] = useState<{
      detected: boolean;
      coordinates: { x: number; y: number } | null;
    }>({
      detected: false,
      coordinates: null,
    });
    const [beamKey, setBeamKey] = useState(0);
    const [cycleCollisionDetected, setCycleCollisionDetected] = useState(false);

    useEffect(() => {
      const checkCollision = () => {
        if (
          beamRef.current &&
          containerRef.current &&
          parentRef.current &&
          !cycleCollisionDetected
        ) {
          const beamRect = beamRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          const parentRect = parentRef.current.getBoundingClientRect();

          if (beamRect.bottom >= containerRect.top) {
            const relativeX =
              beamRect.left - parentRect.left + beamRect.width / 2;
            const relativeY = beamRect.bottom - parentRect.top;

            setCollision({
              detected: true,
              coordinates: {
                x: relativeX,
                y: relativeY,
              },
            });
            setCycleCollisionDetected(true);
          }
        }
      };

      const animationInterval = setInterval(checkCollision, 50);

      return () => clearInterval(animationInterval);
    }, [cycleCollisionDetected, containerRef]);

    useEffect(() => {
      if (collision.detected && collision.coordinates) {
        setTimeout(() => {
          setCollision({ detected: false, coordinates: null });
          setCycleCollisionDetected(false);
        }, 2000);

        setTimeout(() => {
          setBeamKey((prevKey) => prevKey + 1);
        }, 2000);
      }
    }, [collision]);

    return (
      <>
        <motion.div
          key={beamKey}
          ref={beamRef}
          animate="animate"
          initial={{
            translateY: beamOptions.initialY || "-200px",
            translateX: beamOptions.initialX || "0px",
            rotate: beamOptions.rotate || 0,
          }}
          variants={{
            animate: {
              translateY: beamOptions.translateY || "1800px",
              translateX: beamOptions.translateX || "0px",
              rotate: beamOptions.rotate || 0,
            },
          }}
          transition={{
            duration: beamOptions.duration || 8,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            delay: beamOptions.delay || 0,
            repeatDelay: beamOptions.repeatDelay || 0,
          }}
          className={cn(
            "absolute left-0 top-20 m-auto rounded-full bg-gradient-to-t from-purple-500 via-indigo-500 to-transparent opacity-50",
            beamOptions.className
          )}
        />
        <AnimatePresence>
          {collision.detected && collision.coordinates && (
            <Explosion
              key={`${collision.coordinates.x}-${collision.coordinates.y}`}
              className=""
              style={{
                left: `${collision.coordinates.x}px`,
                top: `${collision.coordinates.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </AnimatePresence>
      </>
    );
  }
);

CollisionMechanism.displayName = "CollisionMechanism";

const Explosion = ({ ...props }: React.HTMLProps<HTMLDivElement>) => {
  // Increased number of particles
  const spans = Array.from({ length: 30 }, (_, index) => ({
    id: index,
    initialX: 0,
    initialY: 0,
    directionX: Math.floor(Math.random() * 100 - 50), // Increased spread
    directionY: Math.floor(Math.random() * -60 - 20), // Increased upward movement
  }));

  return (
    <div {...props} className={cn("absolute z-50 h-4 w-4", props.className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -inset-x-10 top-0 m-auto h-3 w-16 rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-sm"
      ></motion.div>
      {spans.map((span) => (
        <motion.span
          key={span.id}
          initial={{ x: span.initialX, y: span.initialY, opacity: 1 }}
          animate={{
            x: span.directionX,
            y: span.directionY,
            opacity: 0,
          }}
          transition={{ duration: Math.random() * 1.5 + 0.5, ease: "easeOut" }}
          className="absolute h-2 w-2 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500"
        />
      ))}
    </div>
  );
};