#include <stddef.h>
#include <string.h>

#include "shared.h"

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#define EMU_EXPORT EMSCRIPTEN_KEEPALIVE
#else
#define EMU_EXPORT
#endif

static uint8_t framebuffer[TI80_LCD_WIDTH * TI80_LCD_HEIGHT];

EMU_EXPORT
void emulator_init(void) {
	stopped = 1;
	errorStop = 0;
	resetForReason("Initial reset");
}

EMU_EXPORT
int emulator_load_rom(const uint8_t *data, size_t size) {
	if(!loadROMBuffer(data, size)) return 0;
	stopped = 1;
	errorStop = 0;
	resetForReason("ROM loaded");
	return 1;
}

EMU_EXPORT
void emulator_reset(void) {
	stopped = 1;
	errorStop = 0;
	resetForReason("Manual reset");
}

EMU_EXPORT
void emulator_hard_reset(void) {
	hardReset();
}

EMU_EXPORT
void emulator_power_cycle(void) {
	powerCycle();
}

EMU_EXPORT
void emulator_start(void) {
	start();
}

EMU_EXPORT
void emulator_pause(void) {
	userBreak();
}

EMU_EXPORT
int emulator_run_frame(void) {
	return emulatorRunFrame();
}

EMU_EXPORT
int emulator_step_instruction(void) {
	singleStep();
	return 1;
}

EMU_EXPORT
int emulator_is_running(void) {
	return !stopped;
}

EMU_EXPORT
void emulator_set_key(int row, int column, int pressed) {
	if(row < 0 || row >= 8 || column < 0 || column >= 7) return;
	key[row][column] = pressed ? 1 : 0;
}

EMU_EXPORT
void emulator_set_on_key(int pressed) {
	onKey = pressed ? 1 : 0;
	reg4w(0x109, reg4r(0x109));
}

EMU_EXPORT
void emulator_render_lcd(void) {
	int index = 0;

	if(!LCD.on || !LCD.notSTB) {
		memset(framebuffer, 0, sizeof(framebuffer));
		return;
	}

	for(int y = 0; y < TI80_LCD_HEIGHT; y++) {
		int sourceY = (y + LCD.z) % TI80_LCD_HEIGHT;
		for(int x = 0; x < TI80_LCD_WIDTH; x++) {
			framebuffer[index++] = LCD.image[sourceY][x] ? 1 : 0;
		}
	}
}

EMU_EXPORT
uint8_t *emulator_framebuffer_ptr(void) {
	return framebuffer;
}

EMU_EXPORT
size_t emulator_state_size(void) {
	return stateSize();
}

EMU_EXPORT
size_t emulator_save_state(uint8_t *buffer, size_t capacity) {
	return saveStateBuffer(buffer, capacity);
}

EMU_EXPORT
int emulator_load_state(const uint8_t *buffer, size_t size) {
	return loadStateBuffer(buffer, size);
}

EMU_EXPORT
int emulator_rom_size_required(void) {
	return TI80_ROM_SIZE;
}

EMU_EXPORT
int emulator_program_counter(void) {
	return PC;
}

EMU_EXPORT
uint8_t *emulator_registers_ptr(void) {
	return reg;
}

EMU_EXPORT
uint16_t *emulator_stack_ptr(void) {
	return stack;
}

EMU_EXPORT
const char *emulator_debug_status_ptr(void) {
	return debugStatus();
}

EMU_EXPORT
int emulator_error_stop(void) {
	return errorStop;
}

EMU_EXPORT
int emulator_break_on_debug(void) {
	return breakOnDebug;
}

EMU_EXPORT
void emulator_set_break_on_debug(int enabled) {
	breakOnDebug = enabled ? 1 : 0;
}

EMU_EXPORT
void emulator_toggle_breakpoint_pc(void) {
	toggleBreakpoint();
}

EMU_EXPORT
int emulator_breakpoint_at_pc(void) {
	return breakpointAt(PC);
}

EMU_EXPORT
void emulator_step_over(void) {
	stepOver();
}

EMU_EXPORT
uint8_t emulator_debug_byte(uint16_t address) {
	return byteDebug(address);
}

EMU_EXPORT
int emulator_lcd_on(void) {
	return LCD.on != 0;
}

EMU_EXPORT
int emulator_lcd_not_stb(void) {
	return LCD.notSTB != 0;
}

EMU_EXPORT
int emulator_lcd_word8(void) {
	return LCD.word8 != 0;
}

EMU_EXPORT
int emulator_lcd_x(void) {
	return LCD.x;
}

EMU_EXPORT
int emulator_lcd_y(void) {
	return LCD.y;
}

EMU_EXPORT
int emulator_lcd_z(void) {
	return LCD.z;
}

EMU_EXPORT
unsigned emulator_reset_count(void) {
	return resetCount();
}

EMU_EXPORT
const char *emulator_reset_reason_ptr(void) {
	return resetReason();
}
