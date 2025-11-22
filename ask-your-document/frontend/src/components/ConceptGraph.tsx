import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { getConceptGraph, ConceptNode as ApiConceptNode, ConceptRelationship } from '../services/api';
import { Loader2, Network, Sparkles, Search, X, Info, LayoutGrid, GitFork, Layers, Download, Filter } from 'lucide-react';

interface ConceptGraphProps {
  sessionId: string;
  onNodeClick: (conceptLabel: string) => void;
  lastQuestion?: string;
}

type LayoutType = 'force' | 'circular' | 'hierarchical';

// Category colors
const categoryColors: Record<string, string> = {
  'Core Topic': '#8b5cf6',      // Purple
  'Supporting Idea': '#3b82f6',  // Blue
  'Entity': '#10b981',           // Green
  'Process': '#f59e0b',          // Orange
  'Outcome': '#ef4444',          // Red
  'Context': '#6b7280',          // Gray
};

// Relationship type colors
const relationshipColors: Record<string, string> = {
  'causes': '#ef4444',
  'requires': '#f59e0b',
  'part_of': '#8b5cf6',
  'influences': '#3b82f6',
  'produces': '#10b981',
  'related_to': '#6b7280',
  'contrasts': '#ec4899',
  'supports': '#14b8a6',
};

