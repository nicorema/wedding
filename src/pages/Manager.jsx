import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageContainer from "../components/PageContainer";
import styles from "./Manager.module.scss";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

// API functions for admin
const getPendingMessages = async () => {
  const response = await fetch("/api/admin/messages/pending");
  if (!response.ok) {
    throw new Error("Failed to fetch pending messages");
  }
  return response.json();
};

const updateMessageStatus = async ({ messageId, status }) => {
  const response = await fetch(`/api/admin/messages/${messageId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update message status");
  }
  return response.json();
};

const deleteMessage = async (messageId) => {
  const response = await fetch(`/api/admin/messages/${messageId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete message");
  }
  return response.json();
};

// API function for getting all scores
const getAllScores = async () => {
  const response = await fetch("/api/admin/scores");
  if (!response.ok) {
    throw new Error("Failed to fetch scores");
  }
  return response.json();
};

function Manager() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if already authenticated in sessionStorage
    return sessionStorage.getItem("manager_authenticated") === "true";
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("messages"); // 'messages' or 'ranking'

  // Query for pending messages
  const {
    data: pendingMessages = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "pending-messages"],
    queryFn: getPendingMessages,
    enabled: isAuthenticated && activeTab === "messages", // Only fetch when authenticated and on messages tab
    staleTime: 1 * 60 * 1000, // 1 minute - admin needs fresher data
    refetchInterval: 60000, // Refetch every 60 seconds (reduced from 30s)
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
  });

  // Query for all scores (ranking)
  const {
    data: scores = [],
    isLoading: isLoadingScores,
    refetch: refetchScores,
  } = useQuery({
    queryKey: ["admin", "scores"],
    queryFn: getAllScores,
    enabled: isAuthenticated && activeTab === "ranking", // Only fetch when authenticated and on ranking tab
    staleTime: 2 * 60 * 1000, // 2 minutes - scores don't change that often
    refetchInterval: 120000, // Refetch every 2 minutes (reduced from 30s)
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
  });

  const queryClient = useQueryClient();

  // Mutation for updating message status
  const updateStatusMutation = useMutation({
    mutationFn: updateMessageStatus,
    onSuccess: () => {
      // Refetch pending messages
      refetch();
      // Invalidate public messages query so approved messages appear
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  // Mutation for deleting messages
  const deleteMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      // Refetch pending messages
      refetch();
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("manager_authenticated", "true");
      setUsername("");
      setPassword("");
    } else {
      setLoginError("Invalid username or password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("manager_authenticated");
  };

  const handleApprove = (messageId) => {
    if (window.confirm("Are you sure you want to approve this message?")) {
      updateStatusMutation.mutate({ messageId, status: "Approved" });
    }
  };

  const handleDeny = (messageId) => {
    if (
      window.confirm("Are you sure you want to deny and delete this message?")
    ) {
      deleteMutation.mutate(messageId);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isAuthenticated) {
    return (
      <PageContainer>
        <div className={styles.manager}>
          <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
              <h1 className={styles.loginTitle}>🔐 Manager Login</h1>
              <form onSubmit={handleLogin} className={styles.loginForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="username" className={styles.label}>
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={styles.input}
                    placeholder="Enter username"
                    required
                    autoFocus
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                    placeholder="Enter password"
                    required
                  />
                </div>
                {loginError && (
                  <div className={styles.errorMessage}>{loginError}</div>
                )}
                <button type="submit" className={styles.loginButton}>
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className={styles.manager}>
        <div className={styles.header}>
          <h1 className={styles.title}>📋 Manager</h1>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "messages" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("messages")}
          >
            💌 Messages ({pendingMessages.length})
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "ranking" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("ranking")}
          >
            🏆 Ranking ({scores.length})
          </button>
        </div>

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className={styles.tabContent}>
            {isLoading ? (
              <div className={styles.loading}>Loading pending messages...</div>
            ) : pendingMessages.length === 0 ? (
              <div className={styles.emptyState}>
                <p>🎉 No pending messages! All caught up!</p>
              </div>
            ) : (
              <div className={styles.messagesList}>
                {pendingMessages.map((message) => (
                  <div key={message.id} className={styles.messageCard}>
                    <div className={styles.messageHeader}>
                      <div className={styles.messageAuthor}>
                        <strong>{message.name}</strong>
                      </div>
                      <div className={styles.messageDate}>
                        {formatDate(message.created_at)}
                      </div>
                    </div>
                    <div className={styles.messageContent}>
                      <p>{message.message}</p>
                    </div>
                    <div className={styles.messageActions}>
                      <button
                        onClick={() => handleApprove(message.id)}
                        className={styles.approveButton}
                        disabled={
                          updateStatusMutation.isLoading ||
                          deleteMutation.isLoading
                        }
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleDeny(message.id)}
                        className={styles.denyButton}
                        disabled={
                          updateStatusMutation.isLoading ||
                          deleteMutation.isLoading
                        }
                      >
                        ❌ Deny & Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ranking Tab */}
        {activeTab === "ranking" && (
          <div className={styles.tabContent}>
            {isLoadingScores ? (
              <div className={styles.loading}>Loading ranking...</div>
            ) : scores.length === 0 ? (
              <div className={styles.emptyState}>
                <p>📊 No scores yet!</p>
              </div>
            ) : (
              <div className={styles.rankingTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>Time</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map((score, index) => (
                      <tr key={score.id}>
                        <td className={styles.rankCell}>
                          {index === 0 && "🥇"}
                          {index === 1 && "🥈"}
                          {index === 2 && "🥉"}
                          {index > 2 && `#${index + 1}`}
                        </td>
                        <td className={styles.nameCell}>{score.name}</td>
                        <td className={styles.timeCell}>
                          {formatTime(score.time)}
                        </td>
                        <td className={styles.dateCell}>
                          {formatDate(score.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default Manager;
