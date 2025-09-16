import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Database, TrendingUp, BarChart3, Activity } from "lucide-react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API = `${API_BASE}/api`;

const SAMPLE_ICONS = {
  'Sales Data': TrendingUp,
  'Temperature Data': Activity,
  'Website Analytics': BarChart3
};

const SampleDataSelector = ({ onSelect }) => {
  const [sampleData, setSampleData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSampleData();
  }, []);

  const fetchSampleData = async () => {
    try {
      const response = await axios.get(`${API}/sample-data`);
      setSampleData(response.data);
    } catch (error) {
      console.error('Error fetching sample data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sample Datasets</h3>
        <p className="text-gray-600">Choose from pre-loaded datasets to start exploring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sampleData.map((sample, index) => {
          const IconComponent = SAMPLE_ICONS[sample.name] || Database;
          return (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 cursor-pointer group"
              onClick={() => onSelect(sample)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{sample.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {sample.columns.slice(0, 4).map((column) => (
                    <Badge key={column} variant="outline" className="text-xs">
                      {column}
                    </Badge>
                  ))}
                  {sample.columns.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{sample.columns.length - 4} more
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>{sample.data.length} rows • {sample.columns.length} columns</p>
                </div>

                {/* Preview first few rows */}
                <div className="bg-gray-50 rounded-lg p-3 text-xs">
                  <div className="font-medium text-gray-700 mb-2">Preview:</div>
                  <div className="space-y-1 max-h-20 overflow-hidden">
                    {sample.data.slice(0, 2).map((row, rowIndex) => (
                      <div key={rowIndex} className="text-gray-600">
                        {Object.entries(row).slice(0, 3).map(([key, value], colIndex) => (
                          <span key={colIndex} className="mr-2">
                            <span className="font-medium">{key}:</span> {value}
                          </span>
                        ))}
                        {Object.keys(row).length > 3 && <span>...</span>}
                      </div>
                    ))}
                    {sample.data.length > 2 && (
                      <div className="text-gray-500 italic">
                        ... and {sample.data.length - 2} more rows
                      </div>
                    )}
                  </div>
                </div>

                <Button className="w-full group-hover:bg-blue-600 transition-colors">
                  Use This Dataset
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
          <Database className="h-4 w-4" />
          <span>More sample datasets coming soon</span>
        </div>
      </div>
    </div>
  );
};

export default SampleDataSelector;