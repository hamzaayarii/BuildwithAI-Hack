import React, { useEffect, useState, useCallback } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getConceptGraph, ConceptNode, ConceptRelationship } from '../services/api';
import { Loader2, X, Network, Sparkles } from 'lucide-react';

interface ConceptGraphProps {
  sessionId: string;
  onNodeClick: (conceptLabel: string) => void;
  lastQuestion?: string;
}

const ConceptGraph: React.FC<ConceptGraphProps> = ({ sessionId, onNodeClick, lastQuestion }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

  // Load concept graph
  useEffect(() => {
    loadGraph();
  }, [sessionId]);

  // Highlight nodes based on last question
  useEffect(() => {
    if (lastQuestion && nodes.length > 0) {
      const questionLower = lastQuestion.toLowerCase();
      const matchedNode = nodes.find(node => 
        questionLower.includes(node.data.label.toLowerCase())
      );
      
      if (matchedNode) {
        setHighlightedNode(matchedNode.id);
        // Pulse animation
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

      // Convert concepts to React Flow nodes
      const flowNodes: Node[] = data.concepts.map((concept, index) => {
        const angle = (index / data.concepts.length) * 2 * Math.PI;
        const radius = 200;
        const x = 250 + radius * Math.cos(angle);
        const y = 250 + radius * Math.sin(angle);

        return {
          id: concept.id,
          type: 'default',
          position: { x, y },
          data: {
            label: concept.label,
            description: concept.description,
          },
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: '2px solid #764ba2',
            borderRadius: '12px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          },
        };
      });

      // Convert relationships to React Flow edges
      const flowEdges: Edge[] = data.relationships.map((rel, index) => ({
        id: `edge-${index}`,
        source: rel.source,
        target: rel.target,
        label: rel.type,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#9333ea', strokeWidth: 2 },
        labelStyle: { 
          fill: '#6b7280', 
          fontSize: 11,
          fontWeight: 500,
        },
        labelBgStyle: { 
          fill: 'white',
          fillOpacity: 0.9,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#9333ea',
        },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load concept graph');
      setLoading(false);
    }
  };

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const label = node.data.label;
    onNodeClick(label);
    
    // Highlight animation
    setHighlightedNode(node.id);
    setTimeout(() => setHighlightedNode(null), 1500);
    
    // Flash connected edges
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.source === node.id || edge.target === node.id) {
          return {
            ...edge,
            animated: true,
            style: { ...edge.style, strokeWidth: 3, stroke: '#ec4899' },
          };
        }
        return edge;
      })
    );
    
    // Reset edges after animation
    setTimeout(() => {
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          style: { ...edge.style, strokeWidth: 2, stroke: '#9333ea' },
        }))
      );
    }, 1500);
  }, [onNodeClick, setEdges]);

  // Update node styles based on highlighting
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        style: {
          ...node.style,
          transform: highlightedNode === node.id ? 'scale(1.2)' : 'scale(1)',
          boxShadow:
            highlightedNode === node.id
              ? '0 8px 16px rgba(147, 51, 234, 0.4)'
              : '0 4px 6px rgba(0,0,0,0.1)',
          border:
            highlightedNode === node.id
              ? '3px solid #ec4899'
              : '2px solid #764ba2',
        },
      }))
    );
  }, [highlightedNode, setNodes]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Analyzing documents...</p>
          <p className="text-sm text-gray-500 mt-1">Extracting concepts & relationships</p>
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
      {/* Header overlay */}
      <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-90 backdrop-blur rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Concept Map</p>
            <p className="text-xs text-gray-500">Click nodes to explore</p>
          </div>
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
        attributionPosition="bottom-left"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="#e5e7eb"
        />
        <Controls className="bg-white border-2 border-gray-200 rounded-lg" />
      </ReactFlow>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-3 shadow-lg max-w-xs">
        <p className="text-xs font-medium">💡 Interactive Graph</p>
        <p className="text-xs opacity-90 mt-1">
          • Click nodes to ask questions<br/>
          • Drag to reposition<br/>
          • Scroll to zoom<br/>
          • Watch animations as you chat
        </p>
      </div>
    </div>
  );
};

export default ConceptGraph;

