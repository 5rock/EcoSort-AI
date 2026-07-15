import { guestRepository } from '../../../offline/repositories/guestRepository';
import { useAuthStore } from '../stores/authStore';

export const guestService = {
  loginAsGuest() {
    let guestId = guestRepository.getGuestId();
    if (!guestId) {
      guestId = guestRepository.generateGuestId();
    }
    useAuthStore.getState().setGuest(guestId);
    return guestId;
  },

  async logoutGuest() {
    await guestRepository.clearGuestData();
    useAuthStore.getState().logout();
  }
};
