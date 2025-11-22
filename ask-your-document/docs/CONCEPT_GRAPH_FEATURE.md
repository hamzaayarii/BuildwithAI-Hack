# Interactive Concept Graph Feature 🌐

## Overview

The **Concept Graph** is an advanced AI-powered feature that visualizes the key concepts and relationships within your documents as an interactive, animated node graph.

---

## ✨ Features

### 1. **Auto-Generated Concept Extraction**
- AI automatically analyzes your documents
- Extracts 5-10 key concepts, topics, and entities
- Identifies relationships between concepts
- Powered by Cohere's advanced NLP

### 2. **Interactive Node Graph**
- **Click Nodes**: Click any concept to instantly ask questions about it
- **Drag & Drop**: Rearrange nodes to your preference
- **Zoom & Pan**: Navigate large concept maps
- **Beautiful Design**: Gradient nodes with smooth animations

### 3. **Smart Animations**
- Nodes **pulse** when mentioned in questions
- Edges **flash** when relationships are explored
- **Highlight animations** on user interaction
- **Smooth transitions** for all changes

### 4. **Relationship Visualization**
- Animated edges show how concepts relate
- Edge labels describe relationship types
- Arrow directions show connection flow
- Multiple relationship types supported

---

## 🎯 How It Works

### Backend Process

```
1. User uploads documents
   ↓
2. Documents are chunked
   ↓
3. User clicks "Concept Graph" button
   ↓
4. Backend retrieves all chunks
   ↓
5. Cohere AI analyzes text
   ↓
6. Extracts key concepts & relationships
   ↓
7. Returns structured graph data (JSON)
   ↓
8. Frontend visualizes with React Flow
```

### AI Extraction

The AI looks for:
- **Main Topics**: Primary themes in the document
- **Entities**: People, places, organizations, products
- **Concepts**: Abstract ideas and themes
- **Relationships**: "relates to", "part of", "causes", etc.

---

## 🎨 Visual Design

### Node Appearance

```
┌──────────────────────┐
│                      │
│   Concept Name       │  ← Gradient purple background
│                      │    White text
└──────────────────────┘    Rounded corners
                            Hover: Scale up
                            Click: Pulse animation
```

### Edge Appearance

```
Node A ──────→ Node B
       ↑
   Animated flow
   Purple gradient
   Labeled relationship
```

### Layout

- **Circular Layout**: Nodes arranged in a circle
- **200px Radius**: Balanced spacing
- **Animated Edges**: Flowing particles
- **Zoom Controls**: Bottom-left corner

---

## 🚀 Usage

### Accessing the Graph

1. **Upload Documents**: Upload one or more documents
2. **Click Graph Icon**: Click the 🌐 Network icon in chat header
3. **Wait for Analysis**: AI extracts concepts (5-15 seconds)
4. **Explore**: Interactive graph appears!

### Interacting with Nodes

#### Click a Node
```
You click: "Revenue" node
  ↓
Auto-generates question: "Tell me about Revenue"
  ↓
Sends question to AI
  ↓
Highlights connected nodes
  ↓
Shows answer in chat below
```

#### Drag Nodes
- Click and drag to reposition
- Create your preferred layout
- Positions are not saved (resets on refresh)

#### Zoom & Pan
- **Scroll**: Zoom in/out
- **Click & Drag Background**: Pan around
- **Reset**: Use controls in bottom-left

---

## 🎮 Interactive Features

### 1. Node Click Interaction
```typescript
User clicks "Growth Strategy" node
  ↓
Question auto-generated: "Tell me about Growth Strategy"
  ↓
Node pulses with pink highlight
  ↓
Connected edges flash
  ↓
AI answers question
  ↓
Animation completes
```

### 2. Question-Based Highlighting
```typescript
User asks: "What about revenue?"
  ↓
System detects "revenue" in question
  ↓
Finds matching node in graph
  ↓
Highlights "Revenue" node
  ↓
Pulses for 2 seconds
  ↓
Returns to normal
```

### 3. Edge Animation
```typescript
Node clicked
  ↓
Find all connected edges
  ↓
Change to pink color
  ↓
Increase stroke width
  ↓
Animate flow faster
  ↓
Reset after 1.5 seconds
```

---

## 📊 Example Graph

```
         ┌─────────┐
         │ Company │
         │ Mission │
         └────┬────┘
              │
     ┌────────┴────────┐
     │                 │
┌────▼────┐      ┌────▼────┐
│ Revenue │◄────►│ Growth  │
│  Goals  │      │Strategy │
└─────────┘      └─────────┘
     │                 │
     │                 │
┌────▼────┐      ┌────▼────┐
│ Market  │      │Customer │
│ Share   │      │Segments │
└─────────┘      └─────────┘
```

**Relationships:**
- Company Mission → Revenue Goals (drives)
- Company Mission → Growth Strategy (guides)
- Revenue Goals ↔ Growth Strategy (relates to)
- Revenue Goals → Market Share (impacts)
- Growth Strategy → Customer Segments (targets)

---

## 🎨 UI Components

### Graph Container
```
┌────────────────────────────────────────┐
│  📊 Concept Map                        │
│  Click nodes to explore                │
├────────────────────────────────────────┤
│                                        │
│        [Interactive Graph Here]        │
│                                        │
│                                        │
│  [Controls]          💡 Instructions   │
└────────────────────────────────────────┘
```

