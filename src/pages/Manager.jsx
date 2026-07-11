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

// API functions for guests
const getAllGuests = async () => {
  const response = await fetch("/api/admin/guests");
  if (!response.ok) {
    throw new Error("Failed to fetch guests");
  }
  return response.json();
};

const createGuest = async (guestData) => {
  const response = await fetch("/api/admin/guests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(guestData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create guest");
  }
  return response.json();
};

const updateGuest = async ({ guestId, guestData }) => {
  const response = await fetch(`/api/admin/guests/${guestId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(guestData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update guest");
  }
  return response.json();
};

const deleteGuest = async (guestId) => {
  const response = await fetch(`/api/admin/guests/${guestId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete guest");
  }
  return response.json();
};

const emptyGuestForm = {
  first_name: "",
  last_name: "",
  nickname: "",
  phone: "",
  has_plus_one_no_name: false,
  group_name: "",
  link_generated: false,
  link_sent: false,
};

function Manager() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if already authenticated in sessionStorage
    return sessionStorage.getItem("manager_authenticated") === "true";
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("messages"); // 'messages', 'ranking' or 'guests'

  // Guests modal state
  const [guestModalMode, setGuestModalMode] = useState(null); // null | 'add' | 'edit'
  const [guestForm, setGuestForm] = useState(emptyGuestForm);
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [deletingGuest, setDeletingGuest] = useState(null);

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

  // Query for all guests
  const {
    data: guests = [],
    isLoading: isLoadingGuests,
    refetch: refetchGuests,
  } = useQuery({
    queryKey: ["admin", "guests"],
    queryFn: getAllGuests,
    enabled: isAuthenticated && activeTab === "guests",
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
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

  // Mutations for guests
  const createGuestMutation = useMutation({
    mutationFn: createGuest,
    onSuccess: () => {
      refetchGuests();
      closeGuestModal();
    },
  });

  const updateGuestMutation = useMutation({
    mutationFn: updateGuest,
    onSuccess: () => {
      refetchGuests();
      closeGuestModal();
    },
  });

  const deleteGuestMutation = useMutation({
    mutationFn: deleteGuest,
    onSuccess: () => {
      refetchGuests();
      setDeletingGuest(null);
    },
  });

  const openAddGuestModal = () => {
    setGuestForm(emptyGuestForm);
    setEditingGuestId(null);
    setGuestModalMode("add");
  };

  const openEditGuestModal = (guest) => {
    setGuestForm({
      first_name: guest.first_name || "",
      last_name: guest.last_name || "",
      nickname: guest.nickname || "",
      phone: guest.phone || "",
      has_plus_one_no_name: guest.has_plus_one_no_name || false,
      group_name: guest.group_name || "",
      link_generated: guest.link_generated || false,
      link_sent: guest.link_sent || false,
    });
    setEditingGuestId(guest.id);
    setGuestModalMode("edit");
  };

  const closeGuestModal = () => {
    setGuestModalMode(null);
    setEditingGuestId(null);
    setGuestForm(emptyGuestForm);
  };

  const handleGuestFormChange = (field, value) => {
    setGuestForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuestFormSubmit = (e) => {
    e.preventDefault();
    if (!guestForm.first_name.trim()) return;

    if (guestModalMode === "edit" && editingGuestId) {
      updateGuestMutation.mutate({ guestId: editingGuestId, guestData: guestForm });
    } else {
      createGuestMutation.mutate(guestForm);
    }
  };

  const handleDeleteGuestClick = (guest) => setDeletingGuest(guest);
  const cancelDeleteGuest = () => setDeletingGuest(null);
  const confirmDeleteGuest = () => {
    if (deletingGuest) {
      deleteGuestMutation.mutate(deletingGuest.id);
    }
  };

  const totalGuests = guests.reduce(
    (total, guest) => total + 1 + (guest.has_plus_one_no_name ? 1 : 0),
    0
  );

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
          <button
            className={`${styles.tab} ${
              activeTab === "guests" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("guests")}
          >
            🧑‍🤝‍🧑 Invitados ({guests.length})
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

        {/* Guests Tab */}
        {activeTab === "guests" && (
          <div className={styles.tabContent}>
            <div className={styles.guestsToolbar}>
              <button
                className={styles.addGuestButton}
                onClick={openAddGuestModal}
              >
                + Agregar invitado
              </button>
            </div>

            {isLoadingGuests ? (
              <div className={styles.loading}>Cargando invitados...</div>
            ) : guests.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Aún no hay invitados registrados.</p>
              </div>
            ) : (
              <>
                <div className={styles.guestsTableWrapper}>
                  <div className={styles.rankingTable}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Apellidos</th>
                          <th>Apodo</th>
                          <th>Teléfono</th>
                          <th>Puede traer +1 sin confirmar</th>
                          <th>Grupo de invitación</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {guests.map((guest) => (
                          <tr key={guest.id}>
                            <td className={styles.nameCell}>
                              {guest.first_name}
                            </td>
                            <td>{guest.last_name || "—"}</td>
                            <td>{guest.nickname || "—"}</td>
                            <td>{guest.phone || "—"}</td>
                            <td className={styles.centerCell}>
                              {guest.has_plus_one_no_name ? "✅" : "—"}
                            </td>
                            <td>{guest.group_name || "—"}</td>
                            <td>
                              <div className={styles.guestActions}>
                                <button
                                  className={styles.editButton}
                                  onClick={() => openEditGuestModal(guest)}
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  className={styles.deleteButton}
                                  onClick={() => handleDeleteGuestClick(guest)}
                                  title="Eliminar"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={styles.guestsTotal}>
                  Total de invitados (contando los +1 aún sin nombre):{" "}
                  <strong>{totalGuests}</strong>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Guest Modal */}
      {guestModalMode && (
        <div className={styles.modalOverlay} onClick={closeGuestModal}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.modalTitle}>
              {guestModalMode === "edit" ? "Editar invitado" : "Agregar invitado"}
            </h2>
            <form onSubmit={handleGuestFormSubmit} className={styles.guestForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre</label>
                <input
                  type="text"
                  className={styles.input}
                  value={guestForm.first_name}
                  onChange={(e) =>
                    handleGuestFormChange("first_name", e.target.value)
                  }
                  required
                  autoFocus
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Apellidos</label>
                <input
                  type="text"
                  className={styles.input}
                  value={guestForm.last_name}
                  onChange={(e) =>
                    handleGuestFormChange("last_name", e.target.value)
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Apodo</label>
                <input
                  type="text"
                  className={styles.input}
                  value={guestForm.nickname}
                  onChange={(e) =>
                    handleGuestFormChange("nickname", e.target.value)
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Teléfono</label>
                <input
                  type="text"
                  className={styles.input}
                  value={guestForm.phone}
                  onChange={(e) =>
                    handleGuestFormChange("phone", e.target.value)
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Grupo de invitación (personas que reciben el mismo link,
                  ej. una pareja)
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ej: Alba y Alfredo"
                  value={guestForm.group_name}
                  onChange={(e) =>
                    handleGuestFormChange("group_name", e.target.value)
                  }
                />
              </div>

              <div className={styles.checkboxRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={guestForm.has_plus_one_no_name}
                    onChange={(e) =>
                      handleGuestFormChange(
                        "has_plus_one_no_name",
                        e.target.checked
                      )
                    }
                  />
                  Puede traer un acompañante sin nombre confirmado aún
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeGuestModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={
                    createGuestMutation.isLoading || updateGuestMutation.isLoading
                  }
                >
                  {guestModalMode === "edit"
                    ? "Guardar cambios"
                    : "Agregar invitado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Guest Confirmation Modal */}
      {deletingGuest && (
        <div className={styles.modalOverlay} onClick={cancelDeleteGuest}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.modalTitle}>¿Eliminar invitado?</h2>
            <p className={styles.confirmText}>
              Esta acción eliminará a{" "}
              <strong>
                {deletingGuest.first_name} {deletingGuest.last_name}
              </strong>{" "}
              de la lista de invitados. No se puede deshacer.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={cancelDeleteGuest}>
                Cancelar
              </button>
              <button
                className={styles.confirmDeleteButton}
                onClick={confirmDeleteGuest}
                disabled={deleteGuestMutation.isLoading}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default Manager;
