#include <gtk/gtk.h>
#include <gdk/gdkkeysyms.h>
#include <inttypes.h>
#include <string.h>
#include <stdlib.h>

#ifndef SHARED_H
#define SHARED_H

// main.c
void Quit();
extern int changed;

// memory.c
extern uint8_t key[8][7], onKey;
extern struct LCD {
	uint8_t on, word8, countY, up, notSTB : 1;
	uint8_t test : 3;
	uint8_t opa2, opa1 : 2;
	uint8_t y : 4;
	uint8_t z, x, contrast : 6;
	uint8_t image[48][64], output;
} LCD;

void loadROM(char *filename);
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
int step();
#ifdef TIEMU_LINK
void linkInit();
void linkReset();
void linkClose();
#endif

// calc.c
extern gchar *stateFile;
void reload();
gboolean reset();
GtkWidget *calcWindow();

// debugger.c
extern int breakOnDebug;
void debug(char *message, ...);
void debugBreak(char *message, ...);
gboolean debugRedraw();
void debugWindow();

#endif
