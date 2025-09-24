
# **A Strategic Blueprint for In-Store Navigation: Feasible Solutions for the Walmart Hackathon**

## **Introduction: A Strategic Framework for Next-Generation In-Store Navigation**

### **The Walmart Challenge: Beyond the Blue Dot**

The challenge of navigating a large retail space like a Walmart store extends far beyond the simple desire for an indoor "blue dot" on a map. A truly effective solution must address a complex interplay of factors: the inherent inaccuracy of GPS-denied environments, the high cost and maintenance of specialized infrastructure like BLE beacons 1, the friction of user adoption for new applications, and the dynamic nature of a store where layouts and product placements can change. The core architectural challenge, therefore, is not to find a single "magic bullet" technology, but to intelligently synthesize a suite of modern, accessible technologies into a cohesive system that is accurate, scalable, and intuitive. A successful solution for the CodEcosystem hackathon must overcome the limitations of any single approach by creating a synergistic whole, leveraging the tools already in every customer's pocket and potentially embedding low-cost intelligence into the store environment itself.

### **The Three Pillars of Innovation**

This report presents a strategic analysis of three distinct technological vectors, each forming the basis for a feasible and innovative solution concept. These pillars represent a spectrum of approaches, balancing implementation complexity, user experience, and underlying accuracy.

1. **Pillar 1: Phone-as-a-Sensor (Inertial Navigation):** This approach leverages the powerful Inertial Measurement Unit (IMU) sensors—accelerometers and gyroscopes—that are standard in modern smartphones. By treating the phone itself as the primary source of motion data, it is possible to create a navigation system with minimal physical infrastructure.  
2. **Pillar 2: Vision-as-a-Guide (Augmented Reality):** This vector utilizes the phone's camera to bridge the gap between the digital and physical worlds. By overlaying navigational cues and contextual information directly onto the user's view of the store, it offers a highly intuitive and engaging experience that transforms navigation from an abstract map-reading exercise into a direct, visual interaction.  
3. **Pillar 3: Environment-as-a-System (IoT Integration):** This pillar shifts the primary source of high-fidelity location data from the user's phone to the store environment itself. Specifically, it proposes embedding intelligence into shopping carts, turning them into precise, mobile sensor platforms that provide ground-truth location data with minimal effort from the customer.

### **Hackathon Constraints and Success Metrics**

All proposed solutions are designed within the specific constraints of the hackathon: a rapid prototyping timeline culminating on a Friday afternoon, and a prescribed technology stack including Python, Next.js, FastAPI, Docker, Kubernetes, Computer Vision models, AI Agents, and the ESP32 microcontroller. The success and viability of each concept will be evaluated against a set of critical metrics:

* **Feasibility:** Can a meaningful and demonstrable Minimum Viable Product (MVP) be built within the hackathon's timeframe using the specified technologies?  
* **Accuracy:** How precisely and reliably can the system determine and track the user's position within the store?  
* **User Experience (UX):** How intuitive, frictionless, and engaging is the solution for the end-user? Does it reduce or add to the cognitive load of shopping?  
* **Innovation:** Does the solution present a novel application of technology or a creative approach to solving the core problem?  
* **Scalability:** Beyond the prototype, what are the architectural and financial implications of deploying this solution across the entire Walmart ecosystem?

## **Foundational Technologies and Architectural Patterns**

### **The Indoor Positioning Triad: A Synergistic Approach**

Effective indoor navigation in a GPS-denied environment requires a multi-layered approach. Relying on a single technology often leads to a system that is either inaccurate, expensive, or cumbersome. The most robust and feasible architecture for this hackathon combines three core concepts: Dead Reckoning using phone sensors, QR codes for absolute position anchoring, and a backend pathfinding engine.

#### **Dead Reckoning (DR) with IMU**

Dead reckoning is the process of calculating a current position by using a previously determined position and advancing it based on known or estimated speed, direction, and elapsed time.2 In the context of pedestrian navigation, this is often called path integration.2 Modern smartphones are equipped with IMU sensors that make this possible. The

Accelerometer interface in the Web Sensor APIs provides data on the acceleration applied to the device along its x, y, and z axes, while the Gyroscope interface provides the angular velocity around those same axes.4

By capturing this data in a web application, a process known as Pedestrian Dead Reckoning (PDR) can be implemented. The general approach involves using acceleration data to detect steps and estimate step length, while gyroscope data is used to determine changes in heading or direction.6 This allows for the continuous estimation of a user's path from a known starting point, creating the fluid, real-time movement of a marker on a minimap. The primary advantage of DR is that it is entirely self-contained; it requires no external signals or infrastructure and can operate autonomously.7

#### **The Inevitable Problem of Drift**

The fundamental weakness of any dead reckoning system is its susceptibility to cumulative error, or "drift".2 Tiny, unavoidable inaccuracies in the IMU sensor readings, when integrated over time, compound to create a significant divergence between the calculated position and the user's true position. A slight error in heading estimation can cause the calculated path to veer dramatically from the actual path over the course of a few dozen meters. This makes a pure DR system unreliable for anything more than very short journeys, as the user's perceived location on the map will quickly become untrustworthy.2

#### **QR Codes as Absolute Anchors**

