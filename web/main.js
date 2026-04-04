const WIDTH = 64;
const HEIGHT = 48;
const SCALE = 6;

const KEY_LAYOUT = [
  { label: "Y=", row: 3, col: 6, kind: "function" },
  { label: "Window", row: 4, col: 6, kind: "function" },
  { label: "Zoom", row: 5, col: 6, kind: "function" },
  { label: "Trace", row: 6, col: 6, kind: "function" },
  { label: "Graph", row: 7, col: 6, kind: "function" },

  { label: "2nd", row: 2, col: 6, kind: "accent" },
  { label: "Mode", row: 1, col: 6, kind: "small" },
  { label: "Del", row: 0, col: 6, kind: "small" },
  { label: "Alpha", row: 0, col: 5, kind: "small" },
  { label: "Stat", row: 0, col: 3, kind: "small" },

  { label: "Math", row: 1, col: 5, kind: "small" },
  { label: "Frac", row: 1, col: 4, kind: "small" },
  { label: "Prgm", row: 1, col: 3, kind: "small" },
  { label: "Vars", row: 1, col: 2, kind: "small" },
  { label: "Clear", row: 1, col: 1, kind: "small" },

  { label: "x^-1", row: 2, col: 5 },
  { label: "Sin", row: 2, col: 4 },
  { label: "Cos", row: 2, col: 3 },
  { label: "Tan", row: 2, col: 2 },
  { label: "^", row: 2, col: 1 },

  { label: "x^2", row: 3, col: 5 },
  { label: ",", row: 3, col: 4 },
  { label: "(", row: 3, col: 3 },
  { label: ")", row: 3, col: 2 },
  { label: "/", row: 3, col: 1 },

  { label: "Log", row: 4, col: 5 },
  { label: "7", row: 4, col: 4 },
  { label: "8", row: 4, col: 3 },
  { label: "9", row: 4, col: 2 },
  { label: "Up", row: 4, col: 0 },

  { label: "Ln", row: 5, col: 5 },
  { label: "4", row: 5, col: 4 },
  { label: "5", row: 5, col: 3 },
  { label: "6", row: 5, col: 2 },
  { label: "Right", row: 5, col: 0 },

  { label: "Sto", row: 6, col: 5 },
  { label: "1", row: 6, col: 4 },
  { label: "2", row: 6, col: 3 },
  { label: "3", row: 6, col: 2 },
  { label: "Left", row: 6, col: 0 },

  { label: "Off", row: 7, col: 5 },
  { label: "0", row: 7, col: 4 },
  { label: ".", row: 7, col: 3 },
  { label: "(-)", row: 7, col: 2 },
  { label: "Down", row: 7, col: 0 },

  { label: "*", row: 4, col: 1 },
  { label: "-", row: 5, col: 1 },
  { label: "+", row: 6, col: 1 },
  { label: "Enter", row: 7, col: 1, wide: true },
  { label: "On", on: true, kind: "accent", wide: true }
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

async function handleRomSelection(event) {
  const [file] = event.target.files ?? [];
  if (!file || !state.ready) return;

  const bytes = await readFile(file);
  const loaded = withHeapBuffer(bytes, (ptr) => ModuleRef._emulator_load_rom(ptr, bytes.length));

  if (!loaded) {
    setStatus("ROM load failed");
    return;
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
  setStatus(`ROM loaded: ${file.name}. Emulation running; ON pulse queued.`);
  logSnapshot(`ROM loaded: ${file.name}`);
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
    const button = document.createElement("button");
    button.type = "button";
    button.className = "key";
    button.dataset.keyId = String(index);
    button.textContent = binding.label;

    if (binding.kind) button.classList.add(binding.kind);
    if (binding.wide) button.classList.add("wide");

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
    keypad.appendChild(button);
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

  if (!animationFrame) animationFrame = window.requestAnimationFrame(animationLoop);
}

createKeypad();
installEventHandlers();
drawScreen();

window.addEventListener("ti80-module-ready", bootModule, { once: true });
