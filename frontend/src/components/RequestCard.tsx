import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "./ui/button";

import { useRespondToRequest } from "@/api/users";
import type { CareRequest } from "@/types/users";
import { format } from "date-fns";
import { toast } from "sonner";

type RequestCardProps = {
  request: CareRequest;
};

export function RequestCard({ request }: RequestCardProps) {
  const respondToRequest = useRespondToRequest();
  
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

  return (
    <div
      key={request.id}
      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-700">
              {request.caregiver.user.name
                .split(" ")
                .map((n) => n[0])
                .join("") || "??"}
            </span>
          </div>
          <div>
            <p className="font-medium">{request.caregiver.user.name || "Unknown"}</p>
            <p className="text-sm text-gray-500">Wants to be your caregiver</p>
            <p className="text-xs text-gray-400 mt-1">
              Requested {format(request.requestedAt, "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRespondToRequest(request.id, "rejected")}
            disabled={respondToRequest.isPending}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Decline
          </Button>
          <Button
            size="sm"
            onClick={() => handleRespondToRequest(request.id, "accepted")}
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
}
