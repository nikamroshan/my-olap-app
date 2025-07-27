// This file contains pure JavaScript functions for all data processing and OLAP logic.

/**
 * Processes raw tabular data into a structured format suitable for 3D cube visualization.
 * It expands Q1-Q4 values into individual data points, each representing a specific quarter.
 * @param {Array<Object>} rawData - The input data from the table, e.g., [{ continent: 'Asia', Q1: 100, ... }]
 * @param {Object} axisMapping - Current mapping of dimensions to axes (e.g., {x: 'continent', y: 'region', z: 'quarter'})
 * @returns {Array<Object>} Processed data where each item represents a single quarter's value for a given dimension combination.
 */
export const processRawData = (rawData, axisMapping) => {
  const processed = [];
  rawData.forEach(row => {
    // Ensure the row has the necessary properties for the current axis mapping
    // This prevents errors if a row is incomplete or missing a mapped dimension.
    if (!row[axisMapping.x] || !row[axisMapping.y]) {
      // Skip rows that don't have data for the primary dimensions
      console.warn(`Skipping row due to missing data for mapped axes: ${JSON.stringify(row)}`);
      return;
    }

    // Iterate over each quarter (Q1 to Q4) to create a separate data point for each.
    ['Q1', 'Q2', 'Q3', 'Q4'].forEach(quarter => {
      // Check if the quarter's value exists and is not null.
      if (row[quarter] !== undefined && row[quarter] !== null) {
        processed.push({
          id: `${row.id}-${quarter}`, // Create a unique ID for each quarter's data point
          continent: row.continent,   // Include all original dimensions
          region: row.region,
          product: row.product,
          quarter: quarter,           // Explicitly add 'quarter' as a dimension
          value: row[quarter],        // The sales value for this specific quarter
          // Keep original Q values for potential drill-down context, even if 'value' is the primary display.
          Q1: row.Q1,
          Q2: row.Q2,
          Q3: row.Q3,
          Q4: row.Q4,
        });
      }
    });
  });
  return processed;
};

/**
 * Applies a slice operation: filters the data by a single dimension and a specific value.
 * @param {Array<Object>} data - The current cube data (processed data).
 * @param {string} dimension - The dimension to filter by (e.g., 'continent', 'region', 'product').
 * @param {string} value - The value to filter for (case-insensitive partial match).
 * @returns {Array<Object>} The filtered data.
 */
export const applySlice = (data, dimension, value) => {
  if (!dimension || !value) {
    // If no dimension or value is provided, return the original data.
    return data;
  }
  const lowerCaseValue = String(value).toLowerCase(); // Convert filter value to lowercase for case-insensitive comparison.
  return data.filter(item =>
    // Check if the item's dimension value (converted to string and lowercase) includes the filter value.
    String(item[dimension]).toLowerCase().includes(lowerCaseValue)
  );
};

/**
 * Applies a dice operation: filters the data by multiple dimensions simultaneously.
 * @param {Array<Object>} data - The current cube data.
 * @param {Object} filters - An object where keys are dimensions and values are filter strings.
 * Example: { continent: 'Asia', product: 'Electronics' }
 * @returns {Array<Object>} The filtered data.
 */
export const applyDice = (data, filters) => {
  if (!filters || Object.keys(filters).length === 0) {
    // If no filters are provided, return the original data.
    return data;
  }

  return data.filter(item => {
    // For each item, check if it satisfies ALL provided filters.
    return Object.entries(filters).every(([dimension, value]) => {
      if (!value) return true; // If a filter value is empty, it means no filter is applied for that dimension.
      // Perform a case-insensitive partial match for each dimension.
      return String(item[dimension]).toLowerCase().includes(String(value).toLowerCase());
    });
  });
};

/**
 * Applies a pivot operation: conceptually changes the axis mapping.
 * Note: The actual visual re-arrangement in the 3D cube is handled by the ThreeDCube component
 * reacting to the `axisMapping` prop change. This function primarily serves to return
 * the new mapping to update the state in `App.jsx`.
 * @param {Array<Object>} data - The current cube data (not directly transformed here, but for context).
 * @param {Object} newAxisMapping - The new mapping object, e.g., {x: 'dim1', y: 'dim2', z: 'dim3'}.
 * @returns {Object} The new axis mapping.
 */
export const applyPivot = (data, newAxisMapping) => {
  // This function is a placeholder for the pivot logic.
  // The core logic of pivoting (re-arranging the visual representation)
  // is handled by how `ThreeDCube` consumes the `axisMapping` prop.
  return newAxisMapping;
};

/**
 * Applies a roll-up operation: aggregates Q1-Q4 values into a single 'Total' value
 * for each unique combination of Continent, Region, and Product.
 * @param {Array<Object>} data - The current cube data (which includes individual quarter data points).
 * @returns {Array<Object>} Data with aggregated 'Total' values, suitable for a rolled-up view.
 */
export const applyRollUp = (data) => {
  // Use a Map to group and aggregate data. The key uniquely identifies a (Continent, Region, Product) combination.
  const rolledUpDataMap = new Map();

  data.forEach(item => {
    const key = `${item.continent}-${item.region}-${item.product}`; // Unique key for aggregation.
    if (!rolledUpDataMap.has(key)) {
      // If this combination hasn't been seen yet, initialize its aggregated entry.
      rolledUpDataMap.set(key, {
        id: key, // Use the aggregation key as the ID for the rolled-up item.
        continent: item.continent,
        region: item.region,
        product: item.product,
        Total: 0, // Initialize total sales.
        // Keep original Q values for potential drill-down, even if 'Total' will be displayed.
        Q1: item.Q1,
        Q2: item.Q2,
        Q3: item.Q3,
        Q4: item.Q4,
      });
    }
    const current = rolledUpDataMap.get(key);
    // Sum up the value. 'item.value' holds the individual quarter's sales.
    if (item.quarter && item.value !== undefined) {
      current.Total += item.value;
    }
  });

  // Convert the Map values (aggregated objects) back into an array.
  const rolledUpArray = Array.from(rolledUpDataMap.values());

  // Modify the 'quarter' property to 'Total' for consistency in axis mapping
  // when displaying the rolled-up view in ThreeDCube.
  return rolledUpArray.map(item => ({
    ...item,
    quarter: 'Total',
  }));
};

/**
 * Applies a drill-down operation.
 * In this example, if the data was rolled up, it reverts to showing the individual Q1-Q4 values.
 * If not rolled up, it effectively resets any active filters, or indicates no further granularity is available
 * given the current input data (which only has quarters, not months).
 * @param {Array<Object>} data - The current cube data.
 * @param {Array<Object>} originalDataBeforeRollUp - The data state saved before a roll-up operation.
 * @returns {Array<Object>} The drilled-down data.
 */
export const applyDrillDown = (data, originalDataBeforeRollUp) => {
  // The primary logic for drill-down (reverting from roll-up) is handled in App.jsx
  // by setting `isRolledUp` to false and restoring `cubeData` from `originalCubeDataBeforeRollUp`.
  // This function serves as a conceptual placeholder for more complex drill-down scenarios,
  // e.g., if you had monthly data to expand quarters into.
  return originalDataBeforeRollUp;
};
