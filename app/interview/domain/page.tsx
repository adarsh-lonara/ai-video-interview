'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { InterviewDomain } from '@/types';
import { 
  Code, 
  Megaphone, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Database,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const domains: Array<{ name: InterviewDomain; icon: React.ReactNode; color: string; gradient: string; description: string }> = [
  {
    name: 'Technology',
    icon: <Code className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    description: 'Software development, systems, and technical expertise'
  },
  {
    name: 'Marketing',
    icon: <Megaphone className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-purple-500 to-pink-500',
    description: 'Digital marketing, branding, and campaign strategies'
  },
  {
    name: 'Sales',
    icon: <TrendingUp className="w-8 h-8" />,
    color: 'from-green-500 to-emerald-500',
    gradient: 'bg-gradient-to-br from-green-500 to-emerald-500',
    description: 'Sales techniques, client relations, and revenue growth'
  },
  {
    name: 'HR',
    icon: <Users className="w-8 h-8" />,
    color: 'from-orange-500 to-red-500',
    gradient: 'bg-gradient-to-br from-orange-500 to-red-500',
    description: 'Human resources, talent management, and organizational development'
  },
  {
    name: 'Finance',
    icon: <DollarSign className="w-8 h-8" />,
    color: 'from-yellow-500 to-amber-500',
    gradient: 'bg-gradient-to-br from-yellow-500 to-amber-500',
    description: 'Financial analysis, accounting, and investment strategies'
  },
  {
    name: 'Data Science',
    icon: <Database className="w-8 h-8" />,
    color: 'from-indigo-500 to-purple-500',
    gradient: 'bg-gradient-to-br from-indigo-500 to-purple-500',
    description: 'Data analysis, machine learning, and statistical modeling'
  },
];

export default function DomainSelectionPage() {
  const router = useRouter();
  const [selectedDomain, setSelectedDomain] = useState<InterviewDomain | null>(null);
  const [hoveredDomain, setHoveredDomain] = useState<InterviewDomain | null>(null);

  const handleContinue = () => {
    if (selectedDomain) {
      router.push(`/interview/duration?domain=${selectedDomain}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-16 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-block mb-4"
            >
              <Sparkles className="w-12 h-12 text-purple-400" />
            </motion.div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Select Your Interview Domain
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose the domain that best matches your expertise. Our AI will tailor questions specifically for you.
            </p>
          </div>

          {/* Domain Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {domains.map((domain, index) => (
              <motion.button
                key={domain.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setHoveredDomain(domain.name)}
                onMouseLeave={() => setHoveredDomain(null)}
                onClick={() => setSelectedDomain(domain.name)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden group ${
                  selectedDomain === domain.name
                    ? 'border-purple-400 shadow-2xl shadow-purple-500/50'
                    : hoveredDomain === domain.name
                    ? 'border-gray-600 shadow-xl'
                    : 'border-gray-700/50 hover:border-gray-600'
                }`}
                style={{
                  background: selectedDomain === domain.name
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))'
                    : 'linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.6))',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {/* Glow effect */}
                {selectedDomain === domain.name && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`absolute inset-0 ${domain.gradient} opacity-20 blur-xl`}
                  />
                )}

                <div className="relative z-10">
                  <div className={`${domain.gradient} w-16 h-16 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg transform transition-transform group-hover:rotate-6`}>
                    {domain.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{domain.name}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{domain.description}</p>
                  
                  {selectedDomain === domain.name && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-4 flex items-center text-purple-400 font-semibold"
                    >
                      <span>Selected</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <button
              onClick={handleContinue}
              disabled={!selectedDomain}
              className={`relative px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                selectedDomain
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-2xl shadow-purple-500/50 transform hover:scale-105'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedDomain ? (
                <>
                  <span className="relative z-10 flex items-center gap-2">
                    Continue to Duration Selection
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </>
              ) : (
                'Select a Domain to Continue'
              )}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
