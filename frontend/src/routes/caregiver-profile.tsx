import { useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { User } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useUpdateCaregivers } from "@/api/users";

export function CaregiverProfile() {
  const { currentUser } = useAuth();
  const { mutate: updateUser } = useUpdateCaregivers();
  const [name, setName] = useState(currentUser?.name || "");
  const [isEditing, setIsEditing] = useState(false);

  if (!currentUser) {
    return <div>Not authenticated</div>;
  }

  const handleSave = () => {
    if (name.trim() === "") {
      toast.error("Name cannot be empty");
      return;
    }

    const updatedUser = {
      ...currentUser,
      name: name.trim(),
    };

    updateUser(updatedUser);
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  const handleCancel = () => {
    setName(currentUser?.name || "");
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Profile Settings</h1>
        <p className="text-gray-500">Manage your profile information</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-700" />
            </div>
            <div>
              <CardTitle> {currentUser.username}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            ) : (
              <p className="text-sm py-2">{currentUser.name}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            {isEditing ? (
              <>
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
