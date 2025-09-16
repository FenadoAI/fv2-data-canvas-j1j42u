import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Upload, Download, Palette, BarChart3, LineChart, PieChart, AreaChart, ScatterChart } from "lucide-react";
import ChartDisplay from "./ChartDisplay";
import ColorCustomization from "./ColorCustomization";
import SampleDataSelector from "./SampleDataSelector";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API = `${API_BASE}/api`;

const CHART_TYPES = [
  { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
  { id: 'line', name: 'Line Chart', icon: LineChart },
  { id: 'area', name: 'Area Chart', icon: AreaChart },
  { id: 'pie', name: 'Pie Chart', icon: PieChart },
  { id: 'scatter', name: 'Scatter Plot', icon: ScatterChart },
];

const DataVisualizationPlayground = () => {
  const [data, setData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [chartConfig, setChartConfig] = useState({
    type: 'bar',
    xAxis: '',
    yAxis: '',
    title: '',
    colors: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef(null);
  const chartRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/upload-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { columns, sample_data } = response.data;
      setColumns(columns);
      setData(sample_data);
      setChartConfig(prev => ({
        ...prev,
        xAxis: columns[0] || '',
        yAxis: columns[1] || '',
        title: file.name.replace('.csv', '').replace(/[_-]/g, ' ')
      }));
      setActiveTab('configure');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please make sure it is a valid CSV.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleDataSelect = (sampleData) => {
    setData(sampleData.data);
    setColumns(sampleData.columns);
    setChartConfig(prev => ({
      ...prev,
      xAxis: sampleData.columns[0] || '',
      yAxis: sampleData.columns[1] || '',
      title: sampleData.name
    }));
    setActiveTab('configure');
  };

  const saveAsImage = () => {
    if (chartRef.current) {
      chartRef.current.saveAsImage();
    }
  };

  const resetData = () => {
    setData(null);
    setColumns([]);
    setChartConfig({
      type: 'bar',
      xAxis: '',
      yAxis: '',
      title: '',
      colors: {}
    });
    setActiveTab('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Data Visualization Playground</h1>
                <p className="text-sm text-gray-600">Upload CSV and generate interactive charts</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="px-3 py-1">
                <Palette className="h-4 w-4 mr-1" />
                Interactive
              </Badge>
              {data && (
                <Button onClick={resetData} variant="outline" size="sm">
                  New Dataset
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!data ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
              <TabsTrigger value="samples">Sample Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <Upload className="h-6 w-6" />
                    <span>Upload Your CSV File</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Select a CSV file to start creating beautiful visualizations
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="px-6 py-3"
                    >
                      {isLoading ? 'Processing...' : 'Choose CSV File'}
                    </Button>
                    <p className="text-sm text-gray-500">
                      Supports CSV files up to 10MB
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="samples">
              <SampleDataSelector onSelect={handleSampleDataSelect} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chart Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Chart Type */}
                  <div className="space-y-2">
                    <Label>Chart Type</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {CHART_TYPES.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <Button
                            key={type.id}
                            variant={chartConfig.type === type.id ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => setChartConfig(prev => ({ ...prev, type: type.id }))}
                          >
                            <IconComponent className="h-4 w-4 mr-2" />
                            {type.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Axis Configuration */}
                  <div className="space-y-2">
                    <Label>X-Axis</Label>
                    <Select
                      value={chartConfig.xAxis}
                      onValueChange={(value) => setChartConfig(prev => ({ ...prev, xAxis: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((column) => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {chartConfig.type !== 'pie' && (
                    <div className="space-y-2">
                      <Label>Y-Axis</Label>
                      <Select
                        value={chartConfig.yAxis}
                        onValueChange={(value) => setChartConfig(prev => ({ ...prev, yAxis: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {columns.filter(col => col !== chartConfig.xAxis).map((column) => (
                            <SelectItem key={column} value={column}>
                              {column}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Title */}
                  <div className="space-y-2">
                    <Label>Chart Title</Label>
                    <Input
                      value={chartConfig.title}
                      onChange={(e) => setChartConfig(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter chart title"
                    />
                  </div>

                  {/* Export Button */}
                  <Button onClick={saveAsImage} className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Save as Image
                  </Button>
                </CardContent>
              </Card>

              {/* Color Customization */}
              <ColorCustomization
                chartConfig={chartConfig}
                onColorChange={(colors) => setChartConfig(prev => ({ ...prev, colors }))}
                data={data}
                columns={columns}
              />
            </div>

            {/* Chart Display */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardContent className="p-6">
                  <ChartDisplay
                    ref={chartRef}
                    data={data}
                    config={chartConfig}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataVisualizationPlayground;