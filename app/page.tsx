'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Video, Brain, Award, Shield, Sparkles, Zap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block mb-6"
          >
            <Sparkles className="w-16 h-16 text-purple-400" />
          </motion.div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            AI Video Interview
            <br />
            <span className="text-5xl md:text-6xl">Platform</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience the future of interviews with AI-powered video assessments,
            intelligent question generation, and instant detailed feedback
          </p>
        </motion.header>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          <FeatureCard
            icon={<Video className="w-8 h-8" />}
            title="Video Interviews"
            description="Record and analyze your responses in real-time with advanced video processing"
            gradient="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="AI-Powered"
            description="Intelligent question generation and evaluation using advanced LLM technology"
            gradient="from-purple-500 to-pink-500"
          />
          <FeatureCard
            icon={<Award className="w-8 h-8" />}
            title="Instant Feedback"
            description="Get detailed scores, strengths, and actionable improvement suggestions"
            gradient="from-yellow-500 to-orange-500"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Secure Platform"
            description="Protected interview environment with integrity checks and monitoring"
            gradient="from-green-500 to-emerald-500"
          />
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={() => router.push('/login')}
            className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-5 px-16 rounded-xl text-lg shadow-2xl shadow-purple-500/50 transform transition hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-3">
              <Zap className="w-5 h-5" />
              Start Interview
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm bg-gray-800/50 overflow-hidden group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
      <div className={`text-transparent bg-clip-text bg-gradient-to-r ${gradient} mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
