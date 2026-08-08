import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/auth.store';
import { useOwnerProfile, useUpdateProfile, useRequestDeletion } from '@/features/owners/owners.hooks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HugeiconsIcon } from '@hugeicons/react';
import { toast } from 'sonner';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { 
  User02Icon, 
  Mail01Icon, 
  Location01Icon,
  Delete02Icon,
  AlertCircleIcon
} from '@hugeicons/core-free-icons';

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { phone, logoutStore } = useAuthStore();
  const { data: profile, isLoading } = useOwnerProfile();
  const updateProfileMutation = useUpdateProfile();
  const requestDeletionMutation = useRequestDeletion();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');

  // Account erasure state
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState('');

  const TARGET_CONFIRM_PHRASE = 'DELETE MY DATA';

  // Populate form from live profile query data
  useEffect(() => {
    if (profile?.owner) {
      setName(profile.owner.full_name || '');
      setEmail(profile.owner.email || '');
      setCity(profile.owner.city || '');
    }
  }, [profile]);

  // Save changes handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync({
        full_name: name,
        email: email.trim() || undefined,
        city: city.trim() || undefined,
      });
      toast.success('Profile settings updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  // DPDP Erasure Request handler
  const handleRequestErasure = async () => {
    if (confirmPhrase !== TARGET_CONFIRM_PHRASE) return;
    try {
      const res = await requestDeletionMutation.mutateAsync();
      toast.success(res.message || 'DPDP Erasure request registered. Logging out...');
      setTimeout(() => {
        logoutStore();
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit erasure request');
    } finally {
      setDeleteAlertOpen(false);
    }
  };

  return (
    <div className="w-full space-y-6 text-left py-4">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-serif tracking-tight uppercase">
          Account Settings
        </h1>
        <p className="text-xs text-zinc-500 mt-1 leading-normal">
          Manage your personal details, email alerts, and data erasure requests under DPDP regulations.
        </p>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 shadow-md">
            <CardHeader className="p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900 mb-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Personal Profile Settings</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Provide contact defaults for telemetry alerts.</CardDescription>
              </div>
              <HugeiconsIcon icon={User02Icon} className="size-5 text-brand" />
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Full Name</label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        className="h-9.5 text-xs rounded-lg border border-zinc-250 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white pl-9 focus-visible:ring-[#ff7a00]/30"
                      />
                      <HugeiconsIcon icon={User02Icon} className="size-4 text-zinc-600 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Email Address</label>
                    <div className="relative">
                      <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="h-9.5 text-xs rounded-lg border border-zinc-250 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white pl-9 focus-visible:ring-[#ff7a00]/30"
                      />
                      <HugeiconsIcon icon={Mail01Icon} className="size-4 text-zinc-600 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Registered Phone</label>
                    <Input
                      type="text"
                      value={phone || ''}
                      disabled
                      className="h-9.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-500 cursor-not-allowed opacity-60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Current City</label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        required
                        className="h-9.5 text-xs rounded-lg border border-zinc-250 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white pl-9 focus-visible:ring-[#ff7a00]/30"
                      />
                      <HugeiconsIcon icon={Location01Icon} className="size-4 text-zinc-600 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending || isLoading}
                    className="w-full sm:w-auto h-9.5 px-6 bg-brand hover:opacity-90 text-white text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer"
                  >
                    {updateProfileMutation.isPending ? 'Saving Changes...' : 'Save Settings'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: DPDP Privacy Deletion Card */}
        <div className="lg:col-span-1">
          <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 shadow-md h-full flex flex-col justify-between">
            <div>
              <CardHeader className="p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900 mb-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Privacy & Erasure Control</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">DPDP Data Erasure Compliance.</CardDescription>
                </div>
                <HugeiconsIcon icon={Delete02Icon} className="size-5 text-red-500" />
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  In compliance with Digital Personal Data Protection (DPDP) standards, you can request complete erasure of your VaahanSafe records.
                </p>
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg space-y-1">
                  <span className="text-[9px] uppercase font-black text-red-500 dark:text-red-400 tracking-wide block">Wipe Warning</span>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    This will queue complete database erasure, deleting active decals, vehicle logs, scan histories, and emergency contacts. This action cannot be reversed.
                  </p>
                </div>
              </CardContent>
            </div>
            
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-900/60 mt-6">
              <Button
                onClick={() => {
                  setConfirmPhrase('');
                  setDeleteAlertOpen(true);
                }}
                className="w-full h-10 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer"
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 text-zinc-900 dark:text-white rounded-lg max-w-md p-6 select-none">
          <AlertDialogHeader className="text-left">
            <div className="size-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-red-500" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-zinc-900 dark:text-white font-serif uppercase tracking-wider">Confirm Account Erasure</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-550 dark:text-zinc-500 mt-1 leading-normal">
              Type the confirmation phrase <strong className="text-zinc-900 dark:text-white">DELETE MY DATA</strong> inside the input box below to authorize erasure processing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4 space-y-2">
            <Input
              type="text"
              placeholder="Type phrase here..."
              value={confirmPhrase}
              onChange={e => setConfirmPhrase(e.target.value)}
              className="h-10 text-xs rounded-lg border border-zinc-250 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white focus-visible:ring-red-500/30"
            />
          </div>

          <AlertDialogFooter className="flex justify-end gap-2">
            <AlertDialogCancel className="h-9.5 px-4 rounded-lg border-zinc-250 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white bg-transparent text-xs font-bold uppercase tracking-wider cursor-pointer">
              Abort
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRequestErasure();
              }}
              disabled={confirmPhrase !== TARGET_CONFIRM_PHRASE || requestDeletionMutation.isPending}
              className="h-9.5 px-5 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer"
            >
              {requestDeletionMutation.isPending ? 'Processing...' : 'Confirm Erasure'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
