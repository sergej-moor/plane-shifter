import { writable } from "svelte/store";

export type SelectionStore = {
  selectedName: string | null;
};

export const selection = writable<SelectionStore>({
  selectedName: null,
});
