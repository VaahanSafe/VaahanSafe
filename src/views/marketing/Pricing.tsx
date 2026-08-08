import { useNavigate } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { LockIcon, Shield01Icon } from '@hugeicons/core-free-icons'
import { motion } from 'framer-motion'
import { BackgroundDesign } from '@/components/shared/BackgroundDesign'

export default function Pricing() {
  const navigate = useNavigate()
  const tiers = [
    {
      name: 'Basic',
      price: '299',
      period: 'year',
      desc: 'Simple wrong parking alerts for single commuters.',
      features: [
        '1 High-Durability QR Sticker',
        '100% Masked Owner Calling',
        '1 Emergency Contact Notification',
        'Pause Alerts Option',
        'Standard Email Support'
      ],
      popular: false,
      cta: 'Choose Basic'
    },
    {
      name: 'Shield',
      price: '499',
      period: 'year',
      desc: 'Full roadside safety & medical identity guard.',
      features: [
        '1 Metallic Finished QR Sticker',
        '100% Masked Owner Calling',
        'Up to 3 Emergency Contacts',
        'Incident Photo & Geolocation SOS',
        'First Responder Medical Card',
        'Pause Alerts Option',
        'Priority Support'
      ],
      popular: true,
      cta: 'Secure My Vehicle'
    },
    {
      name: 'Family Pro',
      price: '899',
      period: 'year',
      desc: 'Multi-vehicle protection for the entire family.',
      features: [
        '3 High-Durability QR Stickers',
        '100% Masked Owner Calling',
        'Up to 5 Emergency Contacts per QR',
        'Incident Photo & Geolocation SOS',
        'First Responder Medical Card',
        'Independent Alert Management',
        '24/7 Dedicated Call Support'
      ],
      popular: false,
      cta: 'Get Family Pro'
    }
  ];

  return (
    <BackgroundDesign className="min-h-screen py-12 px-6 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand/20 bg-brand/10 text-brand text-xs font-bold uppercase tracking-widest backdrop-blur-md mb-2">
            <HugeiconsIcon icon={Shield01Icon} className="size-3.5" />
            <span>Annual Subscriptions</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white font-display tracking-tight">
            Simple, Predictable <span className="bg-gradient-to-r from-[#ff7a00] via-[#f2603f] to-[#e14760] bg-clip-text text-transparent">Pricing</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto text-xs sm:text-sm font-sans leading-relaxed">
            No monthly charges. Pay once a year to secure your vehicle and keep your emergency contacts in the loop.
          </p>
        </motion.div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch relative z-10">
          {tiers.map((tier, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, scale: 1.005 }}
              className={`p-8 rounded-lg border flex flex-col justify-between relative bg-white/70 dark:bg-[#0c0c0f]/80 backdrop-blur-xl shadow-xl transition-all duration-300 ${
                tier.popular 
                  ? 'border-brand/50 shadow-[0_12px_40px_rgba(250,136,22,0.15)] ring-1 ring-brand/30' 
                  : 'border-zinc-200/80 dark:border-zinc-800/80 hover:border-brand/40'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#ff7a00] to-[#f2603f] text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                  RECOMMENDED
                </span>
              )}

              <div className="space-y-6">
                <div className="space-y-2 text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white font-display tracking-tight">{tier.name}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">{tier.desc}</p>
                </div>

                <div className="flex items-baseline text-zinc-900 dark:text-white text-left">
                  <span className="text-2xl font-extrabold text-brand">₹</span>
                  {tier.popular ? (
                    <span className="text-5xl font-black tracking-tight bg-gradient-to-r from-[#fa8816] to-[#e14760] bg-clip-text text-transparent font-display">
                      {tier.price}
                    </span>
                  ) : (
                    <span className="text-5xl font-black tracking-tight font-display">{tier.price}</span>
                  )}
                  <span className="ml-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono">/{tier.period}</span>
                </div>

                <ul className="space-y-3.5 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-6 text-left">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <svg className="h-4 w-4 shrink-0 text-brand mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-sans leading-normal">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => navigate('/dashboard')}
                className={`w-full mt-8 py-3 rounded-lg font-bold transition-all cursor-pointer text-xs tracking-wide ${
                  tier.popular 
                    ? 'bg-gradient-to-r from-[#ff7a00] to-[#f2603f] hover:from-[#ff881a] hover:to-[#f47052] text-white shadow-lg shadow-brand/25' 
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="p-6 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 text-center max-w-3xl mx-auto space-y-2 bg-white/60 dark:bg-[#0c0c0f]/60 backdrop-blur-xl shadow-lg relative z-10"
        >
          <h4 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center justify-center gap-2 font-display">
            <HugeiconsIcon icon={LockIcon} className="size-4 text-brand" />
            Razorpay Secured Payments
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
            All transactions are processed over encrypted SSL channels with Razorpay. We do not store your credit/debit card numbers. Renewals are optional — no auto-debit surprise billing.
          </p>
        </motion.div>
      </div>
    </BackgroundDesign>
  )
}
