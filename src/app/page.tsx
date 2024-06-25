"use client";

import { useState } from "react";
import AudioRecorder from "../components/AudioRecorder";
import TranscriptionForm from "../components/TranscriptionForm";

export default function Home() {
  const [transcription, setTranscription] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleTranscriptionComplete = async (text: string | null) => {
    if (text === null) {
      setError("Transcription failed. Please try recording again.");
      return;
    }

    setTranscription(text);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription: text }),
      });

      if (!response.ok) {
        throw new Error("Processing failed");
      }

      const data = await response.json();
      setFormData(data);
    } catch (err) {
      setError("Failed to process transcription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    console.log("Saving data:", formData);
    setSaveMessage("Patient information saved successfully!");
    setTimeout(() => setSaveMessage(null), 3000); // Clear message after 3 seconds
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-semibold mb-2 text-center text-indigo-600">
              Hippo Scribe - Demo
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Effortlessly record patient details using your voice
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-blue-700">
                Please provide the following patient details verbally:
              </p>
              <ul className="list-disc list-inside text-blue-600 mt-2">
                <li>Patient identification (first & last name)</li>
                <li>Summary of the condition and plan of treatment</li>
              </ul>
            </div>

            <AudioRecorder
              onTranscriptionComplete={handleTranscriptionComplete}
            />

            {isLoading && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                <p className="mt-2 text-indigo-600">
                  Processing your voice input...
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 text-red-500 text-center">{error}</div>
            )}

            {transcription && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2 text-indigo-600">
                  Voice Input Transcription
                </h2>
                <p className="bg-gray-50 p-3 rounded border border-gray-200">
                  {transcription}
                </p>
              </div>
            )}

            {formData && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2 text-indigo-600">
                  Patient Information
                </h2>
                <p className="text-gray-600 mb-4">
                  Please review and edit if necessary:
                </p>
                <TranscriptionForm data={formData} />
                <button
                  onClick={handleSave}
                  className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                >
                  Save Patient Information
                </button>
                {saveMessage && (
                  <p className="mt-2 text-green-600 text-center">
                    {saveMessage}
                  </p>
                )}
              </div>
            )}

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>
                Need help?{" "}
                <button className="text-blue-600"> Contact support</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