The solution to drift lies in periodically correcting the DR algorithm with a source of absolute, ground-truth position data. For a retail environment, Quick Response (QR) codes provide an exceptionally effective, low-cost, and easily deployable method for creating these corrective "control points".7 A QR code can encode a rich amount of information, including a unique ID, precise geodetic coordinates within the store, floor number, and even the type of location (e.g., aisle intersection, department entrance).8

By placing QR codes at strategic locations—such as at the end of each aisle, at major intersections, and near store landmarks—a network of absolute positional anchors is created.10 When a user scans a QR code with their phone's camera, the application can decode its information and instantly reset its own calculated position to the precise coordinates encoded in the QR code. This action effectively nullifies all accumulated drift from the DR algorithm, re-synchronizing the digital map with the user's physical location.7

The combination of these technologies creates a system that is far more powerful than the sum of its parts. Dead reckoning provides the smooth, continuous, step-by-step navigation *between* key points, allowing the user to keep their phone in their pocket or cart and receive turn-by-turn updates. The QR codes provide the high-accuracy "fix" *at* those key points. This architecture establishes a symbiotic relationship: the system doesn't require the user to constantly scan codes, which would be tedious. Instead, it can use DR for the majority of the journey and prompt the user to scan a nearby code only when the algorithm's internal confidence score drops below a certain threshold, or upon reaching a critical decision point like an aisle intersection. This creates a "best of both worlds" system that balances high accuracy with a low-friction user experience.

### **WebAR for the Retail Floor: Choosing the Right Tools for Rapid Prototyping**

Augmented Reality (AR) offers a compelling way to present navigational information, but its implementation must be carefully considered for a hackathon. The key is to choose a technology stack that minimizes user friction and maximizes development velocity.

#### **The Power of WebAR**

Web-based Augmented Reality (WebAR) is the ideal choice for this context because it eliminates the single biggest barrier to adoption: requiring a user to download a dedicated mobile application. WebAR experiences run directly in a standard mobile browser, accessible via a URL or by scanning a QR code.11 This pure web solution, built on JavaScript, works on any phone that supports WebGL and WebRTC, making it instantly accessible to the vast majority of Walmart customers.12 For a hackathon, this means the team can focus on building the experience itself, without worrying about the complexities of native app development, app store submission, or convincing judges to install software on their devices.

#### **Framework Analysis**

The WebAR ecosystem is built around a few key JavaScript libraries, and selecting the right combination is a critical strategic decision.

* **Three.js:** This is the most popular and powerful low-level library for creating and displaying 3D graphics in the browser using WebGL.13 It provides complete control over every aspect of the 3D scene, from geometry and materials to lighting and rendering. However, this power comes with complexity; creating even a simple scene requires a significant amount of boilerplate code.14 It is the foundation upon which most other higher-level frameworks are built.  
* **A-Frame:** A-Frame is a web framework built on top of Three.js, designed for rapid development of VR and AR experiences.13 Its primary innovation is an intuitive Entity-Component-System (ECS) architecture that is exposed through simple, declarative HTML tags. Instead of writing complex JavaScript to create a cube, a developer can simply write  
  \<a-box color="red"\>\</a-box\> in their HTML file.14 This dramatically accelerates the process of building and iterating on 3D scenes.  
* **AR.js:** This is a lightweight, high-performance library that provides the core AR functionality.12 It integrates with either Three.js or A-Frame to handle the computer vision tasks, such as marker tracking, image tracking, and location-based AR.11 It is remarkably efficient, capable of delivering AR experiences at a consistent 60 frames per second even on mobile devices, largely due to its optimized marker-based tracking system.15

#### **Recommended Hackathon Stack: AR.js on A-Frame**

For the purposes of a time-constrained hackathon, the recommended stack is **AR.js integrated with A-Frame**. This combination offers the fastest and most direct path from concept to a working prototype. The declarative nature of A-Frame allows the team to rapidly construct the AR scene and UI elements, while AR.js provides the robust tracking engine.15

This choice represents a strategic trade-off. Some developers report that a pure Three.js and AR.js implementation can offer slightly more stable tracking and performance.16 However, the development velocity gained by using A-Frame is a far more significant factor in a hackathon setting.17 The time saved by using A-Frame's simple HTML syntax to build the scene can be reallocated to more critical tasks, such as refining the user experience or integrating backend services. Furthermore, since A-Frame is built on Three.js, it is always possible to "drop down" to the lower-level Three.js API for specific components that require custom optimization, offering a flexible development path.

### **The "Smart Cart" Paradigm: ESP32 Architecture**

An alternative to relying solely on the user's phone is to instrument the shopping cart itself, transforming it into a high-precision data source. The ESP32 microcontroller is an ideal candidate for this task.

#### **ESP32 as a Versatile IoT Hub**

The ESP32 is a low-cost, low-power system-on-a-chip that features integrated Wi-Fi and dual-mode Bluetooth.18 This makes it a perfect, self-contained "brain" for an intelligent device. Its processing power is more than sufficient for reading sensor data and performing the necessary calculations for dead reckoning, and its built-in networking capabilities allow it to communicate its position to the user's phone.

#### **Communication Patterns**

There are two primary architectural patterns for communication between an ESP32-powered cart and a user's phone:

