import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function HeroResumeMockup() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Ghost card behind */}
      <div className="absolute inset-0 translate-x-4 translate-y-4 rotate-3 rounded-2xl bg-white/60 border border-gray-200/60 shadow-soft" />

      {/* Glow */}
      <div className="absolute -inset-4 bg-blue-200/30 rounded-2xl blur-2xl -z-10" />

      {/* Main card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative bg-white rounded-2xl shadow-soft-lg border border-gray-200/60 overflow-hidden"
      >
        {/* Blue accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600" />

        <div className="p-6 space-y-5">
          {/* Header area */}
          <div className="space-y-2">
            <div className="h-5 w-36 bg-gray-900 rounded" />
            <div className="h-3 w-24 bg-blue-100 rounded" />
          </div>

          {/* AI sparkle indicator */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <div className="h-2 flex-1 bg-blue-50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '75%' }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Experience section */}
          <div className="space-y-3">
            <div className="h-3 w-20 bg-gray-300 rounded" />
            <div className="space-y-2 pl-3 border-l-2 border-gray-100">
              <div className="h-2.5 w-full bg-gray-100 rounded" />
              <div className="h-2.5 w-5/6 bg-gray-100 rounded" />
              <div className="h-2.5 w-4/6 bg-gray-100 rounded" />
            </div>
          </div>

          {/* Another section */}
          <div className="space-y-3">
            <div className="h-3 w-16 bg-gray-300 rounded" />
            <div className="space-y-2 pl-3 border-l-2 border-gray-100">
              <div className="h-2.5 w-full bg-gray-100 rounded" />
              <div className="h-2.5 w-3/4 bg-gray-100 rounded" />
            </div>
          </div>

          {/* Skills pills */}
          <div className="space-y-2">
            <div className="h-3 w-14 bg-gray-300 rounded" />
            <div className="flex flex-wrap gap-2">
              <div className="h-5 w-16 bg-blue-50 rounded-full" />
              <div className="h-5 w-20 bg-blue-50 rounded-full" />
              <div className="h-5 w-14 bg-blue-50 rounded-full" />
              <div className="h-5 w-18 bg-blue-50 rounded-full" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
