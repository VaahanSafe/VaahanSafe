import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HugeiconsIcon } from '@hugeicons/react';
import { User02Icon, Mail01Icon, MapsIcon, ArrowRight01Icon, Location01Icon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';

import { useUpdateProfile } from '@/features/owners/owners.hooks';
import { suggestLocation, reverseGeocodeLocation } from '@/features/owners/owners.api';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') ? decodeURIComponent(searchParams.get('returnTo')!) : '/dashboard';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Mumbai');

  // Suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  
  const updateProfileMutation = useUpdateProfile();
  const isLoading = updateProfileMutation.isPending;

  // Handle click outside suggestions
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (!city.trim() || city.length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await suggestLocation(city);
        setSuggestions(res);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [city]);

  const handleSelectCity = (selectedCity: string) => {
    setCity(selectedCity);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    toast.info('Fetching your current coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await reverseGeocodeLocation(latitude, longitude);
          if (data && data.address) {
            setCity(data.address);
            toast.success(`Location detected: ${data.address}`);
          } else {
            toast.error('Could not resolve location name');
          }
        } catch (err: any) {
          toast.error(err.message || 'Failed to reverse geocode location');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error(error);
        let errorMsg = 'Failed to retrieve location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please search your city manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location position unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out.';
        }
        toast.error(errorMsg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        full_name: fullName,
        email: email.trim() || undefined,
        city: city || undefined,
      });
      toast.success('Onboarding profile completed successfully!');
      navigate(returnTo, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  return (
    <Card className="glass-panel border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0c0c0f]/95 shadow-2xl p-6 w-full max-w-sm mx-auto space-y-6 text-left text-zinc-950 dark:text-white font-sans transition-colors duration-300">
      <CardHeader className="p-0 text-center space-y-1.5">
        <CardTitle className="text-xl font-black text-zinc-900 dark:text-white font-display">
          Complete Profile
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
          Just one step before access: complete your credential record.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500 font-bold uppercase">Full Name</label>
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 focus-within:border-brand dark:focus-within:border-brand rounded-lg transition-all">
            <HugeiconsIcon icon={User02Icon} className="size-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <Input
              type="text"
              placeholder="Aditya Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-transparent dark:bg-transparent border-none dark:border-none shadow-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-650 p-0 text-sm font-semibold h-9 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:ring-0 focus:border-none"
              required
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500 font-bold uppercase">Email Address (Optional)</label>
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 focus-within:border-brand dark:focus-within:border-brand rounded-lg transition-all">
            <HugeiconsIcon icon={Mail01Icon} className="size-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <Input
              type="email"
              placeholder="aditya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent dark:bg-transparent border-none dark:border-none shadow-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-650 p-0 text-sm font-semibold h-9 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:ring-0 focus:border-none"
            />
          </div>
        </div>

        {/* City Input & Suggestion Autocomplete */}
        <div ref={containerRef} className="space-y-1.5 relative">
          <label className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500 font-bold uppercase flex justify-between items-center">
            <span>Registered City</span>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="text-[10px] font-mono text-brand dark:text-brand hover:opacity-85 active:scale-95 transition-all flex items-center gap-1 cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed uppercase font-extrabold"
            >
              {isLocating ? (
                <>
                  <div className="size-2.5 rounded-full border border-current border-t-transparent animate-spin" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={Location01Icon} className="size-3 text-brand" />
                  <span>Detect Location</span>
                </>
              )}
            </button>
          </label>

          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 focus-within:border-brand dark:focus-within:border-brand rounded-lg transition-all relative">
            <HugeiconsIcon icon={MapsIcon} className="size-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <Input
              type="text"
              placeholder="Start typing your city (e.g. Mumbai)"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="bg-transparent dark:bg-transparent border-none dark:border-none shadow-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-650 p-0 text-sm font-semibold h-9 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:ring-0 focus:border-none w-full"
              required
            />
          </div>

          {/* Suggestions Dropdown Overlay */}
          {showSuggestions && (city.trim().length >= 2) && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800/80 rounded-lg shadow-2xl overflow-hidden max-h-48 overflow-y-auto no-scrollbar">
              {isSearching ? (
                <div className="flex items-center justify-center py-4 text-xs text-zinc-400">
                  <div className="size-4 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin mr-2" />
                  <span>Searching locations...</span>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="py-4 text-center text-xs text-zinc-400">
                  No suggestions found. Keep typing...
                </div>
              ) : (
                suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectCity(item)}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white border-none cursor-pointer transition-colors block truncate"
                  >
                    {item}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Popular Cities Quick Selection */}
          <div className="pt-1.5">
            <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-550 block mb-1">POPULAR:</span>
            <div className="flex flex-wrap gap-1.5">
              {['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai'].map((popCity) => (
                <button
                  key={popCity}
                  type="button"
                  onClick={() => handleSelectCity(popCity)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    city.toLowerCase().includes(popCity.toLowerCase())
                      ? 'bg-brand/10 border-brand text-brand'
                      : 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {popCity}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading || !fullName.trim()}
          className="w-full h-10 bg-brand hover:opacity-90 font-extrabold text-white text-xs uppercase tracking-widest cursor-pointer border-none"
        >
          {isLoading ? (
            'Saving settings...'
          ) : (
            <div className="flex items-center gap-2">
              <span>Go to Cockpit</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
            </div>
          )}
        </Button>
      </form>
    </Card>
  );
}
