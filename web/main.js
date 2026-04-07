const WIDTH = 64;
const HEIGHT = 48;
const SCALE = 6;
const ROM_STORAGE_KEY = "ti80-rom";
const BREAKPOINT_STORAGE_KEY = "ti80-breakpoints";
const DEBUGGER_VISIBLE_STORAGE_KEY = "ti80-debugger-visible";
const EMULATION_FRAME_MS = 1000 / 60;
const REGISTER_ROWS = Array.from({ length: 31 }, (_, row) => row).filter((row) => row !== 15);

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
  { label: "◀\uFE0E", ariaLabel: "Left", row: 6, col: 0, kind: "nav", gridRow: 3, gridColumn: "10 / span 2" },
  { label: "▼", ariaLabel: "Down", row: 7, col: 0, kind: "nav", gridRow: 3, gridColumn: "12 / span 2" },
  { label: "▶\uFE0E", ariaLabel: "Right", row: 5, col: 0, kind: "nav", gridRow: 3, gridColumn: "14 / span 2" },

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
  { label: "—", alpha: "W", row: 5, col: 1, kind: "nav", gridRow: 8, gridColumn: "13 / span 3" },

  { label: "STO▶\uFE0E", alpha: "X", row: 6, col: 5, gridRow: 9, gridColumn: "1 / span 3" },
  { label: "1", secondary: "L1", alpha: "Y", kind: "light", row: 6, col: 4, gridRow: 9, gridColumn: "4 / span 3" },
  { label: "2", secondary: "L2", alpha: "Z", kind: "light", row: 6, col: 3, gridRow: 9, gridColumn: "7 / span 3" },
  { label: "3", secondary: "L3", alpha: "θ", kind: "light", row: 6, col: 2, gridRow: 9, gridColumn: "10 / span 3" },
  { label: "+", secondary: "UNIT␣", alpha: "\"", row: 6, col: 1, kind: "nav", gridRow: 9, gridColumn: "13 / span 3" },

  { label: "ON", secondary: "OFF", on: true, kind: "power", gridRow: 10, gridColumn: "1 / span 3" },
  { label: "0", secondary: "MEM", alpha: "␣", row: 7, col: 4, kind: "light", gridRow: 10, gridColumn: "4 / span 3" },
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
const screenshot = document.getElementById("screenshot");
const screenRecordButton = document.getElementById("screen-record-button");
const debuggerToggleButton = document.getElementById("debugger-toggle-button");
const runToggle = document.getElementById("run-toggle");
const stepButton = document.getElementById("step-button");
const resetButton = document.getElementById("reset-button");
const hardResetButton = document.getElementById("hard-reset-button");
const powerCycleButton = document.getElementById("power-cycle-button");
const saveStateButton = document.getElementById("save-state");
const throttleSlider = document.getElementById("throttle-slider");
const throttleValue = document.getElementById("throttle-value");
const keypad = document.getElementById("keypad");
const statusPill = document.getElementById("status-pill");
const breakOnDebugToggle = document.getElementById("break-on-debug");
const stepOverButton = document.getElementById("step-over-button");
const toggleBreakpointButton = document.getElementById("toggle-breakpoint-button");
const debugStatusText = document.getElementById("debug-status");
const opcodePreview = document.getElementById("opcode-preview");
const pcEditor = document.getElementById("pc-editor");
const applyPcButton = document.getElementById("apply-pc-button");
const regAEditor = document.getElementById("reg-a-editor");
const applyRegAButton = document.getElementById("apply-reg-a-button");
const regIEditor = document.getElementById("reg-i-editor");
const applyRegIButton = document.getElementById("apply-reg-i-button");
const regSPEditor = document.getElementById("reg-sp-editor");
const applyRegSPButton = document.getElementById("apply-reg-sp-button");
const breakpointStatus = document.getElementById("breakpoint-status");
const breakpointCountText = document.getElementById("breakpoint-count");
const breakpointAddressInput = document.getElementById("breakpoint-address");
const setBreakpointButton = document.getElementById("set-breakpoint-button");
const clearBreakpointsButton = document.getElementById("clear-breakpoints-button");
const breakpointList = document.getElementById("breakpoint-list");
const stackView = document.getElementById("stack-view");
const registerView = document.getElementById("register-view");
const disassemblyView = document.getElementById("disassembly-view");
const disassemblyFollowPcToggle = document.getElementById("disassembly-follow-pc");
const disassemblySelectedAddress = document.getElementById("disassembly-selected-address");
const disassemblySetPcButton = document.getElementById("disassembly-set-pc-button");
const disassemblyRunHereButton = document.getElementById("disassembly-run-here-button");
const emulatorLayout = document.querySelector(".emulator-layout");
const infoPanel = document.querySelector(".info-panel");

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
const registerInputs = new Map();
const stackInputs = [];

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
  frameCounter: 0,
  debuggerVisible: false,
  debuggerBuilt: false,
  disassemblyFocusPc: null,
  disassemblyFollowPc: true,
  runToAddress: null,
  runToAddressHadBreakpoint: false
};

let ModuleRef = null;
let animationFrame = 0;
let onPulseTimer = 0;
let powerCycleOnTimer = 0;
let screenRecorder = null;
let screenRecorderChunks = [];
let screenRecorderStream = null;
let screenRecorderMimeType = "";
let throttlePercent = Number(throttleSlider?.value ?? 100);
let emulationBudgetMs = 0;
let lastAnimationTimestamp = 0;
let lastBreakpointListKey = "";
let lastDisassemblyKey = "";
let currentRomId = "";

function hex(value, width = 4) {
  return value.toString(16).toUpperCase().padStart(width, "0");
}

function setStatus(text) {
  statusPill.textContent = text;
}

function resetThrottleClock() {
  emulationBudgetMs = 0;
  lastAnimationTimestamp = 0;
}

function updateThrottleLabel() {
  throttleValue.textContent = `${throttlePercent}%`;
}

function clearPowerCycleOnTimer() {
  if (!powerCycleOnTimer) return;
  window.clearTimeout(powerCycleOnTimer);
  powerCycleOnTimer = 0;
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

function supportsScreenRecording() {
  return (typeof screen.captureStream === "function" || typeof screen.mozCaptureStream === "function")
    && typeof MediaRecorder !== "undefined";
}

function preferredRecordingMimeType() {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return "";

  const candidates = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4;codecs=avc1",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm"
  ];

  for (const mimeType of candidates) {
    if (MediaRecorder.isTypeSupported(mimeType)) return mimeType;
  }

  return "";
}

function recordingFileName() {
  const extension = screenRecorderMimeType.includes("mp4") ? "mp4" : "webm";
  return `screenrecording-${screen.width}x${screen.height}-${Date.now()}.${extension}`;
}

function captureCanvasStream() {
  const capture = screen.captureStream || screen.mozCaptureStream;
  if (typeof capture !== "function") return null;

  try {
    return capture.call(screen);
  } catch (error) {
    console.warn("[ti80] canvas.captureStream() without fps failed", error);
  }

  try {
    return capture.call(screen, 60);
  } catch (error) {
    console.warn("[ti80] canvas.captureStream(60) failed", error);
  }

  return null;
}

function queuePowerCycleOnPulse(previousResetCount, attemptsRemaining = 80) {
  clearPowerCycleOnTimer();

  const pollForReset = () => {
    if (!state.ready || !state.romLoaded) {
      powerCycleOnTimer = 0;
      return;
    }

    const resetCount = ModuleRef._emulator_reset_count();
    const resetReason = emulatorString(ModuleRef._emulator_reset_reason_ptr());
    if (resetCount > previousResetCount && resetReason === "Power cycle") {
      powerCycleOnTimer = 0;
      pulseOnKey(80, 150);
      return;
    }

    if (attemptsRemaining <= 0) {
      powerCycleOnTimer = 0;
      return;
    }

    attemptsRemaining -= 1;
    powerCycleOnTimer = window.setTimeout(pollForReset, 50);
  };

  powerCycleOnTimer = window.setTimeout(pollForReset, 50);
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

function saveBlob(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
    link.remove();
  }, 1000);
}

