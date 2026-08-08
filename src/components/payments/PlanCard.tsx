import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Spinner } from '@/components/ui/spinner';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckIcon, Rocket01Icon, PackageIcon, HelpCircleIcon } from '@hugeicons/core-free-icons';
import type { SubscriptionPlan, PlanCardProps } from '@/types/payments';
import { formatCurrency, planBadgeLabel } from '@/lib/payments';
import { cn } from '@/lib/utils';

export const PlanCard: React.FC<PlanCardProps & { billingCycle?: 'monthly' | 'yearly'; hideCTA?: boolean }> = React.memo(({
  plan,
  selected = false,
  current = false,
  loading = false,
  onSelect,
  billingCycle = 'yearly',
  hideCTA = false,
}) => {
  const isYearly = billingCycle === 'yearly';
  const price = isYearly ? plan.priceYearly : plan.priceMonthly;
  const badgeText = planBadgeLabel(plan);
  const isRecommended = plan.popular;

  // Highlight classes based on selection/recommended status
  const cardBorderClasses = useMemo(() => {
    if (selected) {
      return 'border-primary ring-1 ring-primary/45 bg-zinc-950/80 dark:bg-black/90 shadow-[0_0_20px_rgba(250,136,22,0.1)]';
    }
    return 'border-zinc-800 bg-[#0c0c0e]/95 hover:border-zinc-700 hover:bg-[#121215]';
  }, [selected]);

  const handleCardClick = () => {
    if (!current && onSelect) {
      onSelect(plan);
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        whileHover={{ y: current ? 0 : -4 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={handleCardClick}
        className={cn(
          'relative flex flex-col h-full w-full select-none cursor-pointer',
          current && 'cursor-default pointer-events-none'
        )}
      >
        {/* RECOMMENDED badge centered on the top border */}
        {isRecommended && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
            <Badge className="bg-primary hover:bg-primary text-primary-foreground font-black text-[9px] tracking-wider px-3.5 py-0.5 rounded-lg border-none shadow-md uppercase">
              Recommended
            </Badge>
          </div>
        )}

        <Card
          className={cn(
            'relative flex flex-col h-full text-card-foreground transition-all duration-200 border text-left p-6 gap-0 rounded-lg',
            cardBorderClasses
          )}
        >
          {/* Top-Right Selection Indicator (Radio Button Style) */}
          {!current && (
            <div className="absolute top-5 right-5 z-10">
              {selected ? (
                <div className="size-4.5 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <div className="size-1.5 rounded-full bg-white" />
                </div>
              ) : (
                <div className="size-4.5 rounded-full border-2 border-zinc-700/80 bg-transparent hover:border-zinc-650" />
              )}
            </div>
          )}

          {/* Current plan badge fallback */}
          {current && (
            <div className="absolute top-5 right-5 z-10">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-lg text-[9px] tracking-wider uppercase border border-emerald-500/20">
                Active
              </Badge>
            </div>
          )}

          <div className="flex flex-col gap-1 pr-6">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-extrabold tracking-tight text-foreground font-display">
                {plan.name}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground/80 mt-0.5 min-h-[32px] leading-relaxed">
              {plan.features.length > 0 ? (
                plan.id === 'Basic' || plan.id === 'free'
                  ? 'Simple wrong parking alerts for single commuters.'
                  : plan.id === 'Shield' || plan.id === 'shield'
                  ? 'Roadside health telemetry & medical identity guard.'
                  : 'Multi-vehicle protection for family fleets.'
              ) : ''}
            </CardDescription>
          </div>

          {/* Pricing display */}
          <div className="flex items-baseline gap-1 mt-4">
            <span className="text-2xl font-extrabold tracking-tight text-foreground">
              ₹{price}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground">
              /{isYearly ? 'yr' : 'mo'}
            </span>
          </div>

          {/* Thin horizontal line divider below price */}
          <div className="h-px bg-zinc-800/80 dark:bg-zinc-900 my-4" />

          {/* Feature List */}
          <div className="space-y-3.5 flex-1">
            <ul className="space-y-3">
              {plan.features.map((feature, idx) => (
                <li
                  key={idx}
                  className={cn(
                    'flex items-start gap-2.5 text-xs text-foreground/90 font-medium'
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    <HugeiconsIcon
                      icon={CheckIcon}
                      className="size-3.5 text-primary"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span className="flex-1 leading-snug">{feature.text}</span>
                  {feature.tooltip && (
                    <Tooltip>
                      <TooltipTrigger
                        className="text-muted-foreground/50 hover:text-foreground transition-colors cursor-help shrink-0 mt-0.5 outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-full"
                        aria-label={`More info about ${feature.text}`}
                      >
                        <HugeiconsIcon icon={HelpCircleIcon} className="size-3" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-[10px] font-normal leading-normal max-w-xs bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 p-2 rounded-lg">
                        {feature.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Optional CTA Button */}
          {!hideCTA && (
            <CardFooter className="pt-5 border-t border-zinc-800/50 mt-5 p-0">
              <Button
                className={cn(
                  'w-full font-semibold transition-all duration-200 rounded-lg text-xs gap-1.5 h-9 justify-center items-center',
                  selected
                    ? 'bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/10'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/80'
                )}
                variant={current ? 'outline' : 'default'}
                disabled={current || loading}
                onClick={(e) => {
                  e.stopPropagation(); // Avoid triggering parent div click
                  handleCardClick();
                }}
              >
                {loading ? (
                  <Spinner className="size-3.5 text-current animate-spin" />
                ) : current ? (
                  'Current Active Plan'
                ) : (
                  <>
                    <HugeiconsIcon icon={Rocket01Icon} className="size-3.5" />
                    Select Plan
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </TooltipProvider>
  );
});

PlanCard.displayName = 'PlanCard';
