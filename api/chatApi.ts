import { ThreadMessage } from "@assistant-ui/react";

export async function* chatApi({ messages, abortSignal, context }: { messages: readonly ThreadMessage[], abortSignal: AbortSignal, context: any }) {
  let response;

  try {
    response = await fetch("http://127.0.0.1:8000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Thêm 'context' vào body
      body: JSON.stringify({ messages, context }), 
      signal: abortSignal,
    });
  } catch (error: any) {
    // Xử lý lỗi fetch (ví dụ: không thể kết nối)
    console.error("Fetch API error:", error);
    throw new Error(`Connection error: ${error.message}`);
  }

  // 2. Kiểm tra các lỗi HTTP (4xx, 5xx)
  if (!response.ok) {
    let errorBody = "Unknown error";
    try {
      // Cố gắng đọc nội dung lỗi từ server
      errorBody = await response.text();
    } catch (e) {
      // Bỏ qua nếu không thể đọc body
    }
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
  }

  // 3. Xử lý luồng (stream)
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable.");
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  // 4. Dùng try...finally để đảm bảo reader được giải phóng
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      // Nếu luồng kết thúc, thoát khỏi vòng lặp
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Phân tách các sự kiện (messages) bằng "\n\n"
      const parts = buffer.split("\n\n");
      
      // Giữ lại phần cuối cùng (có thể chưa hoàn chỉnh) trong buffer
      buffer = parts.pop() || "";

      for (const part of parts) {
        // Bỏ qua các dòng không phải là dữ liệu
        if (!part.startsWith("data:")) {
          continue;
        }

        // 5. Regex mạnh mẽ hơn để trích xuất dữ liệu
        const data = part.replace(/^data:\s*/, "").trim();

        // Tín hiệu kết thúc luồng
        if (data === "[DONE]") {
          return; // Kết thúc generator
        }

        // 6. Xử lý lỗi parse JSON
        try {
          yield JSON.parse(data);
        } catch (parseError) {
          console.error("Failed to parse streaming data chunk:", data, parseError);
          // Bạn có thể quyết định 'continue' để bỏ qua chunk lỗi
          // hoặc 'throw' để dừng toàn bộ quá trình
        }
      }
    }
  } catch (error:any) {
    // Xử lý lỗi khi đang đọc luồng (ví dụ: người dùng hủy request)
    if (error.name === 'AbortError') {
      console.log("Stream reading aborted by user.");
    } else {
      console.error("Error reading stream:", error);
      throw error; // Ném lỗi ra ngoài để hàm gọi xử lý
    }
  } finally {
    // 7. Luôn giải phóng reader
    reader.releaseLock();
  }
}