function finishScreenRecording() {
  if (!screenRecorderChunks.length) {
    screenRecorderChunks = [];
    screenRecorderMimeType = "";
    syncControls();
    setStatus(state.running ? "Emulation running" : "Emulation paused");
    return;
  }

  const mimeType = screenRecorderMimeType || "video/webm";
  const blob = new Blob(screenRecorderChunks, { type: mimeType });
  screenRecorderChunks = [];
  saveBlob(blob, recordingFileName());
  screenRecorderMimeType = "";
  syncControls();
  setStatus("Screen recording saved");
}

function stopScreenRecording() {
  if (!screenRecorder) return;
  if (screenRecorder.state === "inactive") return;

  try {
    if (screenRecorder.state === "recording") screenRecorder.requestData();
  } catch (error) {
    console.warn("[ti80] MediaRecorder.requestData() failed", error);
  }

  try {
    screenRecorder.stop();
    setStatus("Stopping screen recording");
  } catch (error) {
    console.error("[ti80] MediaRecorder.stop() failed", error);
    setStatus("Unable to stop screen recording");
  }
}

function startScreenRecording() {
  if (!supportsScreenRecording()) {
    setStatus("Screen recording is not supported in this browser");
    return;
  }
  if (!state.ready || !state.romLoaded || screenRecorder) return;

  const mimeType = preferredRecordingMimeType();
  const stream = captureCanvasStream();

  if (!stream) {
    setStatus("Unable to capture the calculator screen");
    return;
  }

  screenRecorderChunks = [];
  screenRecorderStream = stream;
  screenRecorderMimeType = mimeType;

  try {
    screenRecorder = mimeType
      ? new MediaRecorder(screenRecorderStream, { mimeType })
      : new MediaRecorder(screenRecorderStream);
  } catch (error) {
    console.warn("[ti80] MediaRecorder with preferred mime type failed", error);
    screenRecorderMimeType = "";
    try {
      screenRecorder = new MediaRecorder(screenRecorderStream);
      screenRecorderMimeType = screenRecorder.mimeType || "";
    } catch (fallbackError) {
      console.error("[ti80] MediaRecorder construction failed", fallbackError);
      screenRecorderStream.getTracks().forEach((track) => track.stop());
      screenRecorderStream = null;
      setStatus("Unable to start screen recording");
      return;
    }
  }

  screenRecorderMimeType = screenRecorder.mimeType || screenRecorderMimeType || "";
  screenRecorder.addEventListener("dataavailable", (event) => {
    if (event.data && event.data.size > 0) screenRecorderChunks.push(event.data);
  });
  screenRecorder.addEventListener("start", () => {
    syncControls();
    setStatus("Recording screen video");
  });
  screenRecorder.addEventListener("stop", () => {
    if (screenRecorderStream) {
      screenRecorderStream.getTracks().forEach((track) => track.stop());
      screenRecorderStream = null;
    }
    const completedRecorder = screenRecorder;
    if (completedRecorder?.mimeType) screenRecorderMimeType = completedRecorder.mimeType;
    screenRecorder = null;
    finishScreenRecording();
  });
  screenRecorder.addEventListener("error", (event) => {
    console.error("[ti80] MediaRecorder error", event.error ?? event);
    setStatus("Screen recording failed");
  });

  try {
    screenRecorder.start(250);
  } catch (error) {
    console.error("[ti80] MediaRecorder.start() failed", error);
    if (screenRecorderStream) {
      screenRecorderStream.getTracks().forEach((track) => track.stop());
      screenRecorderStream = null;
    }
    screenRecorder = null;
    screenRecorderMimeType = "";
    setStatus("Unable to start screen recording");
    return;
  }

  syncControls();
}

