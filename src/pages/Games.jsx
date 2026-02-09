import { useState, useEffect } from "react";
import PageContainer from "../components/PageContainer";
import styles from "./Games.module.scss";
import { useBestTime, useSubmitScore } from "../hooks/useScores";

const WORDS = [
  "AMOR",
  "BODA",
  "CARO",
  "NICO",
  "FELICIDAD",
  "PENNY",
  "FAMILIA",
  "ANILLO",
  "VESTIDO",
  "BESO",
  "MUSICA",
  "VIAJES",
  "KARATE",
  "COMPROMISO",
];
const GRID_SIZE = 15;

// WhatsApp link generator function
const generateWhatsAppLink = (phoneNumber, message = "") => {
  // Remove any non-digit characters from phone number
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}${
    message ? `?text=${encodedMessage}` : ""
  }`;
};

// Dummy WhatsApp number - replace with real number later
const WHATSAPP_NUMBER = "1234567890"; // Replace with actual number when ready

function Games() {
  const [grid, setGrid] = useState([]);
  const [placedWords, setPlacedWords] = useState([]); // Store word positions for auto-win
  const [foundWords, setFoundWords] = useState([]);
  const [foundWordCells, setFoundWordCells] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showWordsDrawer, setShowWordsDrawer] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Use React Query hooks for data fetching
  const { data: bestTime, isLoading: isLoadingBestTime } = useBestTime();
  const submitScoreMutation = useSubmitScore();

  useEffect(() => {
    generateGrid();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isRunning && startTime && gameStarted) {
      interval = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime, gameStarted]);

  const handleStartGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setIsRunning(true);
  };

  const generateGrid = () => {
    const newGrid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(""));
    const placedWords = [];

    // Sort words by length (longest first) for better placement
    const sortedWords = [...WORDS].sort((a, b) => b.length - a.length);
    const directions = ["horizontal", "vertical", "diagonal"];

    // Place words in the grid
    sortedWords.forEach((word) => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 500;

      // Try all directions and positions more systematically
      while (!placed && attempts < maxAttempts) {
        const direction =
          directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);

        if (canPlaceWord(newGrid, word, row, col, direction)) {
          placeWord(newGrid, word, row, col, direction);
          placedWords.push({ word, row, col, direction });
          placed = true;
        }
        attempts++;
      }

      // If still not placed, try more systematically
      if (!placed) {
        for (let dir of directions) {
          for (let r = 0; r < GRID_SIZE && !placed; r++) {
            for (let c = 0; c < GRID_SIZE && !placed; c++) {
              if (canPlaceWord(newGrid, word, r, c, dir)) {
                placeWord(newGrid, word, r, c, dir);
                placedWords.push({ word, row: r, col: c, direction: dir });
                placed = true;
              }
            }
          }
          if (placed) break;
        }
      }
    });

    // Fill empty cells with random letters
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (newGrid[i][j] === "") {
          newGrid[i][j] = String.fromCharCode(
            65 + Math.floor(Math.random() * 26)
          );
        }
      }
    }

    setGrid(newGrid);
    setPlacedWords(placedWords); // Save word positions
    setFoundWords([]);
    setFoundWordCells([]);
    setGameStarted(false);
    setIsRunning(false);
    setCurrentTime(0);
    setStartTime(null);
  };

  const canPlaceWord = (grid, word, row, col, direction) => {
    if (direction === "horizontal") {
      if (col + word.length > GRID_SIZE) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row][col + i] !== "" && grid[row][col + i] !== word[i]) {
          return false;
        }
      }
    } else if (direction === "vertical") {
      if (row + word.length > GRID_SIZE) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row + i][col] !== "" && grid[row + i][col] !== word[i]) {
          return false;
        }
      }
    } else if (direction === "diagonal") {
      if (row + word.length > GRID_SIZE || col + word.length > GRID_SIZE)
        return false;
      for (let i = 0; i < word.length; i++) {
        if (
          grid[row + i][col + i] !== "" &&
          grid[row + i][col + i] !== word[i]
        ) {
          return false;
        }
      }
    }
    return true;
  };

  const placeWord = (grid, word, row, col, direction) => {
    for (let i = 0; i < word.length; i++) {
      if (direction === "horizontal") {
        grid[row][col + i] = word[i];
      } else if (direction === "vertical") {
        grid[row + i][col] = word[i];
      } else if (direction === "diagonal") {
        grid[row + i][col + i] = word[i];
      }
    }
  };

  const handleMouseDown = (row, col) => {
    setIsDragging(true);
    setStartCell({ row, col });
    setSelectedCells([{ row, col }]);
  };

  const handleMouseEnter = (row, col) => {
    if (isDragging && startCell) {
      const newSelection = getCellsBetween(startCell, { row, col });
      setSelectedCells(newSelection);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && selectedCells.length > 0) {
      checkWord(selectedCells);
      setIsDragging(false);
      setStartCell(null);
      setTimeout(() => setSelectedCells([]), 500);
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setStartCell(null);
      setSelectedCells([]);
    }
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e, row, col) => {
    e.preventDefault();
    setIsDragging(true);
    setStartCell({ row, col });
    setSelectedCells([{ row, col }]);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !startCell) return;

    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.dataset.row && element.dataset.col) {
      const row = parseInt(element.dataset.row);
      const col = parseInt(element.dataset.col);
      const newSelection = getCellsBetween(startCell, { row, col });
      setSelectedCells(newSelection);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging && selectedCells.length > 0) {
      checkWord(selectedCells);
      setIsDragging(false);
      setStartCell(null);
      setTimeout(() => setSelectedCells([]), 500);
    }
  };

  const getCellsBetween = (start, end) => {
    const cells = [];
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;

    if (rowDiff === 0) {
      // Horizontal
      const startCol = Math.min(start.col, end.col);
      const endCol = Math.max(start.col, end.col);
      for (let c = startCol; c <= endCol; c++) {
        cells.push({ row: start.row, col: c });
      }
    } else if (colDiff === 0) {
      // Vertical
      const startRow = Math.min(start.row, end.row);
      const endRow = Math.max(start.row, end.row);
      for (let r = startRow; r <= endRow; r++) {
        cells.push({ row: r, col: start.col });
      }
    } else if (Math.abs(rowDiff) === Math.abs(colDiff)) {
      // Diagonal
      const steps = Math.abs(rowDiff);
      const rowStep = rowDiff > 0 ? 1 : -1;
      const colStep = colDiff > 0 ? 1 : -1;
      for (let i = 0; i <= steps; i++) {
        cells.push({
          row: start.row + i * rowStep,
          col: start.col + i * colStep,
        });
      }
    }

    return cells.length > 0 ? cells : [start];
  };

  const checkWord = (cells) => {
    const word = cells.map((cell) => grid[cell.row][cell.col]).join("");
    const reversedWord = word.split("").reverse().join("");

    if (WORDS.includes(word) || WORDS.includes(reversedWord)) {
      const foundWord = WORDS.includes(word) ? word : reversedWord;
      if (!foundWords.includes(foundWord)) {
        const newFoundWords = [...foundWords, foundWord];
        setFoundWords(newFoundWords);

        // Add cells of found word to foundWordCells
        setFoundWordCells((prev) => [...prev, ...cells]);

        // Check if all words are found
        if (newFoundWords.length === WORDS.length) {
          setIsRunning(false);
          // Modal will appear automatically, no need to scroll
        }
      }
    }
  };

  const isCellSelected = (row, col) => {
    return selectedCells.some((cell) => cell.row === row && cell.col === col);
  };

  const isCellFound = (row, col) => {
    return foundWordCells.some((cell) => cell.row === row && cell.col === col);
  };

  const allWordsFound = foundWords.length === WORDS.length;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResetGame = () => {
    generateGrid();
    setGameStarted(false);
    setSubmitted(false);
    setPlayerName("");
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();

    if (!playerName.trim()) {
      alert("Por favor ingresa tu nombre");
      return;
    }

    try {
      // Submit score using React Query mutation
      await submitScoreMutation.mutateAsync({
        name: playerName.trim(),
        time: currentTime,
      });

      // Mark as submitted
      setSubmitted(true);
      // Best time will be automatically refetched by React Query
    } catch (error) {
      console.error("Error submitting score:", error);
      alert("Hubo un error al enviar tu puntaje. Por favor intenta de nuevo.");
    }
  };

  return (
    <PageContainer>
      <div className={styles.games}>
        <h1 className={styles.title}>Juegos</h1>

        <div className={styles.gameContainer}>
          <div className={styles.gameHeader}>
            <h2 className={styles.gameTitle}>🔍 Búsqueda de Palabras</h2>
            <p className={styles.gameInstructions}>
              Encuentra las palabras relacionadas con nuestra boda.
              <br />
              <strong>Mantén presionado y arrastra</strong> sobre las letras
              para seleccionar una palabra. Puedes seleccionar horizontal,
              vertical o diagonal.
            </p>
            <div className={styles.stats}>
              <div className={styles.progress}>
                Encontradas: {foundWords.length} / {WORDS.length}
              </div>
              <div className={styles.timer}>
                Tiempo: {formatTime(currentTime)}
              </div>
              <div className={styles.bestTime}>
                Mejor tiempo:{" "}
                {isLoadingBestTime
                  ? "Cargando..."
                  : bestTime
                  ? formatTime(bestTime)
                  : "N/A"}
              </div>
            </div>
            <div className={styles.prizeMessage}>
              🏆 <strong>¡Premio especial!</strong> El mejor tiempo ganará un
              premio sorpresa.
              <br />
              <span className={styles.warning}>
                ⚠️ No hagas trampa - tenemos un ingeniero de software detrás de
                nuestros sistemas! 😉
              </span>
              <br />
              <span className={styles.retryMessage}>
                🔄 Puedes intentar las veces que quieras - ¡practica y mejora tu
                tiempo!
              </span>
            </div>
          </div>

          <div className={styles.puzzleContainer}>
            {!gameStarted && (
              <div className={styles.startGameOverlay}>
                <button
                  className={styles.startGameButton}
                  onClick={handleStartGame}
                >
                  Comenzar Juego
                </button>
              </div>
            )}
            <div
              className={`${styles.gridContainer} ${
                !gameStarted ? styles.blurred : ""
              }`}
            >
              <div
                className={styles.wordSearchGrid}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onTouchEnd={handleTouchEnd}
              >
                {grid.map((row, rowIndex) => (
                  <div key={rowIndex} className={styles.gridRow}>
                    {row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`${styles.gridCell} ${
                          isCellSelected(rowIndex, colIndex)
                            ? styles.selected
                            : ""
                        } ${
                          isCellFound(rowIndex, colIndex) ? styles.found : ""
                        }`}
                        data-row={rowIndex}
                        data-col={colIndex}
                        onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                        onMouseEnter={() =>
                          handleMouseEnter(rowIndex, colIndex)
                        }
                        onMouseUp={handleMouseUp}
                        onTouchStart={(e) =>
                          handleTouchStart(e, rowIndex, colIndex)
                        }
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        {cell}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Words list - desktop only, mobile uses drawer */}
            <div className={styles.wordsList}>
              <h3 className={styles.wordsTitle}>Palabras a encontrar:</h3>
              <div className={styles.wordsGrid}>
                {WORDS.map((word) => (
                  <span
                    key={word}
                    className={`${styles.word} ${
                      foundWords.includes(word) ? styles.wordFound : ""
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile words modal - elegant solution */}
          {showWordsDrawer && (
            <div
              className={styles.wordsModal}
              onClick={() => setShowWordsDrawer(false)}
            >
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h3 className={styles.modalTitle}>🔍 Palabras a encontrar</h3>
                  <button
                    className={styles.modalCloseButton}
                    onClick={() => setShowWordsDrawer(false)}
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>
                </div>
                <div className={styles.modalWordsGrid}>
                  {WORDS.map((word) => (
                    <div
                      key={word}
                      className={`${styles.modalWord} ${
                        foundWords.includes(word) ? styles.modalWordFound : ""
                      }`}
                    >
                      {foundWords.includes(word) && (
                        <span className={styles.checkmark}>✓</span>
                      )}
                      <span>{word}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.modalFooter}>
                  <div className={styles.progressInfo}>
                    {foundWords.length} de {WORDS.length} encontradas
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating buttons for mobile */}
          <div className={styles.mobileButtons}>
            <button
              className={styles.showInfoButton}
              onClick={() => setShowInfoModal(true)}
              aria-label="Mostrar información"
            >
              ℹ️ Info
            </button>
            <button
              className={styles.showWordsButton}
              onClick={() => setShowWordsDrawer(true)}
              aria-label="Mostrar palabras"
            >
              📝 Palabras
            </button>
          </div>

          {/* Info modal for mobile */}
          {showInfoModal && (
            <div
              className={styles.infoModal}
              onClick={() => setShowInfoModal(false)}
            >
              <div
                className={styles.infoModalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.infoModalHeader}>
                  <h3 className={styles.infoModalTitle}>
                    🔍 Información del Juego
                  </h3>
                  <button
                    className={styles.infoModalCloseButton}
                    onClick={() => setShowInfoModal(false)}
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>
                </div>
                <div className={styles.infoModalBody}>
                  <div className={styles.infoStats}>
                    <div className={styles.infoStatItem}>
                      <div className={styles.infoStatLabel}>Progreso</div>
                      <div className={styles.infoStatValue}>
                        {foundWords.length} / {WORDS.length}
                      </div>
                    </div>
                    <div className={styles.infoStatItem}>
                      <div className={styles.infoStatLabel}>Tiempo</div>
                      <div className={styles.infoStatValue}>
                        {formatTime(currentTime)}
                      </div>
                    </div>
                    <div className={styles.infoStatItem}>
                      <div className={styles.infoStatLabel}>Mejor Tiempo</div>
                      <div className={styles.infoStatValue}>
                        {isLoadingBestTime
                          ? "Cargando..."
                          : bestTime
                          ? formatTime(bestTime)
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className={styles.infoInstructions}>
                    <h4 className={styles.infoSubtitle}>Instrucciones</h4>
                    <p className={styles.infoText}>
                      Encuentra las palabras relacionadas con nuestra boda.
                      Mantén presionado y arrastra sobre las letras para
                      seleccionar una palabra. Puedes seleccionar horizontal,
                      vertical o diagonal.
                    </p>
                  </div>
                  <div className={styles.infoPrize}>
                    <h4 className={styles.infoSubtitle}>🏆 Premio</h4>
                    <p className={styles.infoText}>
                      El mejor tiempo ganará un premio sorpresa. Puedes intentar
                      las veces que quieras - ¡practica y mejora tu tiempo!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {allWordsFound && (
            <>
              <div
                className={styles.modalOverlay}
                onClick={submitted ? handleResetGame : undefined}
              >
                <div
                  className={styles.modal}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.victoryIcon}>🎉</div>
                  <h3 className={styles.victoryTitle}>¡Felicidades!</h3>
                  <p className={styles.victoryText}>
                    Has encontrado todas las palabras en{" "}
                    <strong>{formatTime(currentTime)}</strong>!
                  </p>
                  {!isLoadingBestTime &&
                    bestTime !== null &&
                    currentTime === bestTime && (
                      <div className={styles.newRecord}>
                        🏆 ¡Nuevo récord! ¡Eres el más rápido!
                      </div>
                    )}
                  {!isLoadingBestTime &&
                    bestTime !== null &&
                    currentTime !== bestTime && (
                      <p className={styles.timeComparison}>
                        El mejor tiempo es {formatTime(bestTime)}. ¡Sigue
                        intentando!
                      </p>
                    )}

                  {!submitted ? (
                    <form
                      className={styles.scoreForm}
                      onSubmit={handleSubmitScore}
                    >
                      <p className={styles.formInstructions}>
                        Ingresa tu nombre para guardar tu tiempo:
                      </p>
                      <div className={styles.formGroup}>
                        <input
                          type="text"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          className={styles.nameInput}
                          placeholder="Tu nombre"
                          maxLength={50}
                          required
                        />
                        <button
                          type="submit"
                          className={styles.submitScoreButton}
                        >
                          Enviar Tiempo 💚
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className={styles.submittedMessage}>
                      ✅ ¡Gracias {playerName}! Tu tiempo ha sido registrado.
                    </div>
                  )}

                  <button
                    className={styles.resetButton}
                    onClick={handleResetGame}
                  >
                    Jugar de nuevo
                  </button>
                </div>
              </div>
            </>
          )}

          <div className={styles.gameActions}>
            <button className={styles.resetButton} onClick={handleResetGame}>
              Reiniciar
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default Games;
