import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Heart, User, ArrowLeft } from "lucide-react";
import { useSignup } from "@/api/auth";
import { toast } from "sonner";
import type { SignUpPostData } from "@/types/auth";

export function Signup() {
  const navigate = useNavigate();
  const signup = useSignup();
  const [selectedRole, setSelectedRole] = useState<
    "caregiver" | "recipient" | null
  >(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    age: 0,
    condition: "",
    likes: "",
    dislikes: "",
    phobias: "",
    petPeeves: "",
  });

  const handleSignup = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (!formData.password.trim()) {
      toast.error("Please enter a password");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    const signUpData: SignUpPostData = {
      name: formData.name,
      username: formData.username,
      password: formData.password,
      role: selectedRole,
    };

    if (selectedRole === "recipient") {
      signUpData.recipient = {
        age: formData.age,
        condition: formData.condition,
        likes: formData.likes,
        dislikes: formData.dislikes,
        phobias: formData.phobias,
        petPeeves: formData.petPeeves,
      };
    } else if (selectedRole === "caregiver") {
      signUpData.caregiver = {};
    }

    signup.mutateAsync(signUpData, {
      onSuccess: () => {
        toast.success("Account created successfully! Please login.");
        navigate({ to: "/login" });
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create account");
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl mb-2">Join CareConnect</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {!selectedRole ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Caregiver Signup */}
              <Card
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-blue-400"
                onClick={() => setSelectedRole("caregiver")}
              >
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">
                    Sign Up as Caregiver
                  </CardTitle>
                  <CardDescription>
                    Create an account to manage and care for recipients
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Recipient Signup */}
              <Card
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-purple-400"
                onClick={() => setSelectedRole("recipient")}
              >
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
                    <Heart className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl">
                    Sign Up as Recipient
                  </CardTitle>
                  <CardDescription>
                    Create an account to journal and connect with caregivers
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="text-center">
              <Link to="/login">
                <Button variant="link">
                  Already have an account? Login here
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <Button
                variant="ghost"
                onClick={() => setSelectedRole(null)}
                className="w-fit mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <CardTitle>
                {selectedRole === "caregiver"
                  ? "Caregiver Registration"
                  : "Recipient Registration"}
              </CardTitle>
              <CardDescription>
                Fill in your information to create your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Common Fields */}
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="Enter a username"
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter a password"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm your password"
                />
              </div>

              {/* Recipient-specific fields */}
              {selectedRole === "recipient" && (
                <>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          age: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Enter your age"
                    />
                  </div>

                  <div>
                    <Label htmlFor="condition">Medical Condition</Label>
                    <Input
                      id="condition"
                      value={formData.condition}
                      onChange={(e) =>
                        setFormData({ ...formData, condition: e.target.value })
                      }
                      placeholder="e.g., Diabetes, Alzheimer's Disease"
                    />
                  </div>

                  <div>
                    <Label htmlFor="likes">Things You Like</Label>
                    <Textarea
                      id="likes"
                      value={formData.likes}
                      onChange={(e) =>
                        setFormData({ ...formData, likes: e.target.value })
                      }
                      placeholder="e.g., Reading, gardening, classical music..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dislikes">Things You Dislike</Label>
                    <Textarea
                      id="dislikes"
                      value={formData.dislikes}
                      onChange={(e) =>
                        setFormData({ ...formData, dislikes: e.target.value })
                      }
                      placeholder="e.g., Loud noises, spicy food..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phobias">Phobias or Fears</Label>
                    <Textarea
                      id="phobias"
                      value={formData.phobias}
                      onChange={(e) =>
                        setFormData({ ...formData, phobias: e.target.value })
                      }
                      placeholder="e.g., Fear of the dark, claustrophobia..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="petPeeves">Pet Peeves</Label>
                    <Textarea
                      id="petPeeves"
                      value={formData.petPeeves}
                      onChange={(e) =>
                        setFormData({ ...formData, petPeeves: e.target.value })
                      }
                      placeholder="e.g., Being rushed, people speaking too fast..."
                      rows={2}
                    />
                  </div>
                </>
              )}

              <Button
                onClick={handleSignup}
                className="w-full"
                disabled={signup.isPending}
              >
                Create Account
              </Button>

              <div className="text-center">
                <Link to="/login">
                  <Button variant="link">
                    Already have an account? Login here
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
