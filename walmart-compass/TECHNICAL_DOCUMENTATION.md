# Walmart Wavefinder - Technical Documentation

## System Architecture Overview

Walmart Wavefinder is a full-stack web application built with Next.js that simulates an intelligent shopping cart navigation system. The application demonstrates the integration of UWB positioning, AI-powered natural language processing, and real-time pathfinding algorithms.

## Core Technologies

### Frontend Stack
- **Next.js 15**: React framework with App Router for server-side rendering and API routes
- **TypeScript**: Provides type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **React Context API**: Global state management for cart position and target items

### Backend & APIs
- **Next.js API Routes**: Serverless functions for LLM integration
- **Google Gemini API**: Large Language Model for natural language processing
- **YAML Configuration**: Store layout and item database

### Algorithms & Simulation
- **A* Pathfinding**: Optimal route calculation with obstacle avoidance
- **Trilateration**: UWB positioning simulation using distance measurements
- **Nearest-First Greedy**: Multi-stop route optimization

## Detailed Component Architecture

### 1. MapDisplay Component

**Purpose**: Renders the interactive store map with cart positioning and route visualization.

**Key Features**:
- Real-time cart position tracking (true vs estimated)
- UWB anchor visualization
- Dynamic route rendering with SVG
- Section labels with category icons
- Responsive scaling for different screen sizes

**Technical Implementation**:
```typescript
// UWB Simulation and Positioning
const { measured, estimated } = simulateAndEstimate(
  storeLayout,
  { x: trueCart.x, y: trueCart.y },
  { noiseStdDev: 0.6, maxAnchors: 6 }
);

// Pathfinding with A* Algorithm
const path = findPath(storeLayout, startPoint, endPoint);
```

**State Management**:
- `trueCart`: Keyboard-controlled ground truth position
- `estimatedCart`: UWB-calculated position with noise simulation
- `pathPoints`: Calculated route coordinates
- `storeLayout`: Store configuration data

### 2. ChatWindow Component

**Purpose**: Provides natural language interface for item requests.

**Key Features**:
- Real-time message display with user/AI distinction
- Loading states during AI processing
- Error handling for failed requests
- Integration with item mapping system

**Technical Implementation**:
```typescript
// LLM Integration
const reply = await askGemini(userMessage);
const extracted = parseItemsFromYaml(reply);
const coords = await mapItemsToCoordinates(extracted);
```

**API Integration**:
- POST requests to `/api/chat` endpoint
- YAML parsing for structured item extraction
- Coordinate mapping from store layout data

### 3. ShoppingList Component

**Purpose**: Manages the user's shopping list with proximity-based sorting.

**Key Features**:
- Dynamic item addition from chat interface
- Proximity-based sorting (closest items first)
- Check-off functionality with visual feedback
- Manual item removal
- Progress tracking

**Technical Implementation**:
```typescript
// Proximity Sorting Algorithm
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => {
    const distA = Math.sqrt(
      Math.pow(a.location.x - cartPosition.x, 2) + 
      Math.pow(a.location.y - cartPosition.y, 2)
    );
    const distB = Math.sqrt(
      Math.pow(b.location.x - cartPosition.x, 2) + 
      Math.pow(b.location.y - cartPosition.y, 2)
    );
    return distA - distB;
  });
}, [items, cartPosition]);
```

### 4. SelectionProvider (Global State)

**Purpose**: Manages shared state between components.

**State Structure**:
```typescript
interface SelectionContextValue {
  targets: TargetPoint[];           // Active navigation targets
  pendingItems: TargetPoint[];      // Items from chat awaiting processing
  cartPosition: { x: number; y: number } | null;  // Current cart location
  // ... action methods
}
```

## Data Flow Architecture

### 1. User Request Flow
```
User Input → ChatWindow → Gemini API → YAML Parsing → Item Mapping → Target Setting → Route Calculation → Map Display
```

### 2. Cart Movement Flow
```
Keyboard Input → True Cart Update → UWB Simulation → Estimated Position → Path Recalculation → Route Update
```

### 3. Item Management Flow
```
Chat Items → Pending Items → Shopping List → Target Sync → Route Update → Visual Feedback
```

## Algorithm Details

### A* Pathfinding Implementation

**Purpose**: Calculate optimal routes avoiding obstacles (aisles).

**Key Features**:
- Grid-based pathfinding with obstacle detection
- Heuristic function using Manhattan distance
- Tie-breaker for consistent path selection
- Snap-to-walkable for grid alignment

**Implementation**:
```typescript
function findPath(layout: StoreLayout, start: Point, goal: Point): Point[] {
  const openSet = new PriorityQueue<PathNode>();
  const closedSet = new Set<string>();
  
  // A* algorithm with Manhattan distance heuristic
  const heuristic = (a: Point, b: Point) => 
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  
  // ... pathfinding logic
}
```

### UWB Trilateration Simulation

