import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../components/ui/dialog";
import { useAuth } from "../lib/auth";
import {
  useJournalEntries,
  useAddJournalEntry,
  useUpdateUser,
  usePendingRequests,
  useRespondToRequest,
  useCaregiversForRecipient,
  useComments,
  useAddComment,
} from "../lib/queries";
import { MoodIcon } from "../components/MoodIcon";
import type { MoodType } from "../lib/mock-data";
import {
  Smile,
  Frown,
  Meh,
  Frown as Anxious,
  Laugh,
  Mic,
  LogOut,
  BookOpen,
  User as UserIcon,
  Bell,
  CheckCircle2,
  XCircle,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getUserById } from "../lib/mock-data";

const moodOptions: {
  type: MoodType;
  icon: any;
  label: string;
  color: string;
}[] = [
  {
    type: "happy",
    icon: Smile,
    label: "Happy",
    color: "bg-green-100 hover:bg-green-200 text-green-700 border-green-300",
  },
  {
    type: "excited",
    icon: Laugh,
    label: "Excited",
    color:
      "bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300",
  },
  {
    type: "neutral",
    icon: Meh,
    label: "Neutral",
    color: "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300",
  },
  {
    type: "sad",
    icon: Frown,
    label: "Sad",
    color: "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300",
  },
  {
    type: "anxious",
    icon: Anxious,
    label: "Anxious",
    color:
      "bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-300",
  },
];

