

# **A Strategic Guide to Simulating BLE and UWB Systems for Application Demonstration**

## **Executive Summary**

In modern systems development, the decoupling of software and hardware lifecycles is a critical enabler of velocity and quality. When physical hardware, such as Bluetooth Low Energy (BLE) beacons and Ultra-Wideband (UWB) modules, is unavailable due to procurement or logistical constraints, development momentum must not be compromised. This report provides a comprehensive, expert-level guide for simulating these hardware components to facilitate a successful application demonstration. The strategies outlined herein treat simulation not as a mere stopgap, but as a strategic component of a robust development and testing lifecycle.

This document details a multi-tiered approach to simulation. For BLE beacons, it presents methods ranging from rapid prototyping using mobile applications to highly controllable and automatable programmatic simulation using Node.js and Python libraries. The analysis moves beyond simple presence simulation to address the physical realities of signal propagation, providing models for generating dynamic and realistic Received Signal Strength Indicator (RSSI) values.

For the more complex domain of UWB, this report advocates for the use of high-fidelity, physics-based toolkits such as MATLAB® & Simulink® and the open-source PyLayers platform. These tools enable the simulation of UWB's core principles—Time of Flight (ToF) and Time Difference of Arrival (TDOA)—by modeling the underlying channel physics, including multipath propagation and line-of-sight (LOS) versus non-line-of-sight (NLOS) conditions.

Critically, this report introduces a foundational architectural pattern: the Hardware Abstraction Layer (HAL). The implementation of a HAL is presented as the central strategy for ensuring a seamless transition from the simulated environment to the eventual integration of physical hardware. This architectural discipline decouples the application logic from the data source, rendering the application agnostic to whether it is consuming data from a simulator or a real device.

Finally, the report provides a candid analysis of the inherent gap between simulation and real-world performance. It offers a strategic framework for managing stakeholder expectations during a demonstration, emphasizing transparency and focusing the narrative on the application's value proposition. By following the guidance within this report, a development team can not only deliver a compelling and credible demonstration but also build a resilient and testable system architecture, transforming a short-term hardware constraint into a long-term engineering asset.

## **Section 1: Simulating Bluetooth Low Energy (BLE) Beacons**

The simulation of BLE beacons is a tractable problem, achievable through a variety of methods with differing levels of complexity and control. The primary function of a beacon is to broadcast its identity periodically; therefore, the core of any simulation is the generation and transmission of correctly formatted advertisement packets. This section provides a comprehensive guide, from foundational theory to practical implementation and techniques for achieving realistic signal behavior.

### **1.1 Foundational Concepts for Simulation: The "What" and "Why"**

To effectively simulate a BLE beacon, it is essential to understand the fundamental components of the technology that enable its operation. The simulation effort is not about replicating the entire Bluetooth stack, but rather about mimicking the specific behaviors that a scanning application (the "Central") observes from a beacon (the "Peripheral").

BLE Advertising Packets  
The cornerstone of beacon technology is the BLE advertising packet. Beacons are typically connectionless, "advertise-only" devices that repeatedly broadcast small data packets on three specific advertising channels (37, 38, and 39).1 This broadcasting, or advertising, allows nearby devices to discover their presence and receive a small amount of data without establishing a full connection, which is key to BLE's low energy consumption.2 The fundamental task of any beacon simulator is to construct and broadcast these advertisement packets.  
GATT (Generic Attribute Profile)  
While beacons are often connectionless, the Generic Attribute Profile (GATT) is a crucial concept in the broader BLE ecosystem. GATT defines a hierarchical data structure that devices use to expose their state and capabilities. This structure consists of Services, which group related functions, and Characteristics, which are the actual data values.3 For instance, a heart rate monitor would have a "Heart Rate Service" containing a "Heart Rate Measurement" Characteristic. Although a simple beacon might not engage in GATT transactions, more complex BLE peripherals do. A comprehensive simulator, particularly one designed for testing applications that interact with a wide range of BLE devices, may need to emulate a GATT server to represent a device's logical functions and allow for reading or writing characteristics.3  
Beacon Pseudo-Standards (iBeacon vs. Eddystone)  
BLE itself does not define a standard beacon format. Instead, platform-specific "pseudo-standards" have emerged, with Apple's iBeacon and Google's Eddystone being the most prominent. These are not official Bluetooth standards but rather proprietary specifications for the structure of the data payload within the advertisement packet.2

* **iBeacon (Apple):** This is a proprietary but widely adopted format that structures the advertisement payload around three key identifiers: a Universally Unique Identifier (UUID), a "Major" value, and a "Minor" value.4 The UUID typically identifies an organization or a specific application, while the Major and Minor values can be used to identify subgroups (e.g., a specific store) and individual beacons (e.g., a specific department), respectively. A compliant iBeacon advertisement packet must be formatted with the Apple Company Identifier, a specific data type indicator (0x02), a data length of 21 bytes (0x15), the 16-byte UUID, 2-byte Major, 2-byte Minor, and a 1-byte "measured power" value used for proximity estimation.6  
* **Eddystone (Google):** This is an open-source format that offers greater flexibility through the use of multiple frame types, which can be broadcast individually or interleaved from the same physical beacon.2 The primary frame types include:  
  * **Eddystone-UID:** Similar to iBeacon, it broadcasts a unique beacon ID composed of a 10-byte Namespace and a 6-byte Instance identifier.2  
  * **Eddystone-URL:** Broadcasts a compressed URL, enabling the "Physical Web" concept where devices can advertise a relevant web link.2  
  * **Eddystone-TLM:** Broadcasts telemetry data such as beacon battery voltage, temperature, and uptime. This is useful for fleet management and monitoring.2  
  * **Eddystone-EID:** An ephemeral identifier that rotates periodically for enhanced security and privacy.8

    A simulator targeting Eddystone must be capable of constructing these distinct frame types to leverage the format's full potential.

Central vs. Peripheral Roles  
In BLE terminology, the device that advertises is the Peripheral (or server), and the device that scans for advertisements is the Central (or client).3 In the context of this simulation, the beacon simulator will always assume the Peripheral role, broadcasting advertisement packets. The application being developed for the demonstration will act as the Central, scanning for and processing these packets.

### **1.2 Mobile-Based Simulation: Quick and Accessible Prototyping**

The most direct path to simulating a BLE beacon is to leverage the hardware already present in modern smartphones. Many devices can be programmed to act as a BLE peripheral, making them an ideal platform for quick, manual testing and initial application validation.4 This approach significantly lowers the barrier to entry, as it requires no specialized hardware beyond a compatible phone.9

iOS Applications  
For developers in the Apple ecosystem, several App Store applications can turn an iPhone into a beacon.

* **Beacon Simulator (Marino Software):** This is a free, developer-centric utility designed for this exact purpose. It provides a straightforward interface to configure the essential iBeacon parameters—UUID, Major, and Minor—and begin broadcasting almost instantly. It also simplifies the process of generating and sharing UUIDs with the development environment, streamlining the setup process.9 However, it is important to be aware of its limitations. User feedback has indicated that the Major and Minor fields may be restricted to three digits (when four are often used) and that the application does not save the UUID between sessions, which can be cumbersome for repetitive testing workflows.9 Its primary focus is on the iBeacon standard, and support for Eddystone is not explicitly documented.9

Android Applications  
The Android ecosystem offers a wider variety of more flexible simulation applications, though this comes with the significant caveat of hardware dependency.