function toggleScreenRecording() {
  if (screenRecorder) stopScreenRecording();
  else startScreenRecording();
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

function debugByteAt(address) {
  return ModuleRef._emulator_debug_byte(address & 0xffff);
}

function debugWordAt(pc) {
  const byteAddress = (pc << 1) & 0xffff;
  return ((debugByteAt(byteAddress) << 8) | debugByteAt(byteAddress + 1)) & 0xffff;
}

function currentIValue() {
  return (((reg4At(0x102) & 0x01) << 8) | reg8At(0x100)) & 0x1ff;
}

function currentDPValue() {
  return (reg8At(0x11c) | (reg8At(0x11e) << 8)) & 0xffff;
}

function add4Address(base, offset = 0) {
  return (((base & 0x1f0) | ((base + offset) & 0x0f))) & 0x1ff;
}

function formatRegAddress(address) {
  return `(${hex(address, 3)})`;
}

function formatImmediate(op) {
  return op & 0x0100 ? hex(op & 0x0f, 1) : hex(op & 0x00ff, 2);
}

function branchDescriptor(op, targetWord) {
  const mode = op & 0x0600;
  if (!mode) return null;

  return {
    clause: mode === 0x0200 ? "" : (mode === 0x0400 ? "IF NO CARRY:" : "IF CARRY:"),
    control: (targetWord & 0x8000) ? "CALL" : "JUMP",
    target: hex(targetWord & 0x7fff, 4),
    type: (targetWord & 0x8000) ? "call" : "jump"
  };
}

function classifyInstruction(mnemonic) {
  if (mnemonic === "BREAK" || mnemonic === "RET" || mnemonic === "JUMP" || mnemonic === "CALL" || mnemonic === "NOP") return "control";
  if (mnemonic.startsWith("LOAD") || mnemonic === "READU" || mnemonic === "READD" || mnemonic === "WRITEU" || mnemonic === "WRITED" || mnemonic === "REP") return "load";
  if (mnemonic.startsWith("ADD") || mnemonic.startsWith("SUB") || mnemonic.startsWith("DADD") || mnemonic.startsWith("DSUB")) return "arithmetic";
  if (mnemonic === "IF") return "compare";
  if (mnemonic.startsWith("XOR") || mnemonic.startsWith("OR") || mnemonic.startsWith("NOT")) return "logic";
  if (mnemonic === "TOGGLE" || mnemonic === "CLEAR" || mnemonic === "SET") return "bit";
  if (mnemonic.startsWith("XCHG")) return "exchange";
  if (mnemonic === "SCANKEYS" || mnemonic === "SHR") return "micro";
  return "default";
}

function compareOperator(op) {
  switch (op & 0x0e00) {
    case 0x0400:
      return "=";
    case 0x0600:
      return "≠";
    case 0x0c00:
      return "<";
    case 0x0e00:
      return "≥";
    default:
      return "=";
  }
}

function instructionTokens({ mnemonic = "", operands = "", separator = "", clause = "", control = "", target = "" }) {
  const tokens = [];
  const push = (role, text) => {
    if (!text) return;
    tokens.push({ role, text });
  };

  push("mnemonic", mnemonic);
  if (operands) {
    if (tokens.length) push("space", " ");
    push("operands", operands);
  }
  if (separator) push("separator", `${separator} `);
  if (clause) {
    if (!separator && tokens.length) push("space", " ");
    push("keyword", clause);
  }
  if (control) {
    if (tokens.length && tokens[tokens.length - 1]?.role !== "separator") push("space", " ");
    push("control", control);
  }
  if (target) {
    if (tokens.length) push("space", " ");
    push("target", target);
  }
  return tokens;
}

function branchInstructionTokens(op, targetWord, { prefixMnemonic = "", prefixOperands = "", separator = "" } = {}) {
  const branch = branchDescriptor(op, targetWord);
  return instructionTokens({
    mnemonic: prefixMnemonic,
    operands: prefixOperands,
    separator,
    clause: branch?.clause ?? "",
    control: branch?.control ?? "",
    target: branch?.target ?? ""
  });
}

function bitAddress(address, bit) {
  return `${formatRegAddress(address)}.${bit}`;
}

function tokensForInstructionText(text) {
  const separatorIndex = text.indexOf(" ");
  if (separatorIndex === -1) return instructionTokens({ mnemonic: text });
  return instructionTokens({
    mnemonic: text.slice(0, separatorIndex),
    operands: text.slice(separatorIndex + 1)
  });
}

function tokensForInstructionSequence(parts) {
  return parts.flatMap((part, index) => {
    const tokens = tokensForInstructionText(part);
    if (index === 0) return tokens;
    return [{ role: "separator", text: "; " }, ...tokens];
  });
}

function decodeInstruction(pc) {
  const op = debugWordAt(pc);
  const nextWord = debugWordAt((pc + 1) & 0xffff);
  const i = currentIValue();
  const dp = currentDPValue();
  const size = op & 0x0100 ? ".N" : ".B";
  const yx = ((op & 0x000f) << 4) | ((op >> 4) & 0x000f);
  const jyx = add4Address((((i & 0x0100) ^ 0x0100) | yx) & 0x1ff);
  const wyxBase = (((op >> 1) & 0x0100) | yx) & 0x1ff;
  const wyx = (op & 0x020f) === 0x020f ? i : add4Address(wyxBase);
  const wyxsNoI = add4Address(wyxBase);
  const wyxs = (op & 0x020f) === 0x020f ? i : wyxsNoI;
  const ef = add4Address((0x0100 | ((op >> 7) & 0x0020) | ((op >> 4) & 0x001f)) & 0x1ff);
  const bitIndex = String((op >> 8 & 0x0001) | (op >> 9 & 0x0002));
  let mnemonic = "";
  let asmTokens = [];
  let length = 1;
  let targetAddress = null;
  let targetType = "";

  if (op === 0xb000) {
    mnemonic = "BREAK";
    asmTokens = instructionTokens({ mnemonic });
  } else if (op < 0x0200) {
    const parts = [];

    switch (op & 0x0007) {
      case 0x0004:
        parts.push(`READU${size} ${formatRegAddress(i)},[DP+]`);
        break;
      case 0x0005:
        parts.push(`READD${size} ${formatRegAddress(i)},[DP-]`);
        break;
      case 0x0006:
        parts.push(`WRITEU${size} [DP+],${formatRegAddress(i)}`);
        break;
      case 0x0007:
        parts.push(`WRITED${size} [DP-],${formatRegAddress(i)}`);
        break;
      default:
        break;
    }

    if ((op & 0x0018) === 0x0018) parts.push((op & 0x0004) && dp < 0x4000 ? "SHR A,2" : "SHR A");
    if (op & 0x0020) parts.push("SCANKEYS");
    if (op & 0x0040) parts.push("RET");
    if (op & 0x0080) parts.push("JUMP (104)");
    if (!parts.length) {
      mnemonic = "NOP";
      asmTokens = instructionTokens({ mnemonic });
    } else {
      mnemonic = parts[0].split(" ")[0];
      asmTokens = tokensForInstructionSequence(parts);
    }
  } else if (op < 0x0400) {
    mnemonic = `LOAD${size}`;
    asmTokens = instructionTokens({ mnemonic, operands: `${formatRegAddress(jyx)},${formatRegAddress(i)}` });
  } else if (op < 0x0600) {
    mnemonic = `LOAD${size}`;
    asmTokens = instructionTokens({ mnemonic, operands: `${formatRegAddress(i)},${formatRegAddress(jyx)}` });
  } else if (op < 0x0800) {
    mnemonic = `XCHG${size}`;
    asmTokens = instructionTokens({ mnemonic, operands: `${formatRegAddress(i)},${formatRegAddress(jyx)}` });
  } else if (op < 0x0c00) {
    mnemonic = "LOAD";
    if (op & 0x0200) {
      const branch = branchDescriptor(op, nextWord);
      targetAddress = nextWord & 0x7fff;
      targetType = branch.type;
      length = 2;
      asmTokens = branchInstructionTokens(op, nextWord, {
        prefixMnemonic: mnemonic,
        prefixOperands: `I,${hex(op & 0x01ff, 3)}`,
        separator: ";"
      });
    } else {
      asmTokens = instructionTokens({ mnemonic, operands: `I,${hex(op & 0x01ff, 3)}` });
    }
  } else if (op < 0x0e00) {
    mnemonic = "LOAD";
    asmTokens = instructionTokens({ mnemonic, operands: `${formatRegAddress(i)},${formatImmediate(op)}` });
  } else if (op < 0x1000) {
    if ((op & 0x0ff0) === 0x0f00) {
      mnemonic = "REP";
      asmTokens = instructionTokens({ mnemonic, operands: hex((op & 0x000f) + 1, 1) });
    } else {
      mnemonic = "LOAD";
      asmTokens = instructionTokens({ mnemonic, operands: `${formatRegAddress(ef)},${hex(op & 0x000f, 1)}` });
    }
  } else if (op < 0x1400) {
    mnemonic = `LOAD${size}`;
    asmTokens = instructionTokens({ mnemonic, operands: `A,${formatRegAddress(wyxsNoI)}` });
  } else if (op < 0x1800) {
    mnemonic = `XCHG${size}`;
    asmTokens = instructionTokens({ mnemonic, operands: `A,${formatRegAddress(wyxsNoI)}` });
  } else if (op < 0x1c00) {
    mnemonic = `LOAD${size}`;
    asmTokens = instructionTokens({ mnemonic, operands: `${formatRegAddress(wyxsNoI)},A` });
  } else if (op < 0x1e00) {
    mnemonic = "LOAD";
    asmTokens = instructionTokens({ mnemonic, operands: `A,${formatImmediate(op)}` });
  } else if (op < 0x2000) {
    mnemonic = "LOAD";
    asmTokens = instructionTokens({ mnemonic, operands: `${formatRegAddress(ef)},${hex(op & 0x000f, 1)}` });
  } else if (op < 0x2800) {
    mnemonic = "TOGGLE";
    asmTokens = instructionTokens({ mnemonic, operands: bitAddress(wyx, bitIndex) });
  } else if (op < 0x3000) {
    mnemonic = "CLEAR";
    asmTokens = instructionTokens({ mnemonic, operands: bitAddress(wyx, bitIndex) });
  } else if (op < 0x3800) {
    mnemonic = "SET";
    asmTokens = instructionTokens({ mnemonic, operands: bitAddress(wyx, bitIndex) });
  } else if (op < 0x3c00) {
    mnemonic = `NOT${size}`;
    asmTokens = instructionTokens({ mnemonic, operands: formatRegAddress(wyxs) });
  } else if (op < 0x3e00) {
    mnemonic = `XOR${size}`;
    asmTokens = instructionTokens({ mnemonic, operands: `${formatRegAddress(i)},${formatRegAddress(jyx)}` });
  } else if (op < 0x4000) {
    mnemonic = `OR${size}`;
    asmTokens = instructionTokens({ mnemonic, operands: `${formatRegAddress(i)},${formatRegAddress(jyx)}` });
  } else if (op < 0x6000) {
    mnemonic = "IF";
    const branch = branchDescriptor(op, nextWord);
    asmTokens = instructionTokens({
      mnemonic,
      operands: `${formatRegAddress(ef)}${compareOperator(op)}${hex(op & 0x000f, 1)}${branch ? ":" : ""}`,
      control: branch?.control ?? "",
      target: branch?.target ?? ""
    });
    if (branch) {
      targetAddress = nextWord & 0x7fff;
      targetType = branch.type;
      length = 2;
    }
  } else if (op < 0x7000) {
    mnemonic = "IF";
    const branch = branchDescriptor(op, nextWord);
    asmTokens = instructionTokens({
      mnemonic,
      operands: `${formatRegAddress(i)}${compareOperator(op)}${formatImmediate(op)}${branch ? ":" : ""}`,
      control: branch?.control ?? "",
      target: branch?.target ?? ""
    });
    if (branch) {
      targetAddress = nextWord & 0x7fff;
      targetType = branch.type;
      length = 2;
    }
  } else if (op < 0x8000) {
    mnemonic = "IF";
    const branch = branchDescriptor(op, nextWord);
    asmTokens = instructionTokens({
      mnemonic,
      operands: `A${compareOperator(op)}${formatImmediate(op)}${branch ? ":" : ""}`,
      control: branch?.control ?? "",
      target: branch?.target ?? ""
    });
    if (branch) {
      targetAddress = nextWord & 0x7fff;
      targetType = branch.type;
      length = 2;
    }
  } else if (op < 0xa000) {
    mnemonic = `${op & 0x0800 ? (op & 0x1000 ? "DSUB" : "DADD") : (op & 0x1000 ? "SUB" : "ADD")}${size}`;
    const branch = branchDescriptor(op, nextWord);
    if (branch) {
      targetAddress = nextWord & 0x7fff;
      targetType = branch.type;
      length = 2;
      asmTokens = branchInstructionTokens(op, nextWord, {
        prefixMnemonic: mnemonic,
        prefixOperands: `${formatRegAddress(i)},${formatRegAddress(jyx)}`,
        separator: ";"
      });
    } else {
      asmTokens = instructionTokens({ mnemonic, operands: `${formatRegAddress(i)},${formatRegAddress(jyx)}` });
    }
  } else if (op < 0xb000) {
    mnemonic = "IF";
    const control = (nextWord & 0x8000) ? "CALL" : "JUMP";
    const target = hex(nextWord & 0x7fff, 4);
    const expected = (op >> 11) & 0x0001 ? "SET" : "CLEAR";
    asmTokens = instructionTokens({
      mnemonic,
      operands: `${expected} ${bitAddress(wyx, bitIndex)}:`,
      control,
      target
    });
    targetAddress = nextWord & 0x7fff;
    targetType = (nextWord & 0x8000) ? "call" : "jump";
    length = 2;
  } else if (op < 0xc000) {
    mnemonic = "IF";
    const branch = branchDescriptor(op, nextWord);
    asmTokens = instructionTokens({
      mnemonic,
      operands: `${formatRegAddress(i)}${compareOperator(op)}${formatRegAddress(jyx)}${branch ? ":" : ""}`,
      control: branch?.control ?? "",
      target: branch?.target ?? ""
    });
    if (branch) {
      targetAddress = nextWord & 0x7fff;
      targetType = branch.type;
      length = 2;
    }
  } else if (op < 0xe000) {
    const branch = branchDescriptor(op, nextWord);
    const arithmeticMnemonic = op & 0x0800 ? "DADD" : "ADD";
    if ((op & 0x00ff) === 0x00 && branch) {
      mnemonic = branch.control;
      asmTokens = instructionTokens({ mnemonic, operands: branch.target });
      targetAddress = nextWord & 0x7fff;
      targetType = branch.type;
      length = 2;
    } else {
      mnemonic = arithmeticMnemonic;
      if (branch) {
        targetAddress = nextWord & 0x7fff;
        targetType = branch.type;
        length = 2;
        asmTokens = branchInstructionTokens(op, nextWord, {
          prefixMnemonic: mnemonic,
          prefixOperands: `${formatRegAddress(ef)},${hex(op & 0x000f, 1)}`,
          separator: ";"
        });
      } else {
        asmTokens = instructionTokens({ mnemonic, operands: `${formatRegAddress(ef)},${hex(op & 0x000f, 1)}` });
      }
    }
  } else if (op < 0xf000) {
    mnemonic = op & 0x0800 ? "DADD" : "ADD";
    const branch = branchDescriptor(op, nextWord);
    if (branch) {
      targetAddress = nextWord & 0x7fff;
      targetType = branch.type;
      length = 2;
      asmTokens = branchInstructionTokens(op, nextWord, {
        prefixMnemonic: mnemonic,
        prefixOperands: `${formatRegAddress(i)},${formatImmediate(op)}`,
        separator: ";"
      });
    } else {
      asmTokens = instructionTokens({ mnemonic, operands: `${formatRegAddress(i)},${formatImmediate(op)}` });
    }
  } else {
    mnemonic = op & 0x0800 ? "DADD" : "ADD";
    const branch = branchDescriptor(op, nextWord);
    if (branch) {
      targetAddress = nextWord & 0x7fff;
      targetType = branch.type;
      length = 2;
      asmTokens = branchInstructionTokens(op, nextWord, {
        prefixMnemonic: mnemonic,
        prefixOperands: `A,${formatImmediate(op)}`,
        separator: ";"
      });
    } else {
      asmTokens = instructionTokens({ mnemonic, operands: `A,${formatImmediate(op)}` });
    }
  }

  return {
    pc,
    op,
    nextWord,
    length,
    mnemonic,
    asmTokens,
    words: length === 2 ? `${hex(op, 4)} ${hex(nextWord, 4)}` : hex(op, 4),
    kind: classifyInstruction(mnemonic),
    targetAddress,
    targetType
  };
}

function toggleBreakpointAtAddress(address) {
  if (!state.ready || !state.romLoaded) return;
  const enabled = ModuleRef._emulator_breakpoint_at(address) === 0;
  ModuleRef._emulator_set_breakpoint(address, enabled ? 1 : 0);
  persistCurrentBreakpoints();
  lastBreakpointListKey = "";
  lastDisassemblyKey = "";
  updateDebugger();
  setStatus(`Breakpoint ${enabled ? "enabled" : "disabled"} at ${hex(address, 4)}`);
  logSnapshot(`Breakpoint ${enabled ? "enabled" : "disabled"} at ${hex(address, 4)}`);
}

function decodeLengthAt(pc) {
  return decodeInstruction(pc).length;
}

function collectPredecessorAddresses(anchorPc, count) {
  const addresses = [];
  let cursor = anchorPc & 0xffff;

  for (let steps = 0; steps < count; steps += 1) {
    let predecessor = null;

    for (const delta of [1, 2]) {
      const candidate = (cursor - delta) & 0xffff;
      if (decodeLengthAt(candidate) === delta) {
        predecessor = candidate;
        break;
      }
    }

    if (predecessor == null) break;
    addresses.unshift(predecessor);
    cursor = predecessor;
  }

  return addresses;
}

function collectDisassemblyWindow(currentPc) {
  const anchorPc = (!state.disassemblyFollowPc && state.disassemblyFocusPc != null)
    ? state.disassemblyFocusPc
    : currentPc;
  const addresses = collectPredecessorAddresses(anchorPc, 8);
  addresses.push(anchorPc);

  let cursor = anchorPc;
  while (addresses.length < 22) {
    const next = (cursor + decodeLengthAt(cursor)) & 0xffff;
    if (addresses.includes(next)) break;
    addresses.push(next);
    cursor = next;
  }

  return addresses;
}

function buildCrossReferenceMap(instructions) {
  const map = new Map();

  instructions.forEach((instruction) => {
    if (instruction.targetAddress == null) return;
    const key = instruction.targetAddress & 0xffff;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({
      from: instruction.pc,
      type: instruction.targetType
    });
  });

  return map;
}

function labelForAddress(address, xrefs) {
  return xrefs.some((xref) => xref.type === "call")
    ? `sub_${hex(address, 4)}`
    : `loc_${hex(address, 4)}`;
}

function setDisassemblySelectedAddress(address) {
  state.disassemblyFocusPc = address & 0xffff;
  state.disassemblyFollowPc = false;
  disassemblyFollowPcToggle.checked = false;
  lastDisassemblyKey = "";
}

function setProgramCounterToAddress(address) {
  if (!debuggerEditable()) return;
  ModuleRef._emulator_set_program_counter(address & 0xffff);
  state.disassemblyFocusPc = address & 0xffff;
  lastDisassemblyKey = "";
  updateProgramCounter();
  updateDebugger();
  setStatus(`PC set to ${hex(address, 4)}`);
  logSnapshot(`Program counter set to ${hex(address, 4)}`);
}

function clearRunToAddressState() {
  if (state.runToAddress == null) return;
  if (!state.runToAddressHadBreakpoint && ModuleRef._emulator_breakpoint_at(state.runToAddress)) {
    ModuleRef._emulator_set_breakpoint(state.runToAddress, 0);
  }
  state.runToAddress = null;
  state.runToAddressHadBreakpoint = false;
}

function finalizeRunToAddressStop() {
  if (state.runToAddress == null) return;

  const target = state.runToAddress;
  const reached = (ModuleRef._emulator_program_counter() & 0xffff) === target;
  clearRunToAddressState();
  if (reached) setStatus(`Reached ${hex(target, 4)}`);
  else setStatus(`Run to ${hex(target, 4)} interrupted`);
  lastBreakpointListKey = "";
  lastDisassemblyKey = "";
}

function runToAddress(address) {
  if (!state.ready || !state.romLoaded) return;
  const target = address & 0xffff;
  if ((ModuleRef._emulator_program_counter() & 0xffff) === target && !state.running) {
    setStatus(`Already at ${hex(target, 4)}`);
    return;
  }
  const alreadySet = ModuleRef._emulator_breakpoint_at(target) !== 0;
  state.runToAddress = target;
  state.runToAddressHadBreakpoint = alreadySet;
  if (!alreadySet) ModuleRef._emulator_set_breakpoint(target, 1);
  state.running = true;
  resetThrottleClock();
  ModuleRef._emulator_start();
  lastBreakpointListKey = "";
  lastDisassemblyKey = "";
  syncControls();
  setStatus(`Running to ${hex(target, 4)}`);
  logSnapshot(`Run to ${hex(target, 4)} requested`);
}

function renderDisassembly(pc, breakpoints) {
  const i = currentIValue();
  const addresses = collectDisassemblyWindow(pc);
  const instructions = addresses.map((address) => decodeInstruction(address));
  const xrefMap = buildCrossReferenceMap(instructions);
  const tempRunTarget = state.runToAddress != null && !state.runToAddressHadBreakpoint ? [state.runToAddress] : [];
  const key = `${hex(pc, 4)}:${hex(i, 3)}:${hex(state.disassemblyFocusPc ?? 0xffff, 4)}:${state.disassemblyFollowPc ? 1 : 0}:${breakpoints.join(",")}:${tempRunTarget.join(",")}`;
  if (key === lastDisassemblyKey) return;
  lastDisassemblyKey = key;
  disassemblyView.textContent = "";
  const breakpointSet = new Set([...breakpoints, ...tempRunTarget]);

  instructions.forEach((instruction) => {
    const linePc = instruction.pc;
    const xrefs = xrefMap.get(linePc) ?? [];

    if (xrefs.length) {
      const labelRow = document.createElement("div");
      labelRow.className = "disassembly-label-row";

      const label = document.createElement("span");
      label.className = "disassembly-label";
      label.textContent = `${labelForAddress(linePc, xrefs)}:`;

      const xrefText = document.createElement("span");
      xrefText.className = "disassembly-xrefs";
      xrefText.textContent = `xrefs ${xrefs.map((xref) => `${hex(xref.from, 4)} ${xref.type}`).join(", ")}`;

      labelRow.append(label, xrefText);
      disassemblyView.appendChild(labelRow);
    }

    const row = document.createElement("div");
    row.className = "disassembly-line";
    row.classList.add(`kind-${instruction.kind}`);
    if (linePc === pc) row.classList.add("is-current");
    if (linePc === state.disassemblyFocusPc) row.classList.add("is-selected");
    row.addEventListener("click", () => {
      setDisassemblySelectedAddress(linePc);
      pcEditor.value = hex(linePc, 4);
      breakpointAddressInput.value = hex(linePc, 4);
      lastDisassemblyKey = "";
      updateDebugger();
    });
    row.addEventListener("dblclick", () => {
      setProgramCounterToAddress(linePc);
    });

    const gutter = document.createElement("div");
    gutter.className = "disassembly-gutter";

    const currentMarker = document.createElement("span");
    currentMarker.className = "disassembly-current-marker";
    currentMarker.textContent = linePc === pc ? ">" : "";
    gutter.appendChild(currentMarker);

    const breakpointButton = document.createElement("button");
    breakpointButton.type = "button";
    breakpointButton.className = "disassembly-breakpoint";
    if (breakpointSet.has(linePc)) breakpointButton.classList.add("is-set");
    breakpointButton.setAttribute("aria-label", `${breakpointSet.has(linePc) ? "Clear" : "Set"} breakpoint at ${hex(linePc, 4)}`);
    breakpointButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleBreakpointAtAddress(linePc);
    });
    gutter.appendChild(breakpointButton);

    const address = document.createElement("span");
    address.className = "disassembly-address";
    address.textContent = hex(linePc, 4);

    const words = document.createElement("span");
    words.className = "disassembly-words";
    words.textContent = instruction.words;

    const asm = document.createElement("span");
    asm.className = "disassembly-asm";

    instruction.asmTokens.forEach((token) => {
      const span = document.createElement("span");
      span.className = `disassembly-token disassembly-${token.role}`;
      span.textContent = token.text;
      asm.appendChild(span);
    });

    row.append(gutter, address, words, asm);
    disassemblyView.appendChild(row);
  });
}

