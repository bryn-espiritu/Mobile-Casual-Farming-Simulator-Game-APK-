# 🌾 Naga Farm: Bicolandia Homestead Simulator

> **A relaxing, slow-paced Filipino agriculture & homestead simulation game.**  
> **Created by Bryn Espiritu · Built primarily with Google AI**

[![Creator](https://img.shields.io/badge/Creator-Bryn%20Espiritu-amber?style=for-the-badge&logo=person)](https://github.com)
[![Powered By](https://img.shields.io/badge/Powered%20By-Google%20AI-emerald?style=for-the-badge&logo=google)](https://ai.google.dev)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Android%20APK%20%7C%20PWA-blue?style=for-the-badge&logo=android)](https://ais-dev-x5aghzc66eeyacckwafgbn-507788884124.asia-northeast1.run.app)
[![Offline](https://img.shields.io/badge/Offline-Full%20Support-success?style=for-the-badge)](https://ais-dev-x5aghzc66eeyacckwafgbn-507788884124.asia-northeast1.run.app)

---

## 📱 Download & Install the Android APK

You can install and run **Naga Farm** directly on Android as a standalone native app (APK) without requiring third-party app stores:

### 🚀 Option 1: Instant Android WebAPK Direct Install (Recommended)
1. Open the game in Chrome on your Android smartphone or tablet:  
   👉 **[Launch Naga Farm App](https://ais-dev-x5aghzc66eeyacckwafgbn-507788884124.asia-northeast1.run.app)**  
   *(Alternative preview link: [Shared Live App](https://ais-pre-x5aghzc66eeyacckwafgbn-507788884124.asia-northeast1.run.app))*
2. Tap the green **"Install Mobile APK"** button on the Title Screen or in Settings.  
   *(Or tap Chrome's menu **⋮** and select **"Install app"** or **"Add to Home screen"**).*
3. Android's package manager will automatically compile and install the verified **WebAPK** onto your device.
4. Launch **Naga Farm** from your Android home screen or app drawer with native fullscreen, offline cache, and 60 FPS performance!

---

### 📦 Option 2: Package into a Standalone `.apk` file (Bubblewrap / TWA)
If you want to build and sign a standalone `.apk` package to distribute or side-load via ADB:

```bash
# 1. Install Google's official Bubblewrap CLI
npm install -g @bubblewrap/cli

# 2. Initialize project from the live Web App Manifest
bubblewrap init --manifest=https://ais-dev-x5aghzc66eeyacckwafgbn-507788884124.asia-northeast1.run.app/manifest.webmanifest

# 3. Build your signed Android APK
bubblewrap build

# 4. Install the generated APK on your connected Android device
adb install app-release-signed.apk
```

---

### ⚡ Option 3: Build Native Android APK with Capacitor
You can also compile a native Android Studio project directly from this codebase:

```bash
# 1. Build web distribution
npm run build

# 2. Add Android platform via Capacitor
npx cap add android

# 3. Sync code and assets
npx cap copy android

# 4. Open in Android Studio to build APK or AAB
npx cap open android
```

---

## 🌟 Game Highlights & Filipino Heritage

### 🐃 Kalabaw (Water Buffalo) & Upgradable Plowing
- **Unlock Requirement**: Reach Farm **Level 20** and collect **50,000 Coins** to adopt your loyal Kalabaw.
- **Plowing Radius Upgrades**:
  - **Tier 1 (Loyal Furrow Plow)**: Simultaneously cultivates **3 linear furrow plots**.
  - **Tier 2 (Reinforced Bronze Harness)**: Expands plowing reach to **5 linear furrow plots** (Available at Lv 25).
  - **Tier 3 (Golden Master Yoke)**: Cultivates a massive **3×3 square grid (9 plots)** in a single charge! (Available at Lv 30).

### 🌱 Stacked Level Plowing Allowance
- **Field Limit Rule**: Plowing capacity is limited to **3 fields per level, stacked** (`maxFields = Level × 3`).
- Track your real-time field count directly in the top HUD (`🌱 Fields: {current}/{max}`).

### 🐔 Livestock Level Limits
- **Heritage Chickens**: Unlocked at Level 3, with **+1 additional capacity every 3rd level** (Level 3, 6, 9, 12...).
- **Jersey Dairy Cows**: Unlocked at Level 10, with **+1 additional capacity every 10th level** (Level 10, 20, 30...).
- **Merino Sheep**: Unlocked at Level 15, with **+1 additional capacity every 5th tier** (Level 15, 25, 35...).

### 🍳 Kusina (Filipino Cookhouse Simulator)
- Unlocked at **Level 10**.
- Cook traditional dishes using your homegrown crops and aquaculture harvests:
  - **Sinigang sa Bayabas** (Sour guava broth with fresh tilapia)
  - **Bicol Express Fiesta Platter** (Spicy coconut chili stew)
  - **Inihaw na Tilapia & Rice**
  - **Ube Halaya Jam** (Slow-stirred purple yam jam)
  - **Carabao Mango Float**
- Features a **4-second interactive cooking simulation** with live sizzling audio, steaming kawali animations, and an interactive **🥄 Stir Kawali** button.
- Consuming dishes grants powerful buffs (Double Harvest, +50% XP, +35% Crop Growth Speed).

### 🏡 3D Homestead Studio & Architecture Upgrades
- Step inside your **Bahay Kubo** to access the 3D room customizer.
- Place, rotate, and move handcrafted Narra furniture, capiz shell windows, and hearths.
- **House Architecture Progression**:
  - **Level 1**: Cozy Bahay Kubo Cabin
  - **Level 10**: 2-Storey Heritage Bahay na Bato
  - **Level 20**: Modernized Farmhouse Villa
  - **Level 35**: 3-Storey Luxury Estate with Private Garage
  - **Level 50**: Sprawling Tropical Bungalow with Lanai Veranda
  - **Level 100**: Palatial Grand Naga Hacienda Mansion

---

## 🏆 Game Credits & Attribution

| Role | Details |
| :--- | :--- |
| **Game Creator** | **Bryn Espiritu** |
| **Primary Tool Used** | **Google AI** (Google AI Studio Build & Gemini API) |
| **Frameworks** | React 19, TypeScript, Vite, Tailwind CSS, Three.js, Canvas 2D |
| **Audio Engine** | Web Audio API (Synthesized acoustic instruments, ambient wildlife, sizzling sounds) |
| **Theme** | Philippine Agricultural Heritage (Bicolandia / Naga Farmstead) |

---

## 🛠️ Development & Local Run

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Run type check and linter
npm run lint

# 4. Build production bundle
npm run build
```

---

*Enjoy farming under the warm morning sun of Mount Isarog!* 🌾🐃☀️
