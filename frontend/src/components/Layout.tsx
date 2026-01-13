import { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, CheckSquare, BookOpen, Users, LogOut, User } from "lucide-react";
import { useAuth } from "../lib/auth";
import { Button } from "./ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { currentUser, logout } = useAuth();

  const isActive = (path: string) => currentPath === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="font-semibold">CareConnect</h1>
              <p className="text-sm text-gray-500">
                {currentUser?.name} •{" "}
                {String(currentUser?.role).charAt(0).toUpperCase() +
                  String(currentUser?.role).slice(1)}
              </p>
            </div>
            <div className="flex gap-2">
              {currentUser?.role === "caregiver" && (
                <Link to="/caregiver-profile">
                  <Button variant="ghost">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              )}
              <Button variant="ghost" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              to="/"
              className={`flex items-center gap-2 py-4 px-3 border-b-2 transition-colors ${
                isActive("/")
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/todos"
              className={`flex items-center gap-2 py-4 px-3 border-b-2 transition-colors ${
                isActive("/todos")
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span>Todo List</span>
            </Link>
            <Link
              to="/journal"
              className={`flex items-center gap-2 py-4 px-3 border-b-2 transition-colors ${
                isActive("/journal")
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Journal</span>
            </Link>
            <Link
              to="/recipients"
              className={`flex items-center gap-2 py-4 px-3 border-b-2 transition-colors ${
                isActive("/recipients") ||
                currentPath.startsWith("/recipients/")
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Recipients</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
