import type { PluginMessageEvent } from "./types";

penpot.ui.open("Plugin Template", `?theme=${penpot.theme}`, {
  width: 664,
  height: 600,
});

// Handle messages from UI
penpot.ui.onMessage(async (message: PluginMessageEvent) => {
  console.log("Received message from UI:", message);

  if (message.type === "add-capture" && message.imageData) {
    console.log("Processing add-capture message...");
    console.log("Image dimensions:", {
      width: message.width,
      height: message.height,
    });

    const blockId = penpot.history.undoBlockBegin();
    try {
      console.log("Uploading captured image...");
      const image = await penpot.uploadMediaData(
        "billboard-capture",
        message.imageData,
        "image/png"
      );

      if (image) {
        console.log("Image uploaded successfully:", image);

        // Create a rectangle with the image as fill
        const rect = penpot.createRectangle();
        console.log("Rectangle created:", rect);

        // Center the rectangle in the viewport
        rect.x = penpot.viewport.center.x;
        rect.y = penpot.viewport.center.y;
        console.log("Rectangle positioned at:", { x: rect.x, y: rect.y });

        // Set size from the message
        rect.resize(message.width, message.height);
        console.log("Rectangle resized to:", {
          width: rect.width,
          height: rect.height,
        });

        // Set the image as fill
        rect.fills = [
          {
            fillOpacity: 1,
            fillImage: image,
            //fillType: "image",
          },
        ];
        console.log("Image set as fill for rectangle");

        // Select the new rectangle
        penpot.selection = [rect];
        console.log("New rectangle selected");
      } else {
        console.error("Image upload failed, no image returned");
      }
    } catch (error) {
      console.error("Error adding capture to Penpot:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
    } finally {
      penpot.history.undoBlockFinish(blockId);
      console.log("Undo block finished");
    }
  } else if (message.type === "load-selection") {
    console.log("Processing load-selection request...");

    try {
      const selection = penpot.selection[0]; // Get first selection only

      if (!selection) {
        console.warn("No element selected");
        return;
      }

      console.log("Exporting selected element:", selection.name);

      const imageData = await selection.export({
        type: "png",
        scale: 4, // Match preview size
      });

      console.log("Element exported successfully");

      // Send the exported image back to the UI
      sendMessage({
        type: "selection-loaded",
        imageData: Array.from(imageData),
        width: selection.width,
        height: selection.height,
      });

      // After successful load, set loading to false
      sendMessage({
        type: "selection-loading",
        isLoading: false,
      });
    } catch (error) {
      // In case of error, also set loading to false
      sendMessage({
        type: "selection-loading",
        isLoading: false,
      });
      console.error("Error loading selection:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
    }
  } else {
    console.warn("Received message with unknown type or missing imageData");
  }
});

// Listen for theme changes and send them to UI
penpot.on("themechange", (theme: string) => {
  console.log("Theme change detected:", theme);
  sendMessage({ type: "theme", content: theme });
});

// Add this at the top with other event handlers
penpot.on("selectionchange", () => {
  const selection = penpot.selection;
  let name = null;

  if (selection.length === 1) {
    const element = selection[0];
    name = element.name || "Unnamed element";
  }

  sendMessage({
    type: "selection-update",
    name,
  });
});

function sendMessage(message: PluginMessageEvent) {
  console.log("Sending message to UI:", message);
  penpot.ui.sendMessage(message);
}
