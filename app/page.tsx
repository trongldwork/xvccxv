import { MyRuntimeProvider } from "@/provider/MyRuntimeProvider";
import { Assistant } from "./assistant";

export default function Home() {
  return (
    <MyRuntimeProvider>
      <Assistant />
    </MyRuntimeProvider>
  );
}
