"use client";

import { useCallback, useRef } from "react";
import { ThreadData } from "@liveblocks/client";

import { useEditThreadMetadata, useThreads } from "@liveblocks/react/suspense";
import { useMaxZIndex } from "@/lib/useMaxZIndex";

import { PinnedThread } from "../comments/PinnedThread";
import { ThreadMetadata } from "@/liveblocks.config";

type OverlayThreadProps = {
  thread: ThreadData<ThreadMetadata>;
  maxZIndex: number;
};

export const CommentsOverlay = () => {
  /**
   * We're using the useThreads hook to get the list of threads
   * in the room.
   *
   * useThreads: https://liveblocks.io/docs/api-reference/liveblocks-react#useThreads
   */
  const { threads } = useThreads();

  // Safely filter and validate threads with correct metadata type
  const typedThreads = threads.filter(
    (thread): thread is ThreadData<ThreadMetadata> =>
      typeof thread.metadata === "object" &&
      thread.metadata !== null &&
      "x" in thread.metadata &&
      "y" in thread.metadata &&
      "resolved" in thread.metadata &&
      "zIndex" in thread.metadata
  );

  // Get the max z-index of all threads
  const maxZIndex = useMaxZIndex();

  return (
    <div>
      {typedThreads
        .filter((thread) => !thread.metadata.resolved)
        .map((thread) => (
          <OverlayThread
            key={thread.id}
            thread={thread}
            maxZIndex={maxZIndex}
          />
        ))}
    </div>
  );
};

const OverlayThread = ({ thread, maxZIndex }: OverlayThreadProps) => {
  /**
   * We're using the useEditThreadMetadata hook to edit the metadata
   * of a thread.
   *
   * useEditThreadMetadata: https://liveblocks.io/docs/api-reference/liveblocks-react#useEditThreadMetadata
   */
  const editThreadMetadata = useEditThreadMetadata();

  // We're using a ref to get the thread element to position it
  const threadRef = useRef<HTMLDivElement>(null);

  // If other thread(s) above, increase z-index on last element updated
  const handleIncreaseZIndex = useCallback(() => {
    if (maxZIndex === thread.metadata.zIndex) {
      return;
    }

    // Update the z-index of the thread in the room
    editThreadMetadata({
      threadId: thread.id,
      metadata: {
        zIndex: maxZIndex + 1,
      },
    });
  }, [thread, editThreadMetadata, maxZIndex]);

  return (
    <div
      ref={threadRef}
      id={`thread-${thread.id}`}
      className="absolute left-0 top-0 flex gap-5"
      style={{
        transform: `translate(${thread.metadata.x}px, ${thread.metadata.y}px)`,
      }}
    >
      {/* Render the pinned thread */}
      <PinnedThread thread={thread} onFocus={handleIncreaseZIndex} />
    </div>
  );
};
