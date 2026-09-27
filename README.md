# Ambedkar Gyaan Kosh (अम्बेडकर ज्ञान कोष)

An AI-powered Digital Heritage Archive kiosk and mobile application for Dr. B. R. Ambedkar’s writings, speeches, manuscripts, and constitutional records. Built for institutions like the Dr. Ambedkar International Centre (DAIC), New Delhi.

---

## 🚀 How to Upload This Code to Your GitHub Repository

The local git repository is already initialized and committed. To push this entire codebase to your GitHub repository:

```bash
# 1. Add your GitHub remote repository (already configured):
git remote add origin https://github.com/aayushsinha30/gyan-kosh.git

# 2. Rename branch to main:
git branch -M main

# 3. Push to GitHub (enter your GitHub username and Personal Access Token when prompted):
git push -u origin main
```

> **Note on GitHub Authentication**: When `git push` asks for your password, use a [GitHub Personal Access Token (classic)](https://github.com/settings/tokens) with `repo` scope enabled, as GitHub no longer accepts account passwords for Git operations.

---

## 📱 Getting the Android APK

### Option A: Automatic Cloud Build via GitHub Actions (Recommended)
This repository includes a pre-configured GitHub Actions workflow in `.github/workflows/build-apk.yml`.
1. Once you push your code to `https://github.com/aayushsinha30/gyan-kosh`, navigate to the **Actions** tab on your GitHub repository.
2. The **Build Android APK** workflow will automatically run.
3. Once completed (approx. 3-4 minutes), click on the workflow run and download the **`ambedkar-gyaan-kosh-apk`** artifact.
4. Transfer the `.apk` to any Android phone and install!

### Option B: Instant 1-Tap PWA Installation on Android
The app is a Progressive Web App (PWA) with a configured `manifest.json`.
1. Open the hosted web URL on Chrome on your Android device.
2. Tap the Chrome menu (`⋮`) and select **"Add to Home screen"** or **"Install App"**.
3. It will install as a native standalone app with full-screen experience and app icon.

### Option C: Local APK Build using Capacitor
If you have Android Studio installed on your computer:
```bash
# Install dependencies
npm install

# Build web distribution
npm run build

# Install Capacitor and open in Android Studio
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap open android
```
In Android Studio, click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 🏛️ Features Included

1. **Kiosk Landing & Attract Screen**: Deep navy & gold heritage aesthetic, touch navigation, and idle attract mode.
2. **Semantic Search Engine**: Natural-language retrieval across 17 verified primary records with category and format filters.
3. **Citation-Locked AI Research Assistant**: Retrieval-Augmented Generation that cites exact document titles, dates, and page sections, declining out-of-corpus queries without hallucinating.
4. **Interactive Timeline (1891–1956)**: 10 life and constitutional milestones linked directly to primary documents.
5. **Manuscripts & Photos OCR Workbench**: High-resolution facsimiles with interactive OCR region bounding and text extraction.
6. **Audio-Video Archive**: Player with animated waveform, scrub bar, speed controls, and searchable time-coded transcripts.
7. **6-Language Support & Web Speech TTS**: English, Hindi, Marathi, Tamil, Bengali, and Pali with live speech synthesis.
