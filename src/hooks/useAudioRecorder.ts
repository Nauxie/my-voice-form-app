import { useState, useRef, useCallback } from 'react';

const useAudioRecorder = () => {
  const [recorderState, setRecorderState] = useState({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
  });

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const audioStream = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.start(10); // Start recording and emit data every 10ms

      setRecorderState((prev) => ({ ...prev, isRecording: true, isPaused: false }));

      timerInterval.current = setInterval(() => {
        setRecorderState((prev) => ({ ...prev, recordingTime: prev.recordingTime + 1 }));
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<{ transcription: string } | null> => {
    if (mediaRecorder.current && recorderState.isRecording) {
      return new Promise((resolve) => {
        mediaRecorder.current!.onstop = async () => {
          clearInterval(timerInterval.current!);

          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          try {
            const response = await fetch('/api/transcribe', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.details || 'Transcription failed');
            }

            const result = await response.json();
            console.log('Transcription result:', result);

            // Reset state
            setRecorderState({ isRecording: false, isPaused: false, recordingTime: 0 });
            audioChunks.current = [];

            // Stop all tracks and nullify the stream
            if (audioStream.current) {
              audioStream.current.getTracks().forEach(track => track.stop());
              audioStream.current = null;
            }

            resolve(result);
          } catch (error) {
            console.error('Error during transcription:', error);
            resolve(null);
          }
        };

        mediaRecorder.current!.stop();
      });
    }
    return null;
  }, [recorderState.isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current && recorderState.isRecording && !recorderState.isPaused) {
      mediaRecorder.current.pause();
      clearInterval(timerInterval.current!);
      setRecorderState((prev) => ({ ...prev, isPaused: true }));
    }
  }, [recorderState.isRecording, recorderState.isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current && recorderState.isRecording && recorderState.isPaused) {
      mediaRecorder.current.resume();
      timerInterval.current = setInterval(() => {
        setRecorderState((prev) => ({ ...prev, recordingTime: prev.recordingTime + 1 }));
      }, 1000);
      setRecorderState((prev) => ({ ...prev, isPaused: false }));
    }
  }, [recorderState.isRecording, recorderState.isPaused]);

  return {
    recorderState,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
};

export default useAudioRecorder;