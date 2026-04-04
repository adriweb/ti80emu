#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "shared.h"

uint8_t ROM[TI80_ROM_SIZE];
uint8_t RAM[TI80_RAM_SIZE];
uint8_t key[8][7], onKey = 0;
LCDState LCD;

int loadROMBuffer(const uint8_t *data, size_t size) {
	size_t copySize;

	if(data == NULL || size == 0) return 0;

	copySize = size > TI80_ROM_SIZE ? TI80_ROM_SIZE : size;
	memset(ROM, 0, sizeof(ROM));
	memcpy(ROM, data, copySize);
	return 1;
}

int loadROMFile(const char *filename) {
	FILE *f;
	size_t size;

	if(filename == NULL) return 0;

	f = fopen(filename, "rb");
	if(f == NULL) return 0;

	memset(ROM, 0, sizeof(ROM));
	size = fread(ROM, 1, sizeof(ROM), f);
	fclose(f);
	return size > 0;
}

#define LCDbits (LCD.word8 ? 8 : 6)
#define LCDimage(i) LCD.image[LCD.x][(LCD.y + 1) * LCDbits - (i) - 1]

uint8_t byte(uint16_t a) {
	// TODO: FIX 3FFE-3FFF (SOMETIMES 4161, SOMETIMES LCD DATA?)
	if(a < 0x3FFE) return ROM[a];
	else if(a >= 0x8000) return ROM[a - 0x4000];
	else if(a < 0x5000)
		if(a & 1)
			if(LCD.notSTB) {
				uint8_t x = LCD.output;
				LCD.output = 0x00;
				if(!LCD.word8 && LCD.y > 10) LCD.output = 0x20 | LCD.y;
				else if(LCD.x > 47 || (LCD.word8 && LCD.y > 7))
					LCD.output = LCD.word8 ? 0xFF : 0x3C;
				else if(LCD.word8 || LCD.y != 10)
					for(int i = 0; i < LCDbits; i++) LCD.output |= LCDimage(i) << i;
				else for(int i = 2; i < LCDbits; i++) LCD.output |= LCDimage(i) << i;
				if(LCD.countY) {
					LCD.y += LCD.up ? 1 : -1; LCD.y &= 0xF;
					if(LCD.up && LCD.y == (LCD.word8 ? 8 : 11)) LCD.y = 0;
					if(!LCD.up && LCD.y == 0xF) LCD.y = LCD.word8 ? 7 : 10;
				} else {
					LCD.x += LCD.up ? 1 : -1; LCD.x &= 0x3F;
					if(LCD.up && LCD.x == 48) LCD.x = 0;
					if(!LCD.up && LCD.x == 0x3F) LCD.x = 47;
				}
				return x;
			} else return 0x00;
		else return (!LCD.notSTB << 7) | (LCD.word8 << 6) | (LCD.on << 5) |
		            (LCD.countY << 1) | LCD.up;
	else if(a < 0x7000) return RAM[a - 0x5000];
	else return a >> 8;
}
uint16_t word(uint16_t a) {return (byte(a<<1)<<8) | byte((a<<1)+1);}
uint8_t byteDebug(uint16_t a) {return byte(a);}

void pokeB(uint16_t a, uint8_t x) {
	if(a == 0x5000 || a == 0x5001 || (a >= 0x5291 && a <= 0x5298) ||
	   a == 0x52C4 || a == 0x5419) {debug("Write to %04X near %04X", a, PC);}
	if(a < 0x4000 || a >= 0x7000) debug("Write to read-only address %04X", a);
	else if(a < 0x5000)
		if(a & 1) {
			if(LCD.x > 47 || LCD.y > 10 || (LCD.word8 && LCD.y > 7));
			else if(LCD.word8 || LCD.y != 10)
				for(int i = 0; i < LCDbits; i++) LCDimage(i) = (x >> i) & 1;
			else for(int i = 2; i < LCDbits; i++) LCDimage(i) = (x >> i) & 1;
			if(LCD.countY) {
				LCD.y += LCD.up ? 1 : -1; LCD.y &= 0xF;
				if(LCD.up && LCD.y == (LCD.word8 ? 8 : 11)) LCD.y = 0;
				if(!LCD.up && LCD.y == 0xF) LCD.y = LCD.word8 ? 7 : 10;
			} else {
				LCD.x += LCD.up ? 1 : -1; LCD.x &= 0x3F;
				if(LCD.up && LCD.x == 48) LCD.x = 0;
				if(!LCD.up && LCD.x == 0x3F) LCD.x = 47;
			}
		} else if(x & 0x80)
			if(x & 0x40) LCD.contrast = x & 0x3F;
			else LCD.x = x & 0x3F;
		else if(x & 0x40) LCD.z = x & 0x3F;
		else if(x & 0x20) LCD.y = x & 0xF;
		else if(x & 0x10)
			if(x & 0x08) LCD.test = x & 0x7;
			else LCD.opa2 = x & 3;
		else if(x & 0x08) LCD.opa1 = x & 3;
		else if(x & 0x04) {LCD.countY = (x & 2) >> 1; LCD.up = x & 1;}
		else if(x & 0x02) LCD.on = x & 1;
		else LCD.word8 = x;
	else RAM[a - 0x5000] = x;
}
