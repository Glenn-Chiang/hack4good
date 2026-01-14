import { useState } from "react";
import {
  useAllJournalEntries,
  useComments,
  useAddComment,
  useRecipients,
} from "../lib/queries";
import { useAuth } from "../lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { MoodIcon } from "../components/MoodIcon";
import { format } from "date-fns";
import { MessageCircle, Mic, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { get } from "http";
import { getUserById } from "@/lib/mock-data";

export function Journal() {
  const { currentUser } = useAuth();
  const { data: allJournalEntries, isLoading } = useAllJournalEntries();
  const { data: recipients } = useRecipients(currentUser?.id || "");
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(
    new Set()
  );
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const addComment = useAddComment();

  // Filter journal entries to only show those from accepted recipients
  const acceptedRecipientIds = new Set(recipients?.map((r) => r.id) || []);
  const journalEntries =
    allJournalEntries?.filter((entry) =>
      acceptedRecipientIds.has(entry.recipientId)
    ) || [];

  const toggleExpand = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const handleAddComment = (journalEntryId: string) => {
    const comment = commentText[journalEntryId]?.trim();
    if (!comment) {
      toast.error("Please enter a comment");
      return;
    }

    addComment.mutate(
      {
        journalEntryId,
        content: comment,
        authorId: currentUser?.id || "",
        authorRole: "caregiver",
      },
      {
        onSuccess: () => {
          toast.success("Comment added");
          setCommentText({ ...commentText, [journalEntryId]: "" });
        },
      }
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2>Journal Entries</h2>
        <p className="text-gray-500">
          View and respond to your recipients' journal entries
        </p>
      </div>

      <div className="space-y-4">
        {journalEntries?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              {recipients?.length === 0
                ? "No recipients assigned yet. Add recipients to see their journal entries."
                : "No journal entries yet from your recipients"}
            </CardContent>
          </Card>
        )}

        {journalEntries?.map((entry) => {
          const recipient = recipients?.find((r) => r.id === entry.recipientId);
          const isExpanded = expandedEntries.has(entry.id);

          return (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              recipient={recipient}
              isExpanded={isExpanded}
              onToggleExpand={() => toggleExpand(entry.id)}
              commentText={commentText[entry.id] || ""}
              onCommentChange={(text) =>
                setCommentText({ ...commentText, [entry.id]: text })
              }
              onAddComment={() => handleAddComment(entry.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

interface JournalEntryCardProps {
  entry: any;
  recipient: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  commentText: string;
  onCommentChange: (text: string) => void;
  onAddComment: () => void;
}

function JournalEntryCard({
  entry,
  recipient,
  isExpanded,
  onToggleExpand,
  commentText,
  onCommentChange,
  onAddComment,
}: JournalEntryCardProps) {
  const { currentUser } = useAuth();
  const { data: comments } = useComments(entry.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm text-blue-700">
                {recipient?.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("") || "??"}
              </span>
            </div>
            <div>
              <CardTitle className="text-base">{recipient?.name}</CardTitle>
              <p className="text-sm text-gray-500">
                {format(entry.createdAt, "MMM d, yyyy h:mm a")}
              </p>
            </div>
          </div>
          <MoodIcon mood={entry.mood} showLabel />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{entry.content}</p>

        {entry.hasVoiceMessage && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Mic className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Voice message attached
            </span>
            <Button variant="link" size="sm" className="text-blue-600 ml-auto">
              Play
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{comments?.length || 0} Comments</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-3 pt-2">
            {/* Existing Comments */}
            {comments && comments.length > 0 && (
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">
                        {getUserById(comment.authorId)?.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(comment.createdAt, "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment */}
            <div className="space-y-2">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => onCommentChange(e.target.value)}
                rows={3}
              />
              <Button onClick={onAddComment} size="sm">
                Add Comment
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
