import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import DataTable from './components/DataTable';
import OlapControls from './components/OlapControls';
import ThreeDCube from './components/ThreeDCube';
import {
  processRawData,
  applySlice,
  applyDice,
  applyPivot,
  applyRollUp,
} from './data/dataProcessor';

function App() {
  const [rawData, setRawData] = useState([]); // No dummy data
  const [cubeData, setCubeData] = useState([]);
  const [axisMapping, setAxisMapping] = useState({ x: 'continent', y: 'region', z: 'quarter' });
  const [currentFilters, setCurrentFilters] = useState({});
  const [isRolledUp, setIsRolledUp] = useState(false);
  const [originalCubeDataBeforeRollUp, setOriginalCubeDataBeforeRollUp] = useState([]);

  // Update cube when rawData or axisMapping changes
  useEffect(() => {
    if (rawData.length > 0) {
      const processed = processRawData(rawData, axisMapping);
      setCubeData(processed);
      setOriginalCubeDataBeforeRollUp(processed);
    } else {
      setCubeData([]); // No cube if no data
    }
    setIsRolledUp(false);
    setCurrentFilters({});
  }, [rawData, axisMapping]);

  const handleDataTableChange = useCallback((newData) => {
    setRawData(newData);
  }, []);

  const handleSlice = useCallback((dimension, value) => {
    const newFilters = { ...currentFilters, [dimension]: value };
    setCurrentFilters(newFilters);
    const filteredData = applySlice(originalCubeDataBeforeRollUp, dimension, value);
    setCubeData(filteredData);
    setIsRolledUp(false);
  }, [currentFilters, originalCubeDataBeforeRollUp]);

  const handleDice = useCallback((filters) => {
    setCurrentFilters(filters);
    const filteredData = applyDice(originalCubeDataBeforeRollUp, filters);
    setCubeData(filteredData);
    setIsRolledUp(false);
  }, [originalCubeDataBeforeRollUp]);

  const handlePivot = useCallback((newMapping) => {
    setAxisMapping(newMapping);
    setIsRolledUp(false);
  }, []);

  const handleRollUp = useCallback(() => {
    if (!isRolledUp) {
      setOriginalCubeDataBeforeRollUp(cubeData);
      const rolledUpData = applyRollUp(cubeData);
      setCubeData(rolledUpData);
      setIsRolledUp(true);
    }
  }, [cubeData, isRolledUp]);

  const handleDrillDown = useCallback(() => {
    if (isRolledUp) {
      setCubeData(originalCubeDataBeforeRollUp);
      setIsRolledUp(false);
    } else if (Object.keys(currentFilters).length > 0) {
      setCurrentFilters({});
      const processed = processRawData(rawData, axisMapping);
      setCubeData(processed);
    }
  }, [isRolledUp, currentFilters, originalCubeDataBeforeRollUp, rawData, axisMapping]);

  const handleReset = useCallback(() => {
    const defaultMap = { x: 'continent', y: 'region', z: 'quarter' };
    setAxisMapping(defaultMap);
    setCurrentFilters({});
    setIsRolledUp(false);
    const resetCube = processRawData(rawData, defaultMap);
    setCubeData(resetCube);
    setOriginalCubeDataBeforeRollUp(resetCube);
  }, [rawData]);

  return (
    <div className="flex flex-col lg:flex-row h-screen px-8 py-4 bg-gray-100 app-container">
      {/* Left Panel */}
      <div className="flex flex-col w-full lg:w-1/2 p-4 bg-white rounded-lg shadow-md mr-4 mb-4 lg:mb-0 overflow-auto panel">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">OLAP Data Visualizer</h2>
        <div className="data-table-panel mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">Input Data Table</h3>
          <DataTable data={rawData} onDataChange={handleDataTableChange} />
        </div>
        <div className="controls-panel">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">OLAP Operations</h3>
          <OlapControls
            onSlice={handleSlice}
            onDice={handleDice}
            onPivot={handlePivot}
            onRollUp={handleRollUp}
            onDrillDown={handleDrillDown}
            onReset={handleReset}
            currentAxisMapping={axisMapping}
            isRolledUp={isRolledUp}
            availableDimensions={['continent', 'region', 'product', 'quarter']}
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center relative panel">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">3D Cube Visualization</h3>
        {cubeData.length > 0 ? (
          <div className="relative w-full" style={{ height: '80vh', minHeight: '600px' }}>
            <Canvas
              camera={{ position: [20, 20, 20], fov: 75 }}
              style={{ width: '100%', height: '100%' }}
            >
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <ThreeDCube data={cubeData} axisMapping={axisMapping} />
              <OrbitControls enablePan enableZoom enableRotate />
            </Canvas>
          </div>
        ) : (
          <div className="text-gray-500 mt-10">No data to display. Please add data above.</div>
        )}
        <div className="absolute bottom-4 left-4 text-sm text-gray-600">
          Use mouse to rotate, pan, and zoom the cube.
        </div>
      </div>
    </div>
  );
}

export default App;
