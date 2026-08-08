import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'framer-motion'
import { 
  ShoppingBag01Icon, 
  IdentityCardIcon, 
  Location01Icon, 
  SmartPhone01Icon,
  SignalIcon,
  Shield01Icon
} from '@hugeicons/core-free-icons'
import { BackgroundDesign } from '@/components/shared/BackgroundDesign'

export default function HowItWorks() {
  const navigate = useNavigate()
  const steps = [
    {
      number: '01',
      title: 'Choose and Buy a Sticker',
      desc: 'Select from our Basic, Shield, or Family Pro subscription tiers. We print a high-durability, weatherproof QR sticker and ship it directly to your address.',
      icon: <HugeiconsIcon icon={ShoppingBag01Icon} className="h-6 w-6" />
    },
    {
      number: '02',
      title: 'Register Vehicle Details',
      desc: 'Scan your sticker when it arrives to link it to your profile. Enter your vehicle number, up to 5 emergency contacts, and blood group. Your data is stored securely.',
      icon: <HugeiconsIcon icon={IdentityCardIcon} className="h-6 w-6" />
    },
    {
      number: '03',
      title: 'Affix Sticker on Windshield',
      desc: 'Place the QR sticker on the bottom left corner of your front windshield. It remains highly visible to paramedics, traffic police, or other vehicle owners.',
      icon: <HugeiconsIcon icon={Location01Icon} className="h-6 w-6" />
    },
    {
      number: '04',
      title: 'Bystander Initiates Scan',
      desc: 'In wrong parking or crash scenarios, anyone scans the QR using their phone. They choose Wrong Parking (rings owner anonymously via Exotel) or Emergency (coordinates + photo sent to your family via AiSensy).',
      icon: <HugeiconsIcon icon={SmartPhone01Icon} className="h-6 w-6" />
    }
  ];

  return (
    <BackgroundDesign className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header Section */}
        <div className="text-center space-y-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand/20 bg-brand/10 text-brand text-xs font-bold uppercase tracking-widest backdrop-blur-md mb-2"
          >
            <HugeiconsIcon icon={Shield01Icon} className="size-3.5" />
            <span>4-Step Protection Ecosystem</span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
            How VaahanSafe <span className="bg-gradient-to-r from-[#ff7a00] via-[#f2603f] to-[#e14760] bg-clip-text text-transparent">Protects You</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Setting up your vehicle security system is quick, completely anonymous, and requires no complicated apps.
          </p>
        </div>

        {/* Step Grid */}
        <div className="space-y-10 relative">
          {/* Glowing vertical timeline line */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'top' }}
            className="absolute inset-y-0 left-6 w-0.5 bg-gradient-to-b from-[#fa8816] via-[#f2603f] to-[#e14760] opacity-50 dark:opacity-80 shadow-[0_0_12px_rgba(250,136,22,0.6)]"
          />

          {steps.map((step, index) => (
            <div key={index} className="relative flex gap-6 sm:gap-8 items-start group">
              {/* Step Icon circle */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-[#0f0f13] border border-zinc-200 dark:border-zinc-800/90 text-brand shadow-lg group-hover:border-brand/50 group-hover:shadow-[0_0_20px_rgba(255,122,0,0.25)] transition-all duration-300"
              >
                {step.icon}
              </motion.div>

              {/* Step Content Card */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 p-6 sm:p-7 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-[#0c0c0f]/80 backdrop-blur-xl space-y-3 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] group-hover:border-brand/40 dark:group-hover:border-brand/35 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest text-brand font-mono">STEP {step.number}</span>
                  <span className="h-2 w-2 rounded-full bg-brand animate-pulse"></span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white font-display tracking-tight">{step.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">{step.desc}</p>
              </motion.div>
            </div>
          ))}
        </div>

        {/* IVR Fallback warning notice */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 rounded-lg bg-white/60 dark:bg-[#0c0c0f]/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 text-center space-y-3 shadow-lg"
        >
          <h4 className="font-bold text-foreground text-base flex items-center justify-center gap-2">
            <HugeiconsIcon icon={SignalIcon} className="size-4 text-brand" />
            Offline Fallback Option
          </h4>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            No internet? No problem. Every sticker includes an Exotel offline IVR number. Bystanders can call the printed number and enter the vehicle's unique ID to connect to the owner directly without access to mobile data.
          </p>
        </motion.div>

        <div className="text-center pt-2">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="h-12 px-9 rounded-lg bg-gradient-to-r from-[#ff7a00] to-[#f2603f] hover:from-[#ff881a] hover:to-[#f47052] font-bold text-white shadow-xl shadow-brand/25 transition-all cursor-pointer text-sm font-sans tracking-wide"
          >
            Secure Your Vehicle Now
          </Button>
        </div>
      </div>
    </BackgroundDesign>
  )
}
