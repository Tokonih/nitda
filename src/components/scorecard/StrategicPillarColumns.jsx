import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Pillar1,
  Pillar2,
  Pillar3,
  Pillar4,
  Pillar5,
  Pillar6,
  Pillar7,
  Pillar8,
} from "@/assets/icons";

const StrategicPillarColumns = ({
  pillars = [],
  onPillarClick,
  selectedPillarId,
  showHeader = true,
}) => {
  const getPillarColor = (index) => {
    const colors = [
      { bg: "#1a5c3a", fill: "#2d8a55", badge: "#1a5c3a" },
      { bg: "#3d9956", fill: "#4db86a", badge: "#3d9956" },
      { bg: "#c5a028", fill: "#d4b33a", badge: "#c5a028" },
      { bg: "#b8860b", fill: "#d4a017", badge: "#b8860b" },
      { bg: "#cd853f", fill: "#daa06d", badge: "#cd853f" },
      { bg: "#c5a028", fill: "#d4b33a", badge: "#c5a028" },
      { bg: "#2d8a55", fill: "#4db86a", badge: "#2d8a55" },
      { bg: "#4a7c35", fill: "#6b9b4d", badge: "#4a7c35" },
    ];
    return colors[index % colors.length];
  };

  const getPillarIcon = (index) => {
    const iconSize = 32;
    const icons = [
      <Pillar1 width={iconSize} height={iconSize} />,
      <Pillar2 width={iconSize} height={iconSize} />,
      <Pillar3 width={iconSize} height={iconSize} />,
      <Pillar4 width={iconSize} height={iconSize} />,
      <Pillar5 width={iconSize} height={iconSize} />,
      <Pillar6 width={iconSize} height={iconSize} />,
      <Pillar7 width={iconSize} height={iconSize} />,
      <Pillar8 width={iconSize} height={iconSize} />,
    ];
    return icons[index % icons.length];
  };

  return (
    <div className="mb-8">
      {showHeader && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold text-foreground">
              Strategic Pillar Performance
            </h2>
            <div className="w-4 h-4 rounded-full border border-muted-foreground/50 flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground">i</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Completion rate across {pillars.length} strategic pillars
          </p>
        </>
      )}

      {/* Pillars Grid */}
      <div className="flex flex-wrap justify-center gap-4 lg:gap-6 xl:gap-8">
        {pillars.map((pillar, index) => {
          const completion = parseFloat(pillar.completion || 0);
          const isSelected = selectedPillarId === pillar.id?.toString();
          const colors = getPillarColor(index);
          const isPositiveTrend = completion >= 30;

          return (
            <motion.div
              key={pillar.id || index}
              className={`
                                flex flex-col items-center cursor-pointer transition-all duration-300 
                                ${isSelected ? "scale-105" : "hover:scale-102"}
                            `}
              onClick={() => onPillarClick && onPillarClick(pillar.id)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Pillar Container */}
              <div className="relative w-20 sm:w-24 lg:w-28">
                {/* Glass Tube / Pillar */}
                <div className="relative h-40 sm:h-48 lg:h-56">
                  {/* Pillar Cap (Top) */}
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-[90%] h-4 rounded-t-full z-20"
                    style={{
                      background:
                        "linear-gradient(to bottom, #d1d5db, #9ca3af)",
                      boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
                    }}
                  />

                  {/* Glass Container */}
                  <div
                    className="absolute inset-x-1 top-0 bottom-4 rounded-t-xl overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(255,255,255,0.4), rgba(255,255,255,0.1), rgba(255,255,255,0.4))",
                      border: "2px solid rgba(200,200,200,0.5)",
                      borderBottom: "none",
                      boxShadow:
                        "inset 0 0 20px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {/* Fill Level (Animated) */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 rounded-t-lg z-30"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.min(completion, 100)}%` }}
                      transition={{
                        duration: 1.2,
                        ease: "easeOut",
                        delay: index * 0.1,
                      }}
                      style={{
                        background: `linear-gradient(to top, ${colors.fill}, ${colors.bg})`,
                        boxShadow: `inset 0 2px 10px rgba(255,255,255,0.3), inset 0 -2px 10px rgba(0,0,0,0.1)`,
                      }}
                    >
                      {/* Liquid Surface Highlight */}
                      <div
                        className="absolute top-0 left-0 right-0 h-2"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)",
                        }}
                      />
                    </motion.div>

                    {/* Glass Reflection */}
                    <div
                      className="absolute top-0 left-1 bottom-0 w-3 opacity-30"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(255,255,255,0.8), transparent)",
                      }}
                    />
                  </div>

                  {/* Icon at the top */}
                  <motion.div
                    className="mb-3 flex items-center justify-center w-12 h-12 rounded-full"
                    style={{
                      borderColor: colors.badge,
                      //   backgroundColor: `${colors.badge}15`,
                    }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* <div style={{ color: colors.badge }}></div> */}
                  </motion.div>

                  {/* Pillar Name Badge (above column) */}
                  <motion.div
                    className="absolute mb-3 w-24 sm:w-28 z-30 "
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
                  >
                    <div
                      className="rounded-lg py-2 px-2 text-white text-center shadow-lg"
                      style={{
                        background: `
  linear-gradient(135deg, ${colors.badge}, ${colors.bg}33),
  rgba(255,255,255,0.05)
`,

                        // background: `linear-gradient(135deg, ${colors.badge}, ${colors.bg})`,
                        fontSize: "9px",
                        lineHeight: "1.3",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                        // boxShadow: `0 4px 12px ${colors.badge}50`,
                        minHeight: "60px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {pillar.name}
                    </div>
                  </motion.div>

                  {/* Pillar Number Circle (inside tube, at bottom of fill) */}
                  <motion.div
                    className="absolute left-10 translate-x-1/2 z-30 bottom-10"
                    style={
                      {
                        //   bottom: `calc(${Math.max(completion * 0.52, 8)}% + 20px)`,
                      }
                    }
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                  >
                    <motion.div
                      className={`
                                    mt-4 flex items-center gap-2 py-1.5 rounded-md
                                    ${isSelected
                          ? "bg-primary/10 border-primary"
                          : "bg-card border-border"
                        }
                                `}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {completion.toFixed(0)}%
                      </span>
                      {isPositiveTrend ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </motion.div>
                    {/* <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-4 border-white"
                      style={{
                        background: `linear-gradient(135deg, ${colors.badge}, ${colors.bg})`,
                        fontSize: "18px",
                        boxShadow: `0 4px 12px ${colors.badge}60`,
                      }}
                    >
                      {index + 1}
                    </div> */}
                  </motion.div>

                  {/* Pillar Base */}
                  <div
                    className="absolute -bottom-1 left-0 right-0 h-6"
                    style={{
                      background:
                        "linear-gradient(to bottom, #9ca3af, #6b7280)",
                      borderRadius: "0 0 4px 4px",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    }}
                  />

                  {/* Base Platform */}
                  <div
                    className="absolute -bottom-3 -left-2 -right-2 h-3"
                    style={{
                      background:
                        "linear-gradient(to bottom, #d1d5db, #9ca3af)",
                      borderRadius: "2px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    }}
                  />
                </div>
              </div>

              {/* Percentage Display */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-4 border-white mt-4"
                style={{
                  background: `linear-gradient(135deg, ${colors.badge}, ${colors.bg})`,
                  fontSize: "18px",
                  boxShadow: `0 4px 12px ${colors.badge}60`,
                }}
              >
                {index + 1}
              </div>
              {/* <motion.div
                className={`
                                    mt-4 flex items-center gap-2 px-3 py-1.5 rounded-md
                                    ${
                                      isSelected
                                        ? "bg-primary/10 border-primary"
                                        : "bg-card border-border"
                                    }
                                `}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <span className="text-sm font-semibold text-foreground">
                  {completion.toFixed(0)}%
                </span>
                {isPositiveTrend ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </motion.div> */}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StrategicPillarColumns;
