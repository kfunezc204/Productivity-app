import { Outlet } from "react-router-dom";
import Titlebar from "./Titlebar";
import Sidebar from "./Sidebar";

export default function AppShell() {
  return (
    <div className="flex flex-col h-screen bg-[#1A1A1A] text-white overflow-hidden">
      <Titlebar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
