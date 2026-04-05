const WIDTH = 64;
const HEIGHT = 48;
const SCALE = 6;
const ROM_STORAGE_KEY = "ti80-rom";

const KEY_LAYOUT = [
  { label: "Y=", secondary: "STATPLOT", row: 3, col: 6, kind: "function", gridRow: 1, gridColumn: "1 / span 3" },
  { label: "WINDOW", secondary: "TblSet", row: 4, col: 6, kind: "function", gridRow: 1, gridColumn: "4 / span 3" },
  { label: "ZOOM", row: 5, col: 6, kind: "function", gridRow: 1, gridColumn: "7 / span 3" },
  { label: "TRACE", row: 6, col: 6, kind: "function", gridRow: 1, gridColumn: "10 / span 3" },
  { label: "GRAPH", secondary: "TABLE", row: 7, col: 6, kind: "function", gridRow: 1, gridColumn: "13 / span 3" },

  { label: "2nd", row: 2, col: 6, kind: "accent", gridRow: 2, gridColumn: "1 / span 3" },
  { label: "MODE", secondary: "QUIT", row: 1, col: 6, kind: "small", gridRow: 2, gridColumn: "4 / span 3" },
  { label: "DEL", secondary: "INS", row: 0, col: 6, kind: "small", gridRow: 2, gridColumn: "7 / span 3" },
  { label: "▲", ariaLabel: "Up", row: 4, col: 0, kind: "nav", gridRow: 2, gridColumn: "12 / span 2" },

  { label: "ALPHA", secondary: "A-LOCK", row: 0, col: 5, kind: "small", gridRow: 3, gridColumn: "1 / span 3" },
  { label: "X,T", row: 0, col: 4, kind: "small", gridRow: 3, gridColumn: "4 / span 3" },
  { label: "STAT", secondary: "LIST", row: 0, col: 3, kind: "small", gridRow: 3, gridColumn: "7 / span 3" },
  { label: "◀", ariaLabel: "Left", row: 6, col: 0, kind: "nav", gridRow: 3, gridColumn: "10 / span 2" },
  { label: "▼", ariaLabel: "Down", row: 7, col: 0, kind: "nav", gridRow: 3, gridColumn: "12 / span 2" },
  { label: "▶", ariaLabel: "Right", row: 5, col: 0, kind: "nav", gridRow: 3, gridColumn: "14 / span 2" },

  { label: "MATH", secondary: "TEST", alpha: "A", row: 1, col: 5, kind: "small", gridRow: 4, gridColumn: "1 / span 3" },
  { label: "FRAC", secondary: "ANGLE", alpha: "B", row: 1, col: 4, kind: "small", gridRow: 4, gridColumn: "4 / span 3" },
  { label: "PRGM", secondary: "DRAW", alpha: "C", row: 1, col: 3, kind: "small", gridRow: 4, gridColumn: "7 / span 3" },
  { label: "VARS", secondary: "Y-VARS", row: 1, col: 2, kind: "small", gridRow: 4, gridColumn: "10 / span 3" },
  { label: "CLEAR", row: 1, col: 1, kind: "small", gridRow: 4, gridColumn: "13 / span 3" },

  { label: "x⁻¹", secondary: "ABS", alpha: "D", row: 2, col: 5, gridRow: 5, gridColumn: "1 / span 3" },
  { label: "SIN", secondary: "SIN⁻¹", alpha: "E", row: 2, col: 4, gridRow: 5, gridColumn: "4 / span 3" },
  { label: "COS", secondary: "COS⁻¹", alpha: "F", row: 2, col: 3, gridRow: 5, gridColumn: "7 / span 3" },
  { label: "TAN", secondary: "TAN⁻¹", alpha: "G", row: 2, col: 2, gridRow: 5, gridColumn: "10 / span 3" },
  { label: "^", secondary: "π", alpha: "H", row: 2, col: 1, gridRow: 5, gridColumn: "13 / span 3" },

  { label: "x²", secondary: "√", alpha: "I", row: 3, col: 5, gridRow: 6, gridColumn: "1 / span 3" },
  { label: ",", secondary: "EE", alpha: "J", row: 3, col: 4, gridRow: 6, gridColumn: "4 / span 3" },
  { label: "(", secondary: "{", alpha: "K", row: 3, col: 3, gridRow: 6, gridColumn: "7 / span 3" },
  { label: ")", secondary: "}", alpha: "L", row: 3, col: 2, gridRow: 6, gridColumn: "10 / span 3" },
  { label: "÷", secondary: "b/c", alpha: "M", kind: "nav", row: 3, col: 1, gridRow: 6, gridColumn: "13 / span 3" },

  { label: "LOG", secondary: "10ˣ", alpha: "N", row: 4, col: 5, gridRow: 7, gridColumn: "1 / span 3" },
  { label: "7", alpha: "O", kind: "light", row: 4, col: 4, gridRow: 7, gridColumn: "4 / span 3" },
  { label: "8", alpha: "P", kind: "light", row: 4, col: 3, gridRow: 7, gridColumn: "7 / span 3" },
  { label: "9", alpha: "Q", kind: "light", row: 4, col: 2, gridRow: 7, gridColumn: "10 / span 3" },
  { label: "×", alpha: "R", row: 4, col: 1, kind: "nav", gridRow: 7, gridColumn: "13 / span 3" },

  { label: "LN", secondary: "eˣ", alpha: "S", row: 5, col: 5, gridRow: 8, gridColumn: "1 / span 3" },
  { label: "4", secondary: "L4", alpha: "T", kind: "light", row: 5, col: 4, gridRow: 8, gridColumn: "4 / span 3" },
  { label: "5", secondary: "L5", alpha: "U", kind: "light", row: 5, col: 3, gridRow: 8, gridColumn: "7 / span 3" },
  { label: "6", secondary: "L6", alpha: "V", kind: "light", row: 5, col: 2, gridRow: 8, gridColumn: "10 / span 3" },
  { label: "-", alpha: "W", row: 5, col: 1, kind: "nav", gridRow: 8, gridColumn: "13 / span 3" },

  { label: "STO▶", alpha: "X", row: 6, col: 5, gridRow: 9, gridColumn: "1 / span 3" },
  { label: "1", secondary: "L1", alpha: "Y", kind: "light", row: 6, col: 4, gridRow: 9, gridColumn: "4 / span 3" },
  { label: "2", secondary: "L2", alpha: "Z", kind: "light", row: 6, col: 3, gridRow: 9, gridColumn: "7 / span 3" },
  { label: "3", secondary: "L3", alpha: "θ", kind: "light", row: 6, col: 2, gridRow: 9, gridColumn: "10 / span 3" },
  { label: "+", secondary: "UNIT", alpha: "\"", row: 6, col: 1, kind: "nav", gridRow: 9, gridColumn: "13 / span 3" },

  { label: "ON", secondary: "OFF", alpha: "␣", on: true, kind: "power", gridRow: 10, gridColumn: "1 / span 3" },
  { label: "0", secondary: "MEM", row: 7, col: 4, kind: "light", gridRow: 10, gridColumn: "4 / span 3" },
  { label: ".", secondary: ":", row: 7, col: 3, kind: "light", gridRow: 10, gridColumn: "7 / span 3" },
  { label: "(-)", secondary: "ANS", alpha: "?", row: 7, col: 2, kind: "light", gridRow: 10, gridColumn: "10 / span 3" },
  { label: "ENTER", secondary: "ENTRY", row: 7, col: 1, kind: "nav", gridRow: 10, gridColumn: "13 / span 3" }
];

