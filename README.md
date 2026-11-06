# 🌾 Naga Farm: Bicolandia Homestead Simulator

> **A relaxing, slow-paced Filipino agriculture & homestead simulation game.**  
> **Created by Bryn Espiritu · Built primarily with Google AI**

[![Creator](https://img.shields.io/badge/Creator-Bryn%20Espiritu-amber?style=for-the-badge&logo=person)](https://github.com)
[![Powered By](https://img.shields.io/badge/Powered%20By-Google%20AI-emerald?style=for-the-badge&logo=google)](https://ai.google.dev)
[![Direct APK Download](https://img.shields.io/badge/Download%20APK-Instant%20Direct%20Download-brightgreen?style=for-the-badge&logo=android)](./public/naga-farm.apk)

---

## 📥 Direct APK Download (Automatic Download — No Redirection)

Click the link below to **automatically download the Android APK file (`naga-farm.apk`) directly to your device**. This initiates an immediate file download and will **not** redirect you to any external website or third-party store:

### 👉 [⬇️ CLICK HERE TO DIRECTLY DOWNLOAD NAGA FARM APK (naga-farm.apk)](./public/naga-farm.apk)

*Live Hosted Direct Download Link:*  
🔗 **[https://ais-dev-x5aghzc66eeyacckwafgbn-507788884124.asia-northeast1.run.app/naga-farm.apk](https://ais-dev-x5aghzc66eeyacckwafgbn-507788884124.asia-northeast1.run.app/naga-farm.apk)**

---

### 💻 One-Line Terminal / Command Prompt Download
Download the APK file directly to your computer or Android terminal with `curl` or `wget`:

```bash
# Using curl (automatically downloads naga-farm.apk)
curl -O https://ais-dev-x5aghzc66eeyacckwafgbn-507788884124.asia-northeast1.run.app/naga-farm.apk

# Or using wget
wget https://ais-dev-x5aghzc66eeyacckwafgbn-507788884124.asia-northeast1.run.app/naga-farm.apk
```

---

### 📲 How to Install the Downloaded APK on Android
1. **Download the APK**: Click the download link above or use the **"📥 Download APK"** button on the in-game Title Screen / Settings modal.
2. **Open the downloaded file**: On your Android device, open your **Downloads** folder or notification shade and tap **`naga-farm.apk`**.
3. **Allow Installation**: If prompted, enable *"Install unknown apps"* for your browser or file manager.
4. **Tap Install**: The app installs directly into your Android app drawer with full standalone offline support, hardware acceleration, and 60 FPS performance!

---

### 🔨 Rebuild / Package the APK Locally
You can regenerate or build the APK file locally from source anytime:

```bash
# Automatically builds public/naga-farm.apk
npm run build:apk
```

---

## 🌟 Game Highlights & Filipino Agricultural Heritage

### 🐃 Kalabaw (Water Buffalo) & Upgradable Furrow Plowing
- **Unlock Requirement**: Reach Farm **Level 20** and collect **50,000 Coins** to adopt your hardworking Philippine Kalabaw in the Farm Shop.
- **Upgradable Plowing Radius**:
  - **Tier 1 (Loyal Furrow Plow)**: Simultaneously plows **3 linear furrow plots** in one swift motion.
  - **Tier 2 (Reinforced Bronze Harness)**: Expands furrow reach to **5 linear plots** (Unlocked at Lv 25).
  - **Tier 3 (Golden Master Yoke)**: Supreme **3×3 square grid furrow (9 plots)** cultivated in a single charge! (Unlocked at Lv 30).

### 🌱 Stacked Level Field Limit
- **Plowing Capacity**: Limited to **3 fields per level, stacked** (`maxFields = Level × 3`).
- Track your real-time field count directly in the top HUD (`🌱 Fields: {current}/{max}`).
- Prevents over-plowing and rewards leveling up with +3 stacked field plots per level.

### 🐔 Livestock Level Progression Limits
- **Heritage Chickens**: Unlocks at Level 3, with **+1 additional capacity every 3rd level** (Level 3, 6, 9, 12...).
- **Jersey Dairy Cows**: Unlocks at Level 10, with **+1 additional capacity every 10th level** (Level 10, 20, 30...).
- **Merino Sheep**: Unlocks at Level 15, with **+1 additional capacity every 5th tier** (Level 15, 25, 35...).

### 🍳 Kusina (Filipino Cookhouse Simulator)
- Unlocked at **Level 10**.
- Cook authentic Filipino dishes using crops and fish harvested from your farm:
  - **Sinigang sa Bayabas** (Sour guava broth with fresh river tilapia)
  - **Bicol Express Fiesta Platter** (Spicy coconut chili stew)
  - **Inihaw na Tilapia & Rice**
  - **Ube Halaya Jam** (Slow-stirred sweet purple yam jam)
  - **Carabao Mango Float**
- Features a **4-second interactive cooking simulation** with live sizzling audio, steaming kawali animations, and an interactive **🥄 Stir Kawali** button.
- Eating prepared dishes activates powerful timed buffs (Double Harvest, +50% XP, +35% Crop Growth Speed).

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

# 3. Build APK
npm run build:apk

# 4. Run type check and linter
npm run lint

# 5. Build production web bundle
npm run build
```

---

*Enjoy farming under the warm morning sun of Mount Isarog!* 🌾🐃☀️
