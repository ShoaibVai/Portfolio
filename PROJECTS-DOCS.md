# Project Documentation (Consolidated)

Portfolio & Resume–Ready Summaries

Use the bullets below directly in your portfolio, CV, and resume. Each entry includes a one-line pitch, your role, highlights, tech stack, and keywords.

AR-Measurement — Mobile AR Measuring App (Concept)
- Role: Solo Unity developer
- Highlights:
  - Designed an AR measuring experience: plane detection, anchor placement, live distance readouts, unit toggle, and snapshot overlay (design/prototype stage)
  - Defined build targets and AR Foundation setup for Android/iOS
- Tech: Unity 2022.3 LTS, AR Foundation, ARCore/ARKit, TextMesh Pro, UGUI
- Keywords: AR, measurement, anchors, mobile, UX prototyping

AR_outdoor_Navi — GPS-based AR Outdoor Navigation
- Role: Unity AR developer
- Highlights:
  - Integrated ARLocation for GPS/world-anchored content and location UI
  - Implemented smooth UI/transform animations with DOTween (`DoMove.cs`, `OnMoveEnd` events)
  - Organized scene (`SimpleRound.unity`) and prefabs for map/location UI
- Tech: Unity 2022.3.62f1, ARLocation, DOTween, TextMesh Pro, UGUI
- Keywords: AR, GPS/Location, DOTween, mobile AR, UI/UX

AR_RPG_Multiplayer — AR-Ready RPG with Firebase and Multiplayer Hooks
- Role: Unity gameplay/infra developer
- Highlights:
  - Initialized Firebase and External Dependency Manager (EDM4U) for Android/iOS
  - Implemented main menu, joystick controls, and weapon switching logic
  - Prepared network object lists/prefabs for future multiplayer features
  - References Niantic Lightship ARDK (local .tgz) for advanced AR capabilities
- Tech: Unity 2022.3.62f1, Firebase, EDM4U, TextMesh Pro, UGUI, (Lightship ARDK references)
- Keywords: AR, Firebase, gameplay systems, input/joystick, multiplayer-ready

Claw_Machine — Arcade Claw Game (WebGL/Mobile)
- Role: Unity game developer
- Highlights:
  - Built a polished arcade claw game with URP visuals, SFX, and UI feedback
  - Produced a WebGL build (`Builds (WP)/index.html`) for easy sharing
  - Organized asset pipeline: animations, audio, prefabs, and scenes
- Tech: Unity 2022.3.62f1, URP 14.x, TextMesh Pro, UGUI
- Keywords: WebGL, casual game, URP, UI/UX, 2D/3D animation

CoWork360—Multiplayer XR — Collaborative XR with Voice & Netcode
- Role: XR/Networking developer
- Highlights:
  - Set up Netcode for GameObjects with Unity Transport for multiplayer sessions
  - Integrated Unity Services (Auth, Multiplayer) and Vivox for voice chat
  - Configured XRI locomotion/interaction with OpenXR/SteamVR runtimes; XR Hands support
  - Curated multiple sample scenes for demos and testing
- Tech: Unity 6000.0.34f1, Netcode for GameObjects, Unity Transport, Unity Services, Vivox, XRI, XR Hands, OpenXR/Oculus/SteamVR
- Keywords: XR, multiplayer, voice chat, OpenXR, interaction toolkit

CrickeTgame — CLI Cricket Mini-game
- Role: Python developer
- Highlights:
  - Implemented toss, bat/bowl selection, overs/wickets, ball-by-ball inputs, and target chases
  - Added replay loop and basic input validation with cross-platform terminal clear
- Tech: Python 3.x (standard library)
- Keywords: CLI game, control flow, input handling

RkPprScisor — CLI Rock–Paper–Scissors
- Role: Python developer
- Highlights:
  - Built configurable multi-round RPS with running score and replay
  - Structured logic for round outcomes and simple UX feedback
- Tech: Python 3.x (standard library)
- Keywords: CLI game, randomness, state management

CustomerCareAI — NPC AI Chatbot with Local LLM Integration
- Role: Python developer
- Highlights:
  - Integrated project with LM Studio for local LLM hosting, removing heavy dependencies like transformers and torch
  - Implemented HTTP requests to LM Studio endpoint with OpenAI-compatible API
  - Created configuration system for easy parameter changes and error handling with fallbacks
  - Built web interface with Flask server for chatbot interaction
- Tech: Python 3.x, Flask, requests, LM Studio
- Keywords: AI, chatbot, local LLM, integration, web app

server_batch_downloader — HTTP/FTP Batch Downloader with PyQt5 GUI
- Role: Python developer
- Highlights:
  - Developed modern PyQt5 GUI with multiple themes and tabbed interface for batch downloading
  - Implemented concurrent downloads, pause/resume/cancel/retry, and real-time progress tracking
  - Added smart directory tree browsing, disk space checks, and percent-decoding for local files
  - Configured robust error handling and settings management
- Tech: Python 3.7+, PyQt5, requests, beautifulsoup4
- Keywords: GUI, batch downloader, HTTP/FTP, PyQt5, concurrent downloads

