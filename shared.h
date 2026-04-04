#ifndef SHARED_H
#define SHARED_H

#include <stddef.h>
#include <stdint.h>

#define TI80_ROM_SIZE 0xC000
#define TI80_RAM_SIZE 0x2000
#define TI80_LCD_WIDTH 64
#define TI80_LCD_HEIGHT 48

// memory.c
extern uint8_t ROM[TI80_ROM_SIZE];
extern uint8_t RAM[TI80_RAM_SIZE];
extern uint8_t key[8][7];
extern uint8_t onKey;

typedef struct LCDState {
	uint8_t on, word8, countY, up, notSTB : 1;
	uint8_t test : 3;
	uint8_t opa2, opa1 : 2;
	uint8_t y : 4;
	uint8_t z, x, contrast : 6;
	uint8_t image[TI80_LCD_HEIGHT][TI80_LCD_WIDTH];
	uint8_t output;
} LCDState;

extern LCDState LCD;

int loadROMFile(const char *filename);
int loadROMBuffer(const uint8_t *data, size_t size);
uint8_t byte(uint16_t x);
uint16_t word(uint16_t x);
void pokeB(uint16_t a, uint8_t x);
uint8_t byteDebug(uint16_t x);

// cpu.c
extern int stopped, errorStop;
uint8_t reg4r(uint16_t a);
uint8_t reg4rd(uint16_t a);
void reg4w(uint16_t a, uint8_t x);
uint8_t reg8r(uint16_t a);
void reg8w(uint16_t a, uint8_t x);
extern uint16_t PC, stack[8];
extern uint8_t reg[0x100];
int step(void);

// calc.c
extern int changed;
int reset(void);
int resetForReason(const char *reason);
void reload(void);
void powerCycle(void);
void hardReset(void);
void start(void);
void userBreak(void);
void toggleBreakpoint(void);
void singleStep(void);
void stepOver(void);
int emulatorRunFrame(void);
void emulatorResetTiming(void);
void toggleBreakpointAt(uint16_t address);
int breakpointAt(uint16_t address);
int loadStateBuffer(const uint8_t *data, size_t size);
size_t saveStateBuffer(uint8_t *buffer, size_t capacity);
size_t stateSize(void);
unsigned resetCount(void);
const char *resetReason(void);

// debugger.c
extern int breakOnDebug;
void debug(const char *message, ...);
void debugBreak(const char *message, ...);
int debugRedraw(void);
void debugWindow(void);
const char *debugStatus(void);

#endif
