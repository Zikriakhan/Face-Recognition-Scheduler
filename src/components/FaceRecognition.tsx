import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { Camera, AlertCircle } from 'lucide-react';

interface EmotionAlert {
  emotion: string;
  confidence: number;
  timestamp: number;
}

export function FaceRecognition() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detector, setDetector] = useState<faceDetection.FaceDetector | null>(null);
  const [landmarkDetector, setLandmarkDetector] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emotionAlert, setEmotionAlert] = useState<EmotionAlert | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsModelLoading(true);
        setError(null);

        // Initialize TensorFlow.js backend
        await tf.setBackend('webgl');
        await tf.ready();

        // Load models sequentially to avoid memory issues
        const faceDetector = await faceDetection.createDetector(
          faceDetection.SupportedModels.MediaPipeFaceDetector,
          {
            runtime: 'tfjs',
            modelType: 'short',
            maxFaces: 1
          }
        );
        
        const landmarkModel = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          {
            runtime: 'tfjs',
            refineLandmarks: true,
            maxFaces: 1
          }
        );
        
        setDetector(faceDetector);
        setLandmarkDetector(landmarkModel);
        setIsModelLoading(false);
      } catch (err) {
        console.error('Error loading models:', err);
        setError('Failed to load face detection models. Please refresh the page and try again.');
        setIsModelLoading(false);
      }
    };

    loadModels();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startVideo = async () => {
    if (!videoRef.current || isModelLoading) return;

    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        if (!videoRef.current) return;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            resolve();
          }
        };
      });

      if (videoRef.current && canvasRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        setIsDetecting(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please ensure camera permissions are granted.');
    }
  };

  const predictEmotion = async (face: faceDetection.Face) => {
    if (!landmarkDetector || !videoRef.current) return null;
    
    try {
      const landmarks = await landmarkDetector.estimateFaces(videoRef.current);
      if (landmarks.length === 0) return null;
      
      const landmark = landmarks[0];
      
      // Ensure keypoints exist
      if (!landmark.keypoints || landmark.keypoints.length < 15) {
        return { emotion: 'neutral', confidence: 0.6 };
      }

      const mouthHeight = Math.abs(landmark.keypoints[13].y - landmark.keypoints[14].y);
      const eyebrowHeight = Math.abs(landmark.keypoints[7].y - landmark.keypoints[3].y);
      const eyeDistance = Math.abs(landmark.keypoints[4].x - landmark.keypoints[1].x);
      
      // Enhanced emotion detection with confidence scores
      if (mouthHeight > 20) {
        return { emotion: 'happy', confidence: 0.8 + (mouthHeight - 20) / 30 };
      }
      if (eyebrowHeight > 15) {
        return { emotion: 'surprised', confidence: 0.7 + (eyebrowHeight - 15) / 20 };
      }
      if (eyeDistance < 30) {
        return { emotion: 'angry', confidence: 0.75 + (30 - eyeDistance) / 20 };
      }
      if (mouthHeight < 10) {
        return { emotion: 'sad', confidence: 0.7 + (10 - mouthHeight) / 10 };
      }
      
      return { emotion: 'neutral', confidence: 0.6 };
    } catch (err) {
      console.error('Error predicting emotion:', err);
      return null;
    }
  };

  const detectFaces = async () => {
    if (!detector || !videoRef.current || !canvasRef.current || !isDetecting) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    try {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const faces = await detector.estimateFaces(video);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0);
        
        for (const face of faces) {
          const box = face.box;
          const emotionResult = await predictEmotion(face);
          
          if (emotionResult && emotionResult.emotion !== 'neutral') {
            const currentTime = Date.now();
            // Only show new alert if 2 seconds have passed since the last one
            if (!emotionAlert || currentTime - emotionAlert.timestamp > 2000) {
              setEmotionAlert({
                emotion: emotionResult.emotion,
                confidence: emotionResult.confidence,
                timestamp: currentTime
              });
            }
          }
          
          // Draw face box only
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(box.xMin, box.yMin, box.width, box.height);
        }
      }

      if (isDetecting) {
        requestAnimationFrame(detectFaces);
      }
    } catch (err) {
      console.error('Error detecting faces:', err);
      setError('Face detection error occurred. Please refresh the page.');
      setIsDetecting(false);
    }
  };

  useEffect(() => {
    if (isDetecting) {
      detectFaces();
    }
  }, [isDetecting, detector]);

  useEffect(() => {
    if (emotionAlert) {
      const timer = setTimeout(() => {
        setEmotionAlert(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [emotionAlert]);

  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: 'bg-green-500',
      surprised: 'bg-yellow-500',
      angry: 'bg-red-500',
      sad: 'bg-blue-500',
      neutral: 'bg-gray-500'
    };
    return colors[emotion as keyof typeof colors] || 'bg-purple-500';
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
        {!isDetecting && (
          <button
            onClick={startVideo}
            disabled={isModelLoading}
            className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 transition-colors"
          >
            <div className={`flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg ${isModelLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
              <Camera className="w-5 h-5 text-blue-600" />
              <span className="font-medium">
                {isModelLoading ? 'Loading Models...' : 'Start Camera'}
              </span>
            </div>
          </button>
        )}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}
        {emotionAlert && (
          <div className={`absolute top-4 left-4 right-4 ${getEmotionColor(emotionAlert.emotion)} text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium capitalize">{emotionAlert.emotion} detected!</span>
              </div>
              <span className="text-sm opacity-75">
                Confidence: {Math.round(emotionAlert.confidence * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}