* **Beacon Simulator (Vincent Hiribarren):** This is a particularly versatile tool that supports not only iBeacon but also AltBeacon and the full suite of Eddystone formats (URL, UID, TLM, and EID).11 Its feature set includes the ability to broadcast in the background and to scan for nearby physical beacons and clone their configurations, making it a powerful tool for both simulation and analysis.  
* **BLE Peripheral Simulator (WebBluetoothCG):** This application is less of a beacon simulator and more of a general-purpose GATT server emulator. It is designed to simulate services like the Battery Service or Heart Rate Service, making it an excellent tool for testing Web Bluetooth applications that require GATT interactions, but it is not the ideal choice for simulating simple iBeacon or Eddystone broadcasts.12  
* **Hardware Dependency:** A critical consideration for Android is that BLE peripheral mode (the ability to advertise) is not universally available. It requires both a modern Android version (5.0 Lollipop or newer) and, crucially, a compatible hardware chipset. Devices like the Google Nexus/Pixel series and flagship models from manufacturers like Samsung and Motorola generally support this mode, but many mid-range or older devices do not.12 This must be verified before relying on an Android device for simulation.

The choice of a mobile application depends on the specific requirements of the demonstration. For a simple iBeacon-based demo, an iOS app may suffice. For a more complex scenario involving Eddystone or requiring more configuration options, a versatile Android app on a compatible device would be the superior choice.

| App Name | Platform | Supported Formats | Key Features | Cost | Noted Limitations |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Beacon Simulator (Marino Software) | iOS | iBeacon | UUID generation, instant broadcast | Free | 3-digit Major/Minor limit, no UUID persistence 9 |
| Beacon Simulator (Vincent Hiribarren) | Android | iBeacon, AltBeacon, Eddystone (UID, URL, TLM, EID) | Background broadcast, scan & clone | Free | Requires compatible hardware chipset 11 |
| Eddystone-URL Beacon (Lab11) | Android | Eddystone-URL | Simple URL broadcasting | Free | Only supports Eddystone-URL format 13 |
| BLE Peripheral Simulator (WebBluetoothCG) | Android | N/A (GATT Services) | Simulates Battery, Heart Rate services | Free | Not a beacon simulator; for GATT testing 12 |

### **1.3 Programmatic Simulation with Software Libraries: Ultimate Control and Automation**

While mobile applications are excellent for rapid, manual testing, they fall short when automation, repeatability, and fine-grained control are required. Programmatic simulation using software libraries in a development environment like Node.js or Python provides the ultimate level of flexibility. This approach is essential for integrating simulation into automated test suites, creating complex multi-beacon scenarios, and dynamically controlling beacon parameters like signal strength.

Node.js Ecosystem  
The Node.js environment offers mature libraries for BLE communication, making it a strong choice for building a beacon simulator.

* **node-bleacon:** This library is specifically tailored for creating and discovering iBeacons.6 It offers a very simple API. The  
  Bleacon.startAdvertising(uuid, major, minor, measuredPower) function allows a developer to begin broadcasting a virtual iBeacon with just a single line of code. It also provides scanning capabilities and emits a discover event that includes useful properties like the current RSSI, calculated accuracy in meters, and proximity ('immediate', 'near', 'far'). A potential drawback is its reliance on older underlying BLE libraries (noble and bleno), which may present compatibility challenges with the latest versions of Node.js.6  
  *Example: Simulating an iBeacon with node-bleacon*  
  JavaScript  
  const Bleacon \= require('node-bleacon');

  const uuid \= 'e2c56db5dffb48d2b060d0f5a71096e0';  
  const major \= 1337; // 0 \- 65535  
  const minor \= 42;   // 0 \- 65535  
  const measuredPower \= \-59; // Calibrated RSSI at 1 meter

  console.log('Starting to advertise as iBeacon...');  
  Bleacon.startAdvertising(uuid, major, minor, measuredPower);

  // To stop advertising after some time  
  setTimeout(() \=\> {  
      Bleacon.stopAdvertising();  
      console.log('Stopped advertising.');  
      process.exit(0);  
  }, 10000); // Stop after 10 seconds

* **node-beacon-scanner:** This is a more modern and versatile library that supports not only iBeacon but also Eddystone and Estimote formats.14 A key advantage is its use of  
  @abandonware/noble, a well-maintained fork of the original noble library that ensures compatibility with Node.js versions 10 and later.14 While its name suggests a focus on scanning, its underlying dependencies can be leveraged for advertising as well, making it a robust foundation for a multi-format beacon simulator.

Python Ecosystem  
Python also provides a rich set of libraries for BLE interaction, suitable for building simulators.

* **BeaconTools:** This library is adept at both scanning for beacons and, more importantly for simulation, parsing raw binary advertisement data for iBeacon, Eddystone, and Estimote formats.16 Its strength in parsing makes it an excellent tool for validating that a custom-built simulator is generating correctly formatted advertisement payloads.  
* **ubeacon (for MicroPython):** Although designed for the MicroPython environment on embedded devices, the ubeacon library provides an exceptionally clean and well-structured set of classes for *encoding* beacon advertisement payloads.18 One can use these classes in a standard Python environment to generate the raw byte payload for an iBeacon or Eddystone frame. This payload can then be passed to a general-purpose Python BLE library, such as  
  bleak, for the actual broadcasting. This modular approach—using one library for payload creation and another for transmission—is a very clean and powerful design pattern.  
  *Example: Constructing an iBeacon payload with ubeacon and broadcasting with bleak*  
  Python  
  import asyncio  
  from bleak import BleakScanner  
  from ubeacon.ibeacon import IBeacon

  async def main():  
      \# 1\. Construct the iBeacon advertisement payload using ubeacon  
      beacon \= IBeacon(  
          uuid="e2c56db5dffb48d2b060d0f5a71096e0",  
          major=1337,  
          minor=42,  
          power=-59  
      )

      \# The advertisement data is a dictionary containing the manufacturer data  
      advertisement\_data \= {  
          0x004c: beacon.adv\_data\[2:\] \# Company ID for Apple is 0x004C  
      }

      \# 2\. Use bleak to advertise this payload  
      \# Note: Bleak's primary API is for scanning, but advertising can be done  
      \# via platform-specific backends or by creating a custom advertiser.  
      \# For simplicity, we demonstrate scanning here, but the key is the  
      \# creation of 'advertisement\_data'.  
      print(f"Generated iBeacon Payload: {advertisement\_data}")  
      print("A full advertising implementation would now broadcast this payload.")

      \# Example of using bleak for scanning  
      print("Scanning for devices for 10 seconds...")  
      scanner \= BleakScanner()  
      await scanner.start()  
      await asyncio.sleep(10)  
      await scanner.stop()

      for d in scanner.discovered\_devices:  
          print(f"Found device: {d.name} ({d.address})")

  if \_\_name\_\_ \== "\_\_main\_\_":  
      asyncio.run(main())

The choice to use a programmatic library is a commitment to a more sophisticated simulation strategy. It moves beyond simple presence indication to enable dynamic, automated, and scenario-driven testing, which is indispensable for a high-quality demonstration and a robust final product.

### **1.4 Simulating Realistic BLE Signal Propagation**

A convincing demonstration requires more than just the presence of a simulated beacon; it requires a simulation that behaves realistically. In the physical world, the signal strength of a beacon fluctuates based on distance, obstacles, and environmental interference. A static RSSI value is a dead giveaway of a simulation and undermines the credibility of the demo.

The Need for Dynamic RSSI  
The Received Signal Strength Indicator (RSSI) is the primary metric used by a central device to estimate its proximity to a beacon. A constant, hardcoded RSSI value is unrealistic. To simulate movement or a dynamic environment, the simulator must continuously vary the RSSI value it presents to the scanning application. This is achieved by modeling the physics of radio wave propagation.  
Path Loss Models  
Path loss models are mathematical formulas that describe the reduction in power density of an electromagnetic wave as it propagates through space.