function mixChannel(from, to, ratio) {
  return Math.round(from + ((to - from) * ratio));
}

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function shadeColor(level) {
  const ratio = clampByte(level) / 255;

  return [
    mixChannel(35, 239, ratio),
    mixChannel(49, 230, ratio),
    mixChannel(31, 206, ratio)
  ];
}

function lcdPalette() {
  if (!state.ready || !state.romLoaded) {
    const blank = shadeColor(0xaa);
    return { light: blank, dark: blank };
  }

  const contrast = ModuleRef._emulator_lcd_contrast() - (4 * ModuleRef._emulator_lcd_opa2());
  const testMode = ModuleRef._emulator_lcd_test();
  let low = 0x82 - (3 * contrast);
  let high = 0x13f - (contrast < 0x10 ? 0x40 : (contrast << 2));

  // Match the original GTK renderer's LCD test mode handling.
  if (testMode === 4 || testMode === 6) {
    low = 0xff;
    high = 0xff;
  }
  if (testMode === 5 || testMode === 7) {
    low = 0x00;
    high = 0x00;
  }
  if (!ModuleRef._emulator_lcd_not_stb() || !ModuleRef._emulator_lcd_on()) {
    low = 0xaa;
    high = 0xaa;
  }

  return {
    dark: shadeColor(low),
    light: shadeColor(high)
  };
}

