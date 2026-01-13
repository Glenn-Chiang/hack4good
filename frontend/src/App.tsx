import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./routes/index";
import { TodoList } from "./routes/todos";
import { Journal } from "./routes/journal";
import { Recipients } from "./routes/recipients";
import { RecipientProfile } from "./routes/recipient-profile";
import { RecipientDashboard } from "./routes/recipient-dashboard";
import { CaregiverProfile } from "./routes/caregiver-profile";
import { Login } from "./routes/login";
import { Signup } from "./routes/signup";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./lib/auth";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route wrapper component
function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole?: "caregiver" | "recipient";
}) {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    } else if (allowedRole && currentUser?.role !== allowedRole) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, currentUser, allowedRole, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRole && currentUser?.role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}

// Root route wrapper with auth
function RootWrapper() {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Outlet />;
  }

  // Recipient gets simplified dashboard
  if (currentUser?.role === "recipient") {
    return <Outlet />;
  }

  // Caregiver gets full layout
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

// Create root route
const rootRoute = createRootRoute({
  component: RootWrapper,
});

// Login route (public)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

// Signup route (public)
const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: Signup,
});

// Main dashboard - redirects based on role or to login if not authenticated
function MainDashboard() {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (currentUser?.role === "recipient") {
    return <RecipientDashboard />;
  }

  return <Dashboard />;
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: MainDashboard,
});

// Caregiver-only routes
const todosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/todos",
  component: () => (
    <ProtectedRoute allowedRole="caregiver">
      <TodoList />
    </ProtectedRoute>
  ),
});

const journalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/journal",
  component: () => (
    <ProtectedRoute allowedRole="caregiver">
      <Journal />
    </ProtectedRoute>
  ),
});

const recipientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/recipients",
  component: () => (
    <ProtectedRoute allowedRole="caregiver">
      <Recipients />
    </ProtectedRoute>
  ),
});

const recipientProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/recipients/$recipientId",
  component: () => (
    <ProtectedRoute allowedRole="caregiver">
      <RecipientProfile />
    </ProtectedRoute>
  ),
});

const caregiverProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/caregiver-profile",
  component: () => (
    <ProtectedRoute allowedRole="caregiver">
      <CaregiverProfile />
    </ProtectedRoute>
  ),
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  signupRoute,
  indexRoute,
  todosRoute,
  journalRoute,
  recipientsRoute,
  recipientProfileRoute,
  caregiverProfileRoute,
]);

// Create the router
const router = createRouter({ routeTree });

// Register the router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}
