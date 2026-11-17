import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styles from "./ManagerTables.module.scss";

const TABLE_CAPACITY = 10;
const COUPLE_SEATS = ["Caro", "Nico"];
// Tables snap to a grid of square cells so the plan stays tidy; a table sits
// GRID_INSET px inside its cell. Keep in sync with the layout in setup_seating.
const GRID_CELL = 150; // keep in sync with $grid-cell in the SCSS
const GRID_INSET = 10;
const GRID_COLS = 10;
const GRID_ROWS = 8;
const TABLE_BOX = 130; // keep in sync with $table-box in the SCSS
const SEAT_SIZE = 22;
const SEAT_RADIUS = 52;
const SEATING_KEY = ["admin", "seating"];

const fetchJson = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request to ${url} failed`);
  }
  return response.json();
};

const jsonRequest = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const getSeating = () => fetchJson("/api/admin/tables");
const setupSeating = (tableCount) =>
  fetchJson(
    "/api/admin/tables?action=setup",
    jsonRequest("POST", { table_count: tableCount })
  );
const createTable = (table) =>
  fetchJson("/api/admin/tables", jsonRequest("POST", table));
const updateTable = (table) =>
  fetchJson(`/api/admin/tables?id=${table.id}`, jsonRequest("PUT", table));
const deleteTable = (tableId) =>
  fetchJson(`/api/admin/tables?id=${tableId}`, { method: "DELETE" });
const saveSeats = (assignments) =>
  fetchJson("/api/admin/tables?action=seats", jsonRequest("PUT", { assignments }));

const personKey = (guestId, personIndex) => `${guestId}-${personIndex}`;

const cellKey = (x, y) =>
  `${Math.round((x - GRID_INSET) / GRID_CELL)},${Math.round(
    (y - GRID_INSET) / GRID_CELL
  )}`;

// Everyone who said yes, one entry per person: the guest is index 0 and
// companion_names[i] is index i + 1.
const getConfirmedPeople = (guests) =>
  guests.flatMap((guest) => {
    const people = [];
    if (guest.attending === true) {
      people.push({
        key: personKey(guest.id, 0),
        guestId: guest.id,
        personIndex: 0,
        name: [guest.first_name, guest.last_name].filter(Boolean).join(" "),
      });
    }
    (guest.companion_names || []).forEach((name, i) => {
      if (guest.companions_attending?.[i] !== true) return;
      people.push({
        key: personKey(guest.id, i + 1),
        guestId: guest.id,
        personIndex: i + 1,
        name: name.trim() || `+1 de ${guest.first_name}`,
      });
    });
    return people;
  });

const initials = (name) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

// Small seats are hard to hit, so a seat under the pointer wins over the
// table that contains it.
const collisionDetection = (args) => {
  const collisions = pointerWithin(args);
  const seat = collisions.find((c) => String(c.id).startsWith("seat:"));
  return seat ? [seat] : collisions;
};

const seatPosition = (index, count) => {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
  const center = TABLE_BOX / 2 - SEAT_SIZE / 2;
  return {
    left: center + SEAT_RADIUS * Math.cos(angle),
    top: center + SEAT_RADIUS * Math.sin(angle),
  };
};

function PersonChip({ person, from }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `person:${person.key}`,
    data: { type: "person", person, from },
  });
  return (
    <div
      ref={setNodeRef}
      className={`${styles.chip} ${isDragging ? styles.isDragging : ""}`}
      {...attributes}
      {...listeners}
    >
      {person.name}
    </div>
  );
}

function Seat({ tableId, seat, person, count }) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `seat:${tableId}:${seat}`,
    data: { type: "seat", tableId, seat },
  });
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: `person:${person?.key ?? `empty-${tableId}-${seat}`}`,
    data: { type: "person", person, from: { tableId, seat } },
    disabled: !person,
  });

  return (
    <div
      ref={(node) => {
        setDropRef(node);
        setDragRef(node);
      }}
      className={`${styles.seat} ${person ? styles.isOccupied : ""} ${
        isOver ? styles.isOver : ""
      } ${isDragging ? styles.isDragging : ""}`}
      style={seatPosition(seat, count)}
      data-name={person?.name}
      {...(person ? { ...attributes, ...listeners } : {})}
    >
      {person && initials(person.name)}
    </div>
  );
}

function SeatingTable({ table, seats, onRename, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(table.name);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `table:${table.id}`, data: { type: "table", table } });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `table-drop:${table.id}`,
    data: { type: "table", tableId: table.id },
    disabled: table.is_couple,
  });

  const seatedCount = seats.filter(Boolean).length;
  const isFull = !table.is_couple && seatedCount === TABLE_CAPACITY;

  const finishRename = () => {
    setIsEditing(false);
    const name = draftName.trim();
    if (name && name !== table.name) {
      onRename(name);
    } else {
      setDraftName(table.name);
    }
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setDropRef(node);
      }}
      className={`${styles.table} ${isFull ? styles.isFull : ""} ${
        isOver ? styles.isOver : ""
      } ${isDragging ? styles.isMoving : ""}`}
      style={{
        left: table.x,
        top: table.y,
        transform: CSS.Translate.toString(transform),
      }}
    >
      <div className={styles.tableTop} {...attributes} {...listeners}>
        {isEditing ? (
          <input
            className={styles.nameInput}
            value={draftName}
            autoFocus
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={finishRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            onPointerDown={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className={styles.tableName}
            onDoubleClick={() => !table.is_couple && setIsEditing(true)}
          >
            {table.name}
          </span>
        )}
        {!table.is_couple && (
          <span className={styles.tableCount}>
            {seatedCount}/{TABLE_CAPACITY}
          </span>
        )}
      </div>

      {table.is_couple
        ? COUPLE_SEATS.map((name, i) => (
            <div
              key={name}
              className={`${styles.seat} ${styles.isOccupied}`}
              style={seatPosition(i, COUPLE_SEATS.length)}
              data-name={name}
            >
              {initials(name)}
            </div>
          ))
        : seats.map((person, seat) => (
            <Seat
              key={seat}
              tableId={table.id}
              seat={seat}
              person={person}
              count={TABLE_CAPACITY}
            />
          ))}

      {!table.is_couple && (
        <button
          className={styles.deleteButton}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onDelete}
          aria-label={`Borrar ${table.name}`}
        >
          ×
        </button>
      )}
    </div>
  );
}

function Pool({ people }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "pool",
    data: { type: "pool" },
  });
  return (
    <div
      ref={setNodeRef}
      className={`${styles.pool} ${isOver ? styles.isOver : ""}`}
    >
      <div className={styles.poolTitle}>Sin mesa ({people.length})</div>
      <div className={styles.poolList}>
        {people.map((person) => (
          <PersonChip key={person.key} person={person} from={null} />
        ))}
      </div>
    </div>
  );
}

function ManagerTables({ guests, isLoadingGuests }) {
  const queryClient = useQueryClient();
  const [activePerson, setActivePerson] = useState(null);
  const hasRequestedSetup = useRef(false);

  const { data: seating, isLoading } = useQuery({
    queryKey: SEATING_KEY,
    queryFn: getSeating,
    refetchOnWindowFocus: false,
  });

  const people = getConfirmedPeople(guests);
  const peopleByKey = new Map(people.map((p) => [p.key, p]));
  const tables = seating?.tables ?? [];

  // Only confirmed people take a seat; a stale row for someone who
  // un-confirmed leaves the seat free.
  const seatsByTable = new Map(
    tables.map((t) => [
      t.id,
      Array(t.is_couple ? 0 : TABLE_CAPACITY).fill(null),
    ])
  );
  const seatedKeys = new Set();
  (seating?.assignments ?? []).forEach((a) => {
    const person = peopleByKey.get(personKey(a.guest_id, a.person_index));
    const seats = seatsByTable.get(a.table_id);
    if (!person || !seats || a.seat >= seats.length) return;
    seats[a.seat] = person;
    seatedKeys.add(person.key);
  });
  const unseated = people
    .filter((p) => !seatedKeys.has(p.key))
    .sort((a, b) => a.name.localeCompare(b.name));

  const onError = () => {
    alert("No se pudo guardar el cambio. Intenta de nuevo.");
    queryClient.invalidateQueries({ queryKey: SEATING_KEY });
  };
  const setSeating = (updater) =>
    queryClient.setQueryData(SEATING_KEY, (old) => updater(old));

  const setupMutation = useMutation({
    mutationFn: setupSeating,
    onSuccess: (data) => queryClient.setQueryData(SEATING_KEY, data),
    onError,
  });

  const seatsMutation = useMutation({
    mutationFn: saveSeats,
    onMutate: (assignments) =>
      setSeating((old) => {
        const moved = new Set(
          assignments.map((a) => personKey(a.guest_id, a.person_index))
        );
        const targets = new Set(
          assignments
            .filter((a) => a.table_id !== null)
            .map((a) => `${a.table_id}:${a.seat}`)
        );
        return {
          ...old,
          assignments: [
            ...old.assignments.filter(
              (a) =>
                !moved.has(personKey(a.guest_id, a.person_index)) &&
                !targets.has(`${a.table_id}:${a.seat}`)
            ),
            ...assignments.filter((a) => a.table_id !== null),
          ],
        };
      }),
    onError,
  });

  const updateTableMutation = useMutation({
    mutationFn: updateTable,
    onMutate: (table) =>
      setSeating((old) => ({
        ...old,
        tables: old.tables.map((t) => (t.id === table.id ? table : t)),
      })),
    onError,
  });

  const createTableMutation = useMutation({
    mutationFn: createTable,
    onSuccess: (table) =>
      setSeating((old) => ({ ...old, tables: [...old.tables, table] })),
    onError,
  });

  const deleteTableMutation = useMutation({
    mutationFn: deleteTable,
    onMutate: (tableId) =>
      setSeating((old) => ({
        tables: old.tables.filter((t) => t.id !== tableId),
        assignments: old.assignments.filter((a) => a.table_id !== tableId),
      })),
    onError,
  });

  // First visit: the couple's table plus enough tables for everyone confirmed.
  useEffect(() => {
    if (isLoading || isLoadingGuests || !seating) return;
    if (seating.tables.length > 0 || hasRequestedSetup.current) return;
    hasRequestedSetup.current = true;
    setupMutation.mutate(Math.max(1, Math.ceil(people.length / TABLE_CAPACITY)));
  }, [isLoading, isLoadingGuests, seating, people.length, setupMutation]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } })
  );

  const toAssignment = (person, tableId, seat) => ({
    guest_id: person.guestId,
    person_index: person.personIndex,
    table_id: tableId,
    seat,
  });

  const handleDragEnd = ({ active, over, delta }) => {
    setActivePerson(null);
    const dragged = active.data.current;

    if (dragged.type === "table") {
      const { table } = dragged;
      const snap = (value, count) =>
        Math.min(Math.max(0, Math.round((value - GRID_INSET) / GRID_CELL)), count - 1);
      const col = snap(table.x + delta.x, GRID_COLS);
      const row = snap(table.y + delta.y, GRID_ROWS);
      // One table per cell: dropping on a taken cell leaves the table where it was.
      if (
        tables.some(
          (t) => t.id !== table.id && cellKey(t.x, t.y) === `${col},${row}`
        )
      )
        return;
      updateTableMutation.mutate({
        ...table,
        x: GRID_INSET + col * GRID_CELL,
        y: GRID_INSET + row * GRID_CELL,
      });
      return;
    }

    if (!over) return;
    const { person, from } = dragged;
    const target = over.data.current;

    if (target.type === "pool") {
      if (from) seatsMutation.mutate([toAssignment(person, null, null)]);
      return;
    }

    if (target.type === "table") {
      if (from?.tableId === target.tableId) return;
      const freeSeat = seatsByTable.get(target.tableId).indexOf(null);
      if (freeSeat === -1) return;
      seatsMutation.mutate([toAssignment(person, target.tableId, freeSeat)]);
      return;
    }

    // Dropped on a seat: whoever sits there swaps to where the dragged
    // person came from (or back to the pool).
    if (from?.tableId === target.tableId && from?.seat === target.seat) return;
    const occupant = seatsByTable.get(target.tableId)[target.seat];
    const assignments = [toAssignment(person, target.tableId, target.seat)];
    if (occupant) {
      assignments.push(
        toAssignment(occupant, from?.tableId ?? null, from?.seat ?? null)
      );
    }
    seatsMutation.mutate(assignments);
  };

  const handleAddTable = () => {
    const taken = new Set(tables.map((t) => cellKey(t.x, t.y)));
    const freeCell = Array.from(
      { length: GRID_COLS * GRID_ROWS },
      (_, i) => i
    ).find((i) => !taken.has(`${i % GRID_COLS},${Math.floor(i / GRID_COLS)}`));
    if (freeCell === undefined) return;
    const regularCount = tables.filter((t) => !t.is_couple).length;
    createTableMutation.mutate({
      name: `Mesa ${regularCount + 1}`,
      x: GRID_INSET + (freeCell % GRID_COLS) * GRID_CELL,
      y: GRID_INSET + Math.floor(freeCell / GRID_COLS) * GRID_CELL,
    });
  };

  const handleDeleteTable = (table) => {
    if (
      !window.confirm(
        `¿Borrar ${table.name}? Sus invitados vuelven a la lista sin mesa.`
      )
    )
      return;
    deleteTableMutation.mutate(table.id);
  };

  if (isLoading || isLoadingGuests || tables.length === 0) {
    return <div className={styles.loading}>Cargando mesas...</div>;
  }

  return (
    <div className={styles.seating}>
      <div className={styles.toolbar}>
        <span>
          {people.length - unseated.length}/{people.length} confirmados con
          mesa
        </span>
        <button className={styles.addButton} onClick={handleAddTable}>
          + Agregar mesa
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={({ active }) =>
          active.data.current.type === "person" &&
          setActivePerson(active.data.current.person)
        }
        onDragCancel={() => setActivePerson(null)}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.board}>
          <Pool people={unseated} />
          <div className={styles.canvasScroll}>
            <div
              className={styles.canvas}
              style={{
                width: GRID_COLS * GRID_CELL,
                height: GRID_ROWS * GRID_CELL,
              }}
            >
              {tables.map((table) => (
                <SeatingTable
                  key={table.id}
                  table={table}
                  seats={seatsByTable.get(table.id)}
                  onRename={(name) =>
                    updateTableMutation.mutate({ ...table, name })
                  }
                  onDelete={() => handleDeleteTable(table)}
                />
              ))}
            </div>
          </div>
        </div>
        <DragOverlay dropAnimation={null}>
          {activePerson && (
            <div className={`${styles.chip} ${styles.overlay}`}>
              {activePerson.name}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <div className={styles.summary}>
        <h3 className={styles.summaryTitle}>Resumen</h3>
        <div className={styles.summaryGrid}>
          {tables.map((table) => {
            const seated = table.is_couple
              ? COUPLE_SEATS.map((name) => ({ key: name, name }))
              : seatsByTable.get(table.id).filter(Boolean);
            return (
              <div key={table.id} className={styles.summaryCard}>
                <div className={styles.summaryHeader}>
                  <span>{table.name}</span>
                  {!table.is_couple && (
                    <span className={styles.tableCount}>
                      {seated.length}/{TABLE_CAPACITY}
                    </span>
                  )}
                </div>
                {seated.length === 0 ? (
                  <p className={styles.summaryEmpty}>—</p>
                ) : (
                  <ul className={styles.summaryList}>
                    {seated.map((person) => (
                      <li key={person.key}>{person.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ManagerTables;
