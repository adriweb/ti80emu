CFLAGS=`pkg-config --cflags gtk+-2.0 ticables2` -std=c99 -Wall -DGTK_DISABLE_DEPRECATED -DTIEMU_LINK
LDFLAGS=`pkg-config --libs gtk+-2.0 ticables2`

all: ti80emu
ti80emu: main.o cpu.o memory.o calc.o debugger.o
	gcc -o ti80emu *.o $(LDFLAGS)
main.o: main.c shared.h
	gcc -c main.c $(CFLAGS)
cpu.o: cpu.c shared.h link.h
	gcc -c cpu.c $(CFLAGS)
memory.o: memory.c shared.h
	gcc -c memory.c $(CFLAGS)
calc.o: calc.c shared.h
	gcc -c calc.c $(CFLAGS)
debugger.o: debugger.c shared.h
	gcc -c debugger.c $(CFLAGS)
clean:
	rm *.o ti80emu
