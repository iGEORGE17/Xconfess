"use client";

import { DailyActivity } from "@/app/lib/types/analytics.types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

interface Props {
  data: DailyActivity[];
  period: '7days' | '30days';
}

export const ActivityChart = ({ data, period }: Props) => {
  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }));

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-purple-500" />
        <h3 className="text-xl font-semibold">Platform Activity</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            stroke="#71717a"
            tick={{ fill: '#a1a1aa' }}
          />
          <YAxis
            stroke="#71717a"
            tick={{ fill: '#a1a1aa' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              color: '#ffffff'
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="confessions"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="Confessions"
          />
          <Line
            type="monotone"
            dataKey="reactions"
            stroke="#ec4899"
            strokeWidth={2}
            name="Reactions"
          />
          <Line
            type="monotone"
            dataKey="activeUsers"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Active Users"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};