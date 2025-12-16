import { useMemo } from 'react';
import { Tree } from './Tree';

interface ForestProps {
  worldSize: number;
  playerPosition: { x: number; y: number };
}

export const Forest = ({ worldSize, playerPosition }: ForestProps) => {
  // Generate static tree positions
  const trees = useMemo(() => {
    const treeData: Array<{
      position: [number, number, number];
      scale: number;
      type: 'pine' | 'oak' | 'dead';
    }> = [];

    // Create a grid with random offsets
    const gridSize = 8;
    const spacing = worldSize / gridSize;

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        // Skip center area (player spawn)
        const centerX = worldSize / 2;
        const centerZ = worldSize / 2;
        const posX = x * spacing + (Math.random() - 0.5) * spacing * 0.8;
        const posZ = z * spacing + (Math.random() - 0.5) * spacing * 0.8;
        
        const distFromCenter = Math.sqrt(
          Math.pow(posX - centerX, 2) + Math.pow(posZ - centerZ, 2)
        );
        
        if (distFromCenter < 15) continue; // Clear area around spawn

        // Random tree type
        const rand = Math.random();
        const type = rand > 0.85 ? 'dead' : rand > 0.4 ? 'pine' : 'oak';
        
        treeData.push({
          position: [posX - worldSize / 2, 0, posZ - worldSize / 2],
          scale: 0.8 + Math.random() * 0.6,
          type,
        });
      }
    }

    // Add some random additional trees
    for (let i = 0; i < 30; i++) {
      const posX = Math.random() * worldSize;
      const posZ = Math.random() * worldSize;
      
      const centerX = worldSize / 2;
      const centerZ = worldSize / 2;
      const distFromCenter = Math.sqrt(
        Math.pow(posX - centerX, 2) + Math.pow(posZ - centerZ, 2)
      );
      
      if (distFromCenter < 10) continue;

      const rand = Math.random();
      const type = rand > 0.8 ? 'dead' : rand > 0.3 ? 'pine' : 'oak';

      treeData.push({
        position: [posX - worldSize / 2, 0, posZ - worldSize / 2],
        scale: 0.6 + Math.random() * 0.8,
        type,
      });
    }

    return treeData;
  }, [worldSize]);

  return (
    <>
      {trees.map((tree, index) => (
        <Tree
          key={index}
          position={tree.position}
          scale={tree.scale}
          type={tree.type}
        />
      ))}
    </>
  );
};
