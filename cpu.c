#include "shared.h"
#ifdef TIEMU_LINK
#include <ticables.h>
#endif

int stopped = 0, errorStop = 0, writeRepeat;
#ifdef TIEMU_LINK
CableHandle *linkCable = NULL;
uint8_t linkData, linkBits = 0, linkSend = 0;
#endif

uint8_t reg[0x100], lastLow, lastHigh;
#define I (((uint16_t)reg[0x102>>1] & 1) << 8 | reg[0x100>>1])
#define DP ((uint16_t)reg[0x11E>>1] << 8 | reg[0x11C>>1])
// Storage locations chosen for convenience
#define ALTERNATE_I (reg[0x0F2>>1])
#define TIMER_START (reg[0x0F4>>1])
static uint8_t reg4rRaw(uint16_t i, uint8_t *d) {
	if((i & 0x0F0) == 0x0F0) return *d = reg[0x0F0>>1] & 0xF;
	else if(i == 0x103 || (i >= 0x10B && i <= 0x10D) || i == 0x10F ||
	        (i >= 0x110 && i <= 0x113) || i == 0x119) return *d;
#ifdef TIEMU_LINK
	else if(i == 0x117) {
		if(linkSend) return reg[0x117>>1] >> 4;
		else {
			CableStatus status;
			ticables_cable_check(linkCable, &status);
			if(linkBits == 0 && status == STATUS_RX) {
				ticables_cable_get(linkCable, &linkData); linkBits = 8;
			}
			if(linkBits == 0 || reg[0x117>>1] >> 4 & 0xC) return reg[0x117>>1] >> 4;
			else return reg[0x117>>1] >> 4 & (linkData & 1 ? 0xD : 0xE);
		}
		// This would be nice instead, but the TiEmu link does not implement it.
		//return ticables_cable_get_d1(linkCable) << 1 |
		//       ticables_cable_get_d0(linkCable);
	}
#else
#ifndef ECHO_LINK
	else if(i == 0x117) return 0x3;
#endif
#endif
	else return *d = reg[i>>1] >> ((i&1) << 2) & 0xF;
}
uint8_t reg4r(uint16_t i) {return reg4rRaw(i, &lastLow);}
uint8_t reg4rd(uint16_t i) {return reg[i>>1] >> ((i&1) << 2) & 0xF;}
static void reg4wRaw(uint16_t i, uint8_t x) {
	static uint8_t Isel;
	if(i == 0x109) { // TODO: FIX
		x |= onKey << 2;
		if((x & 8) != (Isel & 8)) {
			uint8_t temp = (reg[0x101>>1] & 0xF0) | (reg[0x102>>1] & 1);
			reg[0x101>>1] = (reg[0x101>>1] & 0x0F) | (ALTERNATE_I & 0xF0);
			reg[0x102>>1] = (reg[0x102>>1] & 0xF0) | (ALTERNATE_I & 1);
			ALTERNATE_I = temp;
			Isel = x;
		}
	}
	// TODO: IMPLEMENT (10A)
	if(i == 0x10F) {
		if((x & 1) && !(reg[0x10F>>1] & 0x10) && !(reg[0x10D>>1] & 0x10))
			reg[0x11A>>1] = TIMER_START;
		if(x & 4) { // TODO: CHECK
			reg8w(0x11C, 0xAA); reg8w(0x11E, 0xAA);
		}
		if(x & 8); // TODO: CHECK
		if(x & 2) debugBreak("Unknown write to (10F): %X", x & 0xF);
	}
	if(i == 0x110) writeRepeat = 1;
#ifdef TIEMU_LINK
	if(i == 0x117) {
		reg[0x117>>1] &= 0x0F;
		if((x & 0xC) == 0x0) {reg[0x117>>1] |= x << 4; return;}
		if(linkBits == 0) linkSend = 1;
		if(linkSend) {
			switch(x & 0xC) {
				case 0x4: reg[0x117>>1] |= 0x40; linkData >>= 1; linkBits++; break;
				case 0x8: reg[0x117>>1] |= 0x80;
					linkData >>= 1; linkData |= 0x80; linkBits++; break;
				// TODO: CHECK INTERPRETATION BY ACTUAL CABLE
				case 0xC: reg[0x117>>1] |= 0xC0; linkData >>= 1; linkBits++;
			}
			if(linkBits == 8) {
				ticables_cable_put(linkCable, linkData); linkBits = 0; linkSend = 0;
			}
		} else {
			switch(x & 0xC) {
				case 0x4: reg[0x117>>1] |= (x & 0xE) << 4;
					if(linkData & 1) {linkData >>= 1; linkBits--;} break;
				case 0x8: reg[0x117>>1] |= (x & 0xD) << 4;
					if(!(linkData & 1)) {linkData >>= 1; linkBits--;} break;
				// TODO: CHECK
				case 0xC: reg[0x117>>1] |= 0xC0; linkData >>= 1; linkBits--;
			}
		}
		// This would be nice instead, but the TiEmu link does not implement it.
		//ticables_cable_set_d0(linkCable, (x & 0xF) >> 6 & 1);
		//ticables_cable_set_d1(linkCable, (x & 0xF) >> 7 & 1);
		return;
	}
#else
#ifdef ECHO_LINK
	if(i == 0x117) {
		reg[0x117>>1] &= 0x0F;
		switch(x & 0xC) {
			case 0x0: reg[0x117>>1] |= x << 4; break;
			case 0x4: reg[0x117>>1] |= 0x40; printf("0"); break;
			case 0x8: reg[0x117>>1] |= 0x80; printf("1"); break;
			case 0xC: reg[0x117>>1] |= 0xC0; printf("?"); break;
		}
		return;
	}
#endif
#endif
	if((i & 0x0F0) == 0x0F0) reg[0x0F0>>1] = (reg[0x0F0>>1] & 0xF0) | (x & 0xF);
	else if(i == 0x102) reg[0x102>>1] = (reg[0x102>>1] & 0xF0) | (x & 1);
	else if(i == 0x107) reg[0x107>>1] = (reg[0x107>>1] & 0x0F) | (x & 7) << 4;
	else if(i == 0x108 || i == 0x114 || i == 0x115) return;
	else if(i == 0x116) {
		reg[0x116>>1] = (reg[0x116>>1] & 0xF0) | (x & 2);
		LCD.notSTB = (x & 2) >> 1;
	}
	else if(i == 0x11A) TIMER_START = (TIMER_START & 0xF0) | (x & 0xF);
	else if(i == 0x11B) TIMER_START = (TIMER_START & 0x0F) | x << 4;
	else reg[i>>1] = (reg[i>>1] & 0xF0 >> ((i&1) << 2))
	               | (x & 0xF) << ((i&1) << 2);
}
void reg4w(uint16_t i, uint8_t x) {return reg4wRaw(i, lastLow = x & 0xF);}
uint8_t reg8r(uint16_t i) {
	if((i & 0x0F0) == 0x0F0) {
		lastLow = reg[0x0F0>>1] & 0xF; lastHigh = reg[0x0F0>>1] >> 4;
		return reg[0x0F0>>1];
	}
	else if((i & 0x1E1) == 0x101) return reg4rRaw(i, &lastLow) | lastHigh << 4;
	else return reg4rRaw(i, &lastLow) |
	            reg4rRaw((i & 0x1F0) | ((i + 1) & 0xF), &lastHigh) << 4;
}
void reg8w(uint16_t i, uint8_t x) {
	lastLow = x & 0xF; lastHigh = x >> 4;
	if((i & 0x0F0) == 0x0F0) reg[0x0F0>>1] = x;
	else if((i & 0x1E1) == 0x101) reg4w(i, lastLow);
	else {reg4w(i, lastLow); reg4w((i & 0x1F0) | ((i + 1) & 0xF), lastHigh);}
}
uint16_t add4(uint16_t x, uint8_t y) {return (x & 0xFFF0) | ((x + y) & 0xF);}
void Iadd(uint8_t x) {reg[0x100>>1] = add4(reg[0x100>>1], x);}
void DPw(uint16_t x) {reg[0x11C>>1] = x; reg[0x11E>>1] = x >> 8;}