1. **Pattern A (ESP32 as Web Server):** In this model, the ESP32 uses its Wi-Fi module to create its own local Wi-Fi access point and hosts a simple web server.19 The user connects their phone's Wi-Fi directly to the network broadcast by their cart (e.g., "Walmart-Cart-1138"). The web application on their phone then makes requests to a local IP address served by the ESP32 to get real-time coordinate data.21  
2. **Pattern B (ESP32 as Client):** In this model, the ESP32 connects as a client to the main store Wi-Fi network. It then sends its sensor data to a central, cloud-hosted backend server (e.g., via UDP, HTTP, or MQTT). The user's phone, also connected to the store Wi-Fi, communicates with this central backend to receive the cart's location.

For a hackathon, **Pattern A is overwhelmingly the superior choice**. It creates a completely self-contained, localized system consisting of just the cart and the phone. This approach entirely de-risks the project from any external network dependencies. Hackathon Wi-Fi is notoriously unreliable, and gaining access to a corporate network like Walmart's would be impossible. By having the ESP32 host its own network, the team can develop and demonstrate a fully functional prototype without any reliance on event infrastructure.19 This simplifies the data flow, reduces latency, and dramatically increases the robustness of the demo.

#### **Sensor Integration**

Unlike PDR from a phone, which must infer movement from noisy accelerometer data, a smart cart can measure its movement directly and precisely. This is achieved by mounting **rotary wheel encoders** on the cart's wheels.22 These sensors detect the rotation of the wheels, providing a clean, unambiguous measure of both distance traveled and the angle of turns. This data is far more reliable than what can be gathered from a phone that may be in a pocket, in a purse, or being held at an inconsistent angle.

### **AI-Powered Backend Services: The FastAPI Brain**

Regardless of the frontend or hardware approach, a robust backend is required to serve map data, calculate optimal paths, and handle more complex queries. FastAPI, a modern, high-performance Python web framework, is an excellent choice for this role.

#### **Pathfinding with Python**

The layout of a Walmart store can be modeled as a 2D grid or a graph, where aisles are edges and intersections are nodes. The backend's primary role is to run a pathfinding algorithm on this graph. Python offers several powerful and easy-to-use libraries for this purpose. The python-pathfinding library, for example, provides implementations of classic algorithms like A\* and Dijkstra, which are highly efficient at finding the shortest path between two points on a weighted grid.24 When a user requests directions to a product, the frontend sends their current coordinates (the start node) and the product's coordinates (the end node) to a FastAPI endpoint. The backend then uses a library like

python-pathfinding to compute the optimal path and returns it as a series of waypoints for the frontend to display. Other libraries like tcod.path also offer fast, configurable pathfinding on NumPy arrays, suitable for this task.25

#### **AI Agent Integration**

To enhance the user experience, a simple AI agent can be integrated into the backend. This agent, powered by a large language model (LLM) accessed via an API, can handle natural language queries from the user. A FastAPI endpoint can receive a text query like, "Where can I find gluten-free pasta?" The AI agent would process this query, understand the user's intent, look up the location of "gluten-free pasta" in a product database, and translate it into a specific destination coordinate (e.g., Aisle 12, Section B). This coordinate is then fed into the pathfinding algorithm, providing a seamless and intelligent search-to-navigation workflow.

## **Solution Concept 1: "Pathfinder" — IMU & QR-Anchored Dead Reckoning**

### **Concept Overview & User Journey**

"Pathfinder" is a pure web application designed for maximum accessibility and minimal infrastructure overhead. It provides a reliable in-store navigation experience using only the customer's smartphone and a series of strategically placed QR codes.

The user journey begins at the store entrance. The user scans a prominent QR code, which launches the web application in their browser and automatically initializes their position on a 2D minimap of the store. They can then search for items on their shopping list. When a destination is selected, the application calculates and displays the optimal path. As the customer walks through the store, their position on the minimap updates in real-time, guided by the phone's internal IMU sensors. The application provides simple, turn-by-turn text directions (e.g., "In 20 feet, turn left into Aisle 9"). To combat sensor drift and ensure continued accuracy, the user can optionally scan additional QR codes located on aisle signs or at major intersections, which instantly re-calibrates their position on the map.

### **System Architecture & Data Flow**

The architecture is a classic client-server model designed for simplicity and rapid development.

1. **Frontend (Next.js):** This is the user-facing component that runs in the mobile browser. It is responsible for rendering the 2D store map (e.g., using a library like Leaflet.js or a simple HTML5 Canvas). It utilizes the browser's Web Sensor APIs to access the Accelerometer and Gyroscope data.4 A JavaScript-based dead reckoning algorithm, potentially using a library like  
   gyronorm.js to normalize sensor data across devices 26, processes this raw sensor input to calculate the user's movement and update their position on the map. The frontend also includes a QR code scanner (using a library like  
   html5-qrcode) to handle position anchoring.  
2. **Backend (FastAPI):** The Python backend serves several key functions. It hosts the static assets for the Next.js application. It exposes a REST API endpoint that provides the store map data (layout, product locations, QR code coordinates). Its most critical function is the pathfinding service. It exposes an endpoint (e.g., /api/path) that accepts start and end coordinates and uses the python-pathfinding library to compute the A\* path, returning an ordered list of waypoint coordinates to the client.24

**Data Flow:**

