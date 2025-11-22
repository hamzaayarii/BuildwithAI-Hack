# Confidence & Source Coverage Metrics 📊

## Overview

Our system provides two key metrics to help you understand the reliability and grounding of AI-generated answers:

1. **Confidence Score** - How well the retrieved chunks match your question
2. **Source Coverage** - How much of the answer comes from documents vs. inference

---

## 🎯 Confidence Score (Match Score)

### What It Measures
The **Confidence Score** shows how relevant the retrieved document chunks are to your question.

### How It's Calculated
- Based on vector similarity (cosine distance) between your question and retrieved chunks
- Uses Weaviate's **certainty** metric (0-1 scale)
- Converted to percentage (0-100%)

### Interpretation

| Score | Meaning | What It Tells You |
|-------|---------|-------------------|
| **90-100%** | Excellent Match | Chunks are highly relevant to your question |
| **75-89%** | Good Match | Chunks are relevant and useful |
| **60-74%** | Fair Match | Chunks contain some relevant information |
| **Below 60%** | Weak Match | Chunks may not be directly related |

### Example
```
Question: "What is the main topic of the document?"
Retrieved Chunks: About company policy, revenue, mission
Confidence Score: 87% ✅
→ The chunks are highly relevant to the question
```

---

## 📈 Source Coverage (Grounding Score)

### What It Measures
The **Source Coverage** indicates what percentage of the AI's answer is directly grounded in the document versus being inferred or conversational.

### How It's Calculated

**Factors that INCREASE coverage:**
- ✅ Citation markers `[Chunk X]` (+20% each)
- ✅ Document phrases ("according to", "the document states", "based on") (+10% each)
- ✅ Direct quotes or paraphrases from chunks (+5% per match)

**Factors that DECREASE coverage:**
- ❌ Inference phrases ("I think", "probably", "typically") (-10% each)
- ❌ Conversational responses without citations

### Interpretation

| Coverage | Meaning | When You See This |
|----------|---------|-------------------|
| **80-100%** | Highly Grounded | Answer mostly from document with citations |
| **50-79%** | Moderately Grounded | Answer uses document but with some interpretation |
| **20-49%** | Lightly Grounded | Answer mentions document but adds inference |
| **0-19%** | Not Grounded | Conversational response or no document basis |

### Examples

#### High Coverage (90%)
```
User: "What was the revenue in 2023?"
AI: "According to the document [Chunk 2], the revenue 
     in 2023 was $5.2 million."

Confidence: 92% Match
Coverage: 90% Grounded ✅
→ Direct answer from document with citation
```

#### Medium Coverage (55%)
```
User: "What does this tell us about growth?"
AI: "The document mentions revenue increased [Chunk 1].
     This typically indicates positive growth trends."

Confidence: 85% Match
Coverage: 55% Grounded ⚠️
→ Partially from document, partially inference
```

#### Low Coverage (10%)
```
User: "Hi, how are you?"
AI: "Hello! I'm doing great. I'm here to help you 
     with your documents. What would you like to know?"

Confidence: N/A
Coverage: 0% Grounded ℹ️
→ Conversational response, not document-based
```

---

## 🎨 Visual Indicators

### In the UI

```
┌────────────────────────────────────────┐
│ 🤖 AI Response                         │
│                                        │
│ Your answer here...                    │
│                                        │
│ [87% Match] [90% Grounded]            │
│   ↑             ↑                      │
│   Confidence    Source Coverage        │
└────────────────────────────────────────┘
```

**Color Coding:**
- 🔵 **Blue Badge** = Confidence Score (match quality)
- 🟣 **Purple Badge** = Source Coverage (grounding)

### Per-Source Confidence

Each source chunk also shows its individual similarity:

```
📄 Chunk 1 [92% similar]
   "Text from the document..."
   
📄 Chunk 2 [85% similar]
   "More relevant text..."
```

---

## 🔍 Use Cases

### When to Trust High Scores

