import React, { forwardRef, useImperativeHandle, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";
import html2canvas from "html2canvas";

const DEFAULT_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', 
  '#d084d0', '#ffb347', '#87d068', '#ffa1b5', '#b0e57c'
];

const ChartDisplay = forwardRef(({ data, config }, ref) => {
  const chartContainerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    saveAsImage: async () => {
      if (!chartContainerRef.current) return;

      try {
        const canvas = await html2canvas(chartContainerRef.current, {
          backgroundColor: 'white',
          scale: 2,
          logging: false
        });
        
        const link = document.createElement('a');
        link.download = `${config.title || 'chart'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Error saving chart as image:', error);
        alert('Error saving chart. Please try again.');
      }
    }
  }));

  const getColor = (index, key) => {
    if (config.colors[key]) return config.colors[key];
    return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  const renderChart = () => {
    if (!data || !config.xAxis) return null;

    const commonProps = {
      width: 800,
      height: 400,
      data: data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={config.xAxis} stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              {config.yAxis && (
                <Bar 
                  dataKey={config.yAxis} 
                  fill={getColor(0, config.yAxis)}
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={config.xAxis} stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              {config.yAxis && (
                <Line 
                  type="monotone"
                  dataKey={config.yAxis} 
                  stroke={getColor(0, config.yAxis)}
                  strokeWidth={3}
                  dot={{ fill: getColor(0, config.yAxis), strokeWidth: 2, r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getColor(0, config.yAxis)} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={getColor(0, config.yAxis)} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={config.xAxis} stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              {config.yAxis && (
                <Area 
                  type="monotone"
                  dataKey={config.yAxis} 
                  stroke={getColor(0, config.yAxis)}
                  strokeWidth={2}
                  fill="url(#colorGradient)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = data.map((item, index) => ({
          name: item[config.xAxis],
          value: parseFloat(item[config.yAxis] || item[Object.keys(item)[1]] || 0),
          fill: getColor(index, item[config.xAxis])
        }));

        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number" 
                dataKey={config.xAxis} 
                name={config.xAxis}
                stroke="#666"
              />
              <YAxis 
                type="number" 
                dataKey={config.yAxis} 
                name={config.yAxis}
                stroke="#666"
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Scatter 
                data={data} 
                fill={getColor(0, config.yAxis)}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="flex items-center justify-center h-64 text-gray-500">Select a chart type to begin</div>;
    }
  };

  return (
    <div className="w-full">
      {config.title && (
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {config.title}
        </h2>
      )}
      <div ref={chartContainerRef} className="w-full">
        {renderChart()}
      </div>
      {data && (
        <div className="mt-6 text-sm text-gray-600 text-center">
          Showing {data.length} data points
        </div>
      )}
    </div>
  );
});

ChartDisplay.displayName = 'ChartDisplay';

export default ChartDisplay;