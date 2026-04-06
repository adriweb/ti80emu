CC ?= cc
EMCC ?= emcc

CFLAGS ?= -O2 -std=c99 -Wall -Wextra
EMFLAGS ?= -O3 -std=c99

CORE_SOURCES = cpu.c memory.c calc.c debugger.c
CLI_SOURCES = main.c $(CORE_SOURCES)
WEB_SOURCES = web_emulator.c $(CORE_SOURCES)

BUILD_DIR = build
DIST_DIR = dist

CLI_BIN = $(BUILD_DIR)/ti80emu-cli
WEB_JS = $(BUILD_DIR)/emulator.js
WEB_WASM = $(BUILD_DIR)/emulator.wasm

.PHONY: all native web serve clean dist

all: web

native: $(CLI_BIN)

web: $(DIST_DIR)/index.html

serve: web
	python3 -m http.server 8000 --directory $(DIST_DIR)

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(DIST_DIR): $(BUILD_DIR)
	mkdir -p $(DIST_DIR)

$(CLI_BIN): $(CLI_SOURCES) shared.h | $(BUILD_DIR)
	$(CC) $(CFLAGS) -o $(CLI_BIN) $(CLI_SOURCES)

$(WEB_JS): $(WEB_SOURCES) shared.h | $(BUILD_DIR)
	$(EMCC) $(EMFLAGS) $(WEB_SOURCES) -o $(WEB_JS) \
		-s EXPORTED_FUNCTIONS='["_malloc","_free","_emulator_init","_emulator_load_rom","_emulator_reset","_emulator_hard_reset","_emulator_power_cycle","_emulator_start","_emulator_pause","_emulator_run_frame","_emulator_step_instruction","_emulator_is_running","_emulator_set_key","_emulator_set_on_key","_emulator_render_lcd","_emulator_framebuffer_ptr","_emulator_state_size","_emulator_save_state","_emulator_load_state","_emulator_rom_size_required","_emulator_program_counter","_emulator_set_program_counter","_emulator_registers_ptr","_emulator_set_register_nibble","_emulator_stack_ptr","_emulator_set_stack_value","_emulator_debug_status_ptr","_emulator_error_stop","_emulator_break_on_debug","_emulator_set_break_on_debug","_emulator_toggle_breakpoint_pc","_emulator_breakpoint_at_pc","_emulator_breakpoint_at","_emulator_set_breakpoint","_emulator_clear_breakpoints","_emulator_copy_breakpoints","_emulator_breakpoint_count","_emulator_step_over","_emulator_debug_byte","_emulator_lcd_on","_emulator_lcd_not_stb","_emulator_lcd_word8","_emulator_lcd_x","_emulator_lcd_y","_emulator_lcd_z","_emulator_lcd_contrast","_emulator_lcd_test","_emulator_lcd_opa2","_emulator_reset_count","_emulator_reset_reason_ptr"]' \
		-s EXPORTED_RUNTIME_METHODS='["HEAPU8","UTF8ToString"]' \
		-s ALLOW_MEMORY_GROWTH=1 \
		-s ENVIRONMENT=web,worker,node

$(DIST_DIR)/index.html: web/index.html web/main.js web/style.css web/TI_logo.png $(WEB_JS) $(WEB_WASM) | $(DIST_DIR)
	cp web/index.html $(DIST_DIR)/index.html
	cp web/main.js $(DIST_DIR)/main.js
	cp web/style.css $(DIST_DIR)/style.css
	cp web/TI_logo.png $(DIST_DIR)/TI_logo.png
	cp $(WEB_JS) $(DIST_DIR)/emulator.js
	cp $(WEB_WASM) $(DIST_DIR)/emulator.wasm

clean:
	rm -rf $(BUILD_DIR) $(DIST_DIR)
