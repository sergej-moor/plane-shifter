import { writable } from "svelte/store";

export type SelectionStore = {
  selectedName: string | null;
  isLoading: boolean;
};

export const selection = writable<SelectionStore>({
  selectedName: null,
  isLoading: false,
});
