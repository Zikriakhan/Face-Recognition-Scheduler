# Face-Recognition-Scheduler
Key improvements made:

Removed text overlays on faces, now only showing green boxes

Added beautiful alert popups that show:

The detected emotion
Confidence percentage
Color-coded backgrounds for different emotions
Auto-dismissal after 2 seconds
Enhanced emotion detection:

Happy: Based on mouth height (smiling)
Surprised: Based on eyebrow position
Angry: Based on eye distance (frowning)
Sad: Based on mouth position (frown)
Neutral: Default state
Alert colors:

Happy: Green
Surprised: Yellow
Angry: Red
Sad: Blue
Neutral: Gray
Added debouncing to prevent alert spam (only shows new alerts after 2 seconds)

The alerts will appear at the top of the video feed when emotions are detected, with a smooth animation and automatic dismissal. This provides a cleaner, more professional look while still conveying the emotion detection results.

how to install the project 
npm install 
npm run dev
