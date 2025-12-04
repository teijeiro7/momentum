import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { getHabitHeatmap, HeatmapResponse } from '../services/api';

interface HabitChartProps {
  habitId: number;
}

export default function HabitChart({ habitId }: HabitChartProps) {
  const [data, setData] = useState<HeatmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHeatmapData();
  }, [habitId]);

  const loadHeatmapData = async () => {
    try {
      setLoading(true);
      setError(null);
      const heatmapData = await getHabitHeatmap(habitId);
      setData(heatmapData);
    } catch (err) {
      setError('Failed to load heatmap data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading chart...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">{error || 'No data available'}</div>
      </div>
    );
  }

  // Prepare data for ApexCharts
  const chartData = data.data.map(point => ({
    x: point.date,
    y: point.value,
  }));

  // Group data by weeks for better heatmap visualization
  const weeks: { [key: string]: typeof chartData } = {};
  chartData.forEach(point => {
    const date = new Date(point.x);
    const weekNum = Math.floor((date.getDate() - 1) / 7);
    const weekKey = `Week ${weekNum + 1}`;
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = [];
    }
    weeks[weekKey].push(point);
  });

  const series = Object.entries(weeks).map(([name, data]) => ({
    name,
    data,
  }));

  const options: ApexOptions = {
    chart: {
      type: 'heatmap',
      toolbar: {
        show: false,
      },
      background: 'transparent',
    },
    theme: {
      mode: 'dark',
    },
    dataLabels: {
      enabled: false,
    },
    colors: ['#10b981'],
    title: {
      text: `${data.habit_name} - Last 30 Days`,
      style: {
        color: '#f9fafb',
        fontSize: '18px',
        fontWeight: 600,
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#9ca3af',
        },
        format: 'MMM dd',
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#9ca3af',
        },
      },
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 4,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 0,
              color: '#1f2937',
              name: 'Not Done',
            },
            {
              from: 1,
              to: 1,
              color: '#10b981',
              name: 'Done',
            },
          ],
        },
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => (val === 1 ? 'Completed ✓' : 'Not Done'),
      },
    },
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <Chart options={options} series={series} type="heatmap" height={350} />
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded p-4">
          <div className="text-sm text-gray-400">Completion Rate</div>
          <div className="text-2xl font-bold text-green-400">
            {((data.data.filter(d => d.value === 1).length / data.data.length) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-700 rounded p-4">
          <div className="text-sm text-gray-400">Streak</div>
          <div className="text-2xl font-bold text-blue-400">
            {calculateStreak(data.data)} days
          </div>
        </div>
      </div>
    </div>
  );
}

// Calculate current streak (consecutive days from today backwards)
function calculateStreak(data: Array<{ date: string; value: number }>): number {
  const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streak = 0;
  
  for (const point of sorted) {
    if (point.value === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
