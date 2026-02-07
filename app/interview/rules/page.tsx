'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Video, Clock, Shield } from 'lucide-react';
import { interviewApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function RulesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domain = searchParams.get('domain');
  const duration = searchParams.get('duration');
  const [loading, setLoading] = useState(false);

  const handleStartInterview = async () => {
    if (!domain || !duration) return;

    setLoading(true);
    try {
      const { sessionId } = await interviewApi.createSession(domain, parseInt(duration));
      router.push(
        `/interview/session?sessionId=${sessionId}&domain=${encodeURIComponent(
          domain
        )}&duration=${encodeURIComponent(duration)}`
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to start interview');
      setLoading(false);
    }
  };

  const rules = [
    'Ensure you have a stable internet connection',
    'Find a quiet, well-lit environment',
    'Grant camera and microphone permissions when prompted',
    'Do not switch tabs or minimize the browser window',
    'The interview will end automatically when time expires',
    'Answer questions clearly and concisely',
    'You cannot copy, paste, or use external resources',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Interview Rules & Instructions
          </h1>
          <p className="text-center text-gray-600 mb-12">
            Please read these guidelines carefully before starting
          </p>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center space-x-3">
                <Video className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Domain</p>
                  <p className="text-gray-600">{domain}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Duration</p>
                  <p className="text-gray-600">{duration} minutes</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Important Guidelines
              </h2>
              <ul className="space-y-3">
                {rules.map((rule, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900 mb-1">Warning</p>
                <p className="text-yellow-800 text-sm">
                  The interview will automatically terminate if you switch tabs, minimize the window,
                  or exit full-screen mode. Please ensure you're ready to begin.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleStartInterview}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
            >
              {loading ? 'Starting Interview...' : 'Start Interview'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
