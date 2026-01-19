import { useJournalEntries } from '@/api/journal'
import { Link, useParams } from '@tanstack/react-router'
import { useGetRecipientById } from '../api/users'

import { useTodos } from '@/api/todos'
import { useAuth } from '@/auth/AuthProvider'
import { format } from 'date-fns'
import { ArrowLeft, BookOpen, Calendar, CheckSquare } from 'lucide-react'
import { MoodIcon } from '../components/MoodIcon'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'

export function RecipientProfile() {
  const { currentUser } = useAuth()
  const { recipientId } = useParams({ from: '/recipients/$recipientId' })
  const { data: recipient, isLoading: userLoading } =
    useGetRecipientById(recipientId)
  const { data: allTodos } = useTodos(String(currentUser?.id || ''))
  const rid = Number(recipientId)

  const { data: journalEntries } = useJournalEntries(recipientId)

  const recipientTodos = allTodos?.filter((t) => t.recipientId === rid) || []
  const activeTodos = recipientTodos.filter((t) => !t.completed)
  const completedTodos = recipientTodos.filter((t) => t.completed)

  if (userLoading) {
    return <div>Loading...</div>
  }

  if (!recipient) {
    return <div>Recipient not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/recipients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-blue-700">
                {recipient.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{recipient.name}</CardTitle>
              <p className="text-gray-500">{recipient.age} years old</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Condition</p>
              <p className="text-sm">
                {recipient.condition || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Tasks</p>
              <p className="text-sm">{activeTodos.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Journal Entries</p>
              <p className="text-sm">{journalEntries?.length || 0}</p>
            </div>
          </div>

          {/* Additional Profile Information */}
          <div className="mt-6 pt-6 border-t space-y-4">
            {recipient.likes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Likes</p>
                <p className="text-sm">{recipient.likes}</p>
              </div>
            )}
            {recipient.dislikes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Dislikes</p>
                <p className="text-sm">{recipient.dislikes}</p>
              </div>
            )}
            {recipient.phobias && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Phobias/Fears</p>
                <p className="text-sm">{recipient.phobias}</p>
              </div>
            )}
            {recipient.petPeeves && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Pet Peeves</p>
                <p className="text-sm">{recipient.petPeeves}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Tasks</CardTitle>
                <CardDescription>View and manage tasks</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base">Journal</CardTitle>
                <CardDescription>Read journal entries</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">
            <CheckSquare className="w-4 h-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="journal">
            <BookOpen className="w-4 h-4 mr-2" />
            Journal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6 space-y-4">
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
                {activeTodos.map((todo) => (
                  <div key={todo.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm">{todo.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {todo.description}
                        </p>
                      </div>
                      <Badge
                        variant={
                          todo.priority === 'high' ? 'destructive' : 'secondary'
                        }
                      >
                        {todo.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {format(todo.dueDate, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                ))}
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
                  {completedTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className="p-3 border rounded-lg bg-gray-50"
                    >
                      <p className="text-sm line-through text-gray-600">
                        {todo.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(todo.dueDate, 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="journal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Journal Entries ({journalEntries?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {journalEntries?.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No journal entries yet
                  </p>
                )}
                {journalEntries?.map((entry) => (
                  <div key={entry.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">
                        {format(entry.createdAt, 'MMM d, yyyy h:mm a')}
                      </span>
                      <MoodIcon mood={entry.mood} showLabel />
                    </div>
                    <p className="text-sm">{entry.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