1. The user scans the initial QR code at the store entrance. The code contains the URL for the web app and a location ID (e.g., ?location=entrance1).  
2. The Next.js frontend loads and sends the location ID to the FastAPI backend.  
3. The backend validates the ID and returns the full store map data and the precise starting coordinates for "entrance1".  
4. As the user walks, the frontend continuously reads IMU data, runs its DR algorithm, and updates the user's position locally on the minimap.  
5. The user searches for "Milk". The frontend looks up the coordinates for "Milk" from the map data and sends a request to the backend's /api/path endpoint with the user's current DR-calculated position as the start and the milk's coordinates as the end.  
6. The backend's A\* algorithm calculates the path and returns an array of \[x, y\] waypoints.  
7. The frontend renders this path on the map and provides turn-by-turn guidance.  
8. If the user scans a QR code on "Aisle 7", the frontend decodes its coordinates and immediately snaps the user's position on the map to that exact point, resetting any accumulated DR error.

### **Hackathon Prototyping Roadmap**

This solution is highly feasible for a weekend hackathon.

* **Day 1 (Morning):**  
  * Initialize the project with a Next.js frontend and a FastAPI backend, setting up the basic Docker configuration.  
  * Create a simple JSON file to represent a small section of a store layout as a 2D grid.  
  * Build the FastAPI endpoint to serve this JSON map data.  
* **Day 1 (Afternoon):**  
  * On the frontend, implement the sensor access logic using the Web Sensor APIs. Requesting permissions for device motion and orientation is a critical step.27  
  * Develop a basic dead reckoning algorithm in JavaScript to translate sensor data into (x, y) coordinate changes.  
  * Render a simple dot on an HTML Canvas that moves based on the DR output.  
* **Day 2 (Morning):**  
  * On the backend, integrate the python-pathfinding library. Create the /api/path endpoint that takes start/end coordinates and returns a path based on the grid map.  
  * On the frontend, call this API and draw the returned path on the canvas.  
* **Day 2 (Afternoon):**  
  * Integrate a JavaScript QR code scanning library.  
  * Implement the logic to have a successful scan update the user's starting position, effectively anchoring the DR system.  
  * Refine the UI/UX, add basic search functionality, and prepare the demonstration.

### **Strategic Analysis (Pros & Cons)**

* **Pros:**  
  * **Extremely Low Infrastructure Cost:** The only physical requirement is printing and placing paper QR codes, making it incredibly cheap and easy to scale.  
  * **High Accessibility:** As a web application, it works on any modern smartphone without requiring an app installation, maximizing potential user reach.  
  * **High Feasibility:** The technology stack is standard and well-documented. A compelling and functional MVP is achievable within the hackathon timeframe. The core risks are related to algorithm tuning, not fundamental technical blockers.  
* **Cons:**  
  * **Variable Accuracy:** The system's accuracy is heavily dependent on the quality of the IMU sensors in the user's specific phone model and how they carry it. A phone swinging in a user's hand will produce much noisier data than one fixed in a shopping cart.  
  * **User Friction from Permissions:** Accessing motion sensors requires explicit user permission, which can be a point of confusion or distrust for some users.4  
  * **Dependency on Re-calibration:** The system is fundamentally reliant on periodic QR code scans to remain accurate over a full shopping trip. If a user neglects to scan codes, their position will inevitably drift and become unreliable.

## **Solution Concept 2: "AR Wayfinder" — Vision-Based Navigation with AR Overlay**

Concept Overview & User Journey

"AR Wayfinder" offers the most futuristic and visually engaging navigation experience. It transforms the user's phone into a magic lens that overlays digital directions and information directly onto the physical store environment.

The user journey begins by launching the web app and granting camera access. Instead of a 2D map, they see the live view from their camera. After selecting a product from their list, a virtual path—visualized as glowing arrows or a colored line—appears on the floor in the camera view, guiding them step-by-step towards their destination. The path dynamically updates as they walk and turn. Upon reaching the correct aisle, the application could highlight the entire shelf section where the product is located. Furthermore, when the user points their camera at a specific product, the AR overlay could display contextual information like pricing, customer reviews, promotional offers, or detailed nutritional facts.

### **System Architecture & Data Flow**

This solution introduces significant technical complexity, requiring a real-time interplay between the frontend AR rendering and a backend computer vision service.

1. **Frontend (Next.js \+ A-Frame \+ AR.js):** The frontend is the core of the AR experience. It uses Next.js to serve the application shell. The AR scene itself is built using A-Frame for rapid development, with AR.js providing the WebAR capabilities.13 The application will primarily use markerless or location-based AR features to attempt to understand surfaces and track the user's position in 3D space.11 Short-term, moment-to-moment path rendering will still rely on IMU data for smooth, high-framerate updates.  
2. **Backend (FastAPI \+ Python CV):** The backend's role is expanded significantly. In addition to pathfinding, it hosts a lightweight computer vision model, such as a fine-tuned version of YOLO (You Only Look Once). It exposes an API endpoint that accepts an image frame from the frontend's camera stream. The YOLO model runs inference on this image to detect and recognize pre-trained store landmarks (e.g., "Aisle 7" signs, "Pharmacy" department signage, "Exit" signs).  
3. **AI Agent (Optional Extension):** An AI agent could be used to interpret the CV model's output. For example, if the model detects "Aisle 7" and "Cereal," the agent could infer the user's precise location and orientation and provide more contextually aware guidance.

**Data Flow:**