function rgbString(color) {
  return `rgb(${color[0]} ${color[1]} ${color[2]})`;
}

function readDebuggerVisibilityPreference() {
  try {
    return window.localStorage.getItem(DEBUGGER_VISIBLE_STORAGE_KEY) === "1";
  } catch (error) {
    console.warn("[ti80] Failed to read debugger visibility from localStorage", error);
    return false;
  }
}

function saveDebuggerVisibilityPreference(visible) {
  try {
    window.localStorage.setItem(DEBUGGER_VISIBLE_STORAGE_KEY, visible ? "1" : "0");
  } catch (error) {
    console.warn("[ti80] Failed to save debugger visibility to localStorage", error);
  }
}

function normalizeHex(value, width) {
  return value.replace(/[^0-9a-f]/gi, "").toUpperCase().slice(0, width);
}

function parseHex(value, width) {
  const normalized = normalizeHex(value, width);
  if (!normalized) return null;
  const parsed = Number.parseInt(normalized, 16);
  if (Number.isNaN(parsed)) return null;
  const max = (1 << (width * 4)) - 1;
  return parsed & max;
}

function debuggerEditable() {
  return state.ready && state.romLoaded && !state.running;
}

function syncInputValue(input, value, disabled) {
  input.disabled = disabled;
  if (document.activeElement !== input) input.value = value;
}

function getBreakpointAddresses() {
  if (!state.ready) return [];
  const count = ModuleRef._emulator_breakpoint_count();
  if (!count) return [];

  const ptr = ModuleRef._malloc(count * 2);
  try {
    const written = ModuleRef._emulator_copy_breakpoints(ptr, count);
    const view = new Uint16Array(ModuleRef.HEAPU8.buffer, ptr, written);
    return Array.from(view);
  } finally {
    ModuleRef._free(ptr);
  }
}

function buildStackEditor() {
  if (state.debuggerBuilt) return;
  stackView.textContent = "";
  for (let index = 0; index < 8; index += 1) {
    const item = document.createElement("label");
    item.className = "debug-editor-item";

    const label = document.createElement("span");
    label.className = "debug-editor-label";
    label.textContent = `#${index}`;
    item.appendChild(label);

    const input = document.createElement("input");
    input.className = "debug-input";
    input.type = "text";
    input.inputMode = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.dataset.stackIndex = String(index);
    input.addEventListener("blur", () => applyStackValue(input));
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      applyStackValue(input);
      input.blur();
    });
    item.appendChild(input);

    stackInputs.push(input);
    stackView.appendChild(item);
  }
}