const HOST_KEY_MAP = {
  ArrowUp: { row: 4, col: 0 },
  ArrowRight: { row: 5, col: 0 },
  ArrowLeft: { row: 6, col: 0 },
  ArrowDown: { row: 7, col: 0 },
  Enter: { row: 7, col: 1 },
  Backspace: { row: 1, col: 1 },
  Delete: { row: 0, col: 6 },
  Tab: { row: 6, col: 5 },
  Shift: { row: 0, col: 5 },
  Control: { row: 2, col: 6 },
  Escape: { row: 1, col: 6 },
  "^": { row: 2, col: 1 },
  "/": { row: 3, col: 1 },
  "*": { row: 4, col: 1 },
  "-": { row: 5, col: 1 },
  "+": { row: 6, col: 1 },
  "=": { row: 6, col: 2 },
  ".": { row: 7, col: 3 },
  ",": { row: 3, col: 4 },
  "(": { row: 3, col: 3 },
  ")": { row: 3, col: 2 },
  "0": { row: 7, col: 4 },
  "1": { row: 6, col: 4 },
  "2": { row: 6, col: 3 },
  "3": { row: 6, col: 2 },
  "4": { row: 5, col: 4 },
  "5": { row: 5, col: 3 },
  "6": { row: 5, col: 2 },
  "7": { row: 4, col: 4 },
  "8": { row: 4, col: 3 },
  "9": { row: 4, col: 2 },
  a: { row: 1, col: 5 },
  b: { row: 1, col: 4 },
  c: { row: 1, col: 3 },
  d: { row: 2, col: 5 },
  e: { row: 2, col: 4 },
  f: { row: 2, col: 3 },
  g: { row: 2, col: 2 },
  h: { row: 2, col: 1 },
  i: { row: 3, col: 5 },
  j: { row: 3, col: 4 },
  k: { row: 3, col: 3 },
  l: { row: 3, col: 2 },
  m: { row: 3, col: 1 },
  n: { row: 4, col: 5 },
  o: { row: 4, col: 4 },
  p: { row: 4, col: 3 },
  q: { row: 4, col: 2 },
  r: { row: 4, col: 1 },
  s: { row: 5, col: 5 },
  t: { row: 5, col: 4 },
  u: { row: 5, col: 3 },
  v: { row: 5, col: 2 },
  w: { row: 5, col: 1 },
  x: { row: 6, col: 5 },
  y: { row: 6, col: 4 },
  z: { row: 6, col: 3 }
};

