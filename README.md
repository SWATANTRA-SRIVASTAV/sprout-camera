# sprout-camera 📷

A camera-based scavenger hunt for kids. Built with React Native and Expo.

## How it works

The kid gets a simple challenge — find 5 things around the house. They take a photo of each one, the app tells them what it found, and they get a star sticker for each one. After all 5 there's a little celebration screen showing everything they captured.

Pretty straightforward flow: intro → camera → analysing → result → repeat until 5 → celebrate.

## The vision part

Right now the object identification is mocked — it picks a random label from a list and waits ~1 second to simulate a real call. I built it this way so the whole experience is testable without needing an API key. Swapping it out is just replacing one function in App.tsx with a real fetch call to Google Cloud Vision or whatever you want to use.

## Stack

- React Native (Expo)
- expo-camera
- expo-haptics
- React Native Animated API

## Run on your phone

```bash
npm install
npx expo install expo-camera expo-haptics
npx expo start
```

Scan the QR code with Expo Go and it'll open on your phone.
