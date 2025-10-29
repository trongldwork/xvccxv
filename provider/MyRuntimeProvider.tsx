"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  AssistantRuntimeProvider,
  ChatModelAdapter,
  useLocalRuntime,
  unstable_useRemoteThreadListRuntime as useRemoteThreadListRuntime,
  type unstable_RemoteThreadListAdapter as RemoteThreadListAdapter,
  useThreadListItem,
  RuntimeAdapterProvider,
  type ThreadHistoryAdapter,
} from "@assistant-ui/react";
import { createAssistantStream } from "assistant-stream";
import { chatApi } from "@/api/chatApi";
import {
  archiveThread,
  deleteThread,
  generateThreadTitle,
  initializeThread,
  listThreads,
  renameThread,
  unarchiveThread,
  getMessages,
  appendMessage,
} from "@/api/threadApi";

const myModelAdapter:ChatModelAdapter = {
  async *run({ messages, abortSignal, context }) {
    const stream = await chatApi({ messages, abortSignal, context });
    let text = "";
    for await (const part of stream) {
      text += part.choices[0]?.delta?.content || "";
      yield {
        content: [{ type: "text", text }],
      };
    }
  },
};

const threadListAdapter: RemoteThreadListAdapter = {
  async list() {
    console.log("Fetching thread list from server...");
    const threads = await listThreads();
    console.log("Fetched threads:", threads);
    return {
      threads: threads.map((thread) => ({
        remoteId: thread.id,
        externalId: thread.external_id ?? undefined,
        status: thread.is_archived ? "archived" : "regular",
        title: thread.title ?? undefined,
      })),
    };
  },
  async initialize(localId) {
    const result = await initializeThread(localId);
    return { remoteId: result.id, externalId: result.external_id ?? undefined };
  },
  async rename(remoteId, title) {
    await renameThread(remoteId, title);
  },
  async archive(remoteId) {
    await archiveThread(remoteId);
  },
  async unarchive(remoteId) {
    await unarchiveThread(remoteId);
  },
  async delete(remoteId) {
    await deleteThread(remoteId);
  },
  async generateTitle(remoteId, messages) {
    return createAssistantStream(async (controller) => {
      // The API returns the title directly, not a stream.
      // We wrap it in createAssistantStream to match the expected return type.
      const { title } = await generateThreadTitle(remoteId, messages);
      controller.appendText(title);
    });
  },
  unstable_Provider: ({ children }) => {
    const threadListItem = useThreadListItem();
    const remoteId = threadListItem.remoteId;
    console.log("ThreadListItem remoteId:", remoteId);
    // if thread not initialized yet, remoteId will be undefined
    // so we need to handle that case in the history adapter
    if (!remoteId) {
      //create new thread and get remoteId
      console.log("Thread not initialized yet, remoteId is undefined");
      return null;
    }

    const history = useMemo<ThreadHistoryAdapter>(
      () => ({
        async load() {
          console.log("Loading messages for thread:", remoteId);
          if (!remoteId) return { messages: [] };

          const messages = await getMessages(remoteId);
          return {
            messages: messages.map((m) => ({
              message: m.content,
              parentId: m.threadId ?? undefined,
              role: m.role,
              createdAt: m.createdAt,
              id: m.id,
            })),
          };
        },

        async append(message) {
          console.log("Appending message to thread:", remoteId, message);
          if (!remoteId) {
            console.warn("Cannot save message - thread not initialized");
            return;
          }

          await appendMessage(remoteId, message.message.content);
        },
      }),
      [remoteId]
    );

    const adapters = useMemo(() => ({ history }), [history]);

    return (
      <RuntimeAdapterProvider adapters={adapters}>{children}</RuntimeAdapterProvider>
    );
  },
};

export function MyRuntimeProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const runtime = useRemoteThreadListRuntime({
    runtimeHook: () => useLocalRuntime(myModelAdapter),
    adapter: threadListAdapter,
  });

// export function MyRuntimeProvider({
//   children,
// }: Readonly<{ children: ReactNode }>) {
//   const runtime = useLocalRuntime(myModelAdapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}