**Both High (85%+ Match, 80%+ Grounded):**
```
✅ Use for: Factual questions, data extraction, quotes
✅ Example: "What is the deadline?" → "March 15th [Chunk 3]"
✅ Reliable: High confidence, direct from document
```

### When to Verify

**High Match, Low Coverage (85%+ Match, <50% Grounded):**
```
⚠️ Situation: AI found relevant chunks but added interpretation
⚠️ Example: "What does this imply about...?"
⚠️ Action: Check sources, verify interpretations
```

**Low Match, High Coverage (< 70% Match, 70%+ Grounded):**
```
⚠️ Situation: AI answered but chunks may not be ideal
⚠️ Example: Related but not exact answer
⚠️ Action: Check if you got the answer you wanted
```

### When It's Conversational

**Both Low (<50% Match, <20% Grounded):**
```
ℹ️ Situation: Casual conversation, not document-based
ℹ️ Example: "Hi!", "Thanks!", "Can you help?"
ℹ️ Expected: This is normal for chat interactions
```

---

## 🎯 Best Practices

### For Users

1. **Check Both Metrics**
   - High confidence + High coverage = Most reliable
   - High confidence + Low coverage = Verify interpretation
   - Low confidence = May not be the right answer

2. **Expand Sources**
   - Click on source chunks to see full context
   - Verify citations match your understanding

3. **Ask Follow-ups**
   - If coverage is low, ask more specific questions
   - Request citations: "Which part of the document says this?"

### For Interpretation

**Factual Questions:**
- Aim for: 80%+ Match, 80%+ Grounded
- Example: "What is the price?" "When is the deadline?"

**Analytical Questions:**
- Expect: 70%+ Match, 50-70% Grounded
- Example: "What does this suggest?" "How does X relate to Y?"

**Conversational:**
- Normal: 0% Match, 0% Grounded
- Example: "Hi!" "Thanks!" "Can you help?"

---

## 📊 Technical Details

### Confidence Score Calculation
```python
# Average certainty of all retrieved chunks
confidence = sum(chunk.certainty for chunk in chunks) / len(chunks)
confidence_percentage = confidence * 100
```

### Coverage Score Algorithm
```python
coverage = 0

# Citations (high weight)
citations = count("[Chunk X]" in answer)
coverage += min(60, citations * 20)

# Document phrases (medium weight)
doc_phrases = count("according to", "based on", etc.)
coverage += min(30, doc_phrases * 10)

# Content overlap (bonus)
overlap = count(chunk_text in answer)
coverage += min(20, overlap * 5)

# Inference phrases (penalty)
inference = count("I think", "probably", etc.)
coverage -= inference * 10

# Clamp to 0-100
coverage = max(0, min(100, coverage))
```

---

## 🚀 Future Enhancements

Planned improvements:
- [ ] Historical tracking of accuracy
- [ ] Per-document confidence trends
- [ ] Confidence thresholds (warn if < 70%)
- [ ] Coverage breakdown by paragraph
- [ ] Export metrics with chat history

---

## 💡 Examples in Action

### Example 1: Perfect Answer
```
Q: "What is the company's mission?"
A: "The company's mission is to innovate... [Chunk 1]"

📊 87% Match | 95% Grounded
✅ High confidence, well-cited answer
```

### Example 2: Interpreted Answer
```
Q: "What does this tell us about market trends?"
A: "The document shows growth [Chunk 2]. This typically 
    indicates positive market conditions."

📊 82% Match | 60% Grounded
⚠️ Good match but includes interpretation
```

### Example 3: Casual Chat
```
Q: "Thanks for the help!"
A: "You're welcome! Happy to help anytime!"

📊 N/A | 0% Grounded
ℹ️ Conversational response, as expected
```

---

## 📝 Summary

- **Confidence Score**: How well chunks match your question (0-100%)
- **Source Coverage**: How much answer is from document (0-100%)
- **Both High**: Most reliable, use with confidence
- **Mixed**: Verify sources and interpretations
- **Both Low**: Casual chat or unclear question

Use these metrics to understand and trust the AI's responses! 🎉

