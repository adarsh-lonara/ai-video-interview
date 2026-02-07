'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatTime } from '@/lib/utils';
import { interviewApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Mic, Volume2, Clock } from 'lucide-react';

interface InterviewSessionProps {
  sessionId: string;
  duration: number; // in minutes
  domain: string;
}

export default function InterviewSession({
  sessionId,
  duration,
  domain,
}: InterviewSessionProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('');
  const [questions, setQuestions] = useState<Array<{ id: string; question: string }>>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastQuestionTime, setLastQuestionTime] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasEnteredFullscreenRef = useRef(false);
  const isEndingRef = useRef(false);
  const initializationCompleteRef = useRef(false);
  const initializationStartTimeRef = useRef(Date.now());
  const endInterviewRef = useRef<((reason?: string) => Promise<void>) | null>(null);

  // Define endInterview early using useCallback
  const endInterview = useCallback(async (reason?: string) => {
    // Prevent ending during initialization
    if (!initializationCompleteRef.current) {
      console.log('Interview end prevented - still initializing');
      return;
    }
    
    if (isEnded || isEndingRef.current) return;
    isEndingRef.current = true;
    setIsEnded(true);
    
    console.log('Ending interview:', reason);

    // Stop speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (questionTimeoutRef.current) {
      clearTimeout(questionTimeoutRef.current);
    }

    // Stop recording
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Submit current response
    if (currentQuestionId && transcript) {
      try {
        await interviewApi.submitResponse(sessionId, currentQuestionId, transcript);
      } catch (error) {
        console.error('Failed to submit response:', error);
      }
    }

    // Stop all media tracks
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    // End interview and get results
    try {
      const { score, feedback } = await interviewApi.endInterview(sessionId);
      router.push(
        `/interview/results?sessionId=${sessionId}&score=${score}&feedback=${encodeURIComponent(JSON.stringify(feedback))}`
      );
    } catch (error: any) {
      toast.error('Failed to end interview: ' + error.message);
      router.push('/interview/domain');
    }
  }, [isEnded, isRecording, currentQuestionId, transcript, sessionId, router]);

  // Update ref whenever endInterview changes
  useEffect(() => {
    endInterviewRef.current = endInterview;
  }, [endInterview]);

  // Security: Only end when user switches tab (visibility), not on blur (blur fires on fullscreen request)
  // Wait for initialization to complete before enabling security checks
  useEffect(() => {
    if (!isInitialized) return; // Don't enable until initialized
    
    const handleVisibilityChange = () => {
      // Only check after initialization is complete and a grace period has passed
      const timeSinceInit = Date.now() - initializationStartTimeRef.current;
      if (document.hidden && !isEnded && initializationCompleteRef.current && timeSinceInit > 2000) {
        endInterviewRef.current?.('Tab switch detected');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isEnded, isInitialized]);

  // Security: Disable copy/paste
  useEffect(() => {
    const preventDefault = (e: Event) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('copy', preventDefault);
    document.addEventListener('paste', preventDefault);
    document.addEventListener('cut', preventDefault);
    document.addEventListener('contextmenu', preventDefault);

    // Disable keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')
      ) {
        e.preventDefault();
        return false;
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('copy', preventDefault);
      document.removeEventListener('paste', preventDefault);
      document.removeEventListener('cut', preventDefault);
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Security: Only end when user explicitly exits fullscreen (after they had entered it)
  // Wait for initialization to complete before enabling fullscreen checks
  useEffect(() => {
    if (!isInitialized) return; // Don't enable until initialized
    
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        hasEnteredFullscreenRef.current = true;
      } else if (hasEnteredFullscreenRef.current && !isEnded && initializationCompleteRef.current) {
        // Only end if initialization is complete and user had actually entered fullscreen
        const timeSinceInit = Date.now() - initializationStartTimeRef.current;
        if (timeSinceInit > 2000) { // Grace period of 2 seconds
          endInterviewRef.current?.('Fullscreen exited');
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isEnded, isInitialized]);

  // Initialize camera and microphone
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Initialize MediaRecorder
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9,opus',
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current = mediaRecorder;

        // Request fullscreen (optional – interview continues even if user denies)
        // Delay fullscreen request slightly to avoid triggering security checks during init
        setTimeout(async () => {
          try {
            await document.documentElement.requestFullscreen();
            hasEnteredFullscreenRef.current = true;
          } catch (err) {
            console.warn('Fullscreen not supported or denied – continuing without fullscreen:', err);
          }
        }, 500); // Small delay to let initialization settle

        // Initialize speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
              } else {
                interimTranscript += transcript;
              }
            }

            setTranscript((prev) => prev + finalTranscript);
          };

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
              // Restart recognition if no speech detected
              setTimeout(() => {
                if (recognitionRef.current && !isEnded) {
                  try {
                    recognitionRef.current.start();
                  } catch (e) {
                    // Already started
                  }
                }
              }, 1000);
            }
          };

          recognition.onend = () => {
            // Restart recognition automatically
            if (!isEnded && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                // Already started or error
              }
            }
          };

          recognitionRef.current = recognition;
        }

        // Load first question
        try {
          const { questions: loadedQuestions } = await interviewApi.getQuestions(sessionId);
          setQuestions(loadedQuestions);
          if (loadedQuestions.length > 0) {
            setCurrentQuestion(loadedQuestions[0].question);
            setCurrentQuestionId(loadedQuestions[0].id);
            await speakQuestion(loadedQuestions[0].question);
            setLastQuestionTime(Date.now());
          }
        } catch (questionError: any) {
          console.error('Failed to load questions:', questionError);
          toast.error('Failed to load questions. Please try again.');
          // Don't exit - continue with empty questions and let user proceed
        }

        setIsInitialized(true);
        startInterview();
        
        // Mark initialization as complete after a short delay to allow all setup to finish
        setTimeout(() => {
          initializationCompleteRef.current = true;
          console.log('Interview initialization complete - security checks enabled');
        }, 3000); // 3 second grace period
      } catch (error: any) {
        console.error('Initialization error:', error);
        toast.error('Failed to access camera/microphone: ' + error.message);
        // Only redirect if it's a critical error (media access failed)
        if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
          router.push('/interview/domain');
        }
      }
    };

    initializationStartTimeRef.current = Date.now();
    initializeMedia();

    return () => {
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current);
      }
    };
  }, [sessionId, router]);

  // Timer countdown and auto-question generation
  useEffect(() => {
    if (isInitialized && !isEnded && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            endInterviewRef.current?.('Time expired');
            return 0;
          }
          
          // Auto-generate next question if enough time has passed (2.5 minutes per question)
          const timeSinceLastQuestion = (Date.now() - lastQuestionTime) / 1000;
          const timePerQuestion = 150; // 2.5 minutes
          
          if (timeSinceLastQuestion >= timePerQuestion && prev > 30) {
            generateNextQuestion(prev);
          }
          
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isInitialized, isEnded, timeRemaining, lastQuestionTime]);

  const speakQuestion = async (question: string): Promise<void> => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(question);
        
        // Use English-only voice: prefer en-US, then any English
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice =
          voices.find((v) => v.lang === 'en-US') ||
          voices.find((v) => v.lang.startsWith('en-')) ||
          voices.find((v) => v.lang === 'en');
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        utterance.rate = 0.85; // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US'; // Questions are spoken only in English

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  };

  const generateNextQuestion = async (remainingTime: number) => {
    try {
      const { question } = await interviewApi.getNextQuestion(sessionId, remainingTime);
      setQuestions((prev) => [...prev, question]);
      setLastQuestionTime(Date.now());
      
      // Auto-advance to new question if user hasn't answered current one
      if (transcript.length < 10) {
        // If transcript is very short, move to next question
        await handleNextQuestion();
      }
    } catch (error) {
      console.error('Failed to generate next question:', error);
    }
  };

  const startInterview = () => {
    if (mediaRecorderRef.current && !isRecording) {
      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
    }

    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const handleNextQuestion = async () => {
    // Submit current response
    if (currentQuestionId && transcript) {
      try {
        await interviewApi.submitResponse(sessionId, currentQuestionId, transcript);
      } catch (error) {
        console.error('Failed to submit response:', error);
      }
    }

    // Move to next question or generate new one
    const nextIndex = questionIndex + 1;
    if (nextIndex < questions.length) {
      setQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex].question);
      setCurrentQuestionId(questions[nextIndex].id);
      setTranscript('');
      await speakQuestion(questions[nextIndex].question);
      setLastQuestionTime(Date.now());
    } else if (timeRemaining > 30) {
      // Generate new question if time remaining
      try {
        const { question } = await interviewApi.getNextQuestion(sessionId, timeRemaining);
        setQuestions((prev) => [...prev, question]);
        setQuestionIndex(nextIndex);
        setCurrentQuestion(question.question);
        setCurrentQuestionId(question.id);
        setTranscript('');
        await speakQuestion(question.question);
        setLastQuestionTime(Date.now());
      } catch (error) {
        console.error('Failed to generate next question:', error);
        endInterview();
      }
    } else {
      // No more time, end interview
      endInterview();
    }
  };

  const getTimeColor = () => {
    const percentage = (timeRemaining / (duration * 60)) * 100;
    if (percentage <= 20) return 'text-red-500';
    if (percentage <= 40) return 'text-yellow-500';
    return 'text-emerald-400';
  };

  return (
    <div className="fullscreen-interview interview-mode">
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
        {/* Header with timer */}
        <div className="bg-black/50 backdrop-blur-sm px-6 py-4 flex justify-between items-center border-b border-purple-500/20">
          <div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {domain} Interview
            </h2>
            <p className="text-sm text-gray-400">Session: {sessionId.slice(0, 8)}</p>
          </div>
          <div className="text-right flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-5 h-5" />
              <div>
                <div className={`text-3xl font-bold ${getTimeColor()}`}>
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-xs text-gray-500">Time Remaining</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex">
          {/* Video preview */}
          <div className="w-1/3 bg-black flex items-center justify-center p-4 border-r border-purple-500/20">
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="max-w-full max-h-full rounded-xl shadow-2xl border-2 border-purple-500/30"
              />
              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-600 rounded-full p-2 animate-pulse">
                  <Mic className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Question and transcript area */}
          <div className="flex-1 flex flex-col p-8 bg-gradient-to-b from-gray-900/50 to-transparent">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-purple-400 animate-pulse' : 'text-gray-500'}`} />
                <h3 className="text-lg font-semibold text-gray-300">Current Question</h3>
              </div>
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-6 mb-4 border border-purple-500/30 shadow-lg backdrop-blur-sm">
                <p className="text-2xl text-white leading-relaxed">{currentQuestion || 'Loading question...'}</p>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Mic className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-gray-300">Your Response</h3>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 h-64 overflow-y-auto border border-gray-700/50 backdrop-blur-sm">
                <p className="text-lg text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {transcript || 'Start speaking to see your response here...'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => endInterview()}
                className="bg-red-600/80 hover:bg-red-600 px-6 py-3 rounded-lg font-semibold transition backdrop-blur-sm border border-red-500/50"
              >
                End Interview
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={timeRemaining <= 10}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {timeRemaining <= 10 ? 'Time Almost Up' : 'Next Question'}
              </button>
            </div>
          </div>
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 text-center border-t border-red-500/50">
            <div className="flex items-center justify-center gap-2">
              <span className="inline-block w-3 h-3 bg-white rounded-full animate-pulse"></span>
              <span className="font-semibold">Recording in progress</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
