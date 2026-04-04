#include <stdarg.h>
#include <stdio.h>

#include "shared.h"

int breakOnDebug = 0;

static char status[256] = "";

static void setStatus(const char *message, va_list args) {
	vsnprintf(status, sizeof(status), message, args);
}

const char *debugStatus(void) {
	return status;
}

void debug(const char *message, ...) {
	va_list args;

	va_start(args, message);
	setStatus(message, args);
	va_end(args);

	if(breakOnDebug) stopped = 1;
}

void debugBreak(const char *message, ...) {
	va_list args;

	va_start(args, message);
	setStatus(message, args);
	va_end(args);

	stopped = 1;
	errorStop = 1;
}

int debugRedraw(void) {
	return 0;
}

void debugWindow(void) {
	stopped = 1;
}
