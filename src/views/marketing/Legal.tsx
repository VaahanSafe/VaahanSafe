import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { SecurityLockIcon } from '@hugeicons/core-free-icons'
import { BackgroundDesign } from '@/components/shared/BackgroundDesign'

export default function Legal() {
  return (
    <BackgroundDesign className="min-h-screen py-12 px-6 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand/20 bg-brand/10 text-brand text-xs font-bold uppercase tracking-widest backdrop-blur-md mb-2">
            <HugeiconsIcon icon={SecurityLockIcon} className="size-3.5" />
            <span>DPDP Act (2023) Compliant</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white font-display tracking-tight">
            Privacy Policy &amp; <span className="bg-gradient-to-r from-[#ff7a00] via-[#f2603f] to-[#e14760] bg-clip-text text-transparent">Terms</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto font-sans leading-relaxed">
            DPDP-Compliant Data Usage Disclosure and Service Terms for VaahanSafe Users.
          </p>
        </motion.div>

        {/* Summary Box */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="p-6 sm:p-7 rounded-lg bg-white/80 dark:bg-[#0c0c0f]/80 backdrop-blur-xl border border-brand/30 dark:border-brand/40 shadow-xl space-y-3 text-left"
        >
          <h3 className="font-bold text-zinc-900 dark:text-white text-xs tracking-wider uppercase font-display flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            Plain Language Summary
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
            We collect your mobile number to bridge calls and up to 5 emergency numbers to dispatch WhatsApp alerts. If you provide it, we also show your blood group and medical notes to help roadside paramedics in an accident. We never sell your data, we never share medical data with insurance companies, and you can delete all your stored data from your dashboard with a single tap.
          </p>
        </motion.div>

        {/* Policy details */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-8 sm:p-10 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-[#0c0c0f]/80 backdrop-blur-xl space-y-8 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed text-left shadow-xl"
        >
          
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white font-display">1. Data Collection &amp; Consent</h2>
            <p>
              VaahanSafe operates in strict compliance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> (India). We collect and process the following information only after receiving explicit consent:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-sans">
              <li><strong>Owner Information:</strong> Name, verified mobile phone number (collected via OTP login).</li>
              <li><strong>Emergency Contacts:</strong> Up to 5 mobile numbers authorized to receive SMS/WhatsApp emergency alerts.</li>
              <li><strong>Medical Parameters (Sensitive Personal Data):</strong> Blood group and medical notes (optional). A separate, standalone opt-in is required to save these details.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white font-display">2. Purpose Limitation</h2>
            <p>
              Your personal information is collected for the sole purpose of vehicle security, calling bridging, and first-responder emergency diagnostics:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-sans">
              <li>Exotel call masking ensures bystanders can coordinate wrong parking alerts without exposing your mobile number.</li>
              <li>AiSensy WhatsApp API dispatches incident photos and live GPS links to emergency contacts during crash reports.</li>
              <li>Roadside paramedics can access blood group and allergy cards on scanning the QR in an unconscious state. This information will <strong>never</strong> be shared with insurance companies, auto aggregators, or marketing networks.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white font-display">3. Geolocation Data</h2>
            <p>
              During an emergency alert report, VaahanSafe requests access to the scanning device's browser Geolocation API. This coordinates live GPS coordinates into a Google Maps link sent to the emergency contacts. Location data is processed ephemerally and is not logged permanently in our background databases.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white font-display">4. User Rights &amp; Deletion Process</h2>
            <p>
              Under DPDP guidelines, you hold absolute rights to access, update, or withdraw consent for your stored data. You can edit contacts and medical notes at any time from your owner dashboard. A visible <strong>"Delete Account &amp; Erase Stored Profile"</strong> option is available on the dashboard, which completely purges your files from our storage databases within 24 hours.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white font-display">5. Breach Response &amp; Contact</h2>
            <p>
              In the unlikely event of a data storage breach, VaahanSafe is committed to notifying the Data Protection Board of India and affected users within 72 hours of verification. If you have questions regarding data compliance, contact our Grievance Officer at:
            </p>
            <div className="font-mono text-xs text-brand bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/80 inline-block shadow-inner">
              Email: compliance@vaahansafe.in | Subject: Grievance Redressal
            </div>
          </section>

        </motion.div>
      </div>
    </BackgroundDesign>
  )
}