* Free-Space Path Loss Model: This is the most fundamental model, describing signal attenuation in an ideal, unobstructed environment. The path loss (PL) in decibels is given by the formula:

  PL(dB)=20log10​(d)+20log10​(f)+20log10​(c4π​)

  where d is the distance, f is the signal frequency, and c is the speed of light. In simpler terms, signal strength decreases with the square of the distance.19  
* Log-Distance Path Loss Model: For indoor environments, the free-space model is insufficient as it doesn't account for walls, furniture, and other obstacles. The log-distance model is a more practical and widely used alternative. It modifies the free-space model with a path loss exponent, n, which characterizes how rapidly the signal attenuates in a specific environment. The formula is:

  PL(dB)=PL0​+10nlog10​(d0​d​)

  where PL0​ is the known path loss at a reference distance d0​ (typically 1 meter), and n is the path loss exponent. For free space, n=2. In an office building with partitions, n might be 3, and in a building with concrete walls, it could be 4 or higher.19 This model provides a robust and tunable way to simulate different environmental conditions.

Simulating Interference and Collisions  
BLE operates in the congested 2.4 GHz ISM band, which it shares with Wi-Fi, classic Bluetooth, Zigbee, and even microwave ovens.21 This co-channel traffic can lead to advertisement packet collisions, where two devices transmit at the same time on the same channel, causing the receiver to be unable to decode either packet. A high-fidelity simulation can model this behavior. The BLE specification adds a small random delay (  
advDelay, between 0 ms and 10 ms) to each advertising interval to reduce the probability of persistent collisions. A simulator can generate an array of transmission timestamps for multiple virtual beacons, each with this randomized delay. By checking for temporal overlaps in these transmission events, the simulator can determine when a collision would occur and consequently withhold that particular advertisement update from the scanning application, realistically simulating a "missed" packet.22

Implementation Guidance  
To implement dynamic RSSI, a core function should be created within the simulation service. This function would take a virtual distance as input, calculate the path loss using the log-distance model with a configurable exponent n, and then derive the RSSI. To add further realism, a small amount of random noise (jitter), typically drawn from a Gaussian distribution, should be added to the final RSSI value to simulate the minor fluctuations that occur even in a static environment. This function becomes the engine for generating a believable stream of beacon data that can be used to drive the application demo.

## **Section 2: Simulating Ultra-Wideband (UWB) Modules**

Transitioning from BLE to UWB simulation represents a significant leap in complexity. While BLE simulation is primarily concerned with broadcasting a correctly formatted data packet, UWB simulation is an exercise in modeling the fundamental physics that enable its high-precision locationing capabilities. The goal is to generate synthetic data that is not just plausible but is grounded in the principles of radio pulse propagation, timing, and environmental interaction.

### **2.1 Foundational Concepts for Simulation: Precision Through Physics**

Simulating UWB effectively requires a firm grasp of the technology's core operational principles. UWB's precision is not a feature of a data protocol but an emergent property of its physical layer characteristics.

UWB Principles  
Ultra-Wideband is a radio technology defined by its use of an extremely large bandwidth, typically greater than 500 MHz, or at least 20% of its center frequency.23 Instead of modulating a continuous carrier wave like traditional radio systems, UWB transmits a series of very short-duration pulses (often less than 2 nanoseconds).23 This extremely short pulse duration provides a very fine time resolution, which is the key to two of UWB's most important properties:

1. **High Accuracy:** The ability to precisely timestamp the arrival of a pulse enables highly accurate distance measurements.  
2. **Multipath Immunity:** The short duration of the pulses means that reflections of the pulse arriving shortly after the direct-path pulse can be resolved as distinct events rather than causing destructive interference (fading), which plagues narrowband systems.23

Time of Flight (ToF) vs. Time Difference of Arrival (TDOA)  
These are the two primary techniques used to translate UWB's time resolution into spatial location.

* **Time of Flight (ToF):** This is a two-way ranging technique where a device (the "tag") sends a pulse to another device (the "anchor"), which then sends a response. By measuring the total round-trip time and knowing the processing delay at the anchor, the tag can calculate the one-way propagation time and thus its distance from the anchor (distance=time×speed\_of\_light).26 This is accurate but less scalable for systems with many tags.  
* **Time Difference of Arrival (TDOA):** This is the more common and scalable method for implementing a Real-Time Location System (RTLS). In a TDOA system, a tag emits a single UWB pulse, often called a "blink." A set of fixed, time-synchronized anchors in the environment all receive this blink. Because the anchors are at different distances from the tag, they receive the blink at slightly different times. The system measures the *difference* in the arrival times between pairs of anchors. For any given pair of anchors, a constant TDOA value describes a hyperbola in space on which the tag must lie. By using multiple pairs of anchors, the system can generate multiple hyperbolas. The intersection of these hyperbolas provides the precise location of the tag.23 Simulating a TDOA-based RTLS is the primary objective for a convincing multi-anchor UWB demonstration.

IEEE 802.15.4a/z/ab Standards  
These IEEE standards provide the technical specification for the UWB physical (PHY) and media access control (MAC) layers. They define critical parameters that a high-fidelity simulator must be able to model, such as modulation schemes, data rates, and pulse repetition frequencies (PRF). The standards include modes like Base Pulse Repetition Frequency (BPRF) and High Pulse Repetition Frequency (HPRF).23 The 802.15.4z amendment also introduced security enhancements like the Scrambled Timestamp Sequence (STS) to prevent spoofing attacks.23 A simulator that aims for physical accuracy must be capable of generating standard-compliant waveforms.

### **2.2 High-Fidelity Simulation with Specialized Toolkits**

Given the complexity of modeling UWB physics, relying on specialized, high-fidelity simulation toolkits is not just a recommendation but a necessity. These platforms provide pre-built models for UWB waveforms, channel propagation, and signal processing that would be prohibitively complex to develop from scratch.

MATLAB & Simulink  
MATLAB, often paired with Simulink, is the de facto industry standard for the design and simulation of wireless communication systems.

* **Communications Toolbox™ for Zigbee® and UWB Library:** This toolbox is the key enabler for UWB simulation in the MATLAB environment. It provides a rich set of functions and reference examples, shipped as open MATLAB code, for implementing and testing features compliant with the IEEE 802.15.4 standards.23  
* **End-to-End Simulation:** The toolbox facilitates complete end-to-end transceiver simulation. This includes generating standard-compliant HRP UWB waveforms using functions like lrwpanWaveformGenerator, passing these waveforms through sophisticated channel models that simulate multipath and fading, and implementing a practical receiver to decode the signal and estimate performance.23  
* **Localization Examples:** Crucially for this project, MATLAB provides specific, detailed examples that demonstrate how to simulate TDOA-based localization.27 A typical workflow in such an example involves:  
  1. **Network Setup:** Defining the 2D or 3D coordinates of the fixed anchors and the initial position of the mobile tag.  
  2. **Waveform Generation:** Creating a standard-compliant UWB "blink" waveform.  
  3. **Propagation Simulation:** Calculating the true geometric distance from the tag to each anchor and the corresponding true Time of Flight (TOF). The waveform is then delayed by this TOF for each anchor, and Additive White Gaussian Noise (AWGN) is added to simulate a basic channel.  
  4. **TDOA Estimation:** At each simulated anchor, the arrival time of the blink is detected. The TDOA is then calculated as the difference between arrival times at a reference anchor and all other anchors.  
  5. **Position Calculation:** The resulting TDOA measurements are fed into a robust positioning algorithm, such as the one provided by the tdoaposest function in the Phased Array System Toolbox, to compute the final estimated tag location.

PyLayers (Open Source)  
For teams proficient in Python, PyLayers offers a powerful open-source alternative. It is a scientific platform designed specifically for site-specific radio propagation simulation, with a strong focus on indoor localization using UWB.31

