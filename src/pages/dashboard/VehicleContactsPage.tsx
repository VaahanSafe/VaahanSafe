import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Vehicle } from '@/services/db';
import { 
  useContacts, 
  useCreateContact, 
  useUpdateContact, 
  useDeleteContact, 
  useReorderContacts 
} from '@/features/contacts/contacts.hooks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroupIcon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

import { 
  ContactForm, 
  ContactPriorityList, 
  ContactLimitBanner 
} from '@/components/contacts';

import type { EmergencyContact, ContactFormData } from '@/types/contacts';
import { normalizePhoneNumber } from '@/lib/contacts';

interface VehicleOutletContext {
  vehicle: Vehicle;
  reloadVehicle: () => Promise<void>;
}

export default function VehicleContactsPage() {
  const { vehicle, reloadVehicle } = useOutletContext<VehicleOutletContext>();
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: contactsData, refetch } = useContacts(vehicle.id);
  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();
  const deleteContactMutation = useDeleteContact();
  const reorderContactsMutation = useReorderContacts();

  const contacts: EmergencyContact[] = useMemo(() => {
    if (contactsData && contactsData.length > 0) {
      return contactsData.map((c) => ({
        id: c.id,
        vehicleId: c.vehicle_id,
        name: c.full_name,
        relationship: c.relationship,
        phone: c.phone,
        priority: c.priority_order,
        whatsappEnabled: c.whatsapp_opt_in,
      }));
    }
    const raw = (vehicle.emergencyContacts || []) as (string | EmergencyContact)[];
    return raw.map((item, idx) => {
      if (typeof item === 'string') {
        const parts = item.split(' ');
        const phone = normalizePhoneNumber(parts[0] || '');
        const relRaw = (parts[1] || '').replace(/[()]/g, '');
        return {
          id: `contact-${idx}-${phone}`,
          vehicleId: vehicle.id,
          name: `Contact #${idx + 1}`,
          relationship: relRaw || 'Relative',
          phone: phone,
          whatsappEnabled: true,
          priority: idx + 1,
        };
      }
      return {
        ...item,
        id: item.id || `contact-${idx}`,
        vehicleId: vehicle.id,
        priority: idx + 1,
      };
    });
  }, [contactsData, vehicle]);

  const handleReorder = async (newContacts: EmergencyContact[]) => {
    try {
      const items = newContacts.map((c, index) => ({
        contact_id: c.id,
        priority_order: index + 1,
      }));
      await reorderContactsMutation.mutateAsync({ vehicleId: vehicle.id, items });
      await reloadVehicle();
    } catch (err) {
      console.error('Reorder error', err);
    }
  };

  const handleCreateContact = async (formData: ContactFormData) => {
    if (contacts.length >= 5) {
      toast.error('Maximum limit of 5 emergency contacts reached.');
      return;
    }

    const cleanPhone = normalizePhoneNumber(formData.phone);
    const isDuplicate = contacts.some(c => normalizePhoneNumber(c.phone) === cleanPhone);
    if (isDuplicate) {
      toast.error('A contact with this phone number already exists.');
      return;
    }

    setSubmitting(true);
    try {
      await createContactMutation.mutateAsync({
        vehicleId: vehicle.id,
        payload: {
          full_name: formData.name,
          phone: formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`,
          relationship: formData.relationship,
          priority_order: contacts.length + 1,
          whatsapp_opt_in: formData.whatsappEnabled ?? true,
        },
      });
      await refetch();
      await reloadVehicle();
      toast.success('Emergency contact added successfully!');
    } catch (err) {
      toast.error('Failed to add contact');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateContact = async (formData: ContactFormData) => {
    if (!editingContact) return;

    const cleanPhone = normalizePhoneNumber(formData.phone);
    const isDuplicate = contacts.some(c => c.id !== editingContact.id && normalizePhoneNumber(c.phone) === cleanPhone);
    if (isDuplicate) {
      toast.error('Another contact with this phone number already exists.');
      return;
    }

    setSubmitting(true);

    try {
      await updateContactMutation.mutateAsync({
        vehicleId: vehicle.id,
        contactId: editingContact.id,
        payload: {
          full_name: formData.name,
          phone: formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`,
          relationship: formData.relationship,
          whatsapp_opt_in: formData.whatsappEnabled,
        },
      });
      await refetch();
      await reloadVehicle();
      toast.success('Emergency contact updated!');
    } catch (err) {
      toast.error('Failed to update contact');
    } finally {
      setSubmitting(false);
      setEditingContact(null);
    }
  };

  const requestDeleteContact = (contactId: string) => {
    setDeleteTargetId(contactId);
    setShowDeleteConfirm(true);
  };

  const executeDeleteContact = async () => {
    if (!deleteTargetId) return;
    setSubmitting(true);

    try {
      await deleteContactMutation.mutateAsync({
        vehicleId: vehicle.id,
        contactId: deleteTargetId,
      });
      await refetch();
      await reloadVehicle();
      toast.success('Emergency contact deleted');
    } catch (err) {
      toast.error('Failed to delete contact');
    } finally {
      setSubmitting(false);
      setDeleteTargetId(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleWhatsApp = async (contactId: string, enabled: boolean) => {
    try {
      await updateContactMutation.mutateAsync({
        vehicleId: vehicle.id,
        contactId,
        payload: { whatsapp_opt_in: enabled },
      });
      await refetch();
      await reloadVehicle();
      toast.success(`WhatsApp notifications ${enabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error('Failed to update notification preferences');
    }
  };

  return (
    <div className="space-y-6 text-left w-full font-sans">
      
      {/* 1. Contact Limit Warning Banner (Full width top) */}
      <ContactLimitBanner currentCount={contacts.length} maxCount={5} />

      {/* 2. Grid Layout: Left side contacts list, Right side Add/Edit Form */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols on xl): SOS Emergency Recipients Priority List */}
        <div className="xl:col-span-7 space-y-6">
          <Card className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-md">
            <CardHeader className="p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900 mb-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-white tracking-tight font-display">
                  SOS Emergency Recipients
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Dispatches notify contacts in strict priority order (1 to 5). Drag to reorder.
                </CardDescription>
              </div>
              <div className="size-9 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={UserGroupIcon} className="size-5" />
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-4">
              <ContactPriorityList
                vehicleId={vehicle.id}
                contacts={contacts}
                loading={submitting}
                onReorder={handleReorder}
                onEditContact={(c) => setEditingContact(c)}
                onDeleteContact={requestDeleteContact}
                onToggleWhatsApp={handleToggleWhatsApp}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 cols on xl): Add / Edit Contact Form */}
        <div className="xl:col-span-5 space-y-6">
          {editingContact ? (
            <ContactForm
              mode="edit"
              defaultValues={{
                name: editingContact.name,
                relationship: editingContact.relationship,
                phone: editingContact.phone,
                whatsappEnabled: editingContact.whatsappEnabled,
              }}
              loading={submitting}
              onSubmit={handleUpdateContact}
              onCancel={() => setEditingContact(null)}
            />
          ) : (
            <ContactForm
              mode="create"
              loading={submitting || contacts.length >= 5}
              onSubmit={handleCreateContact}
            />
          )}
        </div>

      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Remove Emergency Contact"
        description="Are you sure you want to remove this contact from your emergency broadcast list? They will no longer receive SMS, voice, or WhatsApp alerts during SOS dispatches."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmationPhrase="DELETE"
        variant="danger"
        onConfirm={executeDeleteContact}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
}
