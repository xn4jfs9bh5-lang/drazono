'use client'

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { WHATSAPP_URL } from '@/lib/constants'
import { motion } from 'framer-motion'

export default function WhatsAppButton() {
  const [pulse, setPulse] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setPulse(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5C] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all min-h-[48px] ${pulse ? 'animate-pulse' : ''}`}
      style={{
        bottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
        right: '1.5rem',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-sm font-medium">WhatsApp</span>
    </motion.a>
  )
}