Quick copy snippets for your resume
- AR_outdoor_Navi: Built a GPS-based AR navigation demo in Unity (2022.3) using ARLocation and DOTween; delivered location UI, world-anchored content, and smooth tweened interactions.
- CoWork360—Multiplayer XR: Implemented XR interaction and multiplayer using Netcode for GameObjects, OpenXR/SteamVR, and Vivox voice; set up Unity Services authentication and transport.
- Claw_Machine: Shipped a WebGL arcade claw game with URP visuals, animation-driven feedback, and organized asset pipeline for quick builds.
- AR_RPG_Multiplayer: Integrated Firebase/EDM4U, joystick input, and weapon systems; prepared network-ready prefabs and referenced Lightship ARDK for AR expansion.
- CrickeTgame / RkPprScisor: Created CLI mini-games in Python with replay loops, input validation, and clean control flow.
- CustomerCareAI: Built an NPC AI chatbot in Python integrated with LM Studio for local LLM, featuring web interface, configuration system, and error handling.
- server_batch_downloader: Created a PyQt5 GUI application for batch downloading from HTTP/FTP servers with themes, concurrent downloads, and progress tracking.

—

This document also includes detailed notes below for deeper context if you need to expand portfolio write-ups.

## Index
- AR-Measurement
- AR_outdoor_Navi
- AR_RPG_Multiplayer
- Claw_Machine
- CoWork360--Multiplayer
- CrickeTgame (Python)
- RkPprScisor (Python)
- CustomerCareAI (Python)
- server_batch_downloader (Python)

---

## AR-Measurement
- Type: Unity AR concept (docs only in this folder).
- Unity: Recommended 2022.3 LTS.
- Goal: Place anchors, measure distances/areas.
- Setup: Create a Unity project with AR Foundation, ARCore/ARKit; implement tap-to-place and distance calculations.
- Platforms: Android/iOS AR-capable devices.
- License: See repo LICENSE.

## AR_outdoor_Navi
- Type: Unity AR outdoor navigation demo.
- Unity Version: 2022.3.62f1.
- Core Packages: com.unity.feature.ar, ARLocation (Assets/ARLocation), TextMeshPro, UGUI, DOTween.
- Key Scene: Assets/SimpleRound.unity.
- Important Script: Assets/DoMove.cs (uses DG.Tweening to animate transforms).
- Setup:
  1. Open in Unity 2022.3.62f1.
  2. Ensure DOTween installed and set up; enable ARCore/ARKit via XR Plug-in Management.
  3. For GPS, test on device and grant location permissions.
- Notes: DoMove uses DOLocalMove forward and DOMove on reset; mind parent space.

## AR_RPG_Multiplayer
- Type: Unity AR/multiplayer-ready project with Firebase integration.
- Unity Version: 2022.3.62f1.
- Notable Assets: Firebase, ExternalDependencyManager, Joystick Pack.
- Scripts: FirebaseInit.cs, MainMenuScript.cs, WeaponSwitch.cs.
- Setup:
  1. Open with Unity 2022.3.62f1.
  2. Provide google-services.json (Android) and iOS config; run EDM4U to resolve dependencies.
  3. Configure XR if using AR features.
- Build: Select a scene in Assets/Scenes and build for your target.

## Claw_Machine
- Type: Unity arcade claw game with WebGL build.
- Unity Version: 2022.3.62f1; URP 14.x.
- Web build: Builds (WP)/index.html and Build/.
- Run: Serve the WebGL folder over HTTP; or open in Unity and press Play.
- Build Targets: WebGL, Android, iOS.

## CoWork360--Multiplayer
- Type: Unity XR multiplayer collaboration project.
- Unity Version: 6000.0.34f1.
- Key Packages: Netcode for GameObjects, Unity Transport, Unity Services (Auth, Multiplayer, Vivox), XRI, XR Hands, OpenXR, Oculus, SteamVR plugin.
- Scenes: Assets/Scenes/SampleScene.unity, BasicScene.unity, gAPI+TL.unity.
- Setup:
  1. Open with Unity 6000.0.34f1.
  2. Enable OpenXR and configure runtime (OpenXR/Oculus/SteamVR).
  3. Configure Services and credentials.
  4. Optional: adjust local path packages (Whisper/OpenVR) if missing.
- Build: PCVR targeting OpenXR/Oculus; ensure transport and relay settings.

## CrickeTgame (Python)
- Type: CLI cricket mini-game.
- Language: Python 3.x.
- Features: Toss, choose to bat/bowl, overs and wickets, per-ball inputs, target chases, replay loop.
- Run: `python main.py`.
- Notes: Clears screen between rounds (cls/clear). Handles invalid input with retries.

## RkPprScisor (Python)
- Type: CLI Rock-Paper-Scissors.
- Language: Python 3.x.
- Features: Configurable rounds, running score, replay.
- Run: `python main.py`.

## CustomerCareAI (Python)
- Type: Python web app with AI chatbot.
- Language: Python 3.x.
- Features: Integration with LM Studio for local LLM, web interface, configuration system, error handling.
- Run: `python server.py`.
- Notes: Requires LM Studio running locally at configured endpoint.

## server_batch_downloader (Python)
- Type: Python GUI application for batch downloading.
- Language: Python 3.7+.
- Features: PyQt5 GUI, HTTP/FTP support, concurrent downloads, themes, settings.
- Run: `python main.py`.
- Notes: Install dependencies from requirements.txt.

---

## Troubleshooting
- Unity version mismatches can re-import or break packages. Use the exact versions listed above.
- For WebGL, serve over HTTP to avoid CORS issues.
- For AR GPS, test on real device; editor play mode won’t access real GPS.

## Licenses
Each project contains its own LICENSE file if provided. Respect third-party asset licenses (ARLocation, DOTween, Firebase, SteamVR, etc.).