* **Site-Specific Approach:** The defining feature of PyLayers is its ray-tracing engine. Instead of using a generic statistical channel model, PyLayers can import a digital representation of a physical environment (e.g., a floor plan in a .ini or .osm file). It then simulates how radio signals propagate through this specific layout, tracing the paths of individual rays as they reflect off walls and pass through materials.33 This approach provides an exceptionally high level of realism for indoor scenarios.  
* **Key Features:** PyLayers includes modules for UWB waveform handling, human mobility simulation (allowing virtual agents to move through the layout), and rich antenna pattern descriptions.31  
* **Simulation Workflow:** A typical localization simulation in PyLayers would involve:  
  1. **Layout Definition:** Creating or importing a layout file that defines the geometry and material properties of the demo environment.  
  2. **Network Placement:** Placing virtual anchors and a mobile agent (tag) within the layout.  
  3. **Mobility Definition:** Defining a trajectory for the agent to follow.  
  4. **Ray-Tracing Simulation:** Running the simulation engine, which calculates the detailed Channel Impulse Response (CIR) for the link between the agent and each anchor at discrete points along its trajectory.  
  5. **Data Extraction:** From the rich CIR data, key parameters like the ToF of the first arriving path can be extracted. This ToF data can then be used to calculate TDOA values, which are fed into the application under test.

Other Simulators  
For applications in the robotics domain, it is worth noting the existence of UWB simulation plugins for the Robot Operating System (ROS). Packages like pozyx\_simulation integrate with the Gazebo physics simulator to provide simulated UWB range measurements between virtual anchors and a robot model, which is highly valuable for testing localization and navigation algorithms for autonomous systems.35

| Platform | Cost | Primary Use Case | Key Features | Ease of Use | Integration Language |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **MATLAB & Simulink** | Licensed | Algorithm Development, PHY/MAC Layer Simulation | Standard-compliant waveform generation, statistical channel models, end-to-end transceiver examples | Moderate (steep learning curve, excellent documentation) | MATLAB, C/C++ |
| **PyLayers** | Open Source | Site-Specific Indoor Propagation & Localization | Ray-tracing engine, mobility modeling, layout import, UWB channel simulation | High (requires deep domain knowledge) | Python |
| **ROS (e.g., pozyx\_simulation)** | Open Source | Robotics, Autonomous Systems Integration | Integration with Gazebo physics simulator, publishes range data on ROS topics | Moderate (requires ROS proficiency) | C++, Python |

### **2.3 Generating Synthetic UWB Positioning Data**

The quality of the simulated UWB data is paramount. Generating this data can be approached in two ways: a "bottom-up" physics-based method that simulates the channel and derives the locationing data, or a "top-down" statistical method that starts with a known location and adds realistic noise.

Modeling the UWB Channel  
The UWB channel is defined by its multipath characteristics. The transmitted pulse travels to the receiver via numerous paths, including a direct path and many reflected paths. The superposition of these arrivals creates the Channel Impulse Response (CIR).36

* **Multipath Propagation:** A common and standardized way to model this is the Saleh-Valenzuela model, which groups multipath components into clusters. This model is implemented in tools like MATLAB's uwbChannel System object and forms the basis of the IEEE 802.15.4a channel models.39  
* **LOS vs. NLOS Conditions:** The most significant factor affecting UWB accuracy is the presence or absence of a clear Line-of-Sight path between the tag and an anchor. NLOS conditions, where the direct path is obstructed, introduce a significant positive bias (the signal takes a longer path) and increased variance in range measurements. A credible simulator *must* model NLOS scenarios to be realistic.28 This can be implemented by detecting when a virtual obstacle is between a tag and anchor and switching to a different error model.

From Ground Truth to Simulated Data  
While a full physics-based simulation generating CIRs offers the highest fidelity, a simpler and often sufficient approach for application development is the statistical method:

1. **Define Ground Truth:** Create a known trajectory for the virtual tag, defined as a series of (x, y, z) coordinates over time.  
2. **Calculate True Distances/TOFs:** At each point in time, calculate the true geometric (Euclidean) distance between the tag and each fixed anchor. Convert these distances to true Times of Flight (TOF=distance/c).  
3. **Calculate True TDOAs:** Select a reference anchor (e.g., Anchor 0). The true TDOA for any other anchor i is TDOAi​=TOFi​−TOF0​.  
4. Inject Realistic Noise: This is the most critical step. Instead of using the true TDOA values, add a random error component drawn from a carefully chosen statistical distribution. The parameters of this distribution should be different for LOS and NLOS conditions.

   TDOAsimulated​=TDOAtrue​+Error  
5. **Feed Data to Application:** The resulting noisy TDOA\_simulated values are what the simulation service provides to the application being demonstrated.

Leveraging Real-World Datasets for Noise Modeling  
To make the injected noise as realistic as possible, it should be based on empirical data. Publicly available academic datasets, such as the UTIAS UWB TDOA Dataset, are invaluable for this purpose.28 These datasets contain extensive real-world UWB measurements collected using commercial modules (like the Decawave DWM1000) under a wide variety of precisely documented LOS and NLOS scenarios (e.g., with obstacles made of wood, metal, cardboard).28 By analyzing the error distributions (the difference between measured TDOA and ground-truth TDOA) from these datasets, one can derive highly realistic parameters (mean, variance, skewness) for the noise models used in the statistical simulator. This data-driven approach ensures that the simulated data reflects the performance and failure modes of actual hardware in complex environments.

## **Section 3: Architectural Design for Integrating Simulated Data**

A successful simulation strategy is not only about generating realistic data but also about integrating that data into the application in a clean, scalable, and forward-looking manner. The architectural choices made at this stage will determine the ease with which the system can transition from the simulator to real hardware, its testability, and its long-term maintainability. The core principle guiding this design should be the aggressive decoupling of the application logic from the data source.

### **3.1 The Hardware Abstraction Layer (HAL) Pattern: Decoupling for Flexibility**

The single most important architectural pattern to adopt for this project is the Hardware Abstraction Layer (HAL). A HAL is an interface-based software layer that isolates the high-level application code from the low-level, hardware-specific implementation details.43 This approach is a direct application of the Dependency Inversion Principle, which states that high-level modules should not depend on low-level modules; both should depend on abstractions.43

By defining a HAL, the application becomes dependent only on a stable, abstract interface, not on the concrete class that happens to be providing the data. This is a strategic investment that pays dividends far beyond the immediate need for simulation.

* **Seamless Switching:** The primary benefit is the ability to switch between data sources with minimal friction. For the demo, the application will be configured to use a SimulatedDataProvider class. When the physical hardware arrives, a RealHardwareProvider class will be developed that implements the exact same interface. The application can be switched over by changing a single line in a configuration or factory file, with zero modification to the core application logic.  
* **Enhanced Testability:** The HAL makes the application inherently more testable. For unit and integration tests, a MockDataProvider can be injected, which provides predictable, canned data to test specific logic paths and edge cases without needing to run the full simulator or connect to hardware.  
* **Future-Proofing and Portability:** If the project later migrates to a different vendor's UWB modules or a new generation of BLE beacons, only the concrete implementation of the HAL needs to be rewritten. The application code, which constitutes the bulk of the intellectual property, remains untouched and stable.

Implementation Guidance  
The implementation of the HAL should be centered around defining clear, technology-agnostic interfaces.

1. **Define Interfaces:** Create abstract classes or interfaces for each type of data provider.  
   * IBeaconProvider: This interface would define methods like startScanning(filter) and stopScanning(), and an event or callback mechanism like onBeaconDiscovered(beaconEvent). The beaconEvent object would be a standardized data structure containing properties like uuid, major, minor, and rssi.  
   * ILocationProvider: This interface would define methods like startTracking(tagId) and stopTracking(tagId), and an event like onLocationUpdate(locationEvent). The locationEvent object would contain the tagId and a standardized position object with x, y, z coordinates.  
