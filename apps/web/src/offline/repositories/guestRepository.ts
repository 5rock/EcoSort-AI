import { v4 as uuidv4 } from 'uuid';
import { historyRepository } from './historyRepository';

export const guestRepository = {
  getGuestId(): string | null {
    return localStorage.getItem('eco_guest_id');
  },

  generateGuestId(): string {
    const id = `GST-${uuidv4().substring(0, 8).toUpperCase()}`;
    localStorage.setItem('eco_guest_id', id);
    return id;
  },

  async clearGuestData(): Promise<void> {
    const guestId = this.getGuestId();
    if (guestId) {
      await historyRepository.clearUserScans(guestId);
      localStorage.removeItem('eco_guest_id');
    }
  }
};