const screen = document.getElementById("screen");
const ctx = screen.getContext("2d", { alpha: false });
const romInput = document.getElementById("rom-input");
const stateInput = document.getElementById("state-input");
const runToggle = document.getElementById("run-toggle");
const stepButton = document.getElementById("step-button");
const resetButton = document.getElementById("reset-button");
const hardResetButton = document.getElementById("hard-reset-button");
const powerCycleButton = document.getElementById("power-cycle-button");
const saveStateButton = document.getElementById("save-state");
const keypad = document.getElementById("keypad");
const statusPill = document.getElementById("status-pill");
const runtimeStatus = document.getElementById("runtime-status");
const pcStatus = document.getElementById("pc-status");
const romStatus = document.getElementById("rom-status");
const stateStatus = document.getElementById("state-status");
const breakOnDebugToggle = document.getElementById("break-on-debug");
const stepOverButton = document.getElementById("step-over-button");
const toggleBreakpointButton = document.getElementById("toggle-breakpoint-button");
const debugStatusText = document.getElementById("debug-status");
const opcodePreview = document.getElementById("opcode-preview");
const regAText = document.getElementById("reg-a");
const regIText = document.getElementById("reg-i");
const regSPText = document.getElementById("reg-sp");
const breakpointStatus = document.getElementById("breakpoint-status");
const stackView = document.getElementById("stack-view");
const registerView = document.getElementById("register-view");

screen.width = WIDTH * SCALE;
screen.height = HEIGHT * SCALE;
ctx.imageSmoothingEnabled = false;

const imageData = ctx.createImageData(WIDTH, HEIGHT);
const imagePixels = imageData.data;
const offscreen = document.createElement("canvas");
offscreen.width = WIDTH;
offscreen.height = HEIGHT;
const offscreenCtx = offscreen.getContext("2d", { alpha: false });
const activeButtons = new Map();
const activeKeys = new Map();

const state = {
  ready: false,
  romLoaded: false,
  stateLoaded: false,
  running: false,
  framebufferPtr: 0,
  stateSize: 0,
  registersPtr: 0,
  stackPtr: 0,
  lastBlankLogFrame: -120,
  frameCounter: 0
};

let ModuleRef = null;
let animationFrame = 0;
let onPulseTimer = 0;

function hex(value, width = 4) {
  return value.toString(16).toUpperCase().padStart(width, "0");
}

