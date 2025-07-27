// src/components/ThreeDCube.jsx
// This component is responsible for rendering the 3D cube visualization using Three.js and @react-three/fiber.
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei'; // Text component simplifies 3D text rendering
import * as THREE from 'three'; // Import Three.js library

// Define constant dimensions and spacing for the cube blocks.
const CUBE_SIZE = 3.0; // Further increased size of each individual data cube (block)
const SPACING = 1.0; // Further increased space between adjacent cube blocks
const TEXT_SIZE = 0.7; // Further increased font size for the 3D text displaying values
const TEXT_HEIGHT = 0.15; // Further increased thickness of the 3D text

// Helper function to extract and sort unique values for a given dimension from the data.
const getUniqueValues = (data, dimension) => {
  // Use a Set to get unique values, then convert to array and sort.
  return [...new Set(data.map(d => d[dimension]))].sort();
};

function ThreeDCube({ data, axisMapping }) {
  const meshRef = useRef(); // Ref to hold the group of all cube meshes, allowing transformations.

  // Memoize (cache) unique dimension values and their corresponding indices.
  // This helps optimize performance by avoiding re-computation on every render
  // unless 'data' or 'axisMapping' changes.
  const { xValues, yValues, zValues, xIndices, yIndices, zIndices } = useMemo(() => {
    // Get unique values for the currently mapped X and Y dimensions.
    const xVals = getUniqueValues(data, axisMapping.x);
    const yVals = getUniqueValues(data, axisMapping.y);
    // Z-axis values are fixed to quarters and 'Total' for roll-up.
    const zVals = ['Q1', 'Q2', 'Q3', 'Q4', 'Total'];

    // Create Maps to quickly look up the index of a dimension value.
    const xIdx = new Map(xVals.map((val, idx) => [val, idx]));
    const yIdx = new Map(yVals.map((val, idx) => [val, idx]));
    const zIdx = new Map(zVals.map((val, idx) => [val, idx]));

    return {
      xValues: xVals,
      yValues: yVals,
      zValues: zVals,
      xIndices: xIdx,
      yIndices: yIdx,
      zIndices: zIdx,
    };
  }, [data, axisMapping]); // Dependencies: re-run this memo if data or axisMapping changes.

  // Calculate the total width, height, and depth of the entire cube structure.
  const cubeWidth = xValues.length * (CUBE_SIZE + SPACING) - SPACING;
  const cubeHeight = yValues.length * (CUBE_SIZE + SPACING) - SPACING;
  const cubeDepth = zValues.length * (CUBE_SIZE + SPACING) - SPACING;

  // Calculate offsets to center the entire cube structure around the origin (0,0,0).
  const offsetX = -cubeWidth / 2 + CUBE_SIZE / 2;
  const offsetY = -cubeHeight / 2 + CUBE_SIZE / 2;
  const offsetZ = -cubeDepth / 2 + CUBE_SIZE / 2;

  // Memoize the creation of individual cube blocks and their text labels.
  const cubeBlocks = useMemo(() => {
    const blocks = [];
    data.forEach(item => {
      // Get the numerical indices for the current item's X and Y dimension values.
      const xIdx = xIndices.get(item[axisMapping.x]);
      const yIdx = yIndices.get(item[axisMapping.y]);

      // Define the quarters to iterate through.
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      let hasQuarters = false; // Flag to check if individual quarter data was found.

      // Iterate over each quarter to create a cube block for it.
      quarters.forEach(q => {
        // Check if the quarter's value exists in the current data item.
        if (item[q] !== undefined) {
          hasQuarters = true;
          const zIdx = zIndices.get(q); // Get the index for the current quarter.

          // If all indices are valid, calculate the position and push the cube block.
          if (xIdx !== undefined && yIdx !== undefined && zIdx !== undefined) {
            const posX = xIdx * (CUBE_SIZE + SPACING) + offsetX;
            const posY = yIdx * (CUBE_SIZE + SPACING) + offsetY;
            const posZ = zIdx * (CUBE_SIZE + SPACING) + offsetZ;

            blocks.push(
              // Group each cube and its text together for easier positioning.
              <group key={`${item.id}-${q}`} position={[posX, posY, posZ]}>
                <mesh>
                  <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} /> {/* Cube geometry */}
                  {/* Random HSL color for each block for visual distinction */}
                  <meshStandardMaterial color={new THREE.Color().setHSL(Math.random(), 0.7, 0.5)} />
                </mesh>
                {/* 3D Text displaying the quarter's value */}
                <Text
                  position={[0, 0, CUBE_SIZE / 2 + TEXT_HEIGHT]} // Position text slightly in front of the cube face
                  fontSize={TEXT_SIZE}
                  color="black"
                  anchorX="center"
                  anchorY="middle"
                >
                  {item[q].toFixed(0)} {/* Display value, formatted to 0 decimal places */}
                </Text>
              </group>
            );
          }
        }
      });

      // If 'Total' exists in the item (meaning it's a rolled-up item) AND no individual quarters were processed for it,
      // create a cube block for the 'Total' value.
      if (item.Total !== undefined && !hasQuarters) {
        const zIdx = zIndices.get('Total'); // Get the index for 'Total'.
        if (xIdx !== undefined && yIdx !== undefined && zIdx !== undefined) {
          const posX = xIdx * (CUBE_SIZE + SPACING) + offsetX;
          const posY = yIdx * (CUBE_SIZE + SPACING) + offsetY;
          const posZ = zIdx * (CUBE_SIZE + SPACING) + offsetZ;

          blocks.push(
            <group key={`${item.id}-Total`} position={[posX, posY, posZ]}>
              <mesh>
                <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
                <meshStandardMaterial color={new THREE.Color().setHSL(Math.random(), 0.7, 0.5)} />
              </mesh>
              <Text
                position={[0, 0, CUBE_SIZE / 2 + TEXT_HEIGHT]}
                fontSize={TEXT_SIZE}
                color="black"
                anchorX="center"
                anchorY="middle"
              >
                {item.Total.toFixed(0)} {/* Display the total value */}
              </Text>
            </group>
          );
        }
      }
    });
    return blocks;
  }, [data, axisMapping, xIndices, yIndices, zIndices, offsetX, offsetY, offsetZ]); // Recompute if these dependencies change.

  // Memoize the creation of axis labels.
  const axisLabels = useMemo(() => {
    const labels = [];
    // Define a larger font size for axis labels for better visibility
    const AXIS_LABEL_FONT_SIZE = 1.2; // Further increased font size
    // Define an offset to position labels further from the cube
    const LABEL_OFFSET = 2.5; // Further increased offset

    // X-axis labels: positioned below the X-axis of the cube.
    xValues.forEach((val, idx) => {
      const posX = idx * (CUBE_SIZE + SPACING) + offsetX;
      labels.push(
        <Text
          key={`x-label-${val}`}
          position={[posX, offsetY - CUBE_SIZE / 2 - LABEL_OFFSET, offsetZ - CUBE_SIZE / 2 - LABEL_OFFSET]} // Adjusted position
          fontSize={AXIS_LABEL_FONT_SIZE}
          color="darkblue"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI / 4, 0]} // Slight rotation for better readability
          // Make labels always face the camera for better visibility
          billboard
        >
          {val}
        </Text>
      );
    });

    // Y-axis labels: positioned to the left of the Y-axis of the cube.
    yValues.forEach((val, idx) => {
      const posY = idx * (CUBE_SIZE + SPACING) + offsetY;
      labels.push(
        <Text
          key={`y-label-${val}`}
          position={[offsetX - CUBE_SIZE / 2 - LABEL_OFFSET, posY, offsetZ - CUBE_SIZE / 2 - LABEL_OFFSET]} // Adjusted position
          fontSize={AXIS_LABEL_FONT_SIZE}
          color="darkgreen"
          anchorX="center"
          anchorY="middle"
          rotation={[0, -Math.PI / 4, 0]} // Slight rotation
          billboard
        >
          {val}
        </Text>
      );
    });

    // Z-axis labels (Quarters/Total): positioned behind the Z-axis of the cube.
    zValues.forEach((val, idx) => {
      const posZ = idx * (CUBE_SIZE + SPACING) + offsetZ;
      labels.push(
        <Text
          key={`z-label-${val}`}
          position={[offsetX - CUBE_SIZE / 2 - LABEL_OFFSET, offsetY - CUBE_SIZE / 2 - LABEL_OFFSET, posZ]} // Adjusted position
          fontSize={AXIS_LABEL_FONT_SIZE}
          color="darkred"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI / 2, 0]} // Rotate to face the camera
          billboard
        >
          {val}
        </Text>
      );
    });

    return labels;
  }, [xValues, yValues, zValues, offsetX, offsetY, offsetZ]); // Recompute if these dependencies change.

  return (
    // Group all cube blocks and labels together so they can be rotated/panned as a single unit.
    <group ref={meshRef}>
      {cubeBlocks}
      {axisLabels}
    </group>
  );
}

export default ThreeDCube;