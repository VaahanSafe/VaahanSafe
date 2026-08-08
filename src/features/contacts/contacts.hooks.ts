import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/queryKeys';
import {
  listContacts,
  createContact,
  updateContact,
  deleteContact,
  reorderContacts
} from './contacts.api';
import type {
  EmergencyContactOut,
  ContactCreateIn,
  ContactUpdateIn,
  ContactReorderIn
} from './contacts.types';

export function useContacts(vehicleId: string) {
  return useQuery<EmergencyContactOut[], Error>({
    queryKey: queryKeys.contacts.list(vehicleId),
    queryFn: () => listContacts(vehicleId),
    enabled: Boolean(vehicleId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation<EmergencyContactOut, Error, { vehicleId: string; payload: ContactCreateIn }>({
    mutationFn: ({ vehicleId, payload }) => createContact(vehicleId, payload),
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list(vehicleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.detail(vehicleId) });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation<EmergencyContactOut, Error, { vehicleId: string; contactId: string; payload: ContactUpdateIn }>({
    mutationFn: ({ vehicleId, contactId, payload }) => updateContact(vehicleId, contactId, payload),
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list(vehicleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.detail(vehicleId) });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { vehicleId: string; contactId: string }>({
    mutationFn: ({ vehicleId, contactId }) => deleteContact(vehicleId, contactId),
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list(vehicleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.detail(vehicleId) });
    },
  });
}

export function useReorderContacts() {
  const queryClient = useQueryClient();

  return useMutation<EmergencyContactOut[], Error, { vehicleId: string; items: ContactReorderIn[] }>({
    mutationFn: ({ vehicleId, items }) => reorderContacts(vehicleId, items),
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list(vehicleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.detail(vehicleId) });
    },
  });
}