function buildRegisterEditor() {
  registerView.textContent = "";

  REGISTER_ROWS.forEach((row) => {
    const rowElement = document.createElement("div");
    rowElement.className = "register-row";

    const label = document.createElement("span");
    label.className = "register-row-label";
    label.textContent = `${hex(row, 2)}0`;
    rowElement.appendChild(label);

    const cells = document.createElement("div");
    cells.className = "register-row-cells";

    for (let column = 0; column < 16; column += 1) {
      const index = row * 16 + column;
      const input = document.createElement("input");
      input.className = "register-cell";
      input.type = "text";
      input.inputMode = "text";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.maxLength = 1;
      input.dataset.registerIndex = String(index);
      input.addEventListener("blur", () => applyRegisterNibble(input));
      input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        applyRegisterNibble(input);
        input.blur();
      });
      cells.appendChild(input);
      registerInputs.set(index, input);
    }

    rowElement.appendChild(cells);
    registerView.appendChild(rowElement);
  });
}

function ensureDebuggerBuilt() {
  if (state.debuggerBuilt) return;
  buildStackEditor();
  buildRegisterEditor();
  state.debuggerBuilt = true;
}

function renderStackEditor(disabled) {
  if (!state.debuggerBuilt) return;
  if (!state.ready || !state.romLoaded) {
    stackInputs.forEach((input) => {
      input.disabled = true;
      if (document.activeElement !== input) input.value = "";
    });
    return;
  }

  const stackHeap = new Uint16Array(ModuleRef.HEAPU8.buffer, state.stackPtr, 8);
  stackInputs.forEach((input, index) => {
    syncInputValue(input, hex(stackHeap[index], 4), disabled);
  });
}

function renderRegisterEditor(disabled) {
  if (!state.debuggerBuilt) return;
  if (!state.ready || !state.romLoaded) {
    registerInputs.forEach((input) => {
      input.disabled = true;
      if (document.activeElement !== input) input.value = "";
    });
    return;
  }

  registerInputs.forEach((input, index) => {
    syncInputValue(input, hex(reg4At(index), 1), disabled);
  });
}

function renderBreakpointList(disabled, addresses) {
  if (!state.debuggerVisible) return;
  const mode = !state.ready ? "not-ready" : (!state.romLoaded ? "no-rom" : "rom-loaded");
  const renderKey = `${mode}:${disabled ? 1 : 0}:${addresses.join(",")}`;
  if (renderKey === lastBreakpointListKey) return;
  lastBreakpointListKey = renderKey;
  breakpointList.textContent = "";

  if (!state.ready || !state.romLoaded) {
    const empty = document.createElement("p");
    empty.className = "breakpoint-empty";
    empty.textContent = "Load a ROM to manage breakpoints.";
    breakpointList.appendChild(empty);
    return;
  }

  if (!addresses.length) {
    const empty = document.createElement("p");
    empty.className = "breakpoint-empty";
    empty.textContent = "No active breakpoints.";
    breakpointList.appendChild(empty);
    return;
  }

  addresses.forEach((address) => {
    const item = document.createElement("div");
    item.className = "breakpoint-item";

    const code = document.createElement("code");
    code.textContent = hex(address, 4);
    item.appendChild(code);

    const focusButton = document.createElement("button");
    focusButton.type = "button";
    focusButton.textContent = "Use";
    focusButton.disabled = disabled;
    focusButton.addEventListener("click", () => {
      breakpointAddressInput.value = hex(address, 4);
      pcEditor.value = hex(address, 4);
    });
    item.appendChild(focusButton);

    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.textContent = "Clear";
    clearButton.disabled = disabled;
    clearButton.addEventListener("click", () => {
      ModuleRef._emulator_set_breakpoint(address, 0);
      persistCurrentBreakpoints();
      updateDebugger();
      setStatus(`Breakpoint ${hex(address, 4)} cleared`);
      logSnapshot(`Breakpoint cleared at ${hex(address, 4)}`);
    });
    item.appendChild(clearButton);

    breakpointList.appendChild(item);
  });
}

function updateDebugger() {
  if (!state.debuggerVisible) return;
  ensureDebuggerBuilt();
  if (!state.ready) return;

  if (!state.romLoaded) {
    debugStatusText.textContent = "Waiting for ROM";
    opcodePreview.textContent = "-- -- -- -- -- -- -- --";
    regAEditor.value = "00";
    regIEditor.value = "000";
    regSPEditor.value = "0";
    breakpointStatus.textContent = "Off";
    breakpointCountText.textContent = "0";
    pcEditor.value = "0000";
    breakpointAddressInput.value = "";
    regAEditor.disabled = true;
    applyRegAButton.disabled = true;
    regIEditor.disabled = true;
    applyRegIButton.disabled = true;
    regSPEditor.disabled = true;
    applyRegSPButton.disabled = true;
    applyPcButton.disabled = true;
    setBreakpointButton.disabled = true;
    clearBreakpointsButton.disabled = true;
    renderStackEditor(true);
    renderRegisterEditor(true);
    renderBreakpointList(true, []);
    lastDisassemblyKey = "";
    disassemblyView.textContent = "";
    disassemblySelectedAddress.textContent = "----";
    disassemblySetPcButton.disabled = true;
    disassemblyRunHereButton.disabled = true;
    disassemblyFollowPcToggle.checked = state.disassemblyFollowPc;
    breakOnDebugToggle.checked = false;
    return;
  }

  const pc = ModuleRef._emulator_program_counter() & 0xffff;
  const statusPtr = ModuleRef._emulator_debug_status_ptr();
  const statusText = statusPtr ? ModuleRef.UTF8ToString(statusPtr) : "";
  const opcodeBytes = [];
  const editable = debuggerEditable();
  const breakpoints = getBreakpointAddresses();
  const opcodeByteBase = (pc << 1) & 0xffff;

  for (let i = 0; i < 8; i += 1) opcodeBytes.push(hex(debugByteAt(opcodeByteBase + i), 2));

  syncInputValue(regAEditor, hex(reg8At(0x0ff), 2), !editable);
  syncInputValue(regIEditor, `${hex(reg4At(0x102), 1)}${hex(reg8At(0x100), 2)}`, !editable);
  syncInputValue(regSPEditor, hex(reg4At(0x118), 1), !editable);
  breakpointStatus.textContent = ModuleRef._emulator_breakpoint_at_pc() ? "On" : "Off";
  breakpointCountText.textContent = String(breakpoints.length);
  debugStatusText.textContent = statusText || (ModuleRef._emulator_error_stop() ? "Execution halted on error" : "No debug message");
  opcodePreview.textContent = opcodeBytes.join(" ");
  applyRegAButton.disabled = !editable;
  applyRegIButton.disabled = !editable;
  applyRegSPButton.disabled = !editable;
  syncInputValue(pcEditor, hex(pc, 4), !editable);
  breakpointAddressInput.disabled = !editable;
  applyPcButton.disabled = !editable;
  setBreakpointButton.disabled = !editable;
  clearBreakpointsButton.disabled = !editable || breakpoints.length === 0;
  renderStackEditor(!editable);
  renderRegisterEditor(!editable);
  renderBreakpointList(!editable, breakpoints);
  renderDisassembly(pc, breakpoints);
  disassemblySelectedAddress.textContent = hex(state.disassemblyFocusPc ?? pc, 4);
  disassemblySetPcButton.disabled = !editable || state.disassemblyFocusPc == null;
  disassemblyRunHereButton.disabled = state.disassemblyFocusPc == null;
  disassemblyFollowPcToggle.checked = state.disassemblyFollowPc;
  breakOnDebugToggle.checked = ModuleRef._emulator_break_on_debug() !== 0;
}