2. **Implement Concrete Classes:**  
   * **Simulator Classes:** Create SimulatedBeaconProvider and SimulatedLocationProvider classes that implement these interfaces. These classes will contain the logic for generating synthetic data (as detailed in Sections 1 and 2\) and will invoke the callbacks with the simulated event data.  
   * **Real Hardware Classes (Future):** Later in the project, create RealBeaconProvider and RealLocationProvider classes. These will contain the platform-specific code (e.g., using an Android BLE API or a serial port library to communicate with a UWB module) to interface with the physical hardware.  
3. **Use Dependency Injection:** The application should not instantiate these concrete classes directly. Instead, it should receive an instance of the IBeaconProvider or ILocationProvider interface at runtime through a factory or a dependency injection framework. This inverts the control and completes the decoupling.

### **3.2 Designing a Modular Simulation Service: Isolate the Simulation Logic**

To maintain a clean separation of concerns, the simulation logic itself should not be embedded within the main application's codebase. Instead, it should be encapsulated in a separate, standalone module or microservice. This "Simulation Service" is responsible for managing the state of the virtual world and generating the sensor data.

Architecture and Data Flow  
The Simulation Service acts as the backend for the SimulatedDataProvider classes. The main application, through its HAL implementation, communicates with this service via a well-defined API.

