import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// ✅ Tạo Label component ngay trong file
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
}

const AuthButtons = () => {
  const [open, setOpen] = useState<"login" | "signup" | null>(null);

  return (
    <div className="flex ml-auto space-x-2 w-fit">
      {/* Log In */}
      <Button
        variant="outline"
        onClick={() => setOpen("login")}
        className="border-3 text-gray-700 hover:bg-black hover:text-white hover:border-transparent transition-colors duration-200"
      >
        Log In
      </Button>

      {/* Sign Up */}
      <Button
        variant="outline"
        onClick={() => setOpen("signup")}
        className="border-3 text-gray-700 hover:bg-black hover:text-white hover:border-transparent transition-colors duration-200"
      >
        Sign Up
      </Button>

      {/* Dialog Log In */}
      <Dialog open={open === "login"} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log In</DialogTitle>
            <DialogDescription>
              Welcome back! Please enter your credentials.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-3 mt-3">
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button className="w-full mt-2">Log In</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Sign Up */}
      <Dialog open={open === "signup"} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Up</DialogTitle>
            <DialogDescription>
              Create a new account to get started.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-3 mt-3">
            <div>
              <Label>Full Name</Label>
              <Input placeholder="Nguyen Van A" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button className="w-full mt-2">Sign Up</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthButtons;
