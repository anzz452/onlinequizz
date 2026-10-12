"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface BarChartData {
  name: string;
  count: number;
}

interface StatusPieData {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsChartsProps {
  barData: BarChartData[];
  barTitle?: string;
  barDescription?: string;
  pieData?: StatusPieData[];
  pieTitle?: string;
  pieDescription?: string;
}

export function AnalyticsCharts({
  barData,
  barTitle = "Quiz Activity",
  barDescription = "Attempts distribution across recent quizzes",
  pieData,
  pieTitle = "Attempt Outcomes",
  pieDescription = "Pass vs fail or attempt completion status",
}: AnalyticsChartsProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-80 flex items-center justify-center text-slate-400">Loading charts...</Card>
        {pieData && <Card className="h-80 flex items-center justify-center text-slate-400">Loading charts...</Card>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{barTitle}</CardTitle>
          <CardDescription>{barDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            {barData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No activity records yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Attempts / Score" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pie / Donut Chart */}
      {pieData && (
        <Card>
          <CardHeader>
            <CardTitle>{pieTitle}</CardTitle>
            <CardDescription>{pieDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              {pieData.every((d) => d.value === 0) ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No outcome statistics yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