1. The user opens the web app, which initializes the A-Frame scene and requests camera access. The AR.js library starts the AR session.  
2. The user selects "Avocados" as their destination. The frontend gets the optimal path from the backend's pathfinding service.  
3. The frontend begins rendering the AR path overlay. It uses high-frequency IMU data to update the camera's position and orientation between frames, ensuring the virtual path appears to stick to the real-world floor.  
4. To correct for the inevitable drift of this AR/IMU tracking, the frontend periodically (e.g., once every few seconds) sends a compressed keyframe from the video stream to the backend's /api/recognize endpoint.  
5. The backend's YOLO model analyzes the frame. If it recognizes a landmark, such as the "Produce" sign, it returns a JSON object containing the landmark's identity and its known, fixed coordinates in the store's map.  
6. The frontend receives this response and uses the absolute coordinates to re-anchor its AR world space. This "snap" correction ensures the virtual path remains aligned with the physical store layout over long distances.

### Hackathon Prototyping Roadmap

This is a high-risk, high-reward path that requires parallel workstreams.

* **Day 1 (Morning):**  
  * **Frontend Team:** Set up the basic WebAR project using A-Frame and AR.js. Focus on getting a simple 3D object to appear and remain stable in the camera view on a mobile device.12  
  * **Backend Team:** Begin collecting a small, focused dataset of images of store landmarks (e.g., photos of 3-4 different aisle signs from various angles and distances).  
* **Day 1 (Afternoon):**  
  * **Frontend Team:** Implement a basic navigation path using a-entity components in A-Frame. Work on using IMU data to allow the user to "walk" along this virtual path.  
  * **Backend Team:** Use a pre-trained YOLO model and fine-tune it on the collected landmark images. This can be done relatively quickly using frameworks like PyTorch or TensorFlow.  
* **Day 2 (Morning):**  
  * **Backend Team:** Build the FastAPI endpoint that accepts an image upload, runs inference with the fine-tuned YOLO model, and returns the detection results.  
  * **Integration:** Implement the logic on the frontend to capture a frame, send it to the backend API, and receive the response.  
* **Day 2 (Afternoon):**  
  * **Integration:** Use the response from the backend to trigger an event in the AR scene. The MVP goal is simple: when the "Aisle 7" sign is recognized, display a text label in AR that says "You are in Aisle 7."  
  * Polish the demo to be as stable as possible for a single, pre-defined path.

### Strategic Analysis (Pros & Cons)

* **Pros:**  
  * **Highest "Wow" Factor:** This solution is visually stunning and represents a truly next-generation user experience. It would be extremely memorable and impressive to hackathon judges.  
  * **Intuitive Navigation:** Overlaying directions onto the real world is arguably the most intuitive way to guide a user, eliminating the mental translation required to follow a 2D map.  
  * **Platform for Future Features:** An AR platform can be easily extended to include interactive product information, AR advertisements, and gamified shopping experiences.  
* **Cons:**  
  * **Highest Technical Complexity:** This is by far the most difficult solution to implement. It involves a complex stack (WebAR, CV, real-time communication) where many things can go wrong. WebAR performance can be inconsistent and laggy.15  
  * **High Battery Consumption:** Continuously running the camera, GPU for rendering, and CPU for tracking will drain a phone's battery very quickly.  
  * **Poor User Ergonomics:** The solution requires the user to hold their phone up in front of them for the duration of the navigation, which is unnatural, fatiguing, and socially awkward. This is a significant usability flaw for a full shopping trip.  
  * **High Risk of Failure:** The success of the entire system hinges on the performance of the CV model, which can be brittle and unreliable in variable lighting conditions or with cluttered backgrounds typical of a retail store.

## **Solution Concept 3: "Smart Cart Navigator" — IoT-Enhanced Precision Tracking**

### Concept Overview & User Journey

The "Smart Cart Navigator" shifts the burden of accurate positioning from the user's phone to the shopping cart itself, resulting in a highly accurate, reliable, and low-effort experience.

The user journey starts when they select a shopping cart. They scan a QR code on the cart's handle, which contains the credentials for the cart's private Wi-Fi network. After a one-time connection, the web application loads on their phone. Their phone now acts as a simple display and control interface, showing a minimap of the store. The cart's position on the map is not an estimation; it is a precise reading derived from the cart's own sensors. The user can mount their phone on the cart's handlebar and follow the real-time location marker, which moves and turns with perfect fidelity as they push the cart. The rest of the experience is similar to "Pathfinder"—they can search for items and receive an optimal path—but the location tracking is virtually flawless.

### System Architecture & Data Flow

This solution is unique in its inclusion of a dedicated hardware component, which communicates directly with the user's phone in a localized, peer-to-peer fashion.

1. **Hardware (ESP32):** An ESP32 microcontroller, a battery pack, and two rotary wheel encoders are mounted onto the chassis of a shopping cart.22 The encoders are positioned to measure the rotation of two independent wheels.  
2. **Firmware (Arduino/C++):** Custom firmware runs on the ESP32. Its primary job is to continuously read the pulse counts from the two wheel encoders. By comparing the counts from each wheel, it can calculate not only the distance traveled but also the precise angle of any turns. This data is used to maintain an internal state of the cart's coordinates (x, y) and heading (θ) relative to its starting point. The firmware also implements the ESP32 Web Server pattern, creating a Wi-Fi hotspot and serving a simple webpage or a JSON API endpoint at a static local IP address (e.g., <http://192.168.4.1/location).19>  
3. **Frontend (Next.js):** The user's phone connects to the cart's Wi-Fi network. The Next.js application, once loaded, makes continuous asynchronous requests (e.g., every 250ms) to the ESP32's local /location endpoint. It parses the returned coordinate data and updates the cart's icon on the 2D store map.  
4. **Backend (FastAPI):** The role of the main backend is minimal in the real-time loop. It is used only for the initial download of the store map data and to service on-demand requests for pathfinding calculations, just as in Solution 1\. The critical real-time location data transfer happens directly between the cart and the phone, bypassing any external networks.

**Data Flow:**

1. The user scans a QR code on the cart. The QR code contains Wi-Fi credentials (SSID and password).  
2. The user's phone connects to the cart's Wi-Fi network and navigates to the web app URL (which could also be in the QR code).  
3. The frontend loads the store map from the main FastAPI backend (this is its only interaction with the outside internet).  
4. The frontend begins polling the ESP32's local IP address (<http://192.168.4.1/location>).  
5. The ESP32's web server responds to each poll with the latest (x, y, θ) coordinates calculated from its wheel encoders.  
6. The frontend updates the cart's position on the map.  
7. To initialize its absolute position, the user is prompted to scan a single QR code at a "calibration station" near the cart corral. This tells the cart its starting coordinates.

### Hackathon Prototyping Roadmap

This path requires a team comfortable with both hardware and software.

* **Day 1 (Morning):**  
  * **Hardware Team:** Focus exclusively on the physical prototype. Mount the ESP32, battery, and wheel encoders to a small cart or chair with wheels. Wire the components and write the basic Arduino firmware to read encoder counts and print them to the serial monitor to verify functionality.  
* **Day 1 (Afternoon):**  
  * **Hardware Team:** Enhance the firmware to include the Wi-Fi hotspot and web server functionality. The goal is to have an endpoint that serves a hardcoded JSON object with coordinates.20  
  * **Software Team:** Build the Next.js frontend with a static 2D map and an icon representing the cart.  
* **Day 2 (Morning):**  
  * **Hardware Team:** Implement the dead reckoning logic in the firmware to translate raw encoder counts into (x, y) coordinates.  
  * **Software Team:** Implement the frontend logic to continuously fetch data from the ESP32's IP address and use it to update the cart icon's position on the map.  
* **Day 2 (Afternoon):**  
  * **Integration:** Integrate the backend pathfinding service.  
  * Refine the user experience for pairing (QR code) and initial calibration.  
  * Practice the full demonstration flow: pair phone, calibrate cart, navigate to an item.

### Strategic Analysis (Pros & Cons)

* **Pros:**  
  * **Highest Accuracy and Reliability:** This solution provides ground-truth data, making it immune to phone sensor errors, how the user holds their phone, or other environmental factors. It is by far the most robust and precise approach.  
  * **Excellent User Experience:** After the initial pairing, the experience is seamless. The user can put their phone in the handlebar mount and focus on shopping, confident that the location is always accurate.  
  * **Creates a Future-Proof Platform:** An intelligent, connected cart opens the door for numerous other features, such as checkout-less shopping (with added weight sensors), in-cart promotions, and theft prevention.  
* **Cons:**  
  * **Hardware Dependency:** The success of the hackathon prototype is entirely dependent on successfully building and debugging the physical hardware component. A single loose wire or firmware bug can derail the entire project.  
  * **Complex Prototyping:** This solution requires a broader skillset, spanning embedded systems programming (C++), electronics, and full-stack web development.  
  * **Significant Scalability Challenges:** While excellent for a prototype, deploying this solution at scale would involve a massive capital investment to retrofit tens of thousands of carts, plus ongoing costs for battery maintenance, and hardware repair.

## **Comparative Analysis and Strategic Recommendation**

The choice of which solution to pursue in a hackathon is a critical strategic decision that must balance ambition with pragmatism. Each of the three proposed concepts occupies a different point on the spectrum of risk versus reward. The following matrix provides a direct comparison across the key success metrics to aid in this decision-making process.

### Solution Comparison Matrix

| Metric | Pathfinder (IMU+QR) | AR Wayfinder (Vision+AR) | Smart Cart Navigator (IoT) |
| :---- | :---- | :---- | :---- |
| **Implementation Feasibility (Hackathon)** | **High (4/5):** Pure software, relies on standard web APIs. Main challenge is tuning the DR algorithm. | **Low (2/5):** Involves WebAR, CV model training, and complex frontend-backend integration. High risk of hitting a major roadblock. | **Medium (3/5):** Requires hardware assembly and firmware development, but the software architecture is simpler than AR. |
| **Accuracy & Reliability** | **Medium (3/5):** Prone to drift but correctable. Dependent on user behavior. | **Low (2/5):** Highly dependent on lighting conditions, landmark visibility, and model accuracy. Can be brittle. | **High (5/5):** Ground-truth data from wheel encoders. The most robust and precise method. |
| **User Experience (Effort & Engagement)** | **Good (4/5):** Low effort, works in-pocket. QR scanning is a minor interruption. | **Fair (3/5):** High engagement ("wow" factor) but also high effort (must hold phone up). High battery drain is a major negative. | **Excellent (5/5):** "Set and forget" after pairing. The most seamless and frictionless experience. |
| **Innovation & "Wow" Factor** | **Medium (3/5):** A solid, practical application of existing tech. Smart but not flashy. | **High (5/5):** The most visually impressive and futuristic solution. A clear winner for presentation points. | **High (4/5):** The "smart hardware" angle is highly innovative and opens up a platform of possibilities. |
| **Scalability & Cost (Post-Hackathon)** | **High (5/5):** Extremely low cost, requiring only printed QR codes. | **High (4/5):** Pure software solution, but requires ongoing CV model maintenance and server costs for inference. | **Low (1/5):** High capital expenditure to retrofit thousands of carts. Significant maintenance overhead. |

