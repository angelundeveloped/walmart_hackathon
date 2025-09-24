# **Walmart Wavefinder: AI-Powered In-Store Navigation**

A Hackathon Proposal for Walmart México  
Date: September 26, 2025

### **1\. Executive Summary**

Walmart Wavefinder is a proof-of-concept web application designed to revolutionize the in-store customer experience by eliminating the friction of finding products. Leveraging a conversational AI interface and a real-time simulated navigation map, customers can simply state what they need and be guided along the most efficient route through the store. This solution directly addresses the hackathon's challenge by enhancing in-store navigation, improving accessibility, and providing a scalable, innovative framework for the future of retail.

### **2\. The Problem**

Large retail environments like Walmart, while offering vast selection, can be overwhelming to navigate. Customers often spend significant time searching for specific items, leading to frustration and inefficient shopping trips. This challenge is magnified for new shoppers, individuals with disabilities, or those in a hurry. The lack of a dynamic, interactive guidance system is a key opportunity for improving customer satisfaction.

### **3\. Proposed Solution: Wavefinder**

Wavefinder is a mobile-first web app that provides a seamless "chat-to-checkout" journey.

* **Conversational Search:** Users interact with a friendly AI assistant powered by Google's Gemini. They can ask for items in natural language, like "I need to get some milk, bread, and laundry detergent."  
* **Intelligent Route Planning:** The AI processes the request, identifies the products, and plots the most efficient multi-stop route on a digital map of the store.  
* **Real-Time Navigation:** A clear, arrow-like icon represents the user's shopping cart, guiding them turn-by-turn. As they collect items, they can check them off a dynamic list.  
* **Simulation-First:** For this hackathon, the cart's position is determined by simulating data from Ultra-Wideband (UWB) anchors, proving the viability of the underlying positioning technology.

### **4\. Technical Architecture**

The solution is built on a modern, scalable, and rapidly deployable tech stack.

* **Frontend:** Next.js (React) for a responsive and fast user interface.  
* **AI/LLM:** Google's Gemini API for natural language understanding and item extraction.  
* **Backend (Optional):** FastAPI could be used as a lightweight intermediary for more complex logic or data management, but for the MVP, the frontend communicates directly with the Gemini API.  
* **Positioning (Simulated):** The core of the demo simulates multiple UWB anchors. The cart's position is calculated in real-time using a trilateration algorithm running on the client, demonstrating how a real-world hardware implementation would function.

**System Diagram:**

\[User\] \<--\> \[Next.js Frontend on Phone\]  
   |                |  
   | (Chat Input)   | (Map UI, Shopping List)  
   |                v  
   \+------\> \[Gemini API\] (Processes query, returns item list)  
   |  
   \+------\> \[Pathfinding & UWB Simulation Logic\] (Calculates route & position)

### **5\. Hardware & Cost Estimation (For Real-World Deployment)**

Transitioning from simulation to a live environment would require the following:

* **Hardware:**  
  * **UWB Anchors:** Deployed across the store ceiling (approx. 1 every 20-30 meters). These are the fixed reference points.  
  * **UWB Tags:** A small tag mounted on each shopping cart.  
  * **Local Gateway/Server:** To process UWB data and communicate with the main system.  
* **Estimated Cost:**  
  * **Anchors:** \~$50 \- $150 per unit. A large Walmart might require 100-200 anchors. **(Est: $5k \- $30k per store)**  
  * **Tags:** \~$10 \- $30 per cart. For 500 carts. **(Est: $5k \- $15k per store)**  
  * **Infrastructure & Installation:** Varies significantly but can be estimated at **$10k \- $20k per store.**  
  * **Total Ballpark Per Store:** **$20,000 \- $65,000**

### **6\. Pros & Cons**

**Pros:**

* **Drastically Improved Efficiency:** Reduces shopping time and customer frustration.  
* **High Accessibility:** Assists users who have difficulty navigating large spaces.  
* **Data Insights:** Provides valuable data on popular routes and customer behavior.  
* **Innovative & Modern:** Positions Walmart as a technology leader in the retail space.

**Cons:**

* **Initial Cost:** The hardware installation represents a significant capital investment.  
* **Infrastructure Dependency:** Relies on in-store Wi-Fi and the proper functioning of the UWB system.  
* **Maintenance:** Hardware will require ongoing maintenance and calibration.

### **7\. Caveats & Considerations**

By design, this system optimizes for efficiency. This may have unintended consequences:

* **Reduced "Discovery" Shopping:** Customers are guided directly to their items, potentially reducing impulse buys or the discovery of new products they might have encountered on a more leisurely route.  
* **Over-Reliance:** Users might become dependent on the system, losing familiarity with the store layout over time.  
  * **Mitigation:** The app could feature a "Discovery Mode" that suggests routes passing by new or on-sale items.

*(This document is a draft and will be completed by the submission deadline.)*