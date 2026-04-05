#include <stdio.h>
#include <string.h>

#include "shared.h"

typedef struct BitRepeatCase {
  const char *name;
  uint8_t values[3];
  uint8_t expectedPc;
} BitRepeatCase;

static int runCase(const BitRepeatCase *testCase) {
  unsigned char rom[TI80_ROM_SIZE];
  memset(rom, 0, sizeof(rom));

  /*
   * word 0 = 0xA805
   * Repeated bit-test on nibble base 0x050, testing bit 0 for value 1.
   *
   * word 1 = 0x0003
   * Branch target if the repeated test passes.
   */
  rom[0] = 0xA8;
  rom[1] = 0x05;
  rom[2] = 0x00;
  rom[3] = 0x03;

  if(!loadROMBuffer(rom, sizeof(rom))) {
    fprintf(stderr, "%s: failed to load synthetic ROM\n", testCase->name);
    return 1;
  }

  resetForReason("bitrepeat-validation");
  reg4w(0x110, 2); /* 3 iterations total */
  reg4w(0x050, testCase->values[0]);
  reg4w(0x051, testCase->values[1]);
  reg4w(0x052, testCase->values[2]);
  PC = 0;

  step();

  if(PC != testCase->expectedPc) {
    fprintf(stderr,
      "%s: expected PC=%04X, got PC=%04X (values=%X,%X,%X)\n",
      testCase->name,
      testCase->expectedPc,
      PC,
      testCase->values[0],
      testCase->values[1],
      testCase->values[2]);
    return 1;
  }

  printf("%s: ok (PC=%04X)\n", testCase->name, PC);
  return 0;
}

int main(void) {
  static const BitRepeatCase cases[] = {
    { "repeated-test-fails-when-later-nibbles-fail", {1, 0, 0}, 0x0002 },
    { "repeated-test-passes-when-all-nibbles-match", {1, 1, 1}, 0x0003 },
    { "repeated-test-respects-zero-bits-too", {0, 0, 0}, 0x0002 }
  };

  int failed = 0;

  for(size_t i = 0; i < sizeof(cases) / sizeof(cases[0]); i++)
    failed |= runCase(&cases[i]);

  if(failed) return 1;

  printf("bitrepeat validation passed\n");
  return 0;
}
