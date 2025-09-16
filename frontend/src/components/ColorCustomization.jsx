import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Palette } from "lucide-react";

const PRESET_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', 
  '#d084d0', '#ffb347', '#87d068', '#ffa1b5', '#b0e57c',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

const COLOR_SCHEMES = {
  default: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'],
  ocean: ['#006994', '#0582ca', '#00a8cc', '#40c9a2', '#84d2f6'],
  sunset: ['#ff9a56', '#ff6b6b', '#ee5a6f', '#c44569', '#786fa6'],
  forest: ['#2d5016', '#3e6b1f', '#4f7942', '#87a96b', '#c5d4a7'],
  corporate: ['#2c3e50', '#3498db', '#e74c3c', '#f39c12', '#9b59b6']
};

const ColorCustomization = ({ chartConfig, onColorChange, data, columns }) => {
  const currentColors = chartConfig.colors || {};

  const handleColorChange = (key, color) => {
    const newColors = {
      ...currentColors,
      [key]: color
    };
    onColorChange(newColors);
  };

  const applyColorScheme = (scheme) => {
    const schemeColors = COLOR_SCHEMES[scheme];
    const newColors = {};
    
    if (chartConfig.type === 'pie' && data) {
      data.forEach((item, index) => {
        const key = item[chartConfig.xAxis];
        newColors[key] = schemeColors[index % schemeColors.length];
      });
    } else if (chartConfig.yAxis) {
      newColors[chartConfig.yAxis] = schemeColors[0];
    }
    
    onColorChange(newColors);
  };

  const getColorKeys = () => {
    if (chartConfig.type === 'pie' && data) {
      return data.map(item => item[chartConfig.xAxis]).filter(Boolean);
    } else if (chartConfig.yAxis) {
      return [chartConfig.yAxis];
    }
    return [];
  };

  const colorKeys = getColorKeys();

  if (colorKeys.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Colors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Color Schemes */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Color Schemes</Label>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(COLOR_SCHEMES).map(([name, colors]) => (
              <button
                key={name}
                onClick={() => applyColorScheme(name)}
                className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex space-x-1">
                  {colors.slice(0, 4).map((color, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-sm capitalize">{name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Individual Color Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Custom Colors</Label>
          {colorKeys.map((key) => (
            <div key={key} className="space-y-2">
              <Label className="text-xs text-gray-600">{key}</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={currentColors[key] || '#8884d8'}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <div className="flex-1 grid grid-cols-5 gap-1">
                  {PRESET_COLORS.slice(0, 10).map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(key, color)}
                      className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorCustomization;