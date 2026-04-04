#include <stdio.h>
#include <string.h>

#include "shared.h"

int changed = 0;

static uint8_t breakpoint[0x10000];
static uint16_t overBreakpoint = 0xFFFF;

static int variableTimer = 0;
static int fixedTimer = 0;
static long frameTime = 0;
static unsigned totalResetCount = 0;
static char lastResetReason[64] = "Startup";

static const long timing[8] = {5040, 2100, 1575, 1050, 350, 252, 180, 105};

static void rememberResetReason(const char *reason) {
	if(reason == NULL || *reason == '\0') reason = "Reset";
	snprintf(lastResetReason, sizeof(lastResetReason), "%s", reason);
	totalResetCount++;
}

static void resetLegacyBackupState(void) {
	reg4w(0x10B, 0x1);
	reg4w(0x10D, 0xE);
	reg4w(0x10F, 0x1);
	reg4w(0x110, 0x0);
	reg4w(0x111, 0x0);
	reg8w(0x112, 0x0);
	reg4w(0x119, 0x0);
	LCD.on = LCD.word8 = LCD.up = LCD.notSTB = 1;
	LCD.countY = 0;
	LCD.test = 0;
	LCD.opa2 = LCD.opa1 = 0;
	LCD.contrast = 0x12 + 4 * reg4r(0x065);
	PC = 0x2B2F;
}

void emulatorResetTiming(void) {
	variableTimer = 0;
	fixedTimer = 0;
	frameTime = 0;
	overBreakpoint = 0xFFFF;
}

int reset(void) {
	return resetForReason("Reset");
}

int resetForReason(const char *reason) {
	key[7][5] = 0;

	LCD.on = 0;
	LCD.word8 = LCD.countY = LCD.up = 1;
	LCD.notSTB = 1;
	LCD.test = 0;
	LCD.opa2 = LCD.opa1 = 0;
	LCD.y = LCD.z = LCD.x = 0;
	LCD.output = 0;

	PC = 0x0000;
	reg4w(0x10E, 0);
	reg[0x10F >> 1] &= 0xBF;
	errorStop = 0;
	emulatorResetTiming();
	rememberResetReason(reason);
	return 0;
}

void reload(void) {
	stopped = 1;
	resetForReason("Reload");
	changed = 0;
}

void powerCycle(void) {
	resetForReason("Power cycle");
	start();
}

void hardReset(void) {
	resetForReason("Hard reset");
	reg4w(0x10F, 0);
	reg8w(0x140, (uint8_t)~reg8r(0x140));
	reg8w(0x142, (uint8_t)~reg8r(0x142));
}

size_t stateSize(void) {
	return TI80_RAM_SIZE + 0xFE + 2 + sizeof(stack) + sizeof(LCD);
}

int loadStateBuffer(const uint8_t *data, size_t size) {
	size_t offset = 0;

	if(data == NULL || size < TI80_RAM_SIZE + 0x100) return 0;

	memset(key, 0, sizeof(key));
	onKey = 0;

	for(int a = 0x5000; a < 0x7000; a++) pokeB((uint16_t)a, data[offset++]);
	for(int i = 0; i < 0x100; i++) reg[i] = data[offset++];

	if(offset == size) resetLegacyBackupState();
	else {
		size_t remaining = size - offset;
		size_t needed = sizeof(stack) + sizeof(LCD);

		if(remaining < needed) return 0;

		reg4w(0x10F, reg[0x10F >> 1] >> 4);
		PC = ((uint16_t)reg[0xFE] << 8) | reg[0xFF];

		for(int i = 0; i < 8; i++) {
			stack[i] = (uint16_t)data[offset++] << 8;
			stack[i] |= data[offset++];
		}

		memcpy(&LCD, data + offset, sizeof(LCD));
		offset += sizeof(LCD);
	}

	changed = 0;
	stopped = 1;
	errorStop = 0;
	emulatorResetTiming();
	return offset <= size;
}

size_t saveStateBuffer(uint8_t *buffer, size_t capacity) {
	size_t size = stateSize();
	size_t offset = 0;

	if(buffer == NULL || capacity < size) return 0;

	for(int a = 0x5000; a < 0x7000; a++) buffer[offset++] = byte((uint16_t)a);
	for(int i = 0; i < 0xFE; i++) buffer[offset++] = reg[i];
	buffer[offset++] = (uint8_t)(PC >> 8);
	buffer[offset++] = (uint8_t)PC;

	for(int i = 0; i < 8; i++) {
		buffer[offset++] = (uint8_t)(stack[i] >> 8);
		buffer[offset++] = (uint8_t)stack[i];
	}

	memcpy(buffer + offset, &LCD, sizeof(LCD));
	offset += sizeof(LCD);
	return offset;
}

static void updateTimers(int cycles) {
	if((reg[0x10D >> 1] & 0x10) || (reg[0x10F >> 1] & 0xC0)) {
		variableTimer = 0;
		return;
	}

	fixedTimer += cycles * 10;
	if(fixedTimer >= 131072 * 2) {
		fixedTimer -= 131072 * 2;
		reg[0x108 >> 1] = (reg[0x108 >> 1] & 0xF0) | ((reg[0x108 >> 1] + 1) & 0xF);
	}

	if(reg[0x10F >> 1] & 0x10) {
		int stride = 40960 >> (((reg[0x10B >> 1] >> 4) & 3) << 2);
		variableTimer += cycles * stride;
		if(variableTimer >= 131072 * 2) {
			variableTimer -= 131072 * 2;
			if(--reg[0x11A >> 1] == 0xFF) {
				reg[0x11A >> 1] = reg[0x7A];
				reg[0x109 >> 1] |= 0x20;
			}
		}
	} else variableTimer = 0;
}

int emulatorRunFrame(void) {
	int executedCycles = 0;

	if(stopped) return 0;

	do {
		int cycles = step();
		executedCycles += cycles;
		frameTime += timing[reg[0x10D >> 1] >> 5] * cycles;
		updateTimers(cycles);

		if(breakpoint[PC]) {
			stopped = 1;
			debug("Reached breakpoint");
		}
		if(PC == overBreakpoint) {
			stopped = 1;
			overBreakpoint = 0xFFFF;
			debug("Step-over complete");
		}
	} while(!stopped && frameTime < 450000 * 4);

	frameTime -= 450000 * 4;
	return executedCycles;
}

void start(void) {
	if(!stopped) return;
	stopped = 0;
}

void userBreak(void) {
	stopped = 1;
	debug("User-initiated break");
}

void toggleBreakpoint(void) {
	breakpoint[PC] = !breakpoint[PC];
}

void toggleBreakpointAt(uint16_t address) {
	breakpoint[address] = !breakpoint[address];
}

int breakpointAt(uint16_t address) {
	return breakpoint[address] != 0;
}

void singleStep(void) {
	stopped = 1;
	debug("");
	step();
}

void stepOver(void) {
	overBreakpoint = PC + 2;
	start();
}

unsigned resetCount(void) {
	return totalResetCount;
}

const char *resetReason(void) {
	return lastResetReason;
}
