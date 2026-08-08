import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { HelpCircleIcon } from '@hugeicons/core-free-icons'
import { BackgroundDesign } from '@/components/shared/BackgroundDesign'

interface FAQItem {
  q: string
  a: string
}

export default function FAQ() {
  const faqs: FAQItem[] = [
    {
      q: 'How does masked calling work? Can someone see my number?',
      a: 'No. When a bystander scans your QR sticker and taps "Wrong Parking," the system uses our Exotel telephony bridge. It dials your number and the scanner\'s number simultaneously and connects the call anonymously. Neither of you sees the other\'s actual mobile number.'
    },
    {
      q: 'What prevents people from sending prank emergency alerts?',
      a: 'We have built three levels of prank protection. First, the Emergency flow requires a mandatory browser camera snap of the vehicle/incident to submit an alert. Second, we enforce rate-limiting via our backend (maximum 2 scans per hour per vehicle). Third, we display prominent legal warning notifications regarding the misuse of emergency services.'
    },
    {
      q: 'Why do you ask for my blood group and medical notes?',
      a: 'In a major highway collision or roadside emergency, first responders (like ambulance paramedics) need to act quickly. If you choose to fill in these fields, they are visible immediately upon scanning the QR code, saving crucial time when administering a blood transfusion or avoiding severe drug allergies.'
    },
    {
      q: 'Can I disable the QR sticker alerts temporarily?',
      a: 'Yes. If you leave your car at a workshop for servicing or a valet parking lot, you can toggle "Pause Alerts" from your dashboard. This temporarily blocks bystander scans from triggering calls or sending SMS alerts, preventing false-alarm fatigue.'
    },
    {
      q: 'Is VaahanSafe compliant with the DPDP Act in India?',
      a: 'Absolutely. We collect medical data (blood group, allergies) under explicit consent criteria required by India\'s Digital Personal Data Protection Act. We do not share your medical parameters with insurance providers, advertising networks, or third parties.'
    },
    {
      q: 'How does the offline IVR option function?',
      a: 'Every physical sticker has an Exotel offline dial-in number printed on it. If a scanner is in a remote area with zero data connectivity, they can dial the offline helpline, key in your vehicle ID, and Exotel bridges the call to you entirely offline.'
    }
  ];

  return (
    <BackgroundDesign className="min-h-screen py-12 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto space-y-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand/20 bg-brand/10 text-brand text-xs font-bold uppercase tracking-widest backdrop-blur-md mb-2">
            <HugeiconsIcon icon={HelpCircleIcon} className="size-3.5" />
            <span>Support &amp; FAQ Desk</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white font-display tracking-tight">
            Frequently Asked <span className="bg-gradient-to-r from-[#ff7a00] via-[#f2603f] to-[#e14760] bg-clip-text text-transparent">Questions</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto text-xs sm:text-sm font-sans leading-relaxed">
            Everything you need to know about vehicle privacy, emergency alert dispatches, and roadside safety.
          </p>
        </motion.div>

        {/* Accordion list */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-4"
        >
          <Accordion defaultValue={['faq-0']} className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`} 
                className="rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-[#0c0c0f]/80 backdrop-blur-xl px-6 py-4 hover:border-brand/40 transition-all duration-300 shadow-lg"
              >
                <AccordionTrigger className="text-zinc-900 dark:text-white font-bold text-sm sm:text-base hover:text-brand dark:hover:text-brand hover:no-underline cursor-pointer text-left leading-snug">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed pt-3 font-sans">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </BackgroundDesign>
  )
}
