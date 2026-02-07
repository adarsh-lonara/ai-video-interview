'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, MessageSquare, Award, Sparkles, Home, RotateCcw } from 'lucide-react';
import { InterviewFeedback } from '@/types';

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const score = parseInt(searchParams.get('score') || '0');
  const feedbackStr = searchParams.get('feedback');
  const feedback: InterviewFeedback | null = feedbackStr
    ? JSON.parse(decodeURIComponent(feedbackStr))
    : null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-400 to-green-500';
    if (score >= 60) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-emerald-500 to-green-600';
    if (score >= 60) return 'bg-gradient-to-r from-yellow-500 to-orange-600';
    return 'bg-gradient-to-r from-red-500 to-pink-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
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
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-block mb-4"
            >
              <Award className="w-16 h-16 text-purple-400" />
            </motion.div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Interview Results
            </h1>
            <p className="text-xl text-gray-300">
              Your AI-powered performance analysis
            </p>
          </div>

          {/* Score Card */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-8 text-center border border-purple-500/30"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-300 mb-4">Overall Score</h2>
              <div className={`text-8xl font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent mb-2`}>
                {score}
              </div>
              <div className={`text-3xl font-semibold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
                {getScoreLabel(score)}
              </div>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-6 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className={`h-6 rounded-full ${getScoreGradient(score)} shadow-lg`}
              />
            </div>
          </motion.div>

          {/* Detailed Scores */}
          {feedback && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <ScoreCard
                title="Domain Score"
                score={feedback.domainScore}
                icon={<TrendingUp className="w-6 h-6" />}
                gradient="from-blue-500 to-cyan-500"
              />
              <ScoreCard
                title="Communication"
                score={feedback.communicationScore}
                icon={<MessageSquare className="w-6 h-6" />}
                gradient="from-purple-500 to-pink-500"
              />
              <ScoreCard
                title="Technical"
                score={feedback.technicalScore}
                icon={<CheckCircle className="w-6 h-6" />}
                gradient="from-yellow-500 to-orange-500"
              />
            </div>
          )}

          {/* Feedback Section */}
          {feedback && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-purple-500/30"
              >
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  Performance Summary
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg">{feedback.summary}</p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-emerald-900/50 to-green-900/50 rounded-2xl shadow-xl p-6 border border-emerald-500/30 backdrop-blur-sm"
                >
                  <h3 className="text-xl font-semibold text-emerald-300 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Strengths
                  </h3>
                  <ul className="space-y-3">
                    {feedback.strengths.map((strength, index) => (
                      <li key={index} className="text-emerald-200 flex items-start">
                        <span className="mr-2 text-emerald-400">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-2xl shadow-xl p-6 border border-yellow-500/30 backdrop-blur-sm"
                >
                  <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-3">
                    {feedback.areasForImprovement.map((area, index) => (
                      <li key={index} className="text-yellow-200 flex items-start">
                        <span className="mr-2 text-yellow-400">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {feedback.domainSpecificFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-2xl shadow-xl p-6 border border-blue-500/30 backdrop-blur-sm"
                >
                  <h3 className="text-xl font-semibold text-blue-300 mb-4">
                    Domain-Specific Feedback
                  </h3>
                  <p className="text-blue-200 leading-relaxed">
                    {feedback.domainSpecificFeedback}
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12 space-x-4"
          >
            <button
              onClick={() => router.push('/interview/domain')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-8 rounded-xl transition shadow-lg shadow-purple-500/50 flex items-center gap-2 mx-auto mb-4"
            >
              <RotateCcw className="w-5 h-5" />
              Take Another Interview
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-700/50 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-xl transition border border-gray-600 flex items-center gap-2 mx-auto"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function ScoreCard({
  title,
  score,
  icon,
  gradient,
}: {
  title: string;
  score: number;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 text-center border border-purple-500/30"
    >
      <div className={`bg-gradient-to-r ${gradient} w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-gray-300 mb-2">{title}</h4>
      <div className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {score}
      </div>
    </motion.div>
  );
}