function syncControls() {
  const canInteract = state.ready && state.romLoaded;
  screenRecordButton.textContent = screenRecorder ? "Stop Recording" : "Record Video";
  resetButton.disabled = !canInteract;
  hardResetButton.disabled = !canInteract;
  powerCycleButton.disabled = !canInteract;
  saveStateButton.disabled = !canInteract;
  screenRecordButton.disabled = (!canInteract && !screenRecorder) || !supportsScreenRecording();
  debuggerToggleButton.textContent = state.debuggerVisible ? "Hide Debugger" : "Show Debugger";

  if (!state.debuggerVisible) return;

  runToggle.textContent = state.running ? "Pause" : "Run";
  runToggle.classList.toggle("is-running", state.running);
  runToggle.classList.toggle("is-paused", !state.running);
  runToggle.disabled = !canInteract;
  stepButton.disabled = !canInteract;
  stepOverButton.disabled = !canInteract;
  toggleBreakpointButton.disabled = !canInteract;
  disassemblyFollowPcToggle.disabled = !canInteract;
  disassemblySetPcButton.disabled = !debuggerEditable() || state.disassemblyFocusPc == null;
  disassemblyRunHereButton.disabled = !canInteract || state.disassemblyFocusPc == null;
}

function syncDebuggerVisibility() {
  infoPanel.classList.toggle("hidden", !state.debuggerVisible);
  emulatorLayout.classList.toggle("debugger-hidden", !state.debuggerVisible);
}

function setDebuggerVisible(visible) {
  state.debuggerVisible = visible;
  saveDebuggerVisibilityPreference(visible);
  syncDebuggerVisibility();
  syncControls();
  if (visible) updateDebugger();
}

function updateProgramCounter() {
  if (!state.ready) return;
}

function drawScreen() {
  const palette = lcdPalette();

  if (!state.ready || !state.romLoaded) {
    ctx.fillStyle = rgbString(palette.light);
    ctx.fillRect(0, 0, screen.width, screen.height);
    return;
  }

  ModuleRef._emulator_render_lcd();
  const framebuffer = ModuleRef.HEAPU8.subarray(state.framebufferPtr, state.framebufferPtr + WIDTH * HEIGHT);

  for (let i = 0; i < framebuffer.length; i += 1) {
    const on = framebuffer[i] === 1;
    const pixelIndex = i * 4;
    const color = on ? palette.dark : palette.light;
    imagePixels[pixelIndex + 0] = color[0];
    imagePixels[pixelIndex + 1] = color[1];
    imagePixels[pixelIndex + 2] = color[2];
    imagePixels[pixelIndex + 3] = 255;
  }

  offscreenCtx.putImageData(imageData, 0, 0);
  ctx.clearRect(0, 0, screen.width, screen.height);
  ctx.drawImage(offscreen, 0, 0, screen.width, screen.height);
}

