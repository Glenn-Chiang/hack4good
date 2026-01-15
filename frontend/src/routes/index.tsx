import { Link } from "@tanstack/react-router";
import { useAcceptedJournalEntries } from "@/api/journal";
import { useGetRecipientsByCaregiver } from "../api/users";
import { useTodos } from "@/api/todos";
import { useAuth } from "@/auth/AuthProvider";
import { CheckSquare, BookOpen, Users, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { format } from "date-fns";
import { MoodIcon } from "../components/MoodIcon";

export function Dashboard() {
  const { currentUser } = useAuth();
  const { data: recipients, isLoading: recipientsLoading } =
    useGetRecipientsByCaregiver(currentUser?.id || "");
  const { data: todos, isLoading: todosLoading } = useTodos(
    currentUser?.id || ""
  );
  const { data: journalEntries, isLoading: journalLoading } =
    useAcceptedJournalEntries(currentUser?.id || "");

  const urgentTodos =
    todos?.filter((t) => !t.completed && t.priority === "high") || [];
  const upcomingTodos = todos?.filter((t) => !t.completed).slice(0, 5) || [];
  const recentJournals = journalEntries?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2>Welcome back, {currentUser?.name}</h2>
        <p className="text-gray-500">Here's what's happening today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Recipients</CardTitle>
            <Users className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="font-semibold">
              {recipientsLoading ? "..." : recipients?.length || 0}
            </div>
            <p className="text-xs text-gray-500">Active care relationships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Pending Tasks</CardTitle>
            <CheckSquare className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="font-semibold">
              {todosLoading
                ? "..."
                : todos?.filter((t) => !t.completed).length || 0}
            </div>
            <p className="text-xs text-gray-500">
              {urgentTodos.length > 0 && (
                <span className="text-orange-600">
                  {urgentTodos.length} urgent
                </span>
              )}
              {urgentTodos.length === 0 && "No urgent tasks"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Recent Journals</CardTitle>
            <BookOpen className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="font-semibold">
              {journalLoading ? "..." : journalEntries?.length || 0}
            </div>
            <p className="text-xs text-gray-500">Total entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Tasks */}
      {urgentTodos.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="w-5 h-5" />
              Urgent Tasks
            </CardTitle>
            <CardDescription className="text-orange-700">
              These tasks require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="bg-white p-3 rounded-lg border border-orange-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm">{todo.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(todo.dueDate, "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                    <Badge variant="destructive">High Priority</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Your next scheduled tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTodos.length === 0 && (
                <p className="text-sm text-gray-500">No upcoming tasks</p>
              )}
              {upcomingTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start justify-between pb-3 border-b last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="text-sm">{todo.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(todo.dueDate, "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      todo.priority === "high" ? "destructive" : "secondary"
                    }
                  >
                    {todo.priority}
                  </Badge>
                </div>
              ))}
            </div>
            <Link
              to="/todos"
              className="block mt-4 text-sm text-blue-600 hover:text-blue-700"
            >
              View all tasks →
            </Link>
          </CardContent>
        </Card>

        {/* Recent Journal Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Journal Entries</CardTitle>
            <CardDescription>
              Latest updates from your recipients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentJournals.length === 0 && (
                <p className="text-sm text-gray-500">No journal entries yet</p>
              )}
              {recentJournals.map((entry) => {
                return (
                  <div
                    key={entry.id}
                    className="pb-3 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm">{entry.recipientName}</p>
                      <div className="flex items-center gap-2">
                        <MoodIcon mood={entry.mood} size={16} />
                        <span className="text-xs text-gray-500">
                          {format(entry.createdAt, "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {entry.content}
                    </p>
                  </div>
                );
              })}
            </div>
            <Link
              to="/journal"
              className="block mt-4 text-sm text-blue-600 hover:text-blue-700"
            >
              View all entries →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recipients Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Your Recipients</CardTitle>
          <CardDescription>Quick access to recipient profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recipients?.map((recipient) => (
              <Link
                key={recipient.id}
                to="/recipients/$recipientId"
                params={{ recipientId: String(recipient.id) }}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-blue-700">
                      {recipient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm">{recipient.name}</p>
                    <p className="text-xs text-gray-500">
                      {recipient.age} years old
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