### Final Recommendation for the Walmart Hackathon

Based on the comparative analysis, the following strategic recommendations are offered to the hackathon team, tailored to different risk appetites and team strengths.

* Safest Bet for a Winning MVP: Solution 1: Pathfinder  
  This solution offers the best balance of feasibility, functionality, and innovation within the hackathon's constraints. It directly addresses the core problem with a robust, technically sound architecture. The team can confidently build a working prototype that is easy to demonstrate and clearly explains the symbiotic relationship between dead reckoning and QR anchoring. Its primary risk—algorithm tuning—is an incremental problem that can be improved throughout the event, rather than a binary pass/fail blocker. For a team aiming to deliver a complete, polished, and reliable solution, this is the recommended path.  
* High-Risk, High-Reward Strategy: Solution 2: AR Wayfinder  
  If the team possesses deep, pre-existing expertise in both computer vision and frontend 3D/AR development, this solution has the highest potential to capture the judges' imagination. The "wow" factor of a working AR navigation demo is unparalleled. However, the risks are immense. The strategy here must be one of ruthless prioritization. The goal should not be to build a fully-featured app, but to perfect a single, short, "golden path" demonstration (e.g., navigating from the end of one aisle to a specific product in the next). This minimizes exposure to the brittleness of WebAR and CV models while maximizing visual impact.  
* The "Dark Horse" with a Hardware Edge: Solution 3: Smart Cart Navigator  
  If the team includes members with strong experience in electronics and embedded systems, this solution could be a surprise winner. Its superior accuracy and seamless user experience provide a powerful narrative about building practical, reliable systems. The critical path for this project is to de-risk the hardware component on Day 1\. If the team can get the ESP32 reliably reading encoder data and serving it over Wi-Fi by the end of the first day, they will be in a strong position to complete the software components and deliver a highly differentiated and impressive final product.  
* Hybrid Recommendation for an Ambitious Team:  
  A powerful strategy is to pursue a hybrid approach. The team should begin by building the complete backend and frontend architecture for Solution 1: Pathfinder. This ensures a solid, functional baseline product. Once this core is stable, a sub-team can be tasked with a "stretch goal": developing an AR view (Solution 2: AR Wayfinder) that consumes the exact same pathfinding data from the backend. The final presentation could then showcase a practical 2D map mode for everyday use and an innovative AR mode for featured products or promotions. This strategy demonstrates both practicality and vision, mitigating the risk of the AR component failing while still allowing the team to showcase their full range of technical capabilities.

### Works cited