const ConceptGraph: React.FC<ConceptGraphProps> = ({ sessionId, onNodeClick, lastQuestion }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<ApiConceptNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [layoutType, setLayoutType] = useState<LayoutType>('force');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [conceptsData, setConceptsData] = useState<ApiConceptNode[]>([]);
  const [relationshipsData, setRelationshipsData] = useState<ConceptRelationship[]>([]);

  // Load concept graph
  useEffect(() => {
    loadGraph();
  }, [sessionId]);

  // Update layout when layout type changes
  useEffect(() => {
    if (conceptsData.length > 0) {
      updateLayout(layoutType);
    }
  }, [layoutType]);

  // Highlight nodes based on last question
  useEffect(() => {
    if (lastQuestion && nodes.length > 0) {
      const questionLower = lastQuestion.toLowerCase();
      const matchedNode = nodes.find(node => 
        questionLower.includes(node.data.label.toLowerCase()) ||
        node.data.keywords?.some((kw: string) => questionLower.includes(kw.toLowerCase()))
      );
      
      if (matchedNode) {
        setHighlightedNode(matchedNode.id);
        setTimeout(() => setHighlightedNode(null), 2000);
      }
    }
  }, [lastQuestion, nodes]);

  const loadGraph = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getConceptGraph(sessionId);
      
      if (data.concepts.length === 0) {
        setError('No concepts extracted yet. Upload documents to generate graph.');
        setLoading(false);
        return;
      }

      setConceptsData(data.concepts);
      setRelationshipsData(data.relationships);
      updateLayout(layoutType, data.concepts, data.relationships);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load concept graph');
      setLoading(false);
    }
  };

  const updateLayout = (layout: LayoutType, concepts = conceptsData, relationships = relationshipsData) => {
    let positions: Record<string, { x: number; y: number }> = {};

    switch (layout) {
      case 'circular':
        positions = calculateCircularLayout(concepts);
        break;
      case 'hierarchical':
        positions = calculateHierarchicalLayout(concepts, relationships);
        break;
      case 'force':
      default:
        positions = calculateForceLayout(concepts, relationships);
        break;
    }

    createNodesAndEdges(concepts, relationships, positions);
  };

  const calculateCircularLayout = (concepts: ApiConceptNode[]) => {
    const positions: Record<string, { x: number; y: number }> = {};
    const radius = 300;
    const centerX = 400;
    const centerY = 300;

    // Sort by importance for better visual hierarchy
    const sorted = [...concepts].sort((a, b) => b.importance - a.importance);

    sorted.forEach((concept, index) => {
      const angle = (index / concepts.length) * 2 * Math.PI;
      // More important concepts closer to center
      const r = radius - (concept.importance / 10) * 100;
      positions[concept.id] = {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      };
    });

    return positions;
  };

  const calculateHierarchicalLayout = (concepts: ApiConceptNode[], relationships: ConceptRelationship[]) => {
    const positions: Record<string, { x: number; y: number }> = {};
    
    // Sort by importance to determine levels
    const sorted = [...concepts].sort((a, b) => b.importance - a.importance);
    const levels: ApiConceptNode[][] = [];
    
    // Group into 3 levels based on importance
    const topConcepts = sorted.slice(0, Math.ceil(concepts.length / 3));
    const midConcepts = sorted.slice(Math.ceil(concepts.length / 3), Math.ceil(2 * concepts.length / 3));
    const bottomConcepts = sorted.slice(Math.ceil(2 * concepts.length / 3));
    
    levels.push(topConcepts, midConcepts, bottomConcepts);

    levels.forEach((level, levelIndex) => {
      const y = 100 + levelIndex * 250;
      const spacing = 800 / (level.length + 1);
      
      level.forEach((concept, index) => {
        positions[concept.id] = {
          x: 100 + (index + 1) * spacing,
          y: y,
        };
      });
    });

    return positions;
  };

  const calculateForceLayout = (concepts: ApiConceptNode[], relationships: ConceptRelationship[]) => {
    const positions: Record<string, { x: number; y: number }> = {};
    
    // Create simulation nodes
    const simNodes = concepts.map(c => ({
      id: c.id,
      importance: c.importance,
      x: 400 + (Math.random() - 0.5) * 200,
      y: 300 + (Math.random() - 0.5) * 200,
    }));

    // Create simulation links
    const simLinks = relationships.map(r => ({
      source: r.source,
      target: r.target,
      strength: r.strength,
    }));

    // Run force simulation
    const simulation = forceSimulation(simNodes)
      .force('link', forceLink(simLinks).id((d: any) => d.id).strength((d: any) => d.strength))
      .force('charge', forceManyBody().strength(-500))
      .force('center', forceCenter(400, 300))
      .force('collide', forceCollide().radius((d: any) => 30 + d.importance * 5))
      .stop();

    // Run simulation synchronously
    for (let i = 0; i < 300; i++) {
      simulation.tick();
    }

    simNodes.forEach(node => {
      positions[node.id] = { x: node.x || 400, y: node.y || 300 };
    });

    return positions;
  };

  const createNodesAndEdges = (
    concepts: ApiConceptNode[],
    relationships: ConceptRelationship[],
    positions: Record<string, { x: number; y: number }>
  ) => {
    // Filter concepts by search and category
    const filtered = concepts.filter(concept => {
      const matchesSearch = searchTerm === '' || 
        concept.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        concept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        concept.keywords.some(kw => kw.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = filterCategory === 'all' || concept.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });

    const filteredIds = new Set(filtered.map(c => c.id));

    // Convert concepts to React Flow nodes
    const flowNodes: Node[] = filtered.map((concept) => {
      const pos = positions[concept.id] || { x: 400, y: 300 };
      const nodeSize = 20 + concept.importance * 8; // Size based on importance
      const color = categoryColors[concept.category] || '#6b7280';

      return {
        id: concept.id,
        type: 'default',
        position: pos,
        data: {
          label: concept.label,
          description: concept.description,
          importance: concept.importance,
          category: concept.category,
          keywords: concept.keywords,
        },
        style: {
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          color: 'white',
          border: `3px solid ${color}`,
          borderRadius: '16px',
          padding: `${nodeSize / 2}px ${nodeSize}px`,
          fontSize: `${12 + concept.importance / 2}px`,
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: `0 ${4 + concept.importance / 2}px ${8 + concept.importance}px rgba(0,0,0,0.15)`,
          width: 'auto',
          minWidth: `${nodeSize * 4}px`,
        },
      };
    });

    // Convert relationships to React Flow edges (only between visible nodes)
    const flowEdges: Edge[] = relationships
      .filter(rel => filteredIds.has(rel.source) && filteredIds.has(rel.target))
      .map((rel, index) => {
        const color = relationshipColors[rel.type] || '#6b7280';
        const strokeWidth = 1 + rel.strength * 3;

        return {
          id: `edge-${index}`,
          source: rel.source,
          target: rel.target,
          label: rel.type.replace('_', ' '),
          type: 'smoothstep',
          animated: rel.strength > 0.7,
          style: { 
            stroke: color, 
            strokeWidth: strokeWidth,
            opacity: 0.7 + rel.strength * 0.3,
          },
          labelStyle: { 
            fill: color, 
            fontSize: 10,
            fontWeight: 600,
          },
          labelBgStyle: { 
            fill: 'white',
            fillOpacity: 0.9,
            rx: 4,
            ry: 4,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: color,
            width: 20,
            height: 20,
          },
        };
      });

    setNodes(flowNodes);
    setEdges(flowEdges);
  };

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const concept = conceptsData.find(c => c.id === node.id);
    if (concept) {
      setSelectedNode(concept);
      onNodeClick(concept.label);
      
      // Highlight animation
      setHighlightedNode(node.id);
      setTimeout(() => setHighlightedNode(null), 1500);
      
      // Highlight connected edges
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.source === node.id || edge.target === node.id) {
            return {
              ...edge,
              animated: true,
              style: { ...edge.style, strokeWidth: 4, opacity: 1 },
            };
          }
          return edge;
        })
      );
      
      // Reset edges after animation
      setTimeout(() => {
        updateLayout(layoutType);
      }, 1500);
    }
  }, [onNodeClick, conceptsData, setEdges, layoutType]);

  // Update node styles based on highlighting
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        style: {
          ...node.style,
          transform: highlightedNode === node.id ? 'scale(1.15)' : 'scale(1)',
          boxShadow:
            highlightedNode === node.id
              ? `0 12px 24px rgba(139, 92, 246, 0.5)`
              : node.style?.boxShadow,
          border:
            highlightedNode === node.id
              ? '4px solid #ec4899'
              : node.style?.border,
          zIndex: highlightedNode === node.id ? 1000 : 1,
        },
      }))
    );
  }, [highlightedNode, setNodes]);

  const exportAsImage = () => {
    // Create a simple export by capturing the current view
    alert('Export feature: Right-click on the graph and select "Save as..." to export the current view!');
  };

  const categories = useMemo(() => {
    return Array.from(new Set(conceptsData.map(c => c.category)));
  }, [conceptsData]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Analyzing documents...</p>
          <p className="text-sm text-gray-500 mt-1">Extracting concepts, relationships & metadata</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
        <div className="text-center max-w-md">
          <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">No Concept Graph Yet</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={loadGraph}
            className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative bg-white rounded-xl overflow-hidden border-2 border-gray-200">
      {/* Header controls */}
      <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-95 backdrop-blur rounded-lg p-3 shadow-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-sm font-bold text-gray-800">AI Concept Graph</p>
            <p className="text-xs text-gray-500">{conceptsData.length} concepts • {relationshipsData.length} relationships</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search concepts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="mt-2">
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
            <Filter className="w-3 h-3" />
            <span>Filter by category:</span>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Layout controls */}
      <div className="absolute top-4 right-4 z-10 bg-white bg-opacity-95 backdrop-blur rounded-lg p-2 shadow-lg border border-gray-200">
        <div className="flex gap-1">
          <button
            onClick={() => setLayoutType('force')}
            className={`p-2 rounded-lg transition-colors ${
              layoutType === 'force'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Force-directed layout"
          >
            <GitFork className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayoutType('circular')}
            className={`p-2 rounded-lg transition-colors ${
              layoutType === 'circular'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Circular layout"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayoutType('hierarchical')}
            className={`p-2 rounded-lg transition-colors ${
              layoutType === 'hierarchical'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Hierarchical layout"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={exportAsImage}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            title="Export graph"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* React Flow */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="#e5e7eb"
        />
        <Controls className="bg-white border-2 border-gray-200 rounded-lg" />
        <MiniMap 
          nodeColor={(node) => {
            const concept = conceptsData.find(c => c.id === node.id);
            return concept ? categoryColors[concept.category] || '#6b7280' : '#6b7280';
          }}
          className="bg-white border-2 border-gray-200 rounded-lg"
        />
      </ReactFlow>

      {/* Node details panel */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg p-4 shadow-xl border-2 border-indigo-200 max-w-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-gray-800">{selectedNode.label}</h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">{selectedNode.description}</p>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Category:</span>
              <span 
                className="text-xs px-2 py-1 rounded-full text-white font-semibold"
                style={{ backgroundColor: categoryColors[selectedNode.category] || '#6b7280' }}
              >
                {selectedNode.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Importance:</span>
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < selectedNode.importance ? 'bg-indigo-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">{selectedNode.importance}/10</span>
            </div>

            {selectedNode.keywords.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-gray-500">Keywords:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedNode.keywords.map((kw, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-white bg-opacity-95 backdrop-blur rounded-lg p-3 shadow-lg border border-gray-200 max-w-xs">
        <p className="text-xs font-bold text-gray-800 mb-2">💡 How to Use</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>Click</strong> nodes to ask questions</li>
          <li>• <strong>Drag</strong> to reposition nodes</li>
          <li>• <strong>Scroll</strong> to zoom in/out</li>
          <li>• <strong>Search</strong> to find concepts</li>
          <li>• <strong>Filter</strong> by category</li>
          <li>• Node size = importance level</li>
        </ul>
        
        <p className="text-xs font-bold text-gray-800 mt-3 mb-1">Relationship Types</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {Object.entries(relationshipColors).slice(0, 4).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className="w-3 h-0.5" style={{ backgroundColor: color }} />
              <span className="text-gray-600">{type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConceptGraph;
