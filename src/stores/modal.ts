import type { Show } from '@/types';
import { create } from 'zustand';

interface ModalState {
  open: boolean;
  setOpen: (open: boolean) => void;
  firstLoad: boolean;
  show: Show | null;
  setShow: (show: Show | null) => void;
  play: boolean;
  setPlay: (play: boolean) => void;
  reset: () => void;
}

export const useModalStore = create<ModalState>()((set) => ({
  open: false,
  setOpen: (open: boolean) => {
    console.log('Modal setOpen called:', open); // Debug log
    set(() => ({ open }));
  },
  firstLoad: false,
  setFirstLoad: (firstLoad: boolean) => set(() => ({ firstLoad })),
  show: null,
  setShow: (show: Show | null) => {
    console.log('Modal setShow called:', show?.title || show?.name); // Debug log
    set(() => ({ show }));
  },
  play: false,
  setPlay: (play: boolean) => set(() => ({ play })),
  reset: () => {
    console.log('Modal reset called'); // Debug log
    set(() => ({
      show: null,
      open: false,
      play: false,
      firstLoad: false,
    }));
  },
}));
