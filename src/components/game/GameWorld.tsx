import { useEffect, useRef, useMemo } from 'react';
import { GameState, Position, Resource, Enemy, Building } from '@/types/game';

interface GameWorldProps {
  gameState: GameState;
  worldSize: number;
  onCollectResource: (id: string) => void;
  onAttackEnemy: (id: string, damage: number) => void;
}

export const GameWorld = ({ gameState, worldSize, onCollectResource, onAttackEnemy }: GameWorldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { player, resources, buildings, enemies, isNight, timeOfDay } = gameState;

  // Camera follows player
  const cameraOffset = useMemo(() => ({
    x: Math.max(0, Math.min(player.position.x - 300, worldSize - 600)),
    y: Math.max(0, Math.min(player.position.y - 250, worldSize - 500)),
  }), [player.position, worldSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background gradient
    const nightFactor = isNight ? 0.7 : 0;
    const gradient = ctx.createRadialGradient(300, 250, 0, 300, 250, 400);
    gradient.addColorStop(0, `rgba(20, ${35 - nightFactor * 20}, ${15 - nightFactor * 10}, 1)`);
    gradient.addColorStop(1, `rgba(5, ${15 - nightFactor * 10}, ${8 - nightFactor * 5}, 1)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid pattern (trees/grass indication)
    ctx.strokeStyle = `rgba(34, 80, 34, ${0.1 - nightFactor * 0.05})`;
    ctx.lineWidth = 1;
    for (let x = 0; x < worldSize; x += 50) {
      for (let y = 0; y < worldSize; y += 50) {
        const screenX = x - cameraOffset.x;
        const screenY = y - cameraOffset.y;
        if (screenX >= -50 && screenX <= 650 && screenY >= -50 && screenY <= 550) {
          // Random tree/grass dots
          if (Math.random() > 0.7) {
            ctx.fillStyle = `rgba(34, ${60 + Math.random() * 40}, 34, 0.3)`;
            ctx.beginPath();
            ctx.arc(screenX + Math.random() * 50, screenY + Math.random() * 50, 2 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // Draw buildings
    buildings.forEach(building => {
      const screenX = building.position.x - cameraOffset.x;
      const screenY = building.position.y - cameraOffset.y;
      
      if (screenX >= -30 && screenX <= 630 && screenY >= -30 && screenY <= 530) {
        ctx.save();
        
        switch (building.type) {
          case 'shelter':
            ctx.fillStyle = '#5D4E37';
            ctx.fillRect(screenX - 20, screenY - 20, 40, 40);
            ctx.fillStyle = '#8B7355';
            ctx.beginPath();
            ctx.moveTo(screenX - 25, screenY - 20);
            ctx.lineTo(screenX, screenY - 35);
            ctx.lineTo(screenX + 25, screenY - 20);
            ctx.fill();
            break;
          case 'fire':
            ctx.fillStyle = '#FF6B35';
            ctx.beginPath();
            ctx.arc(screenX, screenY, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFD93D';
            ctx.beginPath();
            ctx.arc(screenX, screenY - 5, 6, 0, Math.PI * 2);
            ctx.fill();
            // Glow effect
            const glowGradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, 50);
            glowGradient.addColorStop(0, 'rgba(255, 150, 50, 0.3)');
            glowGradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(screenX, screenY, 50, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'wall':
            ctx.fillStyle = '#654321';
            ctx.fillRect(screenX - 25, screenY - 5, 50, 10);
            break;
          case 'trap':
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY, 15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(screenX - 10, screenY);
            ctx.lineTo(screenX + 10, screenY);
            ctx.moveTo(screenX, screenY - 10);
            ctx.lineTo(screenX, screenY + 10);
            ctx.stroke();
            break;
        }
        
        ctx.restore();
      }
    });

    // Draw resources
    resources.forEach(resource => {
      const screenX = resource.position.x - cameraOffset.x;
      const screenY = resource.position.y - cameraOffset.y;
      
      if (screenX >= -20 && screenX <= 620 && screenY >= -20 && screenY <= 520) {
        ctx.save();
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const icons: Record<string, string> = {
          wood: '🪵',
          stone: '🪨',
          food: '🍖',
          water: '💧',
          cloth: '🧵',
          metal: '⚙️',
        };
        
        ctx.fillText(icons[resource.type] || '📦', screenX, screenY);
        
        // Amount indicator
        if (resource.amount > 1) {
          ctx.font = '10px Arial';
          ctx.fillStyle = '#fff';
          ctx.fillText(`x${resource.amount}`, screenX + 12, screenY + 12);
        }
        
        ctx.restore();
      }
    });

    // Draw enemies
    enemies.forEach(enemy => {
      const screenX = enemy.position.x - cameraOffset.x;
      const screenY = enemy.position.y - cameraOffset.y;
      
      if (screenX >= -30 && screenX <= 630 && screenY >= -30 && screenY <= 530) {
        ctx.save();
        
        // Enemy body
        if (enemy.type === 'cannibal') {
          ctx.fillStyle = enemy.state === 'chase' ? '#8B0000' : '#4A3728';
        } else {
          ctx.fillStyle = enemy.state === 'chase' ? '#800080' : '#2F1F4A';
        }
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, enemy.type === 'mutant' ? 18 : 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = enemy.state === 'chase' ? '#FF0000' : '#FFFF00';
        ctx.beginPath();
        ctx.arc(screenX - 4, screenY - 3, 2, 0, Math.PI * 2);
        ctx.arc(screenX + 4, screenY - 3, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Health bar
        if (enemy.health < 100) {
          ctx.fillStyle = '#333';
          ctx.fillRect(screenX - 15, screenY - 25, 30, 4);
          ctx.fillStyle = '#FF0000';
          ctx.fillRect(screenX - 15, screenY - 25, (enemy.health / 100) * 30, 4);
        }
        
        // State indicator
        if (enemy.state === 'watch') {
          ctx.fillStyle = '#FFD700';
          ctx.font = '12px Arial';
          ctx.fillText('👁️', screenX + 15, screenY - 15);
        }
        
        ctx.restore();
      }
    });

    // Draw player
    const playerScreenX = player.position.x - cameraOffset.x;
    const playerScreenY = player.position.y - cameraOffset.y;
    
    ctx.save();
    
    // Player shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(playerScreenX, playerScreenY + 12, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Player body
    ctx.fillStyle = '#4A7C59';
    ctx.beginPath();
    ctx.arc(playerScreenX, playerScreenY, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Player face
    ctx.fillStyle = '#DEB887';
    ctx.beginPath();
    ctx.arc(playerScreenX, playerScreenY - 5, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Sanity effect
    if (player.stats.sanity < 30) {
      ctx.strokeStyle = `rgba(128, 0, 128, ${(30 - player.stats.sanity) / 60})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(playerScreenX, playerScreenY, 20 + Math.random() * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();

    // Night overlay
    if (isNight) {
      const nightOverlay = ctx.createRadialGradient(playerScreenX, playerScreenY, 50, playerScreenX, playerScreenY, 200);
      nightOverlay.addColorStop(0, 'rgba(0, 0, 20, 0)');
      nightOverlay.addColorStop(1, 'rgba(0, 0, 20, 0.7)');
      ctx.fillStyle = nightOverlay;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Fog overlay
    const fogGradient = ctx.createRadialGradient(300, 250, 100, 300, 250, 350);
    fogGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    fogGradient.addColorStop(1, `rgba(20, 40, 20, ${0.3 + nightFactor * 0.3})`);
    ctx.fillStyle = fogGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

  }, [player, resources, buildings, enemies, isNight, cameraOffset, worldSize]);

  // Handle keyboard for attacking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        // Find nearest enemy within attack range
        const attackRange = 50;
        enemies.forEach(enemy => {
          const dist = Math.sqrt(
            Math.pow(enemy.position.x - player.position.x, 2) +
            Math.pow(enemy.position.y - player.position.y, 2)
          );
          if (dist < attackRange) {
            const hasWeapon = player.inventory.some(i => i.type === 'axe' || i.type === 'spear');
            const damage = hasWeapon ? 30 : 10;
            onAttackEnemy(enemy.id, damage);
          }
        });
      }
      
      if (e.code === 'KeyE') {
        // Collect nearest resource
        const collectRange = 40;
        resources.forEach(resource => {
          const dist = Math.sqrt(
            Math.pow(resource.position.x - player.position.x, 2) +
            Math.pow(resource.position.y - player.position.y, 2)
          );
          if (dist < collectRange) {
            onCollectResource(resource.id);
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enemies, resources, player, onAttackEnemy, onCollectResource]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={500}
      className="border-2 border-border rounded-lg shadow-2xl"
    />
  );
};
