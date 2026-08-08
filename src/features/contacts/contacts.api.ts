import { apiClient } from '@/lib/http/apiClient';
import { ENDPOINTS } from '@/lib/http/endpoints';
import { contactSchema, contactUpdateSchema } from './contacts.schema';
import type {
  EmergencyContactOut,
  ContactCreateIn,
  ContactUpdateIn,
  ContactReorderIn
} from './contacts.types';

export async function listContacts(vehicleId: string): Promise<EmergencyContactOut[]> {
  const response = await apiClient.get<EmergencyContactOut[]>(ENDPOINTS.CONTACTS.BASE(vehicleId));
  return response.data;
}

export async function createContact(vehicleId: string, payload: ContactCreateIn): Promise<EmergencyContactOut> {
  const validated = contactSchema.parse(payload);
  const response = await apiClient.post<EmergencyContactOut>(ENDPOINTS.CONTACTS.BASE(vehicleId), validated);
  return response.data;
}

export async function updateContact(vehicleId: string, contactId: string, payload: ContactUpdateIn): Promise<EmergencyContactOut> {
  const validated = contactUpdateSchema.parse(payload);
  const response = await apiClient.patch<EmergencyContactOut>(ENDPOINTS.CONTACTS.DETAIL(vehicleId, contactId), validated);
  return response.data;
}

export async function deleteContact(vehicleId: string, contactId: string): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(ENDPOINTS.CONTACTS.DETAIL(vehicleId, contactId));
  return response.data;
}

export async function reorderContacts(vehicleId: string, items: ContactReorderIn[]): Promise<EmergencyContactOut[]> {
  const response = await apiClient.post<EmergencyContactOut[]>(ENDPOINTS.CONTACTS.REORDER(vehicleId), items);
  return response.data;
}