function setStatus(text) {
  statusPill.textContent = text;
}

function pulseOnKey(durationMs = 80, delayMs = 0) {
  if (!state.ready || !state.romLoaded) return;

  if (onPulseTimer) window.clearTimeout(onPulseTimer);
  onPulseTimer = window.setTimeout(() => {
    ModuleRef._emulator_set_on_key(1);
    setStatus("Automatic ON press");
    logSnapshot("Automatic ON press");
    onPulseTimer = window.setTimeout(() => {
      ModuleRef._emulator_set_on_key(0);
      onPulseTimer = 0;
      setStatus(state.running ? "Emulation running" : "Emulation paused");
      logSnapshot("Automatic ON release");
    }, durationMs);
  }, delayMs);
}

function emulatorString(ptr) {
  return ptr ? ModuleRef.UTF8ToString(ptr) : "";
}

function sampleFramebufferOnPixels() {
  const framebuffer = ModuleRef.HEAPU8.subarray(state.framebufferPtr, state.framebufferPtr + WIDTH * HEIGHT);
  let pixelsOn = 0;
  for (let i = 0; i < framebuffer.length; i += 1) pixelsOn += framebuffer[i];
  return pixelsOn;
}

function coreSnapshot() {
  if (!state.ready) return null;

  return {
    pc: hex(ModuleRef._emulator_program_counter() & 0xffff),
    running: ModuleRef._emulator_is_running() !== 0,
    lcdOn: ModuleRef._emulator_lcd_on() !== 0,
    lcdStb: ModuleRef._emulator_lcd_not_stb() !== 0,
    lcdWord8: ModuleRef._emulator_lcd_word8() !== 0,
    lcdX: ModuleRef._emulator_lcd_x(),
    lcdY: ModuleRef._emulator_lcd_y(),
    lcdZ: ModuleRef._emulator_lcd_z(),
    resetCount: ModuleRef._emulator_reset_count(),
    resetReason: emulatorString(ModuleRef._emulator_reset_reason_ptr()),
    debugStatus: emulatorString(ModuleRef._emulator_debug_status_ptr()),
    errorStop: ModuleRef._emulator_error_stop() !== 0,
    pixelsOn: state.romLoaded ? sampleFramebufferOnPixels() : 0
  };
}

function logSnapshot(reason) {
  if (!state.ready) return;
  console.info("[ti80]", reason, coreSnapshot());
}

function reg4At(index) {
  const byte = ModuleRef.HEAPU8[state.registersPtr + (index >> 1)];
  return ((byte >> ((index & 1) << 2)) & 0x0f);
}

function reg8At(index) {
  if ((index & 0x0f0) === 0x0f0) return ModuleRef.HEAPU8[state.registersPtr + 0x78];
  if ((index & 0x1e1) === 0x101) return reg4At(index);
  const low = reg4At(index);
  const highIndex = (index & 0x1f0) | ((index + 1) & 0x0f);
  return low | (reg4At(highIndex) << 4);
}

function updateDebugger() {
  if (!state.ready) return;

  if (!state.romLoaded) {
    debugStatusText.textContent = "Waiting for ROM";
    opcodePreview.textContent = "-- -- -- -- -- -- -- --";
    regAText.textContent = "00";
    regIText.textContent = "000";
    regSPText.textContent = "0";
    breakpointStatus.textContent = "Off";
    stackView.textContent = "";
    registerView.textContent = "";
    breakOnDebugToggle.checked = false;
    return;
  }

  const pc = ModuleRef._emulator_program_counter() & 0xffff;
  const statusPtr = ModuleRef._emulator_debug_status_ptr();
  const statusText = statusPtr ? ModuleRef.UTF8ToString(statusPtr) : "";
  const opcodeBytes = [];
  const stackValues = [];
  const registerRows = [];
  const stackHeap = new Uint16Array(ModuleRef.HEAPU8.buffer, state.stackPtr, 8);

  for (let i = 0; i < 8; i += 1) opcodeBytes.push(hex(ModuleRef._emulator_debug_byte((pc + i) & 0xffff), 2));
  for (let i = 0; i < 8; i += 1) stackValues.push(`${i}: ${hex(stackHeap[i], 4)}`);
  for (let row = 0; row < 31; row += 1) {
    if (row === 15) continue;
    let line = `${hex(row, 2)}0: `;
    for (let column = 0; column < 16; column += 1) line += hex(reg4At(row * 16 + column), 1);
    registerRows.push(line);
  }

  regAText.textContent = hex(reg8At(0x0ff), 2);
  regIText.textContent = `${hex(reg4At(0x102), 1)}${hex(reg8At(0x100), 2)}`;
  regSPText.textContent = hex(reg4At(0x118), 1);
  breakpointStatus.textContent = ModuleRef._emulator_breakpoint_at_pc() ? "On" : "Off";
  debugStatusText.textContent = statusText || (ModuleRef._emulator_error_stop() ? "Execution halted on error" : "No debug message");
  opcodePreview.textContent = opcodeBytes.join(" ");
  stackView.textContent = stackValues.join("\n");
  registerView.textContent = registerRows.join("\n");
  breakOnDebugToggle.checked = ModuleRef._emulator_break_on_debug() !== 0;
}

