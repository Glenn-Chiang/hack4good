import { useState } from "react";
import { useGetRecipientsByCaregiver } from "../api/users";
import { useAuth } from "@/auth/AuthProvider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Calendar, List, Plus } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { toast } from "sonner";
import { useAddTodo, useTodos, useToggleTodo } from "@/api/todos";
import type { Todo } from "@/types/types";

export function TodoList() {
  const { currentUser } = useAuth();
  const caregiverId = currentUser?.caregiverId
    ? String(currentUser.caregiverId)
    : "";

  const { data: todos, isLoading } = useTodos(caregiverId);
  const { data: recipients } = useGetRecipientsByCaregiver(caregiverId);

  const toggleTodo = useToggleTodo();
  const addTodo = useAddTodo();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    recipientId: "",
    dueDate: new Date(),
    priority: "medium" as "low" | "medium" | "high",
  });

  const handleToggleTodo = (todo: Todo) => {
    toggleTodo.mutate({ id: todo.id, completed: todo.completed });
  };



 const handleAddTodo = () => {
   if (!newTodo.title || !newTodo.recipientId) {
     toast.error("Please fill in all required fields");
     return;
   }

   const caregiverId = Number(currentUser?.caregiverId);
   const recipientId = Number(newTodo.recipientId);

   if (!caregiverId || !recipientId) {
     toast.error("Invalid caregiver or recipient");
     return;
   }

   addTodo.mutate(
     {
       title: newTodo.title,
       description: newTodo.description || "(no description)",
       caregiverId,
       recipientId,
       dueDate: newTodo.dueDate.toISOString(),
       priority: newTodo.priority,
     },
     {
       onSuccess: () => {
         toast.success("Task added successfully");
         setIsDialogOpen(false);
         setNewTodo({
           title: "",
           description: "",
           recipientId: "",
           dueDate: new Date(),
           priority: "medium",
         });
       },
     }
   );
 };


  // Calendar view helpers
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getTodosForDate = (date: Date) => {
    return (
      todos?.filter((todo) => isSameDay(new Date(todo.dueDate), date)) || []
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const activeTodos = todos?.filter((t) => !t.completed) || [];
  const completedTodos = todos?.filter((t) => t.completed) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Todo List</h2>
          <p className="text-gray-500">Manage tasks for your recipients</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task for one of your recipients
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newTodo.title}
                  onChange={(e) =>
                    setNewTodo({ ...newTodo, title: e.target.value })
                  }
                  placeholder="Task title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTodo.description}
                  onChange={(e) =>
                    setNewTodo({ ...newTodo, description: e.target.value })
                  }
                  placeholder="Task description"
                />
              </div>
              <div>
                <Label htmlFor="recipient">Recipient *</Label>
                <Select
                  value={newTodo.recipientId}
                  onValueChange={(value: string) =>
                    setNewTodo({ ...newTodo, recipientId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipients?.map((recipient) => (
                      <SelectItem key={recipient.id} value={String(recipient.id)}>
                        {recipient.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTodo.priority}
                  onValueChange={(value: any) =>
                    setNewTodo({ ...newTodo, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date & Time</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={format(new Date(newTodo.dueDate), "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) =>
                    setNewTodo({
                      ...newTodo,
                      dueDate: new Date(e.target.value),
                    })
                  }
                />
              </div>
              <Button onClick={handleAddTodo} className="w-full">
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">
            <List className="w-4 h-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-6">
          {/* Active Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Active Tasks ({activeTodos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeTodos.length === 0 && (
                  <p className="text-sm text-gray-500">No active tasks</p>
                )}
                {activeTodos.map((todo) => {
                  const recipient = recipients?.find(
                    (r) => Number(r.id) === todo.recipientId
                  );
                  return (
                    <div
                      key={todo.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleTodo(todo)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm">{todo.title}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {todo.description}
                            </p>
                          </div>
                          <Badge
                            variant={
                              todo.priority === "high"
                                ? "destructive"
                                : todo.priority === "medium"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {todo.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{recipient?.user.name}</span>
                          <span>
                            {format(new Date(todo.dueDate), "MMM d, yyyy h:mm a")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          {completedTodos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Completed Tasks ({completedTodos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedTodos.map((todo) => {
                    const recipient = recipients?.find(
                      (r) => Number(r.id) === todo.recipientId
                    );
                    return (
                      <div
                        key={todo.id}
                        className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50 opacity-75"
                      >
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => handleToggleTodo(todo)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="text-sm line-through">{todo.title}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{recipient?.user.name}</span>
                            <span>
                              {format(new Date(todo.dueDate), "MMM d, yyyy h:mm a")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{format(selectedDate, "MMMM yyyy")}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          selectedDate.setMonth(selectedDate.getMonth() - 1)
                        )
                      )
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          selectedDate.setMonth(selectedDate.getMonth() + 1)
                        )
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-sm text-gray-500 py-2"
                    >
                      {day}
                    </div>
                  )
                )}
                {daysInMonth.map((day, idx) => {
                  const dayTodos = getTodosForDate(day);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={idx}
                      className={`min-h-24 p-2 border rounded-lg ${
                        isToday ? "bg-blue-50 border-blue-300" : "bg-white"
                      } ${!isSameMonth(day, selectedDate) ? "opacity-50" : ""}`}
                    >
                      <div
                        className={`text-sm mb-1 ${
                          isToday ? "text-blue-600" : ""
                        }`}
                      >
                        {format(day, "d")}
                      </div>
                      <div className="space-y-1">
                        {dayTodos.map((todo) => (
                          <div
                            key={todo.id}
                            className={`text-xs p-1 rounded truncate ${
                              todo.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : todo.priority === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {todo.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
