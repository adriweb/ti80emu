#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "shared.h"

static void setOnKeyPressed(int pressed) {
	onKey = pressed ? 1 : 0;
	reg4w(0x109, reg4r(0x109));
}

static void autoBootWithOnPulse(void) {
	const int settleSteps = 5000;
	const int holdSteps = 20000;

	start();

	for(int i = 0; i < settleSteps && !stopped; i++) step();

	setOnKeyPressed(1);
	for(int i = 0; i < holdSteps && !stopped; i++) step();

	setOnKeyPressed(0);
}

int main(int argc, char **argv) {
	int frames = 120;
	int autoBoot = 1;

	if(argc < 2) {
		fprintf(stderr, "usage: %s ROM_FILE [frames] [--no-auto-on]\n", argv[0]);
		return EXIT_FAILURE;
	}

	if(argc > 2) {
		for(int i = 2; i < argc; i++) {
			if(strcmp(argv[i], "--no-auto-on") == 0) autoBoot = 0;
			else frames = atoi(argv[i]);
		}
	}

	if(!loadROMFile(argv[1])) {
		fprintf(stderr, "failed to load ROM: %s\n", argv[1]);
		return EXIT_FAILURE;
	}

	reset();

	if(autoBoot) autoBootWithOnPulse();
	else start();

	for(int i = 0; i < frames && !stopped; i++) emulatorRunFrame();

	printf("PC=%04X running=%d lcd_on=%d stb=%d resets=%u reason=%s status=%s\n",
		PC, !stopped, LCD.on, LCD.notSTB, resetCount(), resetReason(), debugStatus());
	return EXIT_SUCCESS;
}
