# Walmart Wavefinder - Architecture Diagrams

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Walmart Wavefinder                          │
│                   System Architecture                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │    │   (API Routes)  │    │   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐              ┌───▼───┐              ┌────▼────┐
    │ React   │              │ LLM   │              │ Gemini  │
    │ Context │              │ API   │              │ API     │
    │ State   │              │ Route │              │         │
    └─────────┘              └───────┘              └─────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐              ┌───▼───┐              ┌────▼────┐
    │ Map     │              │ YAML  │              │ UWB     │
    │ Display │              │ Store │              │ Sim     │
    │         │              │ Data  │              │         │
    └─────────┘              └───────┘              └─────────┘
```

## Component Interaction Flow

```
User Input
    │
    ▼
┌─────────────┐
│ ChatWindow  │
└─────────────┘
    │
    ▼
┌─────────────┐    ┌─────────────┐
│ Gemini API  │◄───┤ API Route   │
└─────────────┘    └─────────────┘
    │
    ▼
┌─────────────┐
│ YAML Parse  │
└─────────────┘
    │
    ▼
┌─────────────┐    ┌─────────────┐
│ Item Map    │◄───┤ Store Data  │
└─────────────┘    └─────────────┘
    │
    ▼
┌─────────────┐
│ Selection   │
│ Context     │
└─────────────┘
    │
    ▼
┌─────────────┐    ┌─────────────┐
│ MapDisplay  │◄───┤ Pathfinding │
└─────────────┘    └─────────────┘
    │
    ▼
┌─────────────┐
│ Route       │
│ Display     │
└─────────────┘
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Data Flow                                │
└─────────────────────────────────────────────────────────────────┘

User Request ──► Chat Interface ──► LLM Processing ──► Item Extraction
     │                                                                    │
     │                                                                    ▼
     │                                                              Coordinate Mapping
     │                                                                    │
     │                                                                    ▼
     │                                                              Target Setting
     │                                                                    │
     │                                                                    ▼
     │                                                              Path Calculation
     │                                                                    │
     │                                                                    ▼
     │                                                              Route Display
     │                                                                    │
     │                                                                    ▼
     │                                                              User Navigation
     │                                                                    │
     │                                                                    ▼
     │                                                              Item Completion
     │                                                                    │
     └────────────────────────────────────────────────────────────────────┘
```

## UWB Positioning System

```
┌─────────────────────────────────────────────────────────────────┐
│                    UWB Positioning Flow                        │
└─────────────────────────────────────────────────────────────────┘

True Cart Position
        │
        ▼
┌─────────────┐
│ Distance    │
│ Calculation │
└─────────────┘
        │
        ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Anchor 1    │    │ Anchor 2    │    │ Anchor 3    │
│ Distance    │    │ Distance    │    │ Distance    │
└─────────────┘    └─────────────┘    └─────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │ Noise       │
                    │ Injection   │
                    └─────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │ Trilateration│
                    │ Algorithm   │
                    └─────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │ Estimated   │
                    │ Position    │
                    └─────────────┘
```

## Pathfinding Algorithm Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    A* Pathfinding Flow                         │
└─────────────────────────────────────────────────────────────────┘

Start Point ──► Grid Setup ──► Obstacle Detection ──► Open Set Init
     │                                                                    │
     │                                                                    ▼
     │                                                              Heuristic Calculation
     │                                                                    │
     │                                                                    ▼
     │                                                              Node Evaluation
     │                                                                    │
     │                                                                    ▼
     │                                                              Path Expansion
     │                                                                    │
     │                                                                    ▼
     │                                                              Goal Check
     │                                                                    │
     │                                                                    ▼
     │                                                              Path Reconstruction
     │                                                                    │
     └────────────────────────────────────────────────────────────────────┘
```

## State Management Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    State Management                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Selection   │    │ MapDisplay  │    │ ChatWindow  │
│ Provider    │    │ Component   │    │ Component   │
└─────────────┘    └─────────────┘    └─────────────┘
        │                   │                   │
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ targets     │    │ cartPosition│    │ messages    │
│ pendingItems│    │ pathPoints  │    │ isProcessing│
│ cartPosition│    │ storeLayout │    │ inputText   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Technology Stack                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Frontend    │    │ Backend     │    │ External    │
│             │    │             │    │ Services    │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ Next.js 15  │    │ API Routes  │    │ Gemini API  │
│ TypeScript  │    │ YAML Data   │    │ UWB Sim     │
│ Tailwind    │    │ Pathfinding │    │ Store Data  │
│ React       │    │ Trilateration│   │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Performance Optimization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Performance Optimizations                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Throttling  │    │ Memoization │    │ Lazy Loading│
│ (120ms)     │    │ (Context)   │    │ (Components)│
└─────────────┘    └─────────────┘    └─────────────┘
        │                   │                   │
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Path        │    │ State       │    │ Code        │
│ Recalculation│   │ Updates     │    │ Splitting   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Security & Error Handling

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security & Error Handling                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Input       │    │ API         │    │ Fallback    │
│ Validation  │    │ Error       │    │ Handling    │
│             │    │ Handling    │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
        │                   │                   │
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Sanitized   │    │ User        │    │ Graceful    │
│ User Input  │    │ Friendly    │    │ Degradation │
│             │    │ Messages    │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

These diagrams provide a visual representation of the Walmart Wavefinder system architecture, data flow, and component interactions.