* **Internal State Management:** The service maintains the state of all simulated entities. This includes the positions and properties of virtual beacons, the trajectories and current coordinates of mobile UWB tags, and the parameters of the simulated environment (e.g., path loss exponent, NLOS zones).  
* **Simulation Loop:** The service runs a main loop, typically driven by a timer. In each tick of the loop, it updates the state of the simulated world (e.g., moves a tag along its path), recalculates sensor readings (e.g., determines new RSSI values for all beacons based on the tag's new position), and pushes the updated data to the connected application.  
* **Communication:** The SimulatedDataProvider in the main application can communicate with the Simulation Service in several ways:  
  * **In-Process:** If the simulator is a simple library, it can run in the same process as the application.  
  * **Inter-Process Communication (IPC):** For more complex simulators, running it as a separate process is preferable. Communication can happen via a local WebSocket server, a REST API, or a message queue like MQTT. This architecture mirrors real-world IoT systems where sensors communicate over a network.

Open-source projects like iot-sensor-data-simulator provide excellent examples of this architecture. They offer a self-contained application with a UI for configuration that can send synthetic data to external endpoints like an MQTT broker or an Azure IoT Hub.45 This model allows the main application to simply subscribe to an MQTT topic to receive sensor data, completely unaware of whether the publisher is a real device or a simulator.

### **3.3 Data Ingestion and Transformation Pipelines: Preparing Data for Consumption**

The raw data produced by a sensor or a simulator is rarely in the ideal format for direct use by application logic. A data processing pipeline is needed to abstract, cleanse, and transform this raw data into a rich, application-specific domain model. This can be conceptualized as a miniature Extract-Transform-Load (ETL) pipeline.46

* **Sensor Data Abstraction:** The first step is to define abstract conceptual models that represent the fundamental attributes and behaviors of the sensors, independent of the specific data format from the source.47 For example, a "ProximitySensor" entity might be defined, which can be populated from either BLE RSSI data or UWB range data.  
* **Applying the ETL Pattern:**  
  1. **Extract:** The HAL's concrete implementation (SimulatedDataProvider) "extracts" the raw data from the simulation service. This might be a simple JSON object like {"rssi": \-65} or a more complex array of TDOA values.  
  2. **Transform:** This is the most critical stage. The raw data is transformed into the application's higher-level domain model. This is where business logic is applied. For example:  
     * An RSSI value of \-65 is transformed into a ProximityEvent object with a state of 'near'.  
     * A set of TDOA measurements is passed through a trilateration algorithm to produce a Position object with x, y, z coordinates.  
     * A stream of Position objects might be analyzed to generate a MovementEvent with properties like speed and direction.  
  3. **Load:** The transformed, application-ready domain object is "loaded" into the application's state management system by invoking the HAL's onBeaconDiscovered or onLocationUpdate callback.

This entire flow can be effectively modeled using an event-driven architecture. The simulation service is the **event producer**, generating raw sensor events. The HAL and transformation layer act as the **event router**, processing and enriching these events. The various UI components and business logic modules of the application are the **event consumers**, reacting to the high-level, transformed events.48 This architecture ensures that components are loosely coupled, independently testable, and can evolve without causing cascading changes throughout the system.

## **Section 4: Bridging the Gap: Simulation Fidelity and Demonstration Strategy**

While simulation is a powerful and necessary tool, it is an approximation of reality. Acknowledging and strategically managing the gap between the simulated model and the physical world is crucial for both technical accuracy and for delivering a credible and successful demonstration. This section provides a critical analysis of the limitations of simulation and offers best practices for presenting the simulated system to stakeholders.

### **4.1 Acknowledging the Simulation-Reality Gap: A Comparative Analysis**

The fidelity of a simulation is limited by the complexity of the phenomena it attempts to model. For wireless systems like BLE and UWB, the real world introduces a host of variables that are difficult, if not impossible, to replicate perfectly in software.

**BLE Performance**

* **Ideal vs. Real Chipsets:** A significant discrepancy arises from the behavior of the BLE chipsets themselves. Simulations are often based on the ideal behavior described in the Bluetooth Core Specification. However, empirical studies of off-the-shelf hardware have revealed non-ideal behaviors, most notably the presence of unexpected "scanning gaps" where the receiver momentarily stops listening, even during a supposedly continuous scan. These gaps are not part of the standard but are artifacts of the chipset's implementation and can severely degrade the speed and reliability of device discovery. A simulation that does not account for these non-idealities will produce overly optimistic results for discovery latency.1  
* **Environmental Factors:** The 2.4 GHz spectrum is notoriously noisy. Real-world BLE range and reliability are heavily impacted by co-channel interference from Wi-Fi networks, which can cause packet loss, and by multipath fading caused by RF signals reflecting off surfaces.21 While a simulation can model path loss, it typically cannot replicate the chaotic and unpredictable nature of RF interference in a crowded environment. A simulated RSSI curve may show a smooth decay with distance, whereas a real signal will be far more erratic.49  
* **Throughput and Power Consumption:** The theoretical maximum throughput of BLE is rarely achieved in practice due to protocol overhead, application processing delays, and the limitations of the specific BLE stack being used.50 Similarly, while BLE is low-energy, the power consumption of a real device is a complex equation involving not just the radio but also processors, displays, and other peripherals, which a simple BLE simulation will not capture.52

**UWB Performance**

* **Clock Drift and Synchronization:** TDOA-based localization, the cornerstone of UWB RTLS, depends on the assumption that the clocks of all fixed anchors are perfectly synchronized. In reality, the inexpensive crystal oscillators used in commercial UWB modules drift relative to one another. This clock drift is a primary source of error and must be continuously compensated for using sophisticated algorithms like Kalman filters. Simulating the nuanced, temperature-dependent drift of multiple oscillators and the corresponding correction algorithms is a highly complex task that is often abstracted away in simpler models.53  
* **NLOS and Multipath Complexity:** While simulators can model a binary LOS/NLOS state, the real world is far more complex. The effect of an NLOS obstruction depends heavily on its material composition (e.g., drywall vs. concrete vs. metal) and its precise geometry. Multipath reflections create a complex Channel Impulse Response (CIR) that can distort the UWB pulse and make it difficult for the receiver to identify the true first-path arrival time, leading to significant errors. Real-world accuracy can degrade from a claimed 10-30 cm in ideal LOS conditions to well over a meter in challenging NLOS environments.41  
* **Antenna Effects:** The physical antenna plays a crucial role in shaping the transmitted UWB pulse and in its reception. The antenna's orientation and frequency response can introduce distortions that affect timing accuracy. Most simulations treat the antenna as an ideal isotropic point source, ignoring these real-world effects that can impact performance.56

The fundamental difference between simulators, emulators, and real devices is the level of hardware interaction. Simulators are software-specific and fast but cannot test hardware-dependent features. Emulators mimic hardware but are slower and still lack access to physical sensors. Only testing on real devices can provide authentic feedback on RF performance, battery life, and overall system behavior under real-world conditions.58

| Parameter | Simulated Behavior | Real-World Behavior | Key Delta & Impact | Mitigation / Demo Narrative |
| :---- | :---- | :---- | :---- | :---- |
| **BLE Discovery Latency** | Predictable, based on advertising interval and simulated scan window. | Higher and more variable due to chipset scanning gaps and RF interference.1 | Simulation will appear more responsive. Real-world discovery may feel sluggish in crowded RF environments. | "This demonstrates the application's discovery logic. Production performance will be optimized based on site surveys and hardware selection." |
| **BLE Proximity Accuracy (RSSI)** | Smoothly varying RSSI based on a path loss model. | Noisy and fluctuating RSSI due to multipath fading and interference.49 | Simulated proximity zones will be stable. Real-world proximity may flicker between 'near' and 'far' at zone boundaries. | "We are simulating a user moving through the space. The application uses this proximity data to trigger context-aware content." |
| **UWB Positional Accuracy (LOS)** | Limited only by the injected noise model, often sub-10 cm. | Typically 10-30 cm, affected by clock drift, antenna orientation, and minor multipath.54 | Simulation may appear unrealistically precise. | "The simulation demonstrates centimeter-level accuracy, consistent with UWB performance in ideal line-of-sight conditions." |
| **UWB Positional Accuracy (NLOS)** | Follows a statistical model, e.g., adding a 1-meter bias and higher variance. | Highly variable (0.5 m to several meters error), dependent on obstacle material and geometry.41 | Simulation provides a simplified, predictable error. Real-world NLOS is a major source of large, unpredictable "jumps" in location. | "Here, we simulate the tag moving behind an obstruction, showing how the application handles a temporary reduction in accuracy." |
| **Multi-Device Scalability** | Limited only by CPU/memory. Can simulate thousands of devices perfectly. | Limited by RF channel capacity. Packet collisions increase with device density, degrading performance for all devices.22 | Simulation can mask the real-world challenges of deploying a high-density beacon or tag network. | "The architecture is designed to scale. This simulation shows the system processing data from 50 virtual devices." |

### **4.2 Best Practices for a Compelling Demonstration**

The goal of the demonstration is to showcase the value and functionality of the software application. The simulation is a means to that end. The strategy for the demo should leverage the strengths of simulation while being transparent about its limitations.

* **Be Transparent, Not Deceptive:** Begin the demonstration by explicitly stating that the hardware layer is being simulated due to procurement delays. Frame this positively. This is not a weakness but a testament to a robust, decoupled architecture that allows for parallel development and comprehensive testing. This immediately builds credibility and preempts questions about the data source.  
* **Focus on the Application's Value:** The audience is interested in what the application *does* with location data, not the minutiae of the data source itself. Steer the narrative towards the user experience, the business logic, the data analytics, and the problems the application solves. For example, instead of saying "The simulated beacon is now broadcasting," say "When a customer enters the electronics department, the application receives a proximity alert and presents them with a relevant daily special."  
* **Control the Narrative with Scenarios:** One of the greatest advantages of simulation over a live hardware demo is its predictability and repeatability.60 Design a clear, scripted set of scenarios that tell a compelling story about the application's use. For example: "First, we'll simulate an asset tag moving along the assembly line. Notice how the dashboard tracks its progress through each stage in real-time. Next, we'll simulate the asset being moved into a restricted area, which, as you can see, triggers an immediate security alert." This controlled narrative is far more effective than a live demo that might be derailed by unpredictable RF issues.  
* **Visualize the Simulation State:** To make the simulation more tangible and understandable, consider adding a simple "God view" panel to the demonstration UI. This could be a 2D map showing the virtual positions of the anchors and the animated movement of the simulated UWB tag, or a live graph plotting the dynamic RSSI of a simulated beacon. This visualization helps the audience connect the simulated physical events to the application's response, making the entire demonstration more intuitive and engaging.  
* **Set Realistic Performance Expectations:** Use the insights from the simulation-reality gap analysis to proactively and professionally manage expectations about the final product's performance. When showcasing high-precision UWB tracking, for instance, it is prudent to state: "The sub-30cm accuracy you see here is based on a simulated line-of-sight environment. Final production accuracy in operationally complex areas will be determined and optimized following a comprehensive physical site survey." This demonstrates technical foresight and an understanding of real-world deployment challenges.

## **Conclusion & Recommendations**

The absence of physical hardware presents a challenge, but also an opportunity to build a more robust, testable, and architecturally sound system. By adopting a strategic approach to simulation, the development team can not only meet the immediate goal of delivering a successful application demonstration but also establish a foundation for long-term engineering excellence.

This report has detailed a comprehensive strategy for simulating both BLE and UWB systems. The core recommendations are as follows:

1. **Adopt a Tiered Simulation Approach:**  
   * **For BLE:** Begin with mobile simulator applications for rapid, manual UI and workflow validation. Concurrently, develop a programmatic simulator using Node.js (with node-beacon-scanner) or Python (leveraging ubeacon and bleak) for automated testing and for simulating dynamic RSSI using a log-distance path loss model.  
   * **For UWB:** Invest in a high-fidelity toolkit. MATLAB is the recommended choice for teams focused on algorithm development and PHY-layer analysis. PyLayers is the superior open-source option for creating highly realistic, site-specific indoor localization scenarios. For simpler needs, a statistical data generator informed by public datasets like UTIAS offers a pragmatic path forward.  
2. **Prioritize the Hardware Abstraction Layer (HAL):** The implementation of a HAL is the most critical architectural decision. It is not a temporary fix but a permanent feature that will decouple the application from the data source. This will ensure a seamless transition to physical hardware, dramatically improve the system's testability, and provide long-term flexibility. This is a non-negotiable best practice.  
3. **Build a Modular, Configurable Simulation Service:** The simulation logic should be isolated from the main application. This service should be designed to be configurable, allowing for the easy creation of different scenarios (e.g., varying numbers of devices, different tag trajectories, distinct environmental models) to support a range of demonstration narratives and testing requirements.  
4. **Manage the Demonstration Strategically:** Be transparent about the use of simulation. Focus the narrative on the application's features and the value it delivers. Leverage the predictability of the simulator to tell a clear and compelling story. Use the known limitations of simulation to proactively and professionally set realistic expectations for the performance of the final, deployed system.

Ultimately, the simulation framework developed to overcome this short-term hardware shortage should be viewed as a permanent asset. It will prove invaluable for future regression testing, enabling the team to validate application changes without requiring a full hardware testbed. It will accelerate the onboarding of new developers by providing them with a self-contained environment to work in. Finally, it can be integrated into a Continuous Integration/Continuous Deployment (CI/CD) pipeline, allowing for automated validation of every code commit. By embracing simulation as a core engineering practice, the team can convert a potential roadblock into a catalyst for building a higher-quality, more resilient system.

#### **Works cited**

1. Analytical and Experimental Performance Evaluation of BLE ..., accessed September 23, 2025, [https://pmc.ncbi.nlm.nih.gov/articles/PMC5375785/](https://pmc.ncbi.nlm.nih.gov/articles/PMC5375785/)  
2. Developing Beacons with Bluetooth ® Low Energy BLE Technology \- Silicon Labs, accessed September 23, 2025, [https://www.silabs.com/whitepapers/developing-beacons-with-bluetooth-low-energy-technology](https://www.silabs.com/whitepapers/developing-beacons-with-bluetooth-low-energy-technology)  
3. Learn How To Build A BLE App In 5 Easy Steps | MindBowser, accessed September 23, 2025, [https://www.mindbowser.com/how-to-build-a-ble-app/](https://www.mindbowser.com/how-to-build-a-ble-app/)  
4. The Beacons App \- Gluon Documentation, accessed September 23, 2025, [https://docs.gluonhq.com/samples/beacons](https://docs.gluonhq.com/samples/beacons)  
5. Mobile BLE Beacon Software \- Tracerplus, accessed September 23, 2025, [https://www.tracerplus.com/software/develop/mobile-ble-beacon-software/](https://www.tracerplus.com/software/develop/mobile-ble-beacon-software/)  
6. sandeepmistry/node-bleacon: A Node.js library for creating ... \- GitHub, accessed September 23, 2025, [https://github.com/sandeepmistry/node-bleacon](https://github.com/sandeepmistry/node-bleacon)  
7. Eddystone Support \- Android Beacon Library, accessed September 23, 2025, [https://altbeacon.github.io/android-beacon-library/eddystone-support.html](https://altbeacon.github.io/android-beacon-library/eddystone-support.html)  
8. Eddystone-EID Support \- Android Beacon Library, accessed September 23, 2025, [https://altbeacon.github.io/android-beacon-library/eddystone-eid.html](https://altbeacon.github.io/android-beacon-library/eddystone-eid.html)  
9. Beacon Simulator on the App Store, accessed September 23, 2025, [https://apps.apple.com/us/app/beacon-simulator/id1380778696](https://apps.apple.com/us/app/beacon-simulator/id1380778696)  
10. Beacon Simulator on the App Store, accessed September 23, 2025, [https://apps.apple.com/ca/app/beacon-simulator/id1380778696](https://apps.apple.com/ca/app/beacon-simulator/id1380778696)  
11. Beacon Simulator 1.5.1 Free Download, accessed September 23, 2025, [https://beacon-simulator.soft112.com/](https://beacon-simulator.soft112.com/)  
12. WebBluetoothCG/ble-test-peripheral-android: A BLE ... \- GitHub, accessed September 23, 2025, [https://github.com/WebBluetoothCG/ble-test-peripheral-android](https://github.com/WebBluetoothCG/ble-test-peripheral-android)  
13. Eddystone-URL \- Apps on Google Play, accessed September 23, 2025, [https://play.google.com/store/apps/details?id=edu.umich.eecs.lab11.eddystone](https://play.google.com/store/apps/details?id=edu.umich.eecs.lab11.eddystone)  
14. futomi/node-beacon-scanner \- GitHub, accessed September 23, 2025, [https://github.com/futomi/node-beacon-scanner](https://github.com/futomi/node-beacon-scanner)  
15. Node Beacon Scanner – BeaconZone Blog, accessed September 23, 2025, [https://www.beaconzone.co.uk/blog/node-beacon-scanner/](https://www.beaconzone.co.uk/blog/node-beacon-scanner/)  
16. Python – BeaconZone Blog, accessed September 23, 2025, [https://www.beaconzone.co.uk/blog/category/python/](https://www.beaconzone.co.uk/blog/category/python/)  
17. BeaconTools Python Library – BeaconZone Blog, accessed September 23, 2025, [https://www.beaconzone.co.uk/blog/beacontools-python-library/](https://www.beaconzone.co.uk/blog/beacontools-python-library/)  
18. rroemhild/ubeacon: MicroPython library for encode and decode BLE beacons \- GitHub, accessed September 23, 2025, [https://github.com/rroemhild/ubeacon](https://github.com/rroemhild/ubeacon)  
19. End-to-End Bluetooth LE PHY Simulation Using Path Loss Model, RF Impairments, and AWGN \- MATLAB & Simulink \- MathWorks, accessed September 23, 2025, [https://www.mathworks.com/help/bluetooth/ug/end-to-end-bluetooth-le-phy-simulation-using-path-loss-model-rf-impairments-and-awgn.html](https://www.mathworks.com/help/bluetooth/ug/end-to-end-bluetooth-le-phy-simulation-using-path-loss-model-rf-impairments-and-awgn.html)  
20. BLE signal strength heat-map (200 m by 40 m) \- ResearchGate, accessed September 23, 2025, [https://www.researchgate.net/figure/BLE-signal-strength-heat-map-200-m-by-40-m\_fig2\_337873215](https://www.researchgate.net/figure/BLE-signal-strength-heat-map-200-m-by-40-m_fig2_337873215)  
21. Limitations of BLE in smart home \- Developex, accessed September 23, 2025, [https://developex.com/blog/limitations-of-ble-in-smart-home/](https://developex.com/blog/limitations-of-ble-in-smart-home/)  
22. BLE Simulator \- Learning Bluetooth \- INRIA gitlab, accessed September 23, 2025, [https://gitlab.inria.fr/learning-bluetooth/ble\_simulator](https://gitlab.inria.fr/learning-bluetooth/ble_simulator)  
23. UWB: Ultra-wideband \- MATLAB & Simulink \- MathWorks, accessed September 23, 2025, [https://www.mathworks.com/discovery/ultra-wideband.html](https://www.mathworks.com/discovery/ultra-wideband.html)  
24. A Comprehensive Overview on UWB Radar: Applications, Standards, Signal Processing Techniques, Datasets, Radio Chips, Trends and \- arXiv, accessed September 23, 2025, [https://arxiv.org/pdf/2402.05649](https://arxiv.org/pdf/2402.05649)  
25. Ultra-Wideband Technology (UWB): The Most Accurate Real-Time Location Data, accessed September 23, 2025, [https://www.sewio.net/uwb-technology/](https://www.sewio.net/uwb-technology/)  
26. Ultra wideband products \- STMicroelectronics, accessed September 23, 2025, [https://www.st.com/en/wireless-connectivity/ultra-wideband-products.html](https://www.st.com/en/wireless-connectivity/ultra-wideband-products.html)  
27. UWB Localization Using IEEE 802.15.4z \- MATLAB & Simulink \- MathWorks, accessed September 23, 2025, [https://www.mathworks.com/help/comm/ug/uwb-localization-using-ieee-802.15.4z.html](https://www.mathworks.com/help/comm/ug/uwb-localization-using-ieee-802.15.4z.html)  
28. UTIL: Ultra-wideband Dataset \- GitHub Pages, accessed September 23, 2025, [https://utiasdsl.github.io/util-uwb-dataset/](https://utiasdsl.github.io/util-uwb-dataset/)  
29. Deploying APs for optimal UWB performance \- Cisco Spaces, accessed September 23, 2025, [https://spaces.cisco.com/beyond-connectivity-deploying-for-location-success/](https://spaces.cisco.com/beyond-connectivity-deploying-for-location-success/)  
30. UWB \- MATLAB & Simulink \- MathWorks, accessed September 23, 2025, [https://www.mathworks.com/help/comm/uwb.html](https://www.mathworks.com/help/comm/uwb.html)  
31. PyLayers is a Python platform for Site Specific Radio Propagation Simulation for Evaluating Indoor Localization algorithms using UWB radio signals including Human Indoor Mobility \- GitHub, accessed September 23, 2025, [https://github.com/pylayers/pylayers](https://github.com/pylayers/pylayers)  
32. PyLayers : Propagation and Localization Simulator, accessed September 23, 2025, [https://pylayers.github.io/pylayers/](https://pylayers.github.io/pylayers/)  
33. PyLayers: An open source dynamic simulator for indoor propagation and localization, accessed September 23, 2025, [https://www.researchgate.net/publication/261525520\_PyLayers\_An\_open\_source\_dynamic\_simulator\_for\_indoor\_propagation\_and\_localization](https://www.researchgate.net/publication/261525520_PyLayers_An_open_source_dynamic_simulator_for_indoor_propagation_and_localization)  
34. 1\. What is PyLayers about ? — Python 1 documentation \- GitHub Pages, accessed September 23, 2025, [http://pylayers.github.io/pylayers/notebook/UserManual.html](http://pylayers.github.io/pylayers/notebook/UserManual.html)  
35. UWB Simulation \- Projects \- Open Robotics Discourse, accessed September 23, 2025, [https://discourse.openrobotics.org/t/uwb-simulation/16351](https://discourse.openrobotics.org/t/uwb-simulation/16351)  
36. Window-Based Channel Impulse Response Prediction for Time-Varying Ultra-Wideband Channels | PLOS One \- Research journals, accessed September 23, 2025, [https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0164944](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0164944)  
37. Exploiting Ultra-Wideband Channel Impulse Responses for Device-Free Localization \- MDPI, accessed September 23, 2025, [https://www.mdpi.com/1424-8220/22/16/6255](https://www.mdpi.com/1424-8220/22/16/6255)  
38. Ultra-Wide-Band Propagation Channels, accessed September 23, 2025, [https://wides.usc.edu/Updated\_pdf/molisch2009.pdf](https://wides.usc.edu/Updated_pdf/molisch2009.pdf)  
39. An Ultra Wide Band Simulator Using MATLAB/Simulink \- UNL Digital Commons, accessed September 23, 2025, [https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1058\&context=computerelectronicfacpub](https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1058&context=computerelectronicfacpub)  
40. uwbChannel \- Filter input signal through UWB IEEE 802.15.4 a/z/ab channel \- MATLAB, accessed September 23, 2025, [https://www.mathworks.com/help/comm/ref/uwbchannel-system-object.html](https://www.mathworks.com/help/comm/ref/uwbchannel-system-object.html)  
41. Design of the UWB Positioning System Simulator for LOS/NLOS ..., accessed September 23, 2025, [https://pmc.ncbi.nlm.nih.gov/articles/PMC8309887/](https://pmc.ncbi.nlm.nih.gov/articles/PMC8309887/)  
42. UTIL: An Ultra-Wideband Time-Difference-of-Arrival Indoor Localization Dataset \- arXiv, accessed September 23, 2025, [https://arxiv.org/html/2203.14471v5](https://arxiv.org/html/2203.14471v5)  
43. How to Write Epic Hardware Abstraction Layers (HAL) in C | Beningo Embedded Group, accessed September 23, 2025, [https://www.beningo.com/how-to-write-epic-hardware-abstraction-layers-hal-in-c/](https://www.beningo.com/how-to-write-epic-hardware-abstraction-layers-hal-in-c/)  
44. What is a Hardware Abstraction Layer and How Does it Work? \- Lenovo, accessed September 23, 2025, [https://www.lenovo.com/us/en/glossary/hardware-abstraction-layer/](https://www.lenovo.com/us/en/glossary/hardware-abstraction-layer/)  
45. antonsarg/iot-sensor-data-simulator \- GitHub, accessed September 23, 2025, [https://github.com/antonsarg/iot-sensor-data-simulator](https://github.com/antonsarg/iot-sensor-data-simulator)  
46. Eight Data Pipeline Design Patterns for Data Engineers \- Datalere, accessed September 23, 2025, [https://datalere.com/articles/data-pipeline-design-patterns](https://datalere.com/articles/data-pipeline-design-patterns)  
47. Abstract Entity Patterns for Sensors and Actuators \- Encyclopedia.pub, accessed September 23, 2025, [https://encyclopedia.pub/entry/44530](https://encyclopedia.pub/entry/44530)  
48. Building event-driven architectures with IoT sensor data \- AWS, accessed September 23, 2025, [https://aws.amazon.com/blogs/architecture/building-event-driven-architectures-with-iot-sensor-data/](https://aws.amazon.com/blogs/architecture/building-event-driven-architectures-with-iot-sensor-data/)  
49. Maximizing BLE Range \- Argenox, accessed September 23, 2025, [https://argenox.com/library/bluetooth-low-energy/maximizing-bluetooth-low-energy-ble-range](https://argenox.com/library/bluetooth-low-energy/maximizing-bluetooth-low-energy-ble-range)  
50. Simulation of Network-Level Performance for Bluetooth Low Energy, accessed September 23, 2025, [http://cc.oulu.fi/\~kmikhayl/site-assets/pdfs/2014\_PIMRC1.pdf](http://cc.oulu.fi/~kmikhayl/site-assets/pdfs/2014_PIMRC1.pdf)  
51. Performance Analysis and Comparison of Bluetooth Low Energy with IEEE 802.15.4 and SimpliciTI \- MDPI, accessed September 23, 2025, [https://www.mdpi.com/2224-2708/2/3/589](https://www.mdpi.com/2224-2708/2/3/589)  
52. Understanding the Limitations of BLE in Wearable Devices \- Developex, accessed September 23, 2025, [https://developex.com/blog/limitations-of-ble-in-wearables/](https://developex.com/blog/limitations-of-ble-in-wearables/)  
53. Evaluation and Simulation of Ultra-Wide Band (UWB) Transceiver Timebases \- MDPI, accessed September 23, 2025, [https://www.mdpi.com/2673-4591/88/1/40](https://www.mdpi.com/2673-4591/88/1/40)  
54. Evaluation and Comparison of Ultrasonic and UWB Technology for Indoor Localization in an Industrial Environment \- PMC, accessed September 23, 2025, [https://pmc.ncbi.nlm.nih.gov/articles/PMC9026763/](https://pmc.ncbi.nlm.nih.gov/articles/PMC9026763/)  
55. Ultra-wideband indoor positioning and navigation system \- Marvelmind Robotics, accessed September 23, 2025, [https://marvelmind.com/download/uwb\_positioning/](https://marvelmind.com/download/uwb_positioning/)  
56. Wi-PoS: A Low-Cost, Open Source Ultra-Wideband (UWB) Hardware Platform with Long Range Sub-GHz Backbone \- PubMed Central, accessed September 23, 2025, [https://pmc.ncbi.nlm.nih.gov/articles/PMC6480456/](https://pmc.ncbi.nlm.nih.gov/articles/PMC6480456/)  
57. Ultra-wideband (UWB) transmitter location using time difference of arrival (TDOA) techniques | Request PDF \- ResearchGate, accessed September 23, 2025, [https://www.researchgate.net/publication/4071907\_Ultra-wideband\_UWB\_transmitter\_location\_using\_time\_difference\_of\_arrival\_TDOA\_techniques](https://www.researchgate.net/publication/4071907_Ultra-wideband_UWB_transmitter_location_using_time_difference_of_arrival_TDOA_techniques)  
58. Emulator vs Simulator vs Real Device: A Detailed Comparison \- TestGrid, accessed September 23, 2025, [https://testgrid.io/blog/emulator-vs-simulator-vs-real-device/](https://testgrid.io/blog/emulator-vs-simulator-vs-real-device/)  
59. Precise Indoor Positioning is finally here thanks to Ultra-wideband RTLS | Locatify, accessed September 23, 2025, [https://locatify.com/in-practice-precise-indoor-location-detection-with-uwb-ultra-wideband/](https://locatify.com/in-practice-precise-indoor-location-detection-with-uwb-ultra-wideband/)  
60. Generate Synthetic and Simulated Data for Evaluation \- Azure AI Foundry | Microsoft Learn, accessed September 23, 2025, [https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/develop/simulator-interaction-data](https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/develop/simulator-interaction-data)