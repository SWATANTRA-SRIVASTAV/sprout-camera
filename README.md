# sprout-camera 📷
📲 [Download APK (Android)](https://github.com/SWATANTRA-SRIVASTAV/sprout-camera/releases/latest) 

A camera-based scavenger hunt for kids. Built with React Native and Expo.

A lightweight camera-based interactive prototype focused on playful exploration and child-friendly interaction.

Sprout Camera was built as an experimental project around camera interaction, guided exploration, and simple visual engagement for children.

The project explores how camera-based experiences can feel playful and approachable without relying on complex interfaces or heavy interaction flows.

Instead of focusing purely on gameplay or quizzes, the idea was to create a lightweight interaction experience where children can explore objects around them using the camera in a simple and engaging way.

# Features

* Camera-based interaction
* Simple mission-style exploration
* Child-friendly UI
* Lightweight and responsive design
* Guided interaction flow
* Custom branding and visual theme
* Mobile-friendly layout

# Screenshots

## Home Screen

![Home Screen](screenshots/home.png)

## Camera Screen

![Camera Screen](screenshots/camera.png)

## Success Popup

![Success Popup](screenshots/success.png)

## Completion Screen

![Completion Screen](screenshots/completion.png)

> Note: Screenshots shown may vary slightly across devices.


# Project Structure

```txt
assets/
screenshots/
src/
index.html
```

## How it works

The kid gets a simple challenge — find 5 things around the house. They take a photo of each one, the app tells them what it found, and they get a star sticker for each one. After all 5 there's a little celebration screen showing everything they captured.

Pretty straightforward flow: intro → camera → analysing → result → repeat until 5 → celebrate.

## The vision part

Right now the object identification is mocked — it picks a random label from a list and waits ~1 second to simulate a real call. I built it this way so the whole experience is testable without needing an API key. Swapping it out is just replacing one function in App.tsx with a real fetch call to Google Cloud Vision or whatever you want to use.

# Challenges Faced

One of the biggest challenges during development was designing a camera interaction flow that remained visually clean and easy to understand.

Another challenge was maintaining smooth responsiveness across devices while keeping the project lightweight and simple.

Different ideas around object and shape interaction were explored during development, but the final version focuses primarily on guided interaction and playful exploration.

# Future Improvements

Some ideas planned for future versions:

* Real-time shape detection
* Better camera overlays
* Sound effects and feedback
* Animated mascot interactions
* More interactive missions
* Improved mobile responsiveness
* Offline interaction support

## Tech Stack

- TypeScript
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

# Author

Swatantra Srivastav

Built as part of a mobile app development assignment focused on creating an engaging learning experience for children.

> NOTE: The Vision API is currently mocked with a random label generator — swapping in Google Cloud Vision is a 10-line change in mockIdentifyObject().