### Toggle Button
Located in chat header:
- 🌐 Network icon
- Toggles graph on/off
- Blue when active
- Gray when inactive

### Info Box
Bottom-right overlay:
- "Interactive Graph" title
- Usage instructions
- Purple gradient background

---

## ⚙️ Technical Details

### Frontend

**Library**: React Flow
- Version: 11.11.4
- Features: Drag, zoom, pan, controls
- Custom styling: Gradients, animations

**Component**: `ConceptGraph.tsx`
- Props: `sessionId`, `onNodeClick`, `lastQuestion`
- State: nodes, edges, loading, error
- Effects: Load graph, highlight based on question

### Backend

**Endpoint**: `GET /sessions/{session_id}/concepts`
- Retrieves all chunks for session
- Sends to Cohere for analysis
- Returns structured graph data

**AI Processing**:
- Model: `command-r-plus-08-2024`
- Temperature: 0.3 (focused extraction)
- Max tokens: 1500
- Output: JSON (concepts + relationships)

**Response Format**:
```json
{
  "concepts": [
    {
      "id": "concept1",
      "label": "Revenue Growth",
      "description": "Company's revenue trajectory"
    }
  ],
  "relationships": [
    {
      "source": "concept1",
      "target": "concept2",
      "type": "drives"
    }
  ],
  "total_chunks_analyzed": 25
}
```

---

## 🎯 Use Cases

### 1. Document Exploration
```
Scenario: Large business report uploaded
Action: View concept graph
Result: See all main topics at a glance
Benefit: Quick understanding of document structure
```

### 2. Knowledge Discovery
```
Scenario: Research paper with complex ideas
Action: Explore node relationships
Result: Understand how concepts connect
Benefit: Deeper comprehension
```

### 3. Quick Questions
```
Scenario: Need info on specific topic
Action: Click relevant node
Result: Instant question about that concept
Benefit: Fast, targeted information retrieval
```

### 4. Teaching Tool
```
Scenario: Learning from educational materials
Action: Visual concept map
Result: See knowledge structure
Benefit: Better retention and understanding
```

---

## 🔥 Advanced Features

### Smart Highlighting
- Detects concept mentions in questions
- Auto-highlights relevant nodes
- Draws attention to related information

### Responsive Animation
- Different animations for different interactions
- Smooth transitions (0.3s ease)
- Non-blocking UI

### Error Handling
- Graceful fallback if extraction fails
- Retry mechanism
- Clear error messages

### Performance
- Analyzes first 10 chunks (balance speed/quality)
- 5000 character limit for AI analysis
- Async loading with loading states

---

## 💡 Tips & Tricks

### Best Practices

1. **Upload First**: Upload documents before viewing graph
2. **Wait for Analysis**: Give AI 5-15 seconds to process
3. **Explore Freely**: Click, drag, zoom to explore
4. **Use for Overview**: Great for understanding document structure
5. **Combine with Chat**: Use graph to guide your questions

### Pro Tips

- **Click then Read**: Click nodes then read AI responses
- **Follow Edges**: Explore relationships between concepts
- **Rearrange**: Drag nodes to create your ideal layout
- **Compare Docs**: Upload multiple docs, see combined concepts
- **Question Ideas**: Nodes give you question ideas

---

## 🐛 Troubleshooting

### Graph Not Loading
```
Problem: "No concepts extracted yet"
Solution: 
  1. Ensure documents are uploaded
  2. Wait a few seconds
  3. Click refresh button
  4. Check backend is running
```

### Nodes Overlapping
```
Problem: Nodes are on top of each other
Solution:
  1. Drag nodes apart
  2. Use zoom controls
  3. Circular layout spreads evenly
```

### Animation Lag
```
Problem: Animations are slow
Solution:
  1. Close other browser tabs
  2. Reduce number of documents
  3. Graph optimized for 5-15 nodes
```

---

## 📈 Future Enhancements

Planned features:
- [ ] Save custom layouts
- [ ] Filter by concept type
- [ ] Search within graph
- [ ] Export as image
- [ ] Timeline view (temporal relationships)
- [ ] Hierarchical layout option
- [ ] Concept clustering
- [ ] Strength indicators on edges
- [ ] Mini-map navigator
- [ ] Compare graphs across docs

---

## 🎓 Learning Resources

### Understanding the Graph

**Nodes** = Key concepts, topics, entities from your documents

**Edges** = Relationships, connections, associations between concepts

**Layout** = Visual arrangement (circular, hierarchical, force-directed)

**Interaction** = Click, drag, zoom, explore

### Graph Theory Basics

- **Node Degree**: Number of connections
- **Path**: Sequence of edges connecting nodes
- **Cluster**: Group of highly connected nodes
- **Hub**: Node with many connections

---

## ✅ Summary

The Interactive Concept Graph:
- ✅ **Auto-extracts** concepts from documents
- ✅ **Visualizes** relationships as an interactive graph
- ✅ **Animates** based on your questions
- ✅ **Enables** one-click exploration
- ✅ **Beautiful** purple gradient design
- ✅ **Fast** and responsive
- ✅ **Intuitive** and easy to use

**Transform your documents into an explorable knowledge graph!** 🌐✨

