import { writable } from "svelte/store";

type CaptureStore = {
  captureView: () => Promise<void>;
};

function createCaptureStore() {
  const { subscribe, set } = writable<CaptureStore>({
    captureView: async () => {
      console.warn("Capture function not initialized");
    },
  });

  return {
    subscribe,
    registerCapture: (captureFn: () => Promise<void>) => {
      set({ captureView: captureFn });
    },
  };
}

export const capture = createCaptureStore();
