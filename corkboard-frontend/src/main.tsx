import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage/LoginPage.tsx";
import { CurrentReleasePage } from "@/pages/CurrentReleasePage/CurrentReleasePage.tsx";
import { ProtectedRoute } from "@/features/ProtectedRoute.tsx";
import { AuthProvider } from "@/context/auth/AuthProvider.tsx";
import { SignUpPage } from "@/pages/SignUpPage/SignUpPage.tsx";
import { ReleasesPage } from "@/pages/ReleasesPage/ReleasesPage.tsx";
import { SettingsPage } from "@/pages/SettingsPage/SettingsPage.tsx";
import WorkspaceGeneral from "@/features/Settings/WorkspaceGeneral/WorkspaceGeneral.tsx";
import WorkspaceUsers from "@/features/Settings/WorkspaceUsers/WorkspaceUsers.tsx";
import UserProfile from "@/features/Settings/UserProfile/UserProfile.tsx";
import { WorkspaceList } from "@/features/Settings/WorkspaceList/WorkspaceList.tsx";
import { BacklogPage } from "@/pages/BacklogPage/BacklogPage.tsx";
import { Documents } from "@/features/Documents/Documents.tsx";
import TaskDisplay from "@/features/TaskModal/TaskDisplay.tsx";
import ToastContainer from "@/ui/Toast/ToastContainer.tsx";
import SuperAdminUsers from "@/features/SuperAdmin/SuperAdminUsers/SuperAdminUsers.tsx";
import SuperAdminUser from "@/features/SuperAdmin/SuperAdminUsers/SuperAdminUser.tsx";
import TagsManager from "@/features/Settings/TagsManager/TagsManager.tsx";
import GuestRoute from "@/features/GuestRoute.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Subscriptions from "@/features/Subscriptions/Subscriptions.ts";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Subscriptions />
                <BrowserRouter>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <GuestRoute>
                                    <LoginPage />
                                </GuestRoute>
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                <GuestRoute>
                                    <SignUpPage />
                                </GuestRoute>
                            }
                        />
                        <Route
                            path="/workspaces/:workspaceId/current_release"
                            element={
                                <ProtectedRoute>
                                    <CurrentReleasePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/workspaces/:workspaceId/releases"
                            element={
                                <ProtectedRoute>
                                    <ReleasesPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/workspaces/:workspaceId/backlog/:releaseId?"
                            element={
                                <ProtectedRoute>
                                    <BacklogPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <SettingsPage />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Navigate to="user/profile" />} />

                            <Route path="workspace/:workspaceId/general" element={<WorkspaceGeneral />} />
                            <Route path="workspace/:workspaceId/users" element={<WorkspaceUsers />} />
                            <Route path="workspace/:workspaceId/tags" element={<TagsManager />} />
                            <Route path="user/profile" element={<UserProfile />} />
                            <Route path="user/workspaces" element={<WorkspaceList />} />
                        </Route>

                        <Route
                            path="workspaces/:workspaceId/documents/:documentId?"
                            element={
                                <ProtectedRoute>
                                    <Documents />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/superadmin"
                            element={
                                <ProtectedRoute role="superadmin">
                                    <Outlet />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Navigate to="users" />} />
                            <Route path="users" element={<SuperAdminUsers />} />
                            <Route path="users/:id" element={<SuperAdminUser />} />
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>

                    <TaskDisplay />
                    <ToastContainer />
                </BrowserRouter>
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>,
);