1. indoornavigation.com | Indoor Wayfinding Using BLE, accessed September 23, 2025, [https://indoornavigation.com/](https://indoornavigation.com/)  
2. Dead reckoning \- Wikipedia, accessed September 23, 2025, [https://en.wikipedia.org/wiki/Dead\_reckoning](https://en.wikipedia.org/wiki/Dead_reckoning)  
3. A Novel Map-Based Dead-Reckoning Algorithm for Indoor Localization \- MDPI, accessed September 23, 2025, [https://www.mdpi.com/2224-2708/3/1/44](https://www.mdpi.com/2224-2708/3/1/44)  
4. Gyroscope \- Web APIs | MDN, accessed September 23, 2025, [https://developer.mozilla.org/en-US/docs/Web/API/Gyroscope](https://developer.mozilla.org/en-US/docs/Web/API/Gyroscope)  
5. Accelerometer \- Web APIs | MDN, accessed September 23, 2025, [https://developer.mozilla.org/en-US/docs/Web/API/Accelerometer](https://developer.mozilla.org/en-US/docs/Web/API/Accelerometer)  
6. aradng/MARG-Dead-reckoning \- GitHub, accessed September 23, 2025, [https://github.com/aradng/MARG-Dead-reckoning](https://github.com/aradng/MARG-Dead-reckoning)  
7. INDOOR POSITIONING AND NAVIGATION BASED ON QR CODE MAP \- Semantic Scholar, accessed September 23, 2025, [https://pdfs.semanticscholar.org/6a86/9ad245b854d12e6e1c9839e86d69b7ed0097.pdf](https://pdfs.semanticscholar.org/6a86/9ad245b854d12e6e1c9839e86d69b7ed0097.pdf)  
8. (PDF) INDOOR POSITIONING AND NAVIGATION BASED ON QR CODE MAP, accessed September 23, 2025, [https://www.researchgate.net/publication/376489990\_INDOOR\_POSITIONING\_AND\_NAVIGATION\_BASED\_ON\_QR\_CODE\_MAP](https://www.researchgate.net/publication/376489990_INDOOR_POSITIONING_AND_NAVIGATION_BASED_ON_QR_CODE_MAP)  
9. Literature Survey on Indoor Navigation System Using QR Code and OSM \- iarjset, accessed September 23, 2025, [https://iarjset.com/wp-content/uploads/2024/02/IARJSET.2024.11204.pdf](https://iarjset.com/wp-content/uploads/2024/02/IARJSET.2024.11204.pdf)  
10. Positioning in Indoor Environment using QR Codes, accessed September 23, 2025, [https://www.fig.net/resources/proceedings/2014/2014\_ingeo/TS4-04\_Ilkovicova.pdf.pdf](https://www.fig.net/resources/proceedings/2014/2014_ingeo/TS4-04_Ilkovicova.pdf.pdf)  
11. Ar.js for WebAR \- Queppelin, accessed September 23, 2025, [https://www.queppelin.com/ar-js-for-webar/](https://www.queppelin.com/ar-js-for-webar/)  
12. AR.js Documentation \- AR.js GitHub Pages, accessed September 23, 2025, [https://ar-js-org.github.io/AR.js-Docs/](https://ar-js-org.github.io/AR.js-Docs/)  
13. Top 5 WebXR Frameworks \- Comparison \- Wonderland Engine, accessed September 23, 2025, [https://wonderlandengine.com/news/top-5-webxr-frameworks-comparison/](https://wonderlandengine.com/news/top-5-webxr-frameworks-comparison/)  
14. Comparing WebVR Technologies: React 360 vs A-Frame and Three.js \- Litslink, accessed September 23, 2025, [https://litslink.com/blog/web-vr-technologies-react-360-vs-a-frame-and-threejs](https://litslink.com/blog/web-vr-technologies-react-360-vs-a-frame-and-threejs)  
15. WebAR Comparison – AR.js vs. A-Frame AR \- VR Software wiki, accessed September 23, 2025, [https://www.vrwiki.cs.brown.edu/related-technology/webar-comparison-ar-js-vs-a-frame-ar](https://www.vrwiki.cs.brown.edu/related-technology/webar-comparison-ar-js-vs-a-frame-ar)  
16. Augmented Reality for mobile (which framework?) \- Discussion \- three.js forum, accessed September 23, 2025, [https://discourse.threejs.org/t/augmented-reality-for-mobile-which-framework/8581](https://discourse.threejs.org/t/augmented-reality-for-mobile-which-framework/8581)  
17. Three.js vs a-frame what is a better framework for building AR stuff ? : r/WebVR \- Reddit, accessed September 23, 2025, [https://www.reddit.com/r/WebVR/comments/13626cd/threejs\_vs\_aframe\_what\_is\_a\_better\_framework\_for/](https://www.reddit.com/r/WebVR/comments/13626cd/threejs_vs_aframe_what_is_a_better_framework_for/)  
18. ESP32 Web Application How? \- Reddit, accessed September 23, 2025, [https://www.reddit.com/r/esp32/comments/1hu3c52/esp32\_web\_application\_how/](https://www.reddit.com/r/esp32/comments/1hu3c52/esp32_web_application_how/)  
19. ESP32 Web Server \- Arduino IDE | Random Nerd Tutorials, accessed September 23, 2025, [https://randomnerdtutorials.com/esp32-web-server-arduino-ide/](https://randomnerdtutorials.com/esp32-web-server-arduino-ide/)  
20. Implementing Web Server on ESP32 \- Arduino Project Hub, accessed September 23, 2025, [https://projecthub.arduino.cc/cetech11/implementing-web-server-on-esp32-5c24be](https://projecthub.arduino.cc/cetech11/implementing-web-server-on-esp32-5c24be)  
21. \#7 — The ESP32 Web Server using HTTP and WiFi Communication | by Carissa Aurelia | I learn ESP32 (and you should too). | Medium, accessed September 23, 2025, [https://medium.com/i-learn-esp32-and-you-should-too/7-the-esp32-web-server-using-http-and-wifi-communication-26933a510153](https://medium.com/i-learn-esp32-and-you-should-too/7-the-esp32-web-server-using-http-and-wifi-communication-26933a510153)  
22. FreeRTOS ESP32 Rotary Encoder Example \- YouTube, accessed September 23, 2025, [https://www.youtube.com/watch?v=YlBtapWERYg](https://www.youtube.com/watch?v=YlBtapWERYg)  
23. Rotary Encoder Simulation with ESP32 \- YouTube, accessed September 23, 2025, [https://www.youtube.com/watch?v=QBx\_MGqeUFE](https://www.youtube.com/watch?v=QBx_MGqeUFE)  
24. pathfinding · PyPI, accessed September 23, 2025, [https://pypi.org/project/pathfinding/](https://pypi.org/project/pathfinding/)  
25. Pathfinding tcod.path \- python-tcod 19.4.1 documentation, accessed September 23, 2025, [https://python-tcod.readthedocs.io/en/latest/tcod/path.html](https://python-tcod.readthedocs.io/en/latest/tcod/path.html)  
26. dorukeker/gyronorm.js: JavaScript project for accessing and normalizing the accelerometer and gyroscope data on mobile devices \- GitHub, accessed September 23, 2025, [https://github.com/dorukeker/gyronorm.js/](https://github.com/dorukeker/gyronorm.js/)  
27. Gyro-web: Accessing the device orientation in JavaScript \- Trekhleb, accessed September 23, 2025, [https://trekhleb.dev/blog/2021/gyro-web/](https://trekhleb.dev/blog/2021/gyro-web/)