export function RecipientDashboard() {
  const { currentUser, logout } = useAuth();
  const { data: journalEntries } = useJournalEntries(currentUser?.id || "");
  const { data: pendingRequests } = usePendingRequests(currentUser?.id || "");
  const { data: caregivers } = useCaregiversForRecipient(currentUser?.id || "");
  const addJournalEntry = useAddJournalEntry();
  const updateUser = useUpdateUser();
  const respondToRequest = useRespondToRequest();
  const addCommentMutation = useAddComment();

  const [journalContent, setJournalContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [showVoiceRecording, setShowVoiceRecording] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(
    new Set()
  );
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "",
    condition: currentUser?.condition || "",
    likes: currentUser?.likes || "",
    dislikes: currentUser?.dislikes || "",
    phobias: currentUser?.phobias || "",
    petPeeves: currentUser?.petPeeves || "",
  });

  const handleSubmitJournal = () => {
    if (!journalContent.trim()) {
      toast.error("Please write something in your journal");
      return;
    }

    if (!selectedMood) {
      toast.error("Please select how you're feeling");
      return;
    }

    addJournalEntry.mutate(
      {
        recipientId: currentUser?.id || "",
        content: journalContent,
        mood: selectedMood,
        hasVoiceMessage: showVoiceRecording,
      },
      {
        onSuccess: () => {
          toast.success("Journal entry saved!");
          setJournalContent("");
          setSelectedMood(null);
          setShowVoiceRecording(false);
        },
      }
    );
  };

  const handleUpdateProfile = () => {
    if (!profileData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    updateUser.mutate(
      {
        id: currentUser?.id || "",
        name: profileData.name,
        condition: profileData.condition,
        likes: profileData.likes,
        dislikes: profileData.dislikes,
        phobias: profileData.phobias,
        petPeeves: profileData.petPeeves,
      },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully!");
          setIsProfileDialogOpen(false);
          // Update the auth context would happen here in real app
          window.location.reload(); // Simple refresh for mock data
        },
      }
    );
  };

  const handleRespondToRequest = (
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    respondToRequest.mutate(
      { requestId, status },
      {
        onSuccess: () => {
          toast.success(
            status === "accepted"
              ? "Care request accepted!"
              : "Care request declined"
          );
        },
        onError: () => {
          toast.error("Failed to respond to request");
        },
      }
    );
  };

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

    addCommentMutation.mutate(
      {
        journalEntryId,
        content: comment,
        authorId: currentUser?.id || "",
        authorRole: "recipient",
      },
      {
        onSuccess: () => {
          toast.success("Comment added");
          setCommentText({ ...commentText, [journalEntryId]: "" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-lg text-purple-700">
                  {currentUser?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <h1 className="text-xl">
                  Hello, {currentUser?.name.split(" ")[0]}
                </h1>
                <p className="text-sm text-gray-500">
                  How are you feeling today?
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog
                open={isProfileDialogOpen}
                onOpenChange={setIsProfileDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setProfileData({
                        name: currentUser?.name || "",
                        condition: currentUser?.condition || "",
                        likes: currentUser?.likes || "",
                        dislikes: currentUser?.dislikes || "",
                        phobias: currentUser?.phobias || "",
                        petPeeves: currentUser?.petPeeves || "",
                      })
                    }
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">
                      Edit Your Profile
                    </DialogTitle>
                    <DialogDescription>
                      Update your personal information and preferences
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="name" className="text-lg">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        className="text-lg py-6 mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="condition" className="text-lg">
                        Medical Condition
                      </Label>
                      <Input
                        id="condition"
                        value={profileData.condition}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            condition: e.target.value,
                          })
                        }
                        className="text-lg py-6 mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="likes" className="text-lg">
                        Things You Like
                      </Label>
                      <Textarea
                        id="likes"
                        value={profileData.likes}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            likes: e.target.value,
                          })
                        }
                        placeholder="Things that make you happy..."
                        className="text-base mt-2"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dislikes" className="text-lg">
                        Things You Dislike
                      </Label>
                      <Textarea
                        id="dislikes"
                        value={profileData.dislikes}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            dislikes: e.target.value,
                          })
                        }
                        placeholder="Things you prefer to avoid..."
                        className="text-base mt-2"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phobias" className="text-lg">
                        Phobias or Fears
                      </Label>
                      <Textarea
                        id="phobias"
                        value={profileData.phobias}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phobias: e.target.value,
                          })
                        }
                        placeholder="Things that make you anxious or scared..."
                        className="text-base mt-2"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="petPeeves" className="text-lg">
                        Pet Peeves
                      </Label>
                      <Textarea
                        id="petPeeves"
                        value={profileData.petPeeves}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            petPeeves: e.target.value,
                          })
                        }
                        placeholder="Things that bother or annoy you..."
                        className="text-base mt-2"
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={handleUpdateProfile}
                      className="w-full text-lg py-6"
                      disabled={updateUser.isPending}
                    >
                      Save Profile
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Care Requests */}
        {pendingRequests && pendingRequests.length > 0 && (
          <Card className="shadow-lg border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Bell className="w-5 h-5 text-blue-600" />
                Care Requests
              </CardTitle>
              <CardDescription>
                You have {pendingRequests.length} pending care request
                {pendingRequests.length > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingRequests.map((request) => {
                const caregiver = getUserById(request.caregiverId);
                return (
                  <div
                    key={request.id}
                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-700">
                            {caregiver?.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("") || "??"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {caregiver?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Wants to be your caregiver
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Requested{" "}
                            {format(request.requestedAt, "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleRespondToRequest(request.id, "rejected")
                          }
                          disabled={respondToRequest.isPending}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleRespondToRequest(request.id, "accepted")
                          }
                          disabled={respondToRequest.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* My Caregivers */}
        {caregivers && caregivers.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                My Caregivers
              </CardTitle>
              <CardDescription>
                People who are taking care of you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {caregivers.map((caregiver) => (
                  <div
                    key={caregiver.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm text-purple-700">
                        {caregiver.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{caregiver.name}</p>
                      <p className="text-sm text-gray-500">Caregiver</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Journal Entry */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Write in Your Journal</CardTitle>
            <CardDescription className="text-base">
              Share your thoughts and feelings. Your caregiver will be able to
              read this.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mood Selection */}
            <div>
              <label className="text-lg mb-3 block">How are you feeling?</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {moodOptions.map((mood) => {
                  const Icon = mood.icon;
                  const isSelected = selectedMood === mood.type;
                  return (
                    <button
                      key={mood.type}
                      onClick={() => setSelectedMood(mood.type)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? mood.color + " border-2 scale-105 shadow-md"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Icon
                        className={`w-8 h-8 mx-auto mb-2 ${
                          isSelected ? "" : "text-gray-400"
                        }`}
                      />
                      <p className="text-sm text-center">{mood.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Journal Text */}
            <div>
              <label className="text-lg mb-3 block">What's on your mind?</label>
              <Textarea
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="Write about your day, your feelings, or anything you'd like to share..."
                className="min-h-48 text-lg resize-none"
              />
            </div>

            {/* Voice Message Option */}
            <div>
              <Button
                variant={showVoiceRecording ? "default" : "outline"}
                onClick={() => setShowVoiceRecording(!showVoiceRecording)}
                className="w-full sm:w-auto"
              >
                <Mic className="w-4 h-4 mr-2" />
                {showVoiceRecording
                  ? "Voice message will be recorded"
                  : "Add voice message"}
              </Button>
              {showVoiceRecording && (
                <p className="text-sm text-gray-500 mt-2">
                  Voice recording feature will be available when you submit
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitJournal}
              size="lg"
              className="w-full text-lg py-6"
              disabled={addJournalEntry.isPending}
            >
              Save Journal Entry
            </Button>
          </CardContent>
        </Card>

        {/* Previous Entries with Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Your Previous Entries
            </CardTitle>
            <CardDescription>
              Look back at what you've written and see caregiver responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {journalEntries?.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  You haven't written any journal entries yet. Start by writing
                  your first entry above!
                </p>
              )}
              {journalEntries?.slice(0, 10).map((entry) => (
                <JournalEntryWithComments
                  key={entry.id}
                  entry={entry}
                  isExpanded={expandedEntries.has(entry.id)}
                  onToggleExpand={() => toggleExpand(entry.id)}
                  commentText={commentText[entry.id] || ""}
                  onCommentChange={(text) =>
                    setCommentText({ ...commentText, [entry.id]: text })
                  }
                  onAddComment={() => handleAddComment(entry.id)}
                  currentUserId={currentUser?.id || ""}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

interface JournalEntryWithCommentsProps {
  entry: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  commentText: string;
  onCommentChange: (text: string) => void;
  onAddComment: () => void;
  currentUserId: string;
}

function JournalEntryWithComments({
  entry,
  isExpanded,
  onToggleExpand,
  commentText,
  onCommentChange,
  onAddComment,
  currentUserId,
}: JournalEntryWithCommentsProps) {
  const { data: comments } = useComments(entry.id);

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">
          {format(entry.createdAt, "EEEE, MMMM d, yyyy")} at{" "}
          {format(entry.createdAt, "h:mm a")}
        </span>
        <MoodIcon mood={entry.mood} showLabel />
      </div>
      <p className="text-gray-700 mb-3">{entry.content}</p>
      {entry.hasVoiceMessage && (
        <div className="mb-3 flex items-center gap-2 text-sm text-purple-600">
          <Mic className="w-4 h-4" />
          <span>Voice message attached</span>
        </div>
      )}

      {/* Comments Toggle */}
      <div className="border-t border-gray-200 pt-3 mt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpand}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            {comments?.length || 0} Comment{comments?.length !== 1 ? "s" : ""}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {isExpanded && (
          <div className="space-y-3 mt-3">
            {/* Existing Comments */}
            {comments && comments.length > 0 && (
              <div className="space-y-2">
                {comments.map((comment) => {
                  const author = getUserById(comment.authorId);
                  return (
                    <div
                      key={comment.id}
                      className="bg-white p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {author?.name || "Unknown"}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {comment.authorRole === "caregiver"
                            ? "Caregiver"
                            : "You"}
                        </Badge>
                        <span className="text-xs text-gray-500 ml-auto">
                          {format(comment.createdAt, "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Comment */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => onCommentChange(e.target.value)}
                rows={2}
                className="text-base"
              />
              <Button
                onClick={onAddComment}
                size="sm"
                className="w-full sm:w-auto"
              >
                Add Comment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
