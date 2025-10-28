import apiInstance from "./apiConfig";
import { ThreadMessage } from "@assistant-ui/react";

// --- Định nghĩa Typescript dựa trên các model Pydantic ---

export interface ThreadPublic {
    id: string;
    title: string | null;
    is_archived: boolean;
    created_at: string; // datetime được chuyển thành chuỗi ISO 8601
    updated_at: string;
    external_id: string | null;
}

export interface GeneratedTitle {
    title: string;
}

export interface MessageRecord {
  id: string;
  threadId: string;
  role: "user" | "assistant" | "system";
  content: any; // Được lưu dưới dạng JSON
  createdAt: string; // Chuỗi ISO 8601
}

// --- Các hàm tương tác với API ---

/**
 * Lấy danh sách các thread của user hiện tại.
 * @returns Promise<ThreadPublic[]>
 */
export const listThreads = async (): Promise<ThreadPublic[]> => {
    const response = await apiInstance.get<ThreadPublic[]>("/threads");
    return response.data;
};

/**
 * Khởi tạo một thread mới trên server.
 * @param localId - ID cục bộ được tạo bởi client.
 * @returns Promise<ThreadPublic>
 */
export const initializeThread = async (localId: string): Promise<ThreadPublic> => {
    const response = await apiInstance.post<ThreadPublic>("/threads", { localId });
    return response.data;
};

/**
 * Đổi tên một thread.
 * @param remoteId - ID của thread trên server.
 * @param title - Tiêu đề mới.
 */
export const renameThread = async (remoteId: string, title: string): Promise<void> => {
    await apiInstance.patch(`/threads/${remoteId}`, { title });
};

/**
 * Lưu trữ một thread.
 * @param remoteId - ID của thread trên server.
 */
export const archiveThread = async (remoteId: string): Promise<void> => {
    await apiInstance.post(`/threads/${remoteId}/archive`);
};

/**
 * Hủy lưu trữ một thread.
 * @param remoteId - ID của thread trên server.
 */
export const unarchiveThread = async (remoteId: string): Promise<void> => {
    await apiInstance.post(`/threads/${remoteId}/unarchive`);
};

/**
 * Xóa một thread.
 * @param remoteId - ID của thread trên server.
 */
export const deleteThread = async (remoteId: string): Promise<void> => {
    await apiInstance.delete(`/threads/${remoteId}`);
};

/**
 * Tạo tiêu đề cho thread dựa trên nội dung tin nhắn.
 * @param remoteId - ID của thread trên server.
 * @param messages - Danh sách các tin nhắn trong thread.
 * @returns Promise<GeneratedTitle>
 */
export const generateThreadTitle = async (remoteId: string, messages: readonly ThreadMessage[]): Promise<GeneratedTitle> => {
    const response = await apiInstance.post<GeneratedTitle>(`/threads/${remoteId}/title`, { messages });
    return response.data;
};

/**
 * Lấy danh sách các tin nhắn trong một thread.
 * @param remoteId - ID của thread trên server.
 * @returns Promise<MessageRecord[]>
 */
export const getMessages = async (remoteId: string): Promise<MessageRecord[]> => {
    const response = await apiInstance.get<MessageRecord[]>(`/threads/${remoteId}/messages`);
    return response.data;
};

/**
 * Thêm một tin nhắn mới vào thread.
 * @param remoteId - ID của thread trên server.
 * @param content - Nội dung của tin nhắn.
 * @returns Promise<MessageRecord>
 */
export const appendMessage = async (remoteId: string, content: any): Promise<MessageRecord> => {
    // Backend mong đợi một object có key là 'content'
    const response = await apiInstance.post<MessageRecord>(`/threads/${remoteId}/messages`, { content });
    return response.data;
};