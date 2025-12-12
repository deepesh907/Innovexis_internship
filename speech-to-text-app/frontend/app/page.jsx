"use client";
import { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import api from "../lib/api.js";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  // 📌 Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());

        if (audioChunks.current.length === 0) {
          setText("Recording too short or empty. Please record again.");
          return;
        }

        const blob = new Blob(audioChunks.current, { type: "audio/webm" });

        // Create a proper file name with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `recording-${timestamp}.webm`;

        const form = new FormData();
        form.append("file", blob, fileName);

        setLoading(true);
        try {
          const res = await api.convertAudio(form);
          if (res.error) {
            setText(`Error: ${res.error}`);
          } else {
            setText(res.text || "No speech detected in recording.");
          }
        } catch (err) {
          setText(`Network error: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };

      mediaRecorder.current.start(1000); // Collect data every second
      setRecording(true);
      setText("Recording... Speak clearly into the microphone.");
    } catch (err) {
      console.error("Recording error:", err);
      alert("Microphone permission denied or unavailable. Please check your microphone settings.");
    }
  };

  // 📌 Stop recording
  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  // 📌 Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 25MB)
      if (selectedFile.size > 25 * 1024 * 1024) {
        alert("File size too large. Please select a file smaller than 25MB.");
        e.target.value = ""; // Clear the input
        return;
      }

      // Check file type
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];
      if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(mp3|wav|webm|ogg|m4a|flac)$/i)) {
        alert("Please select a valid audio file (MP3, WAV, WebM, OGG, M4A, FLAC)");
        e.target.value = ""; // Clear the input
        return;
      }

      setFile(selectedFile);
      setText(""); // Clear previous text
    }
  };

  // 📌 Manual file upload convert
  const upload = async () => {
    if (!file) {
      alert("Please select an audio file first");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    setLoading(true);
    setText("Processing...");

    try {
      const res = await api.convertAudio(form);
      if (res.error) {
        setText(`Error: ${res.error}`);
      } else {
        setText(res.text || "No speech detected in audio.");
      }
    } catch (err) {
      setText(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 📌 Clear all
  const clearAll = () => {
    setFile(null);
    setText("");
    setLoading(false);
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Navbar />

      <div className="p-6 md:p-8 max-w-3xl mx-auto mt-8 md:mt-12 bg-gray-800 shadow-xl rounded-2xl border border-gray-700">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-indigo-400">
          🎤 Speech to Text Converter
        </h1>

        {/* File Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Upload Audio File
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="file"
              accept="audio/*,.mp3,.wav,.webm,.ogg,.m4a,.flac"
              onChange={handleFileChange}
              className="flex-1 border border-gray-600 rounded-lg p-3 bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
            />
            {file && (
              <button
                onClick={clearAll}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition font-semibold"
              >
                Clear
              </button>
            )}
          </div>
          {file && (
            <p className="mt-2 text-sm text-gray-400">
              Selected: <span className="text-indigo-300">{file.name}</span>
              ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <button
          onClick={upload}
          disabled={loading || !file}
          className="w-full bg-indigo-500 text-white py-3 rounded-lg mb-6 hover:bg-indigo-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            "Convert Uploaded File"
          )}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">OR</span>
          </div>
        </div>

        {/* Microphone Section */}
        <div className="mb-6 p-6 bg-gray-700/50 border border-gray-600 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-center">🎙 Record with Microphone</h2>
          <p className="text-gray-400 text-sm mb-4 text-center">
            Record clear audio for best results. Speak naturally and avoid background noise.
          </p>

          <div className="flex flex-col items-center">
            {!recording ? (
              <button
                onClick={startRecording}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-4 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-gray-600 transition font-semibold flex items-center justify-center gap-3 text-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Start Recording
              </button>
            ) : (
              <div className="w-full space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                  <span className="text-red-400 font-semibold">Recording...</span>
                </div>
                <button
                  onClick={stopRecording}
                  className="w-full sm:w-auto px-8 py-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition font-semibold flex items-center justify-center gap-3 text-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  Stop Recording
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Text Output */}
        {text && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-300">Transcription Result</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(text)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 whitespace-pre-line shadow-inner min-h-[120px]">
              {text === "Recording... Speak clearly into the microphone." ? (
                <div className="text-center text-gray-400 italic py-8">
                  <svg className="w-8 h-8 mx-auto mb-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  {text}
                </div>
              ) : text === "Processing..." ? (
                <div className="text-center text-gray-400 italic py-8">
                  <svg className="animate-spin h-6 w-6 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {text}
                </div>
              ) : (
                text
              )}
            </div>
            {text && !text.includes("Recording...") && !text.includes("Processing...") && !text.includes("Error:") && !text.includes("Network error:") && (
              <p className="mt-2 text-sm text-gray-500">
                {text.split(/\s+/).length} words, {text.length} characters
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}