uint16_t PC, stack[8];

#define S (op >> 8 & 1)
#define SMASK (op & 0x0100 ? 0x0F : 0xFF)
#define SB (op & 0x0100 ? 4 : 8)
#define OFFSET (op & 0x0100 ? offset : offset << 1)
#define regSr (op & 0x0100 ? reg4r : reg8r)
#define regSw (op & 0x0100 ? reg4w : reg8w)
#define YX ((op & 0xF) << 4 | (op >> 4 & 0xF))
#define JYX add4(((I & 0x100) ^ 0x100) | YX, OFFSET)
#define WYX ((op & 0x20F) == 0x20F ? I : add4((op >> 1 & 0x100) | YX, offset))
#define WYXS_NO_I (add4((op >> 1 & 0x100) | YX, OFFSET))
#define WYXS ((op & 0x20F) == 0x20F ? I : WYXS_NO_I)
#define CHECK_WYXS_REP do{if(rep && (op & 0x20F) == 0x20F) Iadd(2 - S);}while(0)
#define EF add4(0x100 | (op >> 7 & 0x20) | (op >> 4 & 0x1F), offset)
#define B ((op >> 9 & 2) | (op >> 8 & 1))
#define COND(x, y) do {\
	carry = op & 0x0800 ? (x) < (y) || (carry && (x) == (y))\
	                    : carry || (x) != (y);\
	if(!repeat) {carry = !(op & 0x0800) ^ !carry;}\
	M_JUMP_CALL;\
} while(0)
#define JUMP_CALL do {\
	if(word(PC) & 0x8000) {\
		if(reg4r(0x118) < 8) stack[reg4r(0x118)] = PC + 1;\
		reg4w(0x118, reg4r(0x118) + 1);\
	}\
	PC = word(PC) & 0x7FFF; cycles += 2;\
} while(0)
#define C_JUMP_CALL JUMP_CALL; else PC++
#define M_JUMP_CALL \
	if(!repeat) { \
		if(op & 0x0400) \
			if(op & 0x0200) if(carry) C_JUMP_CALL;\
			else if(!carry) C_JUMP_CALL;\
		else if(op & 0x0200) JUMP_CALL;\
	}