function syncControls() {
  const canInteract = state.ready && state.romLoaded;
  runtimeStatus.textContent = state.running ? "Running" : "Paused";
  romStatus.textContent = state.romLoaded ? "Loaded" : "Missing";
  stateStatus.textContent = state.stateLoaded ? "Loaded" : "Unsaved";
  runToggle.textContent = state.running ? "Pause" : "Run";
  runToggle.disabled = !canInteract;
  stepButton.disabled = !canInteract;
  resetButton.disabled = !canInteract;
  hardResetButton.disabled = !canInteract;
  powerCycleButton.disabled = !canInteract;
  saveStateButton.disabled = !canInteract;
  stepOverButton.disabled = !canInteract;
  toggleBreakpointButton.disabled = !canInteract;
}

function updateProgramCounter() {
  if (!state.ready) return;
  pcStatus.textContent = hex(ModuleRef._emulator_program_counter());
}

function drawScreen() {
  if (!state.ready || !state.romLoaded) {
    ctx.fillStyle = "#d8e0b7";
    ctx.fillRect(0, 0, screen.width, screen.height);
    return;
  }

  ModuleRef._emulator_render_lcd();
  const framebuffer = ModuleRef.HEAPU8.subarray(state.framebufferPtr, state.framebufferPtr + WIDTH * HEIGHT);

  for (let i = 0; i < framebuffer.length; i += 1) {
    const on = framebuffer[i] === 1;
    const pixelIndex = i * 4;
    imagePixels[pixelIndex + 0] = on ? 35 : 216;
    imagePixels[pixelIndex + 1] = on ? 49 : 224;
    imagePixels[pixelIndex + 2] = on ? 31 : 183;
    imagePixels[pixelIndex + 3] = 255;
  }

  offscreenCtx.putImageData(imageData, 0, 0);
  ctx.clearRect(0, 0, screen.width, screen.height);
  ctx.drawImage(offscreen, 0, 0, screen.width, screen.height);
}

function animationLoop() {
  if (state.running && state.ready && state.romLoaded) {
    ModuleRef._emulator_run_frame();
    state.running = ModuleRef._emulator_is_running() !== 0;
    state.frameCounter += 1;
    updateProgramCounter();
    syncControls();
    if (!state.running) logSnapshot("Emulation stopped");
  }

  drawScreen();
  updateDebugger();
  if (state.ready && state.romLoaded && state.running) {
    const snapshot = coreSnapshot();
    if (snapshot.pixelsOn === 0 && state.frameCounter - state.lastBlankLogFrame >= 120) {
      state.lastBlankLogFrame = state.frameCounter;
      console.warn("[ti80] LCD still blank while running", snapshot);
    }
  }
  animationFrame = window.requestAnimationFrame(animationLoop);
}

