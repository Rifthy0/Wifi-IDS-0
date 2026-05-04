

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Device, DeviceStatus } from '../types';
import { getDeviceTypeIcon } from './DeviceList';

interface NetworkVisualizerProps {
    devices: Device[];
    onSelectDevice: (device: Device) => void;
    theme: string;
}

const statusColors: { [key in DeviceStatus | 'Blocked']: string } = {
    [DeviceStatus.Trusted]: '#4ade80',
    [DeviceStatus.Suspicious]: '#facc15',
    [DeviceStatus.Unknown]: '#64748b',
    'Blocked': '#ef4444',
};

interface VisualizerNode {
    x: number;
    y: number;
    vx: number;
    vy: number;
    targetR: number;
    r: number;
}

const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({ devices, onSelectDevice, theme }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const nodesRef = useRef<{ [id: string]: VisualizerNode }>({});
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [tick, setTick] = useState(0);

    const updateDimensions = useCallback(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
            });
        }
    }, []);

    useEffect(() => {
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [updateDimensions]);

    const deviceMap = useMemo(() => new Map(devices.map(d => [d.id, d])), [devices]);

    useEffect(() => {
        const { width, height } = dimensions;
        if (width === 0 || height === 0) return;

        const currentNodes = nodesRef.current;
        const deviceIds = new Set(devices.map(d => d.id));

        // Add new nodes
        for (const device of devices) {
            if (!currentNodes[device.id]) {
                currentNodes[device.id] = {
                    x: width / 2 + (Math.random() - 0.5) * 50,
                    y: height / 2 + (Math.random() - 0.5) * 50,
                    vx: 0,
                    vy: 0,
                    targetR: 0, // Will be set below
                    r: 5,
                };
            }
            // Update target radius
            currentNodes[device.id].targetR = 8 + (device.threatScore / 100) * 12;
        }
        
        // Remove old nodes
        for (const id in currentNodes) {
            if (!deviceIds.has(id)) {
                delete currentNodes[id];
            }
        }
    }, [devices, dimensions]);


    useEffect(() => {
        if (dimensions.width === 0) return;
        const { width, height } = dimensions;

        const simulation = () => {
            const nodes = Object.values(nodesRef.current) as VisualizerNode[];
            const nodeIds = Object.keys(nodesRef.current);
            
            // Forces
            const repulsionStrength = 2;
            const centerGravity = 0.005;

            for (let i = 0; i < nodes.length; i++) {
                const nodeA = nodes[i];
                
                // Center gravity
                nodeA.vx += (width / 2 - nodeA.x) * centerGravity;
                nodeA.vy += (height / 2 - nodeA.y) * centerGravity;

                // Repulsion
                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeB = nodes[j];
                    const dx = nodeB.x - nodeA.x;
                    const dy = nodeB.y - nodeA.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    distance = Math.max(distance, 1);
                    
                    const force = repulsionStrength / (distance * distance);
                    const minDistance = nodeA.r + nodeB.r + 10;
                    if(distance < minDistance) {
                        const overlap = minDistance - distance;
                        const fx = (dx / distance) * force * -1 - (dx/distance) * overlap * 0.1;
                        const fy = (dy / distance) * force * -1 - (dy/distance) * overlap * 0.1;

                        nodeA.vx += fx;
                        nodeA.vy += fy;
                        nodeB.vx -= fx;
                        nodeB.vy -= fy;
                    }
                }
            }
            
            // Update positions
            for(const node of nodes) {
                // Dampening
                node.vx *= 0.95;
                node.vy *= 0.95;

                node.x += node.vx;
                node.y += node.vy;
                
                // Smooth radius change
                node.r += (node.targetR - node.r) * 0.1;

                // Boundary collision
                if (node.x - node.r < 0) { node.x = node.r; node.vx *= -1; }
                if (node.x + node.r > width) { node.x = width - node.r; node.vx *= -1; }
                if (node.y - node.r < 0) { node.y = node.r; node.vy *= -1; }
                if (node.y + node.r > height) { node.y = height - node.r; node.vy *= -1; }
            }
            setTick(t => t + 1);
        };
        
        const frameId = requestAnimationFrame(simulation);
        return () => cancelAnimationFrame(frameId);
        
    }, [dimensions, tick, devices]);

    return (
        <div ref={containerRef} className="w-full h-full bg-light-bg dark:bg-slate-900/50 rounded-b-lg">
            {dimensions.width > 0 ? (
                <svg width={dimensions.width} height={dimensions.height} className="cursor-pointer">
                    {(Object.entries(nodesRef.current) as [string, VisualizerNode][]).map(([id, node]) => {
                        const device = deviceMap.get(id);
                        if (!device) return null;
                        const color = device.isBlocked ? statusColors.Blocked : statusColors[device.status];
                        
                        return (
                            <g key={id} transform={`translate(${node.x}, ${node.y})`} onClick={() => onSelectDevice(device)}>
                                <circle
                                    r={node.r}
                                    fill={color}
                                    stroke={theme === 'dark' ? '#0f172a' : '#ffffff'}
                                    strokeWidth="2"
                                >
                                    <title>{`${device.mac}\nVendor: ${device.vendor}\nStatus: ${device.isBlocked ? 'Blocked' : device.status}`}</title>
                                </circle>
                                {node.r > 12 && (
                                    <foreignObject x={-10} y={-10} width="20" height="20">
                                        {React.cloneElement(getDeviceTypeIcon(device.deviceType), {className: "h-5 w-5 text-white/80"})}
                                    </foreignObject>
                                )}
                            </g>
                        );
                    })}
                </svg>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-500">Loading visualizer...</div>
            )}
        </div>
    );
};

export default NetworkVisualizer;