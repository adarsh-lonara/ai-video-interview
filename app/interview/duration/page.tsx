'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { InterviewDuration } from '@/types';
import { Clock, Zap, Target, Award } from 'lucide-react';

const durations: Array<{ value: InterviewDuration; icon: React.ReactNode; label: string; description: string }> = [
  { value: 5, icon: <Zap className="w-6 h-6" />, label: 'Quick', description: 'Fast assessment' },
  { value: 10, icon: <Target className="w-6 h-6" />, label: 'Standard', description: 'Balanced interview' },
  { value: 15, icon: <Clock className="w-6 h-6" />, label: 'Extended', description: 'Detailed evaluation' },
  { value: 30, icon: <Award className="w-6 h-6" />, label: 'Comprehensive', description: 'Full assessment' },
];

export default function DurationSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domain = searchParams.get('domain');
  const [selectedDuration, setSelectedDuration] = useState<InterviewDuration | null>(null);

  const handleContinue = () => {
    if (selectedDuration && domain) {
      router.push(`/interview/rules?domain=${domain}&duration=${selectedDuration}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-16 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Select Interview Duration
            </h1>
            <p className="text-xl text-gray-300">
              Choose how long you want your interview to last
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {durations.map((duration, index) => (
              <motion.button
                key={duration.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDuration(duration.value)}
                className={`relative p-8 rounded-2xl border-2 transition-all text-left overflow-hidden group ${
                  selectedDuration === duration.value
                    ? 'border-purple-400 shadow-2xl shadow-purple-500/50'
                    : 'border-gray-700/50 hover:border-gray-600'
                }`}
                style={{
                  background: selectedDuration === duration.value
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))'
                    : 'linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.6))',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {selectedDuration === duration.value && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur-xl"
                  />
                )}

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg">
                      {duration.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {duration.value} Minutes
                      </h3>
                      <p className="text-gray-400">{duration.label} • {duration.description}</p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {duration.value}'
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!selectedDuration}
              className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all ${
                selectedDuration
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-2xl shadow-purple-500/50 transform hover:scale-105'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