#define DEC(x) (((x) >> 4) * 10 + ((x) & 0xF))
#define BCD(x) (((x) / 100) << 8 | (((x) / 10) % 10) << 4 | ((x) % 10))
int step() {
	// TODO: CHECK
	if(onKey && (reg[0x10E>>1] & 0xC) == 0xC) reset();
	if(reg[0x10F>>1] & 0xC0) return 8;
	errorStop = 0;
	int carry = 0, rep = reg[0x110>>1] & 0xF, cycles = 1;
	uint16_t PCsave = PC;
	for(int repeat = rep, offset = 0; repeat >= 0; repeat--, offset++) {
		PC = PCsave; writeRepeat = 0; cycles++;
		if(0) {
			printf("%04X: %04X %04X %04X ", PC, word(PC), word(PC+1), word(PC+2));
			printf("A=%02X I=%03X (I)=%02X DP=%04X SP=%X\n",
				reg[0x0F0>>1], I, reg8r(I), DP, reg[0x118>>1] & 0xF);
		}
		uint16_t op = word(PC++);

		// TODO: FIX BCD ARITHMETIC WITH DIGITS OVER 9
		uint8_t ADD(int b, uint8_t x, uint8_t y) {
			if(b > 0)
				if(op & 0x0800) {
					int sum = DEC(x) + DEC(y) + carry;
					carry = sum > (b == 4 ? 9 : 99);
					return BCD(sum);
				} else {int sum = x + y + carry; carry = sum >> b & 1; return sum;}
			else
				if(op & 0x0800) {
					int sum = DEC(x) - DEC(y) - carry;
					carry = sum < 0;
					sum = b == -4 ? (sum + 10) % 10 : (sum + 100) % 100;
					return BCD(sum);
				} else {int sum = x - y - carry; carry = sum >> -b & 1; return sum;}
		}

		if(op == 0xB000) {debugWindow(); debug("Break instruction"); stopped = 1;}
		else if(op < 0x0200) {
			uint16_t DPsave = DP;
			// TODO: CHECK lastLow/lastHigh WHEN COMBINED
			// TODO: IMPLEMENT CONFLICTS
			if(op & 4 && !repeat) cycles++;
			if((op & 7) == 4) {regSw(I, byte(DP)); DPw(DP + 1); if(rep) Iadd(2 - S);}
			if((op & 7) == 5) {regSw(I, byte(DP)); DPw(DP - 1); if(rep) Iadd(2 - S);}
			if((op & 7) == 6) {
				pokeB(DP, S ? reg4r(I) | lastHigh << 4 : reg8r(I)); DPw(DP + 1);
				if(rep) Iadd(2 - S);
			}
			if((op & 7) == 7) {
				pokeB(DP, S ? reg4r(I) | lastHigh << 4 : reg8r(I)); DPw(DP - 1);
				if(rep) Iadd(2 - S);
			}
			if((op & 0x18) == 0x18)
				reg8w(0x0F0, reg8r(0x0F0) >> (op & 4 && DPsave < 0x4000 ? 2 : 1));
			if(op & 0x20) {
				// TODO: FIGURE OUT STUFF RELATED TO 1B41
				uint8_t temp = 0x00;
				for(int i = 0; i < 7; i++)
					if(reg[0x112>>1] & 1 << i)
						for(int j = 0; j < 8; j++) temp |= key[j][i] << (7-j);
				reg[0x114>>1] = temp;
			}
			if(op & 0x40) {
				uint8_t SP = reg[0x118>>1] & 0xF;
				if(SP > 0x0) {reg4wRaw(0x118, --SP); PC = SP < 8 ? stack[SP] : 0x0000;}
			}
			if(op & 0x80) PC = reg[0x104>>1] | reg[0x106>>1] << 8;
		}
		else if(op < 0x0400) {regSw(JYX, regSr(I)); if(rep) Iadd(2 - S);}
		else if(op < 0x0600) {regSw(I, regSr(JYX)); if(rep) Iadd(2 - S);}
		else if(op < 0x0800) {
			uint8_t temp = regSr(JYX); regSw(JYX, regSr(I)); regSw(I, temp);
			if(rep) Iadd(2 - S);
		}
		else if(op < 0x0C00) {
			reg4w(0x102, op >> 8); reg8w(0x100, op);
			if(op & 0x0200) JUMP_CALL;
		}
		else if(op < 0x0E00) {regSw(I, op); Iadd(2 - S);}
		else if(op < 0x1000) reg4w(EF, op);
		else if(op < 0x1400) regSw(0x0F0, regSr(WYXS_NO_I));
		else if(op < 0x1800) {
			uint8_t temp = regSr(0x0F0);
			regSw(0x0F0, regSr(WYXS_NO_I));
			regSw(WYXS_NO_I, temp);
		}
		else if(op < 0x1C00) regSw(WYXS_NO_I, regSr(0x0F0));
		else if(op < 0x1E00) regSw(0x0F0, op);
		else if(op < 0x2000) reg4w(EF, op);
		// DO THESE BIT OPERATIONS NEED TO CHECK WHETHER TO CHANGE I WHEN REPEATING?
		else if(op < 0x2800) reg4w(WYX, reg4r(WYX) ^ 1 << B);
		else if(op < 0x3000) reg4w(WYX, reg4r(WYX) & ~(1 << B));
		else if(op < 0x3800) reg4w(WYX, reg4r(WYX) | 1 << B);
		else if(op < 0x3C00) {regSw(WYXS, ~regSr(WYXS)); CHECK_WYXS_REP;}
		else if(op < 0x3E00) {regSw(I, regSr(I) ^ regSr(JYX)); if(rep) Iadd(2 - S);}
		else if(op < 0x4000) {regSw(I, regSr(I) | regSr(JYX)); if(rep) Iadd(2 - S);}
		else if(op < 0x6000) COND(reg4r(EF), op & 0xF);
		else if(op < 0x7000) {COND(regSr(I), op & SMASK); Iadd(2 - S);}
		else if(op < 0x8000) COND(regSr(0x0F0), op & SMASK);
		else if(op < 0xA000) {
			regSw(I, ADD(op & 0x1000 ? -SB : SB, regSr(I), regSr(JYX)));
			if(rep) Iadd(2 - S);
			M_JUMP_CALL;
		}
		else if(op < 0xB000) {
			// TODO: FIX REPETITION
			int test = 1;
			do test &= (reg4r(WYX) >> B & 1) == (op >> 11 & 1);
			while(repeat && repeat--);
			if(test) C_JUMP_CALL;
		}
		else if(op < 0xC000) {COND(regSr(I), regSr(JYX)); if(rep) Iadd(2 - S);}
		else if(op < 0xE000) {reg4w(EF, ADD(4, reg4r(EF), op & 0xF)); M_JUMP_CALL;}
		else if(op < 0xF000) {
			regSw(I, ADD(SB, regSr(I), op & SMASK));
			if(rep) Iadd(2 - S);
			M_JUMP_CALL;
		}
		else {regSw(0x0F0, ADD(SB, regSr(0x0F0), op & SMASK)); M_JUMP_CALL;}
		if(writeRepeat) {
			if(repeat) {repeat = reg[0x110>>1] & 0xF; if(!repeat) repeat = 0x10;}
		}
		else reg4wRaw(0x110, repeat);
	}
	if(errorStop) PC = PCsave;
	return cycles;
}

// TODO: ALLOW CHOOSING LINK INTERFACE
#ifdef TIEMU_LINK
void linkInit() {
	ticables_library_init();
	linkCable = ticables_handle_new(CABLE_TIE, PORT_1);
	if(!linkCable) {
		fprintf(stderr, "Could not open virtual link cable\n");
		exit(EXIT_FAILURE);
	}
	ticables_cable_open(linkCable);
}
void linkReset() {linkSend = 0; linkBits = 0;}
void linkClose() {
	ticables_cable_close(linkCable);
	ticables_handle_del(linkCable);
	ticables_library_exit();
}
#endif
