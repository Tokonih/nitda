import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const StrategicPillars = ({ pillars = [], onPillarClick, selectedPillarId }) => {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">
                    Strategic Pillars
                </h2>
                <p className="text-sm text-muted-foreground">
                    Click a pillar to filter the scorecard details below
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {pillars.map((pillar, index) => {
                    // Calculate chart data based on completion
                    const completion = parseFloat(pillar.completion || 0);
                    const remaining = 100 - completion;
                    const isSelected = selectedPillarId === pillar.id.toString();

                    const getGradeColor = (percentage) => {
                        if (percentage >= 90) return "#7C3AED"; // Purple (A+)
                        if (percentage >= 80) return "#3B82F6"; // Blue (A)
                        if (percentage >= 70) return "#22C55E"; // Green (B)
                        if (percentage >= 60) return "#F59E0B"; // Yellow (C)
                        if (percentage >= 50) return "#F97316"; // Orange (D)
                        return "#EF4444"; // Red (E)
                    };
                    const color = getGradeColor(completion);

                    const data = [
                        { name: "Completed", value: completion, color: color },
                        { name: "Remaining", value: remaining, color: "#F3F4F6" }, // You might want to make this dark-mode aware too, e.g., using a variable or conditional logic if passing props
                    ];
                    // Fix for Remaining color in dark mode context:
                    // Since Recharts doesn't support CSS classes directly on cells easily without custom components, 
                    // we can't use 'bg-muted'. We'll stick to a neutral gray, or you can pass a dark/light prop.
                    // For now, let's keep it simple or use a slightly darker gray if needed.
                    const remainingColor = "#e5e7eb"; // Gray-200

                    return (
                        <div
                            key={pillar.id || index}
                            className={`
                                relative rounded-xl border p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-200 group
                                ${isSelected
                                    ? "bg-primary/5 border-primary ring-1 ring-primary shadow-md transform scale-[1.02]"
                                    : "bg-card border-border hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                                }
                            `}
                            onClick={() => onPillarClick && onPillarClick(pillar.id)}
                        >
                            {/* Hover Hint */}
                            <div className={`absolute top-2 right-2 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                            </div>

                            {/* Top Line indicating Pillar Color */}
                            <div
                                className="w-full h-1 rounded-full mb-3 opacity-80"
                                style={{ backgroundColor: color }}
                            />

                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3 tracking-wider">
                                PILLAR {index + 1}
                            </p>

                            {/* Donut Chart */}
                            <div className="w-24 h-24 relative mb-3">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            innerRadius={35}
                                            outerRadius={45}
                                            startAngle={90}
                                            endAngle={-270}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {data.map((entry, idx) => (
                                                <Cell key={`cell-${idx}`} fill={entry.name === "Remaining" ? remainingColor : entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Percentage */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className={`text-lg font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                        {completion.toFixed(0)}%
                                    </span>
                                </div>
                            </div>

                            {/* Pillar Name */}
                            <h3 className={`text-xs font-semibold leading-tight transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                {pillar.name}
                            </h3>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StrategicPillars;