function setRunning(nextRunning) {
  if (!state.ready || !state.romLoaded) return;

  state.running = nextRunning;
  if (nextRunning) {
    ModuleRef._emulator_start();
    setStatus("Emulation running");
    logSnapshot("Run requested");
  } else {
    ModuleRef._emulator_pause();
    setStatus("Emulation paused");
    logSnapshot("Pause requested");
  }
  syncControls();
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function withHeapBuffer(data, fn) {
  const ptr = ModuleRef._malloc(data.length);
  try {
    ModuleRef.HEAPU8.set(data, ptr);
    return fn(ptr);
  } finally {
    ModuleRef._free(ptr);
  }
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return window.btoa(binary);
}

function base64ToBytes(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

  return bytes;
}

function saveRomToStorage(bytes, name) {
  try {
    window.localStorage.setItem(ROM_STORAGE_KEY, JSON.stringify({
      name,
      bytes: bytesToBase64(bytes)
    }));
    return true;
  } catch (error) {
    console.warn("[ti80] Failed to save ROM to localStorage", error);
    return false;
  }
}

function clearSavedRom() {
  try {
    window.localStorage.removeItem(ROM_STORAGE_KEY);
  } catch (error) {
    console.warn("[ti80] Failed to clear saved ROM from localStorage", error);
  }
}

function readSavedRom() {
  try {
    const raw = window.localStorage.getItem(ROM_STORAGE_KEY);
    if (!raw) return null;

    const saved = JSON.parse(raw);
    if (!saved || typeof saved.bytes !== "string") {
      clearSavedRom();
      return null;
    }

    return {
      name: typeof saved.name === "string" && saved.name ? saved.name : "Saved ROM",
      bytes: base64ToBytes(saved.bytes)
    };
  } catch (error) {
    console.warn("[ti80] Failed to read saved ROM from localStorage", error);
    clearSavedRom();
    return null;
  }
}

function loadRomBytes(bytes, label, statusText) {
  const loaded = withHeapBuffer(bytes, (ptr) => ModuleRef._emulator_load_rom(ptr, bytes.length));

  if (!loaded) {
    setStatus("ROM load failed");
    return false;
  }

  state.romLoaded = true;
  state.stateLoaded = false;
  state.running = true;
  state.frameCounter = 0;
  state.lastBlankLogFrame = -120;
  ModuleRef._emulator_start();
  pulseOnKey(80, 1000);
  syncControls();
  updateProgramCounter();
  updateDebugger();
  drawScreen();
  setStatus(statusText ?? `ROM loaded: ${label}. Emulation running; ON pulse queued.`);
  logSnapshot(`ROM loaded: ${label}`);
  return true;
}

async function handleRomSelection(event) {
  const [file] = event.target.files ?? [];
  if (!file || !state.ready) return;

  const bytes = await readFile(file);
  if (!loadRomBytes(bytes, file.name)) return;

  const saved = saveRomToStorage(bytes, file.name);
  setStatus(saved
    ? `ROM loaded: ${file.name}. Saved locally; emulation running.`
    : `ROM loaded: ${file.name}. Emulation running; local save failed.`);
}

function restoreSavedRom() {
  if (!state.ready || state.romLoaded) return;

  const savedRom = readSavedRom();
  if (!savedRom) return;

  const loaded = loadRomBytes(
    savedRom.bytes,
    savedRom.name,
    `Saved ROM restored: ${savedRom.name}. Emulation running.`
  );

  if (!loaded) {
    clearSavedRom();
    setStatus("Saved ROM restore failed");
  }
}

async function handleStateSelection(event) {
  const [file] = event.target.files ?? [];
  if (!file || !state.ready || !state.romLoaded) return;

  const bytes = await readFile(file);
  const loaded = withHeapBuffer(bytes, (ptr) => ModuleRef._emulator_load_state(ptr, bytes.length));

  if (!loaded) {
    setStatus("State load failed");
    return;
  }

  state.stateLoaded = true;
  state.running = false;
  state.frameCounter = 0;
  state.lastBlankLogFrame = -120;
  syncControls();
  updateProgramCounter();
  updateDebugger();
  drawScreen();
  setStatus(`State loaded: ${file.name}`);
}

function downloadState() {
  if (!state.ready || !state.romLoaded) return;

  const size = state.stateSize;
  const ptr = ModuleRef._malloc(size);
  const written = ModuleRef._emulator_save_state(ptr, size);
  if (!written) {
    ModuleRef._free(ptr);
    setStatus("State export failed");
    return;
  }

  const bytes = ModuleRef.HEAPU8.slice(ptr, ptr + written);
  ModuleRef._free(ptr);

  const blob = new Blob([bytes], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ti80.state";
  link.click();
  URL.revokeObjectURL(url);

  state.stateLoaded = true;
  syncControls();
  setStatus("State downloaded");
}

function setKeyState(binding, pressed) {
  if (!state.ready || !state.romLoaded) return;

  if (binding.on) {
    ModuleRef._emulator_set_on_key(pressed ? 1 : 0);
    if (pressed && !state.running) {
      ModuleRef._emulator_start();
      state.running = true;
      syncControls();
    }
    logSnapshot(pressed ? "ON key pressed" : "ON key released");
  } else {
    ModuleRef._emulator_set_key(binding.row, binding.col, pressed ? 1 : 0);
  }
}

function activateButton(button, binding) {
  const key = button.dataset.keyId;
  if (activeButtons.get(key)) return;
  activeButtons.set(key, true);
  button.classList.add("active");
  setKeyState(binding, true);
}

function releaseButton(button, binding) {
  const key = button.dataset.keyId;
  if (!activeButtons.get(key)) return;
  activeButtons.delete(key);
  button.classList.remove("active");
  setKeyState(binding, false);
}

function createKeypad() {
  KEY_LAYOUT.forEach((binding, index) => {
    const slot = document.createElement("div");
    slot.className = "key-slot";

    if (binding.gridRow) slot.style.gridRow = String(binding.gridRow);
    if (binding.gridColumn) slot.style.gridColumn = binding.gridColumn;

    if (binding.secondary) {
      const secondary = document.createElement("span");
      secondary.className = "key-secondary";
      secondary.textContent = binding.secondary;
      slot.appendChild(secondary);
    }

    if (binding.alpha) {
      const alpha = document.createElement("span");
      alpha.className = "key-alpha";
      alpha.textContent = binding.alpha;
      slot.appendChild(alpha);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "key";
    button.dataset.keyId = String(index);
    button.setAttribute("aria-label", binding.ariaLabel ?? binding.label);

    if (binding.kind) button.classList.add(binding.kind);

    const label = document.createElement("span");
    label.className = "key-label";
    label.textContent = binding.label;
    button.appendChild(label);

    const press = (event) => {
      event.preventDefault();
      activateButton(button, binding);
    };
    const release = (event) => {
      event.preventDefault();
      releaseButton(button, binding);
    };

    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", () => releaseButton(button, binding));
    slot.appendChild(button);
    keypad.appendChild(slot);
  });
}

function validateKeyLayout() {
  const seen = new Set();

  KEY_LAYOUT.forEach((binding) => {
    if (binding.on) return;
    if (!Number.isInteger(binding.row) || !Number.isInteger(binding.col)) {
      console.warn("[ti80] Invalid keypad binding", binding);
      return;
    }
    if (binding.row < 0 || binding.row > 7 || binding.col < 0 || binding.col > 6) {
      console.warn("[ti80] Out-of-range keypad binding", binding);
      return;
    }

    const matrixKey = `${binding.row}:${binding.col}`;
    if (seen.has(matrixKey)) console.warn("[ti80] Duplicate keypad binding", matrixKey, binding);
    else seen.add(matrixKey);
  });
}

function normalizeHostKey(event) {
  if (event.key === "Shift") return "Shift";
  if (event.key === "Control") return "Control";
  if (event.key.length === 1) return event.key.toLowerCase();
  return event.key;
}

function handleKeyboard(event, pressed) {
  if (!state.ready || !state.romLoaded) return;
  if (event.target instanceof HTMLInputElement) return;

  const key = normalizeHostKey(event);
  const binding = HOST_KEY_MAP[key];
  if (!binding) return;

  event.preventDefault();

  if (pressed) {
    if (activeKeys.has(key)) return;
    activeKeys.set(key, binding);
  } else if (!activeKeys.has(key)) return;
  else activeKeys.delete(key);

  setKeyState(binding, pressed);
}

function installEventHandlers() {
  romInput.addEventListener("change", (event) => {
    handleRomSelection(event).catch(() => setStatus("ROM load failed"));
  });

  stateInput.addEventListener("change", (event) => {
    handleStateSelection(event).catch(() => setStatus("State load failed"));
  });

  runToggle.addEventListener("click", () => {
    setRunning(!state.running);
  });

  stepButton.addEventListener("click", () => {
    if (!state.ready || !state.romLoaded) return;
    state.running = false;
    ModuleRef._emulator_step_instruction();
    updateProgramCounter();
    updateDebugger();
    drawScreen();
    syncControls();
    setStatus("Single instruction executed");
    logSnapshot("Single-step complete");
  });

  resetButton.addEventListener("click", () => {
    if (!state.ready || !state.romLoaded) return;
    state.running = false;
    state.frameCounter = 0;
    state.lastBlankLogFrame = -120;
    ModuleRef._emulator_reset();
    updateProgramCounter();
    updateDebugger();
    drawScreen();
    syncControls();
    setStatus("Emulator reset");
    logSnapshot("Manual reset");
  });

  hardResetButton.addEventListener("click", () => {
    if (!state.ready || !state.romLoaded) return;
    state.running = false;
    state.frameCounter = 0;
    state.lastBlankLogFrame = -120;
    ModuleRef._emulator_hard_reset();
    updateProgramCounter();
    updateDebugger();
    drawScreen();
    syncControls();
    setStatus("Hard reset applied");
    logSnapshot("Hard reset");
  });

  powerCycleButton.addEventListener("click", () => {
    if (!state.ready || !state.romLoaded) return;
    state.frameCounter = 0;
    state.lastBlankLogFrame = -120;
    ModuleRef._emulator_power_cycle();
    state.running = ModuleRef._emulator_is_running() !== 0;
    updateProgramCounter();
    updateDebugger();
    drawScreen();
    syncControls();
    setStatus("Power cycle applied");
    logSnapshot("Power cycle");
  });

  saveStateButton.addEventListener("click", downloadState);
  breakOnDebugToggle.addEventListener("change", () => {
    if (!state.ready) return;
    ModuleRef._emulator_set_break_on_debug(breakOnDebugToggle.checked ? 1 : 0);
    updateDebugger();
  });
  stepOverButton.addEventListener("click", () => {
    if (!state.ready || !state.romLoaded) return;
    ModuleRef._emulator_step_over();
    state.running = true;
    syncControls();
    updateDebugger();
    setStatus("Step over armed");
    logSnapshot("Step-over armed");
  });
  toggleBreakpointButton.addEventListener("click", () => {
    if (!state.ready || !state.romLoaded) return;
    ModuleRef._emulator_toggle_breakpoint_pc();
    updateDebugger();
    setStatus(`Breakpoint at PC ${ModuleRef._emulator_breakpoint_at_pc() ? "enabled" : "disabled"}`);
    logSnapshot("Breakpoint toggled at PC");
  });

  window.addEventListener("keydown", (event) => handleKeyboard(event, true));
  window.addEventListener("keyup", (event) => handleKeyboard(event, false));
  window.addEventListener("blur", () => {
    activeKeys.forEach((binding) => setKeyState(binding, false));
    activeKeys.clear();
  });
}

function bootModule() {
  ModuleRef = window.Module;
  ModuleRef._emulator_init();
  state.ready = true;
  state.frameCounter = 0;
  state.lastBlankLogFrame = -120;
  state.framebufferPtr = ModuleRef._emulator_framebuffer_ptr();
  state.stateSize = ModuleRef._emulator_state_size();
  state.registersPtr = ModuleRef._emulator_registers_ptr();
  state.stackPtr = ModuleRef._emulator_stack_ptr();
  syncControls();
  updateProgramCounter();
  updateDebugger();
  setStatus(`Ready for ROM (${ModuleRef._emulator_rom_size_required()} bytes expected)`);
  logSnapshot("Module initialized");
  restoreSavedRom();

  if (!animationFrame) animationFrame = window.requestAnimationFrame(animationLoop);
}

validateKeyLayout();
createKeypad();
installEventHandlers();
drawScreen();

window.addEventListener("ti80-module-ready", bootModule, { once: true });
