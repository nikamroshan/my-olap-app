// This component provides the user interface for performing various OLAP operations.
import React, { useState, useEffect } from 'react';

function OlapControls({
  onSlice,          // Callback for slice operation
  onDice,           // Callback for dice operation
  onPivot,          // Callback for pivot operation
  onRollUp,         // Callback for roll-up operation
  onDrillDown,      // Callback for drill-down operation
  onReset,          // Callback for reset operation
  currentAxisMapping, // Current axis mapping from parent (App.jsx)
  isRolledUp,       // State indicating if data is currently rolled up
  availableDimensions, // List of dimensions available for filtering/pivoting
}) {
  // State for slice operation inputs
  const [sliceDimension, setSliceDimension] = useState('continent');
  const [sliceValue, setSliceValue] = useState('');
  // State for dice operation filters (object where key is dimension, value is filter string)
  const [diceFilters, setDiceFilters] = useState({});

  // States for pivot operation axis selections
  const [pivotX, setPivotX] = useState(currentAxisMapping.x);
  const [pivotY, setPivotY] = useState(currentAxisMapping.y);
  const [pivotZ, setPivotZ] = useState(currentAxisMapping.z);

  // Effect to update pivot states when the currentAxisMapping prop changes from the parent.
  useEffect(() => {
    setPivotX(currentAxisMapping.x);
    setPivotY(currentAxisMapping.y);
    setPivotZ(currentAxisMapping.z);
  }, [currentAxisMapping]);

  // Handles changes in dice filter input fields.
  const handleDiceFilterChange = (dimension, value) => {
    setDiceFilters(prev => ({
      ...prev,
      [dimension]: value,
    }));
  };

  // Applies the dice operation by calling the 'onDice' callback with active filters.
  const handleApplyDice = () => {
    // Filter out any empty filter values before applying.
    const activeFilters = Object.fromEntries(
      Object.entries(diceFilters).filter(([, value]) => value !== '')
    );
    onDice(activeFilters);
  };

  // Applies the pivot operation by calling the 'onPivot' callback with new axis mapping.
  const handleApplyPivot = () => {
    // Basic validation: ensure X, Y, and Z axes are unique.
    const uniqueAxes = new Set([pivotX, pivotY, pivotZ]);
    if (uniqueAxes.size !== 3) {
      // Using a console log instead of alert for better user experience in an iframe.
      console.error('Error: X, Y, and Z axes must be unique for pivoting.');
      // You could implement a custom modal or message box here for user feedback.
      return;
    }
    onPivot({ x: pivotX, y: pivotY, z: pivotZ });
  };

  // Filter out 'quarter' from dimensions available for slice/dice, as it's typically a measure.
  const dimensionsForSliceDice = availableDimensions.filter(d => d !== 'quarter');

  return (
    <div className="olap-controls space-y-6">
      {/* Main OLAP Operations Buttons (aligned like reference image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => onSlice(sliceDimension, sliceValue)}
          className="btn-slice-dice"
        >
          Apply Slice
        </button>
        <button
          onClick={handleApplyPivot}
          className="btn-pivot"
        >
          Apply Pivot
        </button>
        <button
          onClick={onRollUp}
          disabled={isRolledUp}
          className="btn-rollup-drilldown"
        >
          Roll-up
        </button>
        <button
          onClick={onDrillDown}
          // Disable drill-down if already showing base data (not rolled up and no filters applied)
          disabled={!isRolledUp && Object.values(diceFilters).every(val => val === '') && sliceValue === ''}
          className="btn-rollup-drilldown"
        >
          Drill-down
        </button>
      </div>

      {/* Slice Operation */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
        <h4 className="font-semibold text-lg mb-2 text-gray-700">Slice (Filter by one dimension)</h4>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <select
            value={sliceDimension}
            onChange={(e) => setSliceDimension(e.target.value)}
            className="p-2 border border-gray-300 rounded-md flex-grow"
          >
            {dimensionsForSliceDice.map(dim => (
              <option key={dim} value={dim}>{dim.charAt(0).toUpperCase() + dim.slice(1)}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder={`Value for ${sliceDimension}`}
            value={sliceValue}
            onChange={(e) => setSliceValue(e.target.value)}
            className="p-2 border border-gray-300 rounded-md flex-grow"
          />
        </div>
      </div>

      {/* Dice Operation */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
        <h4 className="font-semibold text-lg mb-2 text-gray-700">Dice (Filter multiple dimensions)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {dimensionsForSliceDice.map(dim => (
            <input
              key={`dice-${dim}`}
              type="text"
              placeholder={`${dim.charAt(0).toUpperCase() + dim.slice(1)} filter`}
              value={diceFilters[dim] || ''}
              onChange={(e) => handleDiceFilterChange(dim, e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            />
          ))}
        </div>
        <button
          onClick={handleApplyDice}
          className="btn-slice-dice w-full"
        >
          Apply Dice
        </button>
      </div>

      {/* Pivot Operation */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
        <h4 className="font-semibold text-lg mb-2 text-gray-700">Pivot (Swap Axis Mappings)</h4>
        <div className="flex flex-col sm:flex-row gap-3 items-center mb-3">
          <label className="text-gray-700">X-Axis:</label>
          <select
            value={pivotX}
            onChange={(e) => setPivotX(e.target.value)}
            className="p-2 border border-gray-300 rounded-md flex-grow"
          >
            {dimensionsForSliceDice.map(dim => (
              <option key={`pivot-x-${dim}`} value={dim}>{dim.charAt(0).toUpperCase() + dim.slice(1)}</option>
            ))}
          </select>
          <label className="text-gray-700">Y-Axis:</label>
          <select
            value={pivotY}
            onChange={(e) => setPivotY(e.target.value)}
            className="p-2 border border-gray-300 rounded-md flex-grow"
          >
            {dimensionsForSliceDice.map(dim => (
              <option key={`pivot-y-${dim}`} value={dim}>{dim.charAt(0).toUpperCase() + dim.slice(1)}</option>
            ))}
          </select>
          <label className="text-gray-700">Z-Axis (Quarter):</label>
          <select
            value={pivotZ}
            onChange={(e) => setPivotZ(e.target.value)}
            className="p-2 border border-gray-300 rounded-md flex-grow"
          >
            <option value="quarter">Quarter</option>
            {/* You could add other measures here if available */}
          </select>
        </div>
      </div>

      {/* Reset Button */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
        <button
          onClick={onReset}
          className="btn-reset w-full"
        >
          Reset All Operations
        </button>
      </div>
    </div>
  );
}

export default OlapControls;