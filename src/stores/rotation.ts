import { writable } from "svelte/store";

export type RotationValues = {
  x: number;
  y: number;
  z: number;
  zoom: number;
  fov: number;
  width: number;
  height: number;
};

export const rotation = writable<RotationValues>({
  x: 0,
  y: 0,
  z: 0,
  zoom: 1,
  fov: 75,
  width: 400,
  height: 400,
});
