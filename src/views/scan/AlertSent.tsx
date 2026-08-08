import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Call02Icon } from '@hugeicons/core-free-icons'
import { SuccessCheck } from '../../components/svg'

interface AlertSentProps {
  vehicleId: string
  onRestart: () => void
}

export default function AlertSent({ vehicleId, onRestart }: AlertSentProps) {
  return (
    <div className="max-w-md mx-auto space-y-8 py-8 px-4 text-center select-none font-sans">
      
      {/* Success Badge */}
      <div className="space-y-4">
        <SuccessCheck size={120} className="mx-auto" />
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-foreground font-display tracking-wide">Alert sent.</h2>
          <p className="text-xs text-muted-foreground">Coordinates and incident details have been successfully dispatched.</p>
        </div>
      </div>

      {/* Confirmation Details Card */}
      <Card className="glass-panel border-border text-left font-mono text-[11px]">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">LOG ID: {vehicleId.toUpperCase()}</span>
            <span className="text-green-500 font-bold uppercase tracking-wider font-sans text-[10px]">DISPATCHED</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">GPS Coordinates:</span>
              <span className="text-foreground">Sent via Google Maps link</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Incident Snap:</span>
              <span className="text-foreground">Attached as JPEG media</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Call Masking:</span>
              <span className="text-foreground">Exotel private bridge armed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MANUAL 112 DIAL BUTTON (P0) */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="space-y-1">
          <span className="text-xs font-bold text-foreground block font-display tracking-wide">Need Professional Rescue Support?</span>
          <p className="text-[10px] text-muted-foreground max-w-xs mx-auto leading-relaxed font-sans">
            Safety alerts are sent *only* to the owner's emergency WhatsApp contacts. You can manually place an additional call to India's public response services here:
          </p>
        </div>
        
        <a 
          href="tel:112"
          className="w-full inline-flex items-center justify-center gap-3 p-5 rounded-lg bg-emergency hover:bg-emergency-dark text-white font-extrabold text-base tracking-wide shadow-lg shadow-emergency/25 transition-all cursor-pointer border border-emergency-dark/30 active:scale-[0.97]"
        >
          <HugeiconsIcon icon={Call02Icon} className="h-6 w-6 text-white" />
          DIAL 112 MANUAL HOTLINE
        </a>
      </div>

      <Button 
        onClick={onRestart}
        variant="secondary"
        className="w-full h-11 rounded-lg text-foreground font-bold border border-border text-xs transition-all cursor-pointer"
      >
        Return to Vehicle Options
      </Button>

    </div>
  )
}