function animationLoop(timestamp) {
  if (!lastAnimationTimestamp) lastAnimationTimestamp = timestamp;
  const elapsedMs = Math.min(timestamp - lastAnimationTimestamp, 250);
  lastAnimationTimestamp = timestamp;

  if (state.running && state.ready && state.romLoaded) {
    emulationBudgetMs += elapsedMs * (throttlePercent / 100);

    while (state.running && emulationBudgetMs >= EMULATION_FRAME_MS) {
      ModuleRef._emulator_run_frame();
      state.running = ModuleRef._emulator_is_running() !== 0;
      state.frameCounter += 1;
      emulationBudgetMs -= EMULATION_FRAME_MS;
    }

    updateProgramCounter();
    syncControls();
    if (!state.running) {
      finalizeRunToAddressStop();
      resetThrottleClock();
      logSnapshot("Emulation stopped");
    }
  } else {
    resetThrottleClock();
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
  resetThrottleClock();
  if (nextRunning) {
    ModuleRef._emulator_start();
    setStatus("Emulation running");
    logSnapshot("Run requested");
  } else {
    ModuleRef._emulator_pause();
    clearRunToAddressState();
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

function fingerprintRom(bytes) {
  let hash = 0x811c9dc5;

  for (let i = 0; i < bytes.length; i += 1) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return `${bytes.length.toString(16)}-${hash.toString(16).padStart(8, "0")}`;
}

function saveRomToStorage(bytes, name, id) {
  try {
    window.localStorage.setItem(ROM_STORAGE_KEY, JSON.stringify({
      name,
      id,
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

    const bytes = base64ToBytes(saved.bytes);

    return {
      name: typeof saved.name === "string" && saved.name ? saved.name : "Saved ROM",
      id: typeof saved.id === "string" && saved.id ? saved.id : fingerprintRom(bytes),
      bytes
    };
  } catch (error) {
    console.warn("[ti80] Failed to read saved ROM from localStorage", error);
    clearSavedRom();
    return null;
  }
}

function readSavedBreakpoints() {
  try {
    const raw = window.localStorage.getItem(BREAKPOINT_STORAGE_KEY);
    if (!raw) return null;

    const saved = JSON.parse(raw);
    if (!saved || typeof saved.romId !== "string" || !Array.isArray(saved.addresses)) {
      window.localStorage.removeItem(BREAKPOINT_STORAGE_KEY);
      return null;
    }

    return {
      romId: saved.romId,
      addresses: saved.addresses
        .map((address) => Number.parseInt(String(address), 10))
        .filter((address) => Number.isInteger(address) && address >= 0 && address <= 0xffff)
    };
  } catch (error) {
    console.warn("[ti80] Failed to read saved breakpoints from localStorage", error);
    try {
      window.localStorage.removeItem(BREAKPOINT_STORAGE_KEY);
    } catch (removeError) {
      console.warn("[ti80] Failed to clear saved breakpoints from localStorage", removeError);
    }
    return null;
  }
}

function saveBreakpointsToStorage(romId, addresses) {
  try {
    if (!romId || !addresses.length) {
      window.localStorage.removeItem(BREAKPOINT_STORAGE_KEY);
      return true;
    }

    window.localStorage.setItem(BREAKPOINT_STORAGE_KEY, JSON.stringify({
      romId,
      addresses
    }));
    return true;
  } catch (error) {
    console.warn("[ti80] Failed to save breakpoints to localStorage", error);
    return false;
  }
}

function persistCurrentBreakpoints() {
  if (!state.ready || !state.romLoaded || !currentRomId) return false;
  return saveBreakpointsToStorage(currentRomId, getBreakpointAddresses());
}

function restoreSavedBreakpointsForCurrentRom() {
  if (!state.ready || !state.romLoaded || !currentRomId) return;

  ModuleRef._emulator_clear_breakpoints();
  const saved = readSavedBreakpoints();
  if (!saved || saved.romId !== currentRomId) {
    lastBreakpointListKey = "";
    return;
  }

  saved.addresses.forEach((address) => ModuleRef._emulator_set_breakpoint(address, 1));
  lastBreakpointListKey = "";
}

function loadRomBytes(bytes, label, romId, statusText) {
  const loaded = withHeapBuffer(bytes, (ptr) => ModuleRef._emulator_load_rom(ptr, bytes.length));

  if (!loaded) {
    setStatus("ROM load failed");
    return false;
  }

  currentRomId = romId;
  state.romLoaded = true;
  state.stateLoaded = false;
  state.running = true;
  state.disassemblyFocusPc = null;
  state.disassemblyFollowPc = true;
  clearRunToAddressState();
  state.frameCounter = 0;
  state.lastBlankLogFrame = -120;
  resetThrottleClock();
  restoreSavedBreakpointsForCurrentRom();
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
  const romId = fingerprintRom(bytes);
  if (!loadRomBytes(bytes, file.name, romId)) return;

  const saved = saveRomToStorage(bytes, file.name, romId);
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
    savedRom.id,
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
  state.disassemblyFocusPc = null;
  state.disassemblyFollowPc = true;
  clearRunToAddressState();
  state.frameCounter = 0;
  state.lastBlankLogFrame = -120;
  resetThrottleClock();
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
    clearPowerCycleOnTimer();
    ModuleRef._emulator_set_on_key(pressed ? 1 : 0);
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

function commitFocusedDebuggerEdit() {
  if (!state.debuggerVisible || !state.debuggerBuilt) return;
  if (!debuggerEditable()) return;
  const activeElement = document.activeElement;
  if (!(activeElement instanceof HTMLInputElement)) return;

  if (activeElement === regAEditor) {
    applyRegisterA();
    return;
  }

  if (activeElement === regIEditor) {
    applyRegisterI();
    return;
  }

  if (activeElement === regSPEditor) {
    applyRegisterSP();
    return;
  }

  if (activeElement === pcEditor) {
    applyProgramCounter();
    return;
  }

  if (activeElement.dataset.stackIndex != null) {
    applyStackValue(activeElement);
    return;
  }

  if (activeElement.dataset.registerIndex != null) applyRegisterNibble(activeElement);
}

function applyProgramCounter() {
  if (!debuggerEditable()) return;
  const nextPc = parseHex(pcEditor.value, 4);
  if (nextPc == null) {
    setStatus("Enter a valid 4-digit PC value");
    updateDebugger();
    return;
  }

  ModuleRef._emulator_set_program_counter(nextPc);
  updateProgramCounter();
  updateDebugger();
  setStatus(`PC set to ${hex(nextPc, 4)}`);
  logSnapshot(`Program counter set to ${hex(nextPc, 4)}`);
}

function applyRegisterA() {
  if (!debuggerEditable()) return;
  const value = parseHex(regAEditor.value, 2);
  if (value == null) {
    setStatus("Enter a valid 2-digit A value");
    updateDebugger();
    return;
  }

  ModuleRef._emulator_set_register_byte(0x0f0, value);
  updateDebugger();
  setStatus(`A set to ${hex(value, 2)}`);
}

function applyRegisterI() {
  if (!debuggerEditable()) return;
  const value = parseHex(regIEditor.value, 3);
  if (value == null) {
    setStatus("Enter a valid 3-digit I value");
    updateDebugger();
    return;
  }

  ModuleRef._emulator_set_register_nibble(0x100, value & 0x0f);
  ModuleRef._emulator_set_register_nibble(0x101, (value >> 4) & 0x0f);
  ModuleRef._emulator_set_register_nibble(0x102, (value >> 8) & 0x01);
  updateDebugger();
  setStatus(`I set to ${hex(value, 3)}`);
}

function applyRegisterSP() {
  if (!debuggerEditable()) return;
  const value = parseHex(regSPEditor.value, 1);
  if (value == null) {
    setStatus("Enter a valid 1-digit SP value");
    updateDebugger();
    return;
  }

  ModuleRef._emulator_set_register_nibble(0x118, value);
  updateDebugger();
  setStatus(`SP set to ${hex(value, 1)}`);
}

function toggleBreakpointAtInput() {
  if (!debuggerEditable()) return;
  const address = parseHex(breakpointAddressInput.value, 4);
  if (address == null) {
    setStatus("Enter a valid 4-digit breakpoint address");
    updateDebugger();
    return;
  }

  toggleBreakpointAtAddress(address);
}

function applyStackValue(input) {
  if (!debuggerEditable()) return;
  const index = Number.parseInt(input.dataset.stackIndex ?? "", 10);
  const value = parseHex(input.value, 4);
  if (!Number.isInteger(index) || value == null) {
    updateDebugger();
    return;
  }

  ModuleRef._emulator_set_stack_value(index, value);
  updateDebugger();
  setStatus(`Stack #${index} set to ${hex(value, 4)}`);
}

function applyRegisterNibble(input) {
  if (!debuggerEditable()) return;
  const index = Number.parseInt(input.dataset.registerIndex ?? "", 10);
  const value = parseHex(input.value, 1);
  if (!Number.isInteger(index) || value == null) {
    updateDebugger();
    return;
  }

  ModuleRef._emulator_set_register_nibble(index, value);
  updateProgramCounter();
  updateDebugger();
  setStatus(`Register nibble ${hex(index, 3)} set to ${hex(value, 1)}`);
}

function installEventHandlers() {
  romInput.addEventListener("change", (event) => {
    handleRomSelection(event).catch(() => setStatus("ROM load failed"));
  });

  stateInput.addEventListener("change", (event) => {
    handleStateSelection(event).catch(() => setStatus("State load failed"));
  });

  throttleSlider.addEventListener("input", () => {
    throttlePercent = Number(throttleSlider.value);
    resetThrottleClock();
    updateThrottleLabel();
  });

  debuggerToggleButton.addEventListener("click", () => {
    setDebuggerVisible(!state.debuggerVisible);
  });

  disassemblyFollowPcToggle.addEventListener("change", () => {
    state.disassemblyFollowPc = disassemblyFollowPcToggle.checked;
    if (state.disassemblyFollowPc) state.disassemblyFocusPc = null;
    lastDisassemblyKey = "";
    updateDebugger();
  });
  disassemblySetPcButton.addEventListener("click", () => {
    if (state.disassemblyFocusPc == null) return;
    setProgramCounterToAddress(state.disassemblyFocusPc);
  });
  disassemblyRunHereButton.addEventListener("click", () => {
    if (state.disassemblyFocusPc == null) return;
    runToAddress(state.disassemblyFocusPc);
  });

  applyRegAButton.addEventListener("click", applyRegisterA);
  regAEditor.addEventListener("blur", applyRegisterA);
  regAEditor.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    applyRegisterA();
  });

  applyRegIButton.addEventListener("click", applyRegisterI);
  regIEditor.addEventListener("blur", applyRegisterI);
  regIEditor.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    applyRegisterI();
  });

  applyRegSPButton.addEventListener("click", applyRegisterSP);
  regSPEditor.addEventListener("blur", applyRegisterSP);
  regSPEditor.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    applyRegisterSP();
  });

  applyPcButton.addEventListener("click", applyProgramCounter);
  pcEditor.addEventListener("blur", applyProgramCounter);
  pcEditor.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    applyProgramCounter();
  });

  setBreakpointButton.addEventListener("click", toggleBreakpointAtInput);
  breakpointAddressInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    toggleBreakpointAtInput();
  });

  clearBreakpointsButton.addEventListener("click", () => {
    if (!debuggerEditable()) return;
    ModuleRef._emulator_clear_breakpoints();
    persistCurrentBreakpoints();
    updateDebugger();
    setStatus("All breakpoints cleared");
    logSnapshot("All breakpoints cleared");
  });

  runToggle.addEventListener("click", () => {
    commitFocusedDebuggerEdit();
    setRunning(!state.running);
  });

  screenshot.addEventListener("click", () => {
    screen.toBlob((blob) => {
      saveBlob(blob, `screencapture-${screen.width}x${screen.height}.png`);
    });
  });
  screenRecordButton.addEventListener("click", toggleScreenRecording);

  stepButton.addEventListener("click", () => {
    if (!state.ready || !state.romLoaded) return;
    commitFocusedDebuggerEdit();
    state.running = false;
    clearRunToAddressState();
    resetThrottleClock();
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
    clearRunToAddressState();
    state.frameCounter = 0;
    state.lastBlankLogFrame = -120;
    resetThrottleClock();
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
    clearRunToAddressState();
    state.frameCounter = 0;
    state.lastBlankLogFrame = -120;
    resetThrottleClock();
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
    const previousResetCount = ModuleRef._emulator_reset_count();
    clearRunToAddressState();
    state.frameCounter = 0;
    state.lastBlankLogFrame = -120;
    resetThrottleClock();
    ModuleRef._emulator_power_cycle();
    queuePowerCycleOnPulse(previousResetCount);
    state.running = ModuleRef._emulator_is_running() !== 0;
    updateProgramCounter();
    updateDebugger();
    drawScreen();
    syncControls();
    setStatus("Power cycle applied; ON pulse queued");
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
    commitFocusedDebuggerEdit();
    clearRunToAddressState();
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
    persistCurrentBreakpoints();
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
  state.debuggerVisible = readDebuggerVisibilityPreference();
  state.frameCounter = 0;
  state.lastBlankLogFrame = -120;
  resetThrottleClock();
  state.framebufferPtr = ModuleRef._emulator_framebuffer_ptr();
  state.stateSize = ModuleRef._emulator_state_size();
  state.registersPtr = ModuleRef._emulator_registers_ptr();
  state.stackPtr = ModuleRef._emulator_stack_ptr();
  syncDebuggerVisibility();
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
updateThrottleLabel();
syncDebuggerVisibility();
syncControls();
drawScreen();

window.addEventListener("ti80-module-ready", bootModule, { once: true });
