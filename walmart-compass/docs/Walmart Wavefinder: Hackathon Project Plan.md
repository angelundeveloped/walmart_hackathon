# **Walmart Wavefinder: Hackathon Project Plan**

Goal: Create a working MVP of an AI-powered in-store navigation web app by the deadline.  
Deadline: Friday, September 26, 2025, 3:00 PM (Hard Stop: 8:00 PM)

### **✅ Phase 1: Setup & Scaffolding (Tonight, Sept 23)**

* **Objective:** Get the project structure and basic UI in place.  
* [x] **Environment Setup:** Initialize a new Next.js project with TypeScript.  
* [x] **Directory Structure:** Create folders for components, simulation, lib, etc.  
* [x] **UI Scaffolding:** Create basic, non-functional UI components for the main page:  
  * [x] MapDisplay.tsx: A component that will hold the map canvas or divs.  
  * [x] ChatWindow.tsx: A component for the LLM chat interface.  
  * [x] ShoppingList.tsx: A component to display items and allow check-offs.  
* [x] **Data Modeling:** Define the data structure for the store layout in a YAML file (store-layout.yaml). Include:  
  * [x] Map dimensions.  
  * [x] Aisle coordinates (as polygons or lines for obstacles).  
  * [x] Item locations with name, ID, and (x, y) coordinates.  
  * [x] Simulated UWB anchor locations (x, y).  
* [x] **Initial Commit:** Push the basic project structure to a Git repository.

### **✅ Phase 2: Simulation & Pathfinding Core (Wednesday, Sept 24)**

* **Objective:** Build the simulation engine and the navigation logic. This is the most technically challenging day.  
* [x] **Map Rendering:**  
  * [x] Create a component that reads store-layout.yaml and renders a visual representation of the store aisles and layout. A simple 2D grid using HTML divs or an HTML Canvas is fine.  
* [x] **Cart Simulation:**  
  * [x] Create a state for the cart ({x, y, heading}).  
  * [x] Render the cart on the map as a blue arrow.  
  * [x] Implement keyboard controls (e.g., arrow keys) to manually move the cart's (x, y) state for testing. This is crucial for demonstrating navigation.  
* [x] **UWB Simulation & Positioning:**  
  * [x] Write a function that calculates the "true" distance from the simulated cart to each UWB anchor defined in your YAML. Add a small random noise factor to make it more realistic.  
  * [x] Implement a positioning algorithm (e.g., trilateration) that takes the simulated distances from at least 3 anchors and *calculates* the cart's position.  
  * [x] **Crucially, the arrow on the map should be updated from the *calculated* position, not the keyboard-controlled one, to prove the concept works.**  
* [x] **Pathfinding:**  
  * [x] Integrate a pathfinding library (like pathfinding-js) or implement a simple A* algorithm. The "grid" for the algorithm will be your store layout, with aisles as impassable obstacles.  
  * [x] Create a function calculateRoute(startCoords, itemCoordsList) that generates a path.  
  * [x] Draw the calculated path on the map.  
  * [x] Nearest-first multi-stop routing and snap-to-walkable stability.

### **✅ Phase 3: AI Integration & UI Polish (Thursday, Sept 25)**

* **Objective:** Connect the chat functionality and make the app interactive.  
* [x] **LLM Chat Integration:**  
  * [x] Set up a client-side function to call the Gemini API.  
  * [x] Develop a system prompt that instructs the model to extract product names from user queries and return them in a structured yaml format (e.g., {"items": ["milk", "bread", "eggs"]}).  
  * [x] Connect the ChatWindow.tsx component to this function. Display the conversation flow.  
* [x] **Connecting Logic:**  
  * [x] When the LLM returns the list of items, look up their coordinates from store-layout.yaml.  
  * [x] Call your calculateRoute function with the cart's current position and the list of item coordinates.  
  * [x] Update the map to display the new, optimized route.  
  * [x] Populate the ShoppingList.tsx component with the requested items.  
* [x] **Shopping List Functionality:**  
  * [x] Implement the check-off feature. When an item is checked, it could be greyed out on the list and its pin removed from the map.  
  * [x] Items should be deletable.
  * [x] Items should be organized by proximity.
* [x] **UI/UX Refinement:**  
  * [x] Ensure the blue arrow smoothly follows the path and rotates to show direction.  
  * [x] Add loading states for the AI response and route calculation.  
  * [x] Make the UI responsive and usable on mobile screen sizes.

### **✅ Phase 5: Enhanced UI Features & Navigation**

* **Objective:** Improve user experience with better visual indicators, labels, and navigation aids.  
* [x] **Enhanced Map Legend:**  
  * [x] Add icons to legend items (🛒 Cart, 📡 UWB, 🚪 Entrance, 🎯 Target, etc.)
  * [x] Improve legend layout with better styling and descriptions
  * [x] Add route path and true position indicators
* [x] **Store Section Labels:**  
  * [x] Add section labels with icons (🥛 Dairy, 🍞 Bakery, 🥬 Produce, etc.)
  * [x] Position labels at center of each section for easy identification
  * [x] Use semi-transparent backgrounds for better readability
* [x] **Shopping List Enhancements:**  
  * [x] Add category icons to each item (🥛 Dairy, 🍞 Bakery, etc.)
  * [x] Visual category indicators for better item organization
* [x] **Chat Interface Improvements:**  
  * [x] Add user (👤) and AI (🤖) icons to messages
  * [x] Enhanced loading state with AI icon
* [x] **Header Enhancements:**  
  * [x] Add BETA badge to indicate development status
  * [x] Add system status indicators (📡 UWB Active, 🤖 AI Ready)

### **✅ Phase 6: Finalization & Documentation (Friday, Sept 26)**

* **Objective:** Polish the demo, complete the documentation, and submit.  
* [x] **Testing & Bug Fixes:**  
  * [x] Run through the entire user flow multiple times. Type in weird queries. Try to break it.  
  * [x] Fix any visual glitches or logical errors.  
* [x] **Finalize Documentation:**  
  * [x] Complete all sections in the Solution-Documentation.md file.  
  * [x] Create the diagrams using a tool like Excalidraw or draw.io and embed them, or use ASCII art for the submission.  
* [x] **Prepare Demo:**  
  * [x] Write a short, clear script for your demo presentation/video.  
  * [x] Record a screen capture of the app working flawlessly.  
* [x] **Submission:**  
  * [x] Write the submission email.  
  * [x] Attach the documentation and a link to the live app (if deployed) or the video.  
  * [x] **SUBMIT BEFORE 3 PM!**