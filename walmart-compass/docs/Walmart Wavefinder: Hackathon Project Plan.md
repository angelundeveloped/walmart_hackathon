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

### **✅ Phase 3: AI Integration & UI Polish (Thursday, Sept 25)**

* **Objective:** Connect the chat functionality and make the app interactive.  
* [] **LLM Chat Integration:**  
  * [] Set up a client-side function to call the Gemini API.  
  * [] Develop a system prompt that instructs the model to extract product names from user queries and return them in a structured JSON format (e.g., {"items": ["milk", "bread", "eggs"]}).  
  * [] Connect the ChatWindow.tsx component to this function. Display the conversation flow.  
* [] **Connecting Logic:**  
  * [] When the LLM returns the list of items, look up their coordinates from store-layout.json.  
  * [] Call your calculateRoute function with the cart's current position and the list of item coordinates.  
  * [] Update the map to display the new, optimized route.  
  * [] Populate the ShoppingList.tsx component with the requested items.  
* [] **Shopping List Functionality:**  
  * [] Implement the check-off feature. When an item is checked, it could be greyed out on the list and its pin removed from the map.  
* [] **UI/UX Refinement:**  
  * [] Ensure the blue arrow smoothly follows the path and rotates to show direction.  
  * [] Add loading states for the AI response and route calculation.  
  * [] Make the UI responsive and usable on mobile screen sizes.

### **✅ Phase 4: Finalization & Documentation (Friday, Sept 26)**

* **Objective:** Polish the demo, complete the documentation, and submit.  
* [] **Testing & Bug Fixes:**  
  * [] Run through the entire user flow multiple times. Type in weird queries. Try to break it.  
  * [] Fix any visual glitches or logical errors.  
* [] **Finalize Documentation:**  
  * [] Complete all sections in the Solution-Documentation.md file.  
  * [] Create the diagrams using a tool like Excalidraw or draw.io and embed them, or use ASCII art for the submission.  
* [] **Prepare Demo:**  
  * [] Write a short, clear script for your demo presentation/video.  
  * [] Record a screen capture of the app working flawlessly.  
* [] **Submission:**  
  * [] Write the submission email.  
  * [] Attach the documentation and a link to the live app (if deployed) or the video.  
  * [] **SUBMIT BEFORE 3 PM!**