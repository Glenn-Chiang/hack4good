import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  useGetRecipientsByCaregiver,
  useSendRequest,
  
  useGetAllRecipients,
} from "../api/users";
import { useAuth } from "@/auth/AuthProvider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
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
import { Badge } from "../components/ui/badge";
import { Users, Plus, Search, Clock } from "lucide-react";
import { toast } from "sonner";

export function Recipients() {
  const { currentUser } = useAuth();
  const { data: recipients, isLoading } = useGetRecipientsByCaregiver(
    currentUser?.id || ""
  );
  const assignRecipient = useSendRequest();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter recipients that are not already assigned to this caregiver
  const { data: availableRecipients = [] } = useGetAllRecipients();

  // Filter based on search query
  const filteredRecipients = availableRecipients.filter((recipient) =>
    recipient.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendRequest = (recipientId: string) => {
    assignRecipient.mutate(
      { recipientId, caregiverId: currentUser?.id || "" },
      {
        onSuccess: () => {
          toast.success("Care request sent! Waiting for recipient to accept.");
          setSearchQuery("");
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Failed to send request"
          );
        },
      }
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Recipients</h2>
          <p className="text-gray-500">Manage your care recipients</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Recipient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Care Request</DialogTitle>
              <DialogDescription>
                Search for recipients and send them a care request. They will
                need to accept before you can access their information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="search">Search by Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type a name to search..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredRecipients.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    {searchQuery
                      ? "No recipients found matching your search"
                      : "No available recipients"}
                  </p>
                )}
                {filteredRecipients.map((recipient) => {
                  const { data: relationship } = useGetRequest(
                    currentUser?.id || "",
                    recipient.id
                  );

                  const isPending = relationship?.status === "pending";

                  return (
                    <Card
                      key={recipient.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-700">
                                {recipient.user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {recipient.user.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {recipient.age} years old
                                {recipient.condition &&
                                  ` • ${recipient.condition}`}
                              </p>
                              {isPending && (
                                <Badge
                                  variant="outline"
                                  className="mt-1 text-xs"
                                >
                                  <Clock className="w-3 h-3 mr-1" />
                                  Request Pending
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleSendRequest(recipient.id)}
                            disabled={assignRecipient.isPending || isPending}
                            size="sm"
                          >
                            {isPending ? "Pending" : "Send Request"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipients?.map((recipient) => (
          <Card
            key={recipient.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl text-blue-700">
                    {recipient.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {recipient.user.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {recipient.age} years old
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Condition</p>
                <p className="text-sm">
                  {recipient.condition || "Not specified"}
                </p>
              </div>
              <Link to={`/recipients/${recipient.id}`}>
                <Button className="w-full">View Profile</Button>
              </Link>
            </CardContent>
          </Card>
        ))}

        {recipients?.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No recipients assigned</p>
              <p className="text-sm text-gray-400">
                Click "Add Recipient" to search for recipients and send care
                requests
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
