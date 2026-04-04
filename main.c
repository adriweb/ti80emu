#include <stdio.h>
#include <stdlib.h>

#include "shared.h"

int main(int argc, char **argv) {
	int frames = 120;

	if(argc < 2) {
		fprintf(stderr, "usage: %s ROM_FILE [frames]\n", argv[0]);
		return EXIT_FAILURE;
	}

	if(argc > 2) frames = atoi(argv[2]);

	if(!loadROMFile(argv[1])) {
		fprintf(stderr, "failed to load ROM: %s\n", argv[1]);
		return EXIT_FAILURE;
	}

	reset();
	start();

	for(int i = 0; i < frames && !stopped; i++) emulatorRunFrame();

	printf("PC=%04X running=%d lcd_on=%d stb=%d resets=%u reason=%s status=%s\n",
		PC, !stopped, LCD.on, LCD.notSTB, resetCount(), resetReason(), debugStatus());
	return EXIT_SUCCESS;
}
