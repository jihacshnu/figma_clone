import { useOthers } from "@liveblocks/react";
import Cursor from "./Cursor";
import { COLORS } from "@/constants";

// Type guard to check if the cursor is of the correct shape
function isCursorObject(cursor: any): cursor is { x: number; y: number } {
  return cursor && typeof cursor === "object" && "x" in cursor && "y" in cursor;
}

function getMessage(message: any): string {
  if (typeof message === "string") {
    return message;
  }
  return ""; // default empty string if message is not a string
}

const LiveCursors = () => {
  const others = useOthers();
  return others.map(({ connectionId, presence }) => {
    if (!presence?.cursor || !isCursorObject(presence.cursor)) {
      return null;
    }

    return (
      <Cursor
        key={connectionId}
        color={COLORS[Number(connectionId) % COLORS.length]}
        x={presence.cursor.x}
        y={presence.cursor.y}
        message={getMessage(presence.message)}
      />
    );
  });
};

export default LiveCursors;