**Purpose**: Simulate realistic UWB positioning with noise.

**Key Features**:
- Distance calculation with Gaussian noise
- Trilateration using least squares method
- Configurable noise parameters
- Fallback to true position on failure

**Implementation**:
```typescript
function simulateAndEstimate(
  layout: StoreLayout,
  truePosition: Point,
  options: { noiseStdDev: number; maxAnchors: number }
): { measured: AnchorDistance[]; estimated: Point | null } {
  // Simulate noisy distance measurements
  const measured = layout.uwb_anchors.map(anchor => ({
    anchor,
    distance: calculateDistance(truePosition, anchor.coordinates) + 
              gaussianNoise(options.noiseStdDev)
  }));
  
  // Trilateration calculation
  const estimated = performTrilateration(measured);
  
  return { measured, estimated };
}
```

## Store Layout Data Structure

### YAML Configuration Format
```yaml
map:
  width: 100
  height: 80
  scale: 1.0

sections:
  - name: "Dairy"
    id: "dairy"
    color: "#87CEEB"
    aisles:
      - id: "dairy-1"
        coordinates: [[10, 5], [15, 5], [15, 8], [10, 8]]

items:
  - id: "milk-organic"
    name: "Organic Whole Milk"
    category: "Dairy"
    coordinates: [12, 6]
    price: 4.99

uwb_anchors:
  - id: "anchor-1"
    coordinates: [5, 5]
```

## Performance Optimizations

### 1. Pathfinding Optimization
- **Throttling**: Route recalculation limited to 120ms intervals
- **Memoization**: Target key memoization prevents unnecessary recalculations
- **Path Comparison**: Deep equality checks prevent redundant state updates

### 2. Rendering Optimization
- **ResizeObserver**: Dynamic scaling based on container size
- **SVG Optimization**: Vector graphics for smooth scaling
- **Conditional Rendering**: Components only render when data is available

### 3. State Management Optimization
- **Context Optimization**: Memoized context values prevent unnecessary re-renders
- **Atomic Updates**: Single state updates for related data changes
- **Ref-based Stability**: useRef for preventing render loops

## Error Handling & Edge Cases

### 1. API Error Handling
```typescript
try {
  const reply = await askGemini(userMessage);
  // Process response
} catch (error) {
  console.error('Chat error:', error);
  // Show user-friendly error message
}
```

### 2. Data Validation
- **Store Layout**: Fallback layout for missing data
- **Item Mapping**: Fuzzy matching for item name variations
- **Coordinate Validation**: Bounds checking for cart movement

### 3. Network Resilience
- **Timeout Handling**: API request timeouts
- **Retry Logic**: Automatic retry for failed requests
- **Offline Fallback**: Graceful degradation without network

## Security Considerations

### 1. API Security
- **Environment Variables**: Sensitive keys stored securely
- **Input Validation**: Sanitized user inputs
- **Rate Limiting**: Protection against API abuse

### 2. Data Privacy
- **No Data Persistence**: No user data stored permanently
- **Client-side Processing**: Sensitive operations on client side
- **Secure Communication**: HTTPS for all API calls

## Testing Strategy

### 1. Unit Testing
- **Component Testing**: Individual component functionality
- **Algorithm Testing**: Pathfinding and positioning accuracy
- **Utility Testing**: Helper function validation

### 2. Integration Testing
- **API Integration**: LLM communication testing
- **State Management**: Context provider testing
- **Data Flow**: End-to-end user journey testing

### 3. Performance Testing
- **Load Testing**: Multiple concurrent users
- **Memory Testing**: Memory leak detection
- **Responsiveness**: UI performance under load

## Deployment Architecture

### 1. Development Environment
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
```

### 2. Environment Configuration
```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemma-3n-e2b-it
NODE_ENV=production
```

### 3. Build Optimization
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and CSS optimization

## Future Scalability Considerations

### 1. Horizontal Scaling
- **Stateless Design**: No server-side state dependencies
- **CDN Integration**: Static asset distribution
- **Load Balancing**: Multiple server instances

### 2. Database Integration
- **Real-time Inventory**: Live stock level updates
- **User Preferences**: Personalized shopping experiences
- **Analytics**: Shopping pattern analysis

### 3. Hardware Integration
- **UWB Hardware**: Real anchor integration
- **IoT Sensors**: Environmental data collection
- **Mobile Apps**: Native mobile applications

## Monitoring & Analytics

### 1. Performance Monitoring
- **Core Web Vitals**: User experience metrics
- **API Response Times**: Backend performance tracking
- **Error Rates**: System reliability monitoring

### 2. User Analytics
- **Navigation Patterns**: Route optimization insights
- **Feature Usage**: Component interaction tracking
- **Conversion Metrics**: Shopping completion rates

---

This technical documentation provides a comprehensive overview of the Walmart Wavefinder system architecture, implementation details, and considerations for future development.
