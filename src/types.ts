export type PluginMessageEvent =
  | { type: "theme"; content: string }
  | {
      type: "add-capture";
      imageData: Uint8Array;
      width: number;
      height: number;
    };
// Add more message types here
