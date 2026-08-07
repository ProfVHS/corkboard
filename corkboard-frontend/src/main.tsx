import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage/LoginPage.tsx";
import { CurrentReleasePage } from "./pages/./CurrentReleasePage/CurrentReleasePage.tsx";
import { ProtectedRoute } from "./components/features/ProtectedRoute.tsx";
import { AuthProvider } from "./context/auth/AuthProvider.tsx";
import { SignUpPage } from "./pages/SignUpPage/SignUpPage.tsx";
import { ReleasesPage } from "./pages/ReleasesPage/ReleasesPage.tsx";
import { SettingsPage } from "./pages/SettingsPage/SettingsPage.tsx";
import { WorkspaceGeneral } from "./components/features/Settings/WorkspaceGeneral/WorkspaceGeneral.tsx";
import { WorkspaceUsers } from "./components/features/Settings/WorkspaceUsers/WorkspaceUsers.tsx";
import { UserProfile } from "./components/features/Settings/UserProfile/UserProfile.tsx";
import { WorkspaceList } from "./components/features/Settings/WorkspaceList/WorkspaceList.tsx";
import { BacklogPage } from "./pages/BacklogPage/BacklogPage.tsx";
import { Documents } from "./components/features/Documents/Documents.tsx";
import TaskDisplay from "./components/features/TaskModal/TaskDisplay.tsx";
import ToastContainer from "./components/ui/Toast/ToastContainer.tsx";
import SuperAdminUsers from "./components/features/SuperAdmin/SuperAdminUsers/SuperAdminUsers.tsx";
import SuperAdminUser from "./components/features/SuperAdmin/SuperAdminUsers/SuperAdminUser.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
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
                        <Route path="user/profile" element={<UserProfile />} />
                        <Route path="user/workspaces" element={<WorkspaceList />} />
                    </Route>

                    <Route
                        path="/backlog/:releaseId?"
                        element={
                            <ProtectedRoute>
                                <BacklogPage />
                            </ProtectedRoute>
                        }
                    />

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

                    <Route path="*" element={<div>NO ROUTE</div>} />
                </Routes>

                <TaskDisplay />
                <ToastContainer />
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>,
);
