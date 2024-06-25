import React from "react";
import useAudioRecorder from "../hooks/useAudioRecorder";

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscriptionComplete,
}) => {
  const {
    recorderState,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useAudioRecorder();

  const handleStopRecording = async () => {
    try {
      const result = await stopRecording();
      onTranscriptionComplete(result?.transcription || "");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-4">
        {!recorderState.isRecording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Stop Recording
          </button>
        )}

        {recorderState.isRecording && !recorderState.isPaused ? (
          <button
            onClick={pauseRecording}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
          >
            Pause
          </button>
        ) : recorderState.isPaused ? (
          <button
            onClick={resumeRecording}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Resume
          </button>
        ) : null}
      </div>
      <p className="text-center">
        {recorderState.isRecording &&
          `Recording${recorderState.isPaused ? " Paused" : ""}: ${
            recorderState.recordingTime
          } seconds`}
      </p>
    </div>
  );
};

export default AudioRecorder;
