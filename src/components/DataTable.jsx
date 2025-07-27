// This component provides an editable table for users to input and modify their sales data.
import React, { useState, useEffect } from 'react';

function DataTable({ data, onDataChange }) {
  // Internal state for the table data, initialized with the 'data' prop.
  const [tableData, setTableData] = useState(data);
  // State for the new row input fields
  const [newRow, setNewRow] = useState({
    continent: '', region: '', product: '', Q1: 0, Q2: 0, Q3: 0, Q4: 0
  });

  // Effect to update internal tableData state if the 'data' prop changes from parent (e.g., on reset).
  useEffect(() => {
    setTableData(data);
  }, [data]);

  // Handles changes in input fields within the table.
  const handleInputChange = (e, id, field) => {
    const newValue = e.target.value;
    setTableData(prevData =>
      prevData.map(row =>
        // Update the specific row and field. Convert Q values to numbers.
        row.id === id ? { ...row, [field]: field.startsWith('Q') ? parseFloat(newValue) || 0 : newValue } : row
      )
    );
  };

  // Handles changes in the "Add New Data" input fields.
  const handleNewRowInputChange = (e, field) => {
    const newValue = e.target.value;
    setNewRow(prev => ({
      ...prev,
      [field]: field.startsWith('Q') ? parseFloat(newValue) || 0 : newValue
    }));
  };

  // Adds a new row to the table from the "Add New Data" inputs.
  const handleAddRow = () => {
    const newId = tableData.length > 0 ? Math.max(...tableData.map(row => row.id)) + 1 : 1;
    setTableData(prevData => [
      ...prevData,
      { id: newId, ...newRow }
    ]);
    // Clear the new row input fields after adding
    setNewRow({ continent: '', region: '', product: '', Q1: 0, Q2: 0, Q3: 0, Q4: 0 });
  };

  // Deletes a row from the table based on its ID.
  const handleDeleteRow = (id) => {
    setTableData(prevData => prevData.filter(row => row.id !== id));
  };

  // Triggers the 'onDataChange' callback in the parent component (App.jsx)
  // to load the current table data into the 3D cube.
  const handleLoadData = () => {
    onDataChange(tableData);
  };

  return (
    <div className="overflow-x-auto">
      {/* Input fields for adding new data, styled like the reference image */}
      <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
        <h4 className="font-semibold text-lg mb-3 text-gray-700">Add New Data</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <input
            type="text"
            placeholder="Continent"
            value={newRow.continent}
            onChange={(e) => handleNewRowInputChange(e, 'continent')}
          />
          <input
            type="text"
            placeholder="Region"
            value={newRow.region}
            onChange={(e) => handleNewRowInputChange(e, 'region')}
          />
          <input
            type="text"
            placeholder="Product"
            value={newRow.product}
            onChange={(e) => handleNewRowInputChange(e, 'product')}
          />
          {/* Empty div for layout spacing on larger screens */}
          <div className="hidden lg:block"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <input
            type="number"
            placeholder="Q1"
            value={newRow.Q1}
            onChange={(e) => handleNewRowInputChange(e, 'Q1')}
          />
          <input
            type="number"
            placeholder="Q2"
            value={newRow.Q2}
            onChange={(e) => handleNewRowInputChange(e, 'Q2')}
          />
          <input
            type="number"
            placeholder="Q3"
            value={newRow.Q3}
            onChange={(e) => handleNewRowInputChange(e, 'Q3')}
          />
          <input
            type="number"
            placeholder="Q4"
            value={newRow.Q4}
            onChange={(e) => handleNewRowInputChange(e, 'Q4')}
          />
        </div>
        <button
          onClick={handleAddRow}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md w-full"
        >
          Add Row
        </button>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Continent</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Q1</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Q2</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Q3</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Q4</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tableData.map(row => (
            <tr key={row.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  value={row.continent}
                  onChange={(e) => handleInputChange(e, row.id, 'continent')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  value={row.region}
                  onChange={(e) => handleInputChange(e, row.id, 'region')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  value={row.product}
                  onChange={(e) => handleInputChange(e, row.id, 'product')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="number"
                  value={row.Q1}
                  onChange={(e) => handleInputChange(e, row.id, 'Q1')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="number"
                  value={row.Q2}
                  onChange={(e) => handleInputChange(e, row.id, 'Q2')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="number"
                  value={row.Q3}
                  onChange={(e) => handleInputChange(e, row.id, 'Q3')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="number"
                  value={row.Q4}
                  onChange={(e) => handleInputChange(e, row.id, 'Q4')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleDeleteRow(row.id)}
                  className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-end"> {/* Moved Load Data button to the right */}
        <button
          onClick={handleLoadData}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          Apply Data to Cube
        </button>
      </div>
    </div>
  );
}

export default DataTable;