#include "shared.h"

static GtkWidget *w = NULL, *da;
static GdkPixbuf *screen;
static GtkWidget *meu, *mer, *mec, *mep;
//static GtkWidget *tbu, *tbr, *tbc, *tbp;

gchar *stateFile = NULL;
int changed = 0;

uint8_t breakpoint[0x10000]; uint16_t overBreakpoint = 0xFFFF;

#define SCALE 3
#define WIDTH (64*SCALE)
#define HEIGHT (48*SCALE)

gboolean reset() {
	key[7][5] = 0;

	// Reset LCD
	LCD.on = 0;
	LCD.word8 = LCD.countY = LCD.up = 1;
	LCD.test = 0;
	LCD.opa2 = LCD.opa1 = 0;
	LCD.y = LCD.z = LCD.x = 0;
	// T6B79 data sheet does not specify reset-state contrast

	PC = 0x0000;
	reg4w(0x10E, 0);
	reg[0x10F>>1] &= 0xBF; // TODO: CHECK IF OTHER (10F) BITS ARE ALSO CLEARED
	// TODO: CHECK IF ANYTHING ELSE FOR CPU

	return FALSE;
}
void powerCycle() {key[7][5] = 1; g_timeout_add(1000, reset, NULL);}

void hardReset() {
	reset();
	reg4w(0x10F, 0); // TODO: CHECK
	reg8w(0x140, ~reg8r(0x140)); reg8w(0x142, ~reg8r(0x142));
	// TODO: CHECK WHAT ELSE NEEDS TO CHANGE WHEN STUCK OFF TO ENSURE IT REBOOTS
}

static gboolean redraw() {
	int rs = gdk_pixbuf_get_rowstride(screen);
	guchar *p = gdk_pixbuf_get_pixels(screen);
	int contrast = LCD.contrast - 4 * LCD.opa2;
	uint8_t low = 0xBD - 3 * contrast;
	uint8_t high = 0x13F - (contrast < 0x10 ? 0x40 : contrast << 2);
	// TODO: FIX TEST MODES 4 & 6 (GET VERY DARK FIRST & THEN FADE TO BLANK)
	if(LCD.test == 4 || LCD.test == 6) {low = high = 0xFF; LCD.contrast = 0x3F;}
	if(LCD.test == 5 || LCD.test == 7) {low = high = 0x00; LCD.contrast = 0x3F;}
	if(!LCD.notSTB || !LCD.on) low = high = 0xAA;
	for(int y = 0; y < 48; y++, p += SCALE*rs)
		for(int x = 0; x < 64; x++)
			for(int v = 0; v < SCALE; v++)
				for(int u = x * SCALE; u < x * SCALE + SCALE; u++) {
					p[v*rs+u*4+0] = p[v*rs+u*4+1] = p[v*rs+u*4+2] =
						LCD.image[(y + LCD.z) % 48][x] ? low : high;
					p[v*rs+u*4+3] = 0x80; // TODO: DETERMINE ACTUAL AMOUNT OF GHOSTING
				}
	gdk_draw_pixbuf(da->window, NULL, screen, 0, 0, 0, 0, -1, -1,
	 GDK_RGB_DITHER_NONE, 0, 0);
	return TRUE;
}

static gboolean buttonEvent(GtkWidget *da, GdkEventButton *e) {return FALSE;}

static void save();
static int askSave() {
	int result = 0;
	if(changed) {
		GtkWidget *as = gtk_message_dialog_new(GTK_WINDOW(w),
		 GTK_DIALOG_DESTROY_WITH_PARENT, GTK_MESSAGE_WARNING, GTK_BUTTONS_NONE,
		 "Save the state to \"%s\" before closing?", stateFile);
		gtk_message_dialog_format_secondary_text(GTK_MESSAGE_DIALOG(as),
		 "If you do not save, any new changes will be permanently lost.");
		gtk_dialog_add_buttons(GTK_DIALOG(as),
		 "Close _without Saving", GTK_RESPONSE_NO,
		 GTK_STOCK_CANCEL, GTK_RESPONSE_CANCEL,
		 GTK_STOCK_SAVE, GTK_RESPONSE_YES, NULL);
		gtk_dialog_set_default_response(GTK_DIALOG(as), GTK_RESPONSE_YES);
		switch(gtk_dialog_run(GTK_DIALOG(as))) {
			case GTK_RESPONSE_YES: save(); break;
			case GTK_RESPONSE_CANCEL:
			case GTK_RESPONSE_DELETE_EVENT: result = 1;
		}
		gtk_widget_destroy(as);
	}
	return result;
}
void reload() {
	if(changed) {
		GtkWidget *ar = gtk_message_dialog_new(GTK_WINDOW(w),
		 GTK_DIALOG_DESTROY_WITH_PARENT, GTK_MESSAGE_WARNING, GTK_BUTTONS_NONE,
		 "TODO: FIX reload() MESSAGE");
		//gtk_message_dialog_format_secondary_text(GTK_MESSAGE_DIALOG(ar),
		// "If you do not save, any new changes will be permanently lost.");
		gtk_dialog_add_buttons(GTK_DIALOG(ar),
		 GTK_STOCK_CANCEL, GTK_RESPONSE_CANCEL,
		 GTK_STOCK_REVERT_TO_SAVED, GTK_RESPONSE_YES, NULL);
		gtk_dialog_set_default_response(GTK_DIALOG(ar), GTK_RESPONSE_YES);
		switch(gtk_dialog_run(GTK_DIALOG(ar))) {
			case GTK_RESPONSE_YES: break;
			case GTK_RESPONSE_CANCEL:
			case GTK_RESPONSE_DELETE_EVENT: return;
		}
		gtk_widget_destroy(ar);
	}
	if(stateFile == NULL) reset();
	else {
		FILE *f = fopen(stateFile, "rb");
		for(int a = 0x5000; a < 0x7000; a++) pokeB(a, fgetc(f));
		for(int i = 0x00; i < 0x100; i++) reg[i] = fgetc(f);
		int c = fgetc(f);
		if(feof(f)) {
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
			PC = 0x2B2F; // END OF link-backup.80z
		} else {
			ungetc(c, f);
			reg4w(0x10F, reg[0x10F>>1] >> 4);
			PC = (reg[0xFE] << 8) | reg[0xFF];
			for(int i = 0; i < 8; i++) {
				stack[i] = fgetc(f) << 8; stack[i] |= fgetc(f);
			}
			fread(&LCD, sizeof(LCD), 1, f);
			fclose(f);
		}
	}
	changed = 0;
}
static void saveAs();
// TODO: MAKE IT POSSIBLE TO OPTIONALLY SAVE A BACKUP WHICH CAN BE UPLOADED TO THE ACTUAL CALCULATOR (PROBABLY INCLUDING WAITING FOR SP=0)
static void save() {
	if(stateFile == NULL) return saveAs();
	FILE *f = fopen(stateFile, "wb");
	for(int a = 0x5000; a < 0x7000; a++) fputc(byte(a), f);
	for(int i = 0x00; i < 0xFE; i++) fputc(reg[i], f);
	fputc(PC>>8, f); fputc(PC, f);
	for(int i = 0; i < 8; i++) {fputc(stack[i]>>8, f); fputc(stack[i], f);}
	fwrite(&LCD, sizeof(LCD), 1, f);
	fclose(f);
	changed = 0;
}
static void open() {
	if(askSave()) return;
	GtkWidget *fc = gtk_file_chooser_dialog_new("Load State",
	 GTK_WINDOW(w), GTK_FILE_CHOOSER_ACTION_OPEN, GTK_STOCK_CANCEL,
	 GTK_RESPONSE_CANCEL, GTK_STOCK_OPEN, GTK_RESPONSE_ACCEPT, NULL);
	if(stateFile != NULL)
		gtk_file_chooser_set_filename(GTK_FILE_CHOOSER(fc), stateFile);
	if(gtk_dialog_run(GTK_DIALOG(fc)) == GTK_RESPONSE_ACCEPT) {
		if(stateFile != NULL) g_free(stateFile);
		stateFile = gtk_file_chooser_get_filename(GTK_FILE_CHOOSER(fc));
		changed = 0;
		reload();
	}
	gtk_widget_destroy(fc);
}
static void saveAs() {
	GtkWidget *fc = gtk_file_chooser_dialog_new("Save State",
	 GTK_WINDOW(w), GTK_FILE_CHOOSER_ACTION_SAVE, GTK_STOCK_CANCEL,
	 GTK_RESPONSE_CANCEL, GTK_STOCK_SAVE, GTK_RESPONSE_ACCEPT, NULL);
	gtk_file_chooser_set_do_overwrite_confirmation(GTK_FILE_CHOOSER(fc), TRUE);
	if(stateFile != NULL)
		gtk_file_chooser_set_filename(GTK_FILE_CHOOSER(fc), stateFile);
	if(gtk_dialog_run(GTK_DIALOG(fc)) == GTK_RESPONSE_ACCEPT) {
		if(stateFile != NULL) g_free(stateFile);
		stateFile = gtk_file_chooser_get_filename(GTK_FILE_CHOOSER(fc));
		save();
	}
	gtk_widget_destroy(fc);
}
static void quit() {
	if(!askSave()) {
#ifdef TIEMU_LINK
		linkClose();
#endif
		gtk_main_quit();
	}
}

void clipOwnerChange(GtkClipboard *c) {}
static void copy() {}
static void paste() {}

static gboolean keyEvent(GtkWidget *da, GdkEventKey *e) {
	int pressed = e->type == GDK_KEY_PRESS;
	switch(e->keyval) {
		case GDK_KEY_Delete: case GDK_KEY_KP_Delete: key[0][6] = pressed; break;
		case GDK_KEY_Caps_Lock: case GDK_KEY_ISO_Left_Tab: key[0][5]=pressed;break;
		case GDK_KEY_asciitilde: key[0][4] = pressed; break;
		case GDK_KEY_ampersand: key[0][3] = pressed; break;
		case GDK_KEY_backslash: onKey = pressed; reg4w(0x109, reg4r(0x109)); break;
		case GDK_KEY_grave: key[1][6] = pressed; break;
		case GDK_KEY_F1: key[1][5] = pressed; break;
		case GDK_KEY_F2: key[1][4] = pressed; break;
		case GDK_KEY_F3: key[1][3] = pressed; break;
		case GDK_KEY_F4: key[1][2] = pressed; break;
		case GDK_KEY_BackSpace: key[1][1] = pressed; break;
		case GDK_KEY_Control_L: case GDK_KEY_Control_R: key[2][6] = pressed; break;
		case GDK_KEY_semicolon: key[2][5] = pressed; break;
		case GDK_KEY_Insert: key[2][4] = pressed; break;
		case GDK_KEY_Home: key[2][3] = pressed; break;
		case GDK_KEY_Page_Up: key[2][2] = pressed; break;
		case GDK_KEY_asciicircum: key[2][1] = pressed; break;
		case GDK_KEY_exclam: key[3][6] = pressed; break;
		case GDK_KEY_apostrophe: key[3][5] = pressed; break;
		case GDK_KEY_comma: key[3][4] = pressed; break;
		case GDK_KEY_parenleft: case GDK_KEY_bracketleft:key[3][3] = pressed;break;
		case GDK_KEY_parenright: case GDK_KEY_bracketright:key[3][2]=pressed;break;
		case GDK_KEY_slash: case GDK_KEY_KP_Divide: key[3][1] = pressed; break;
		case GDK_KEY_at: key[4][6] = pressed; break;
		case GDK_KEY_less: key[4][5] = pressed; break;
		case GDK_KEY_7: case GDK_KEY_KP_7: key[4][4] = pressed; break;
		case GDK_KEY_8: case GDK_KEY_KP_8: key[4][3] = pressed; break;
		case GDK_KEY_9: case GDK_KEY_KP_9: key[4][2] = pressed; break;
		case GDK_KEY_asterisk: case GDK_KEY_KP_Multiply: key[4][1] = pressed;break;
		case GDK_KEY_Up: case GDK_KEY_KP_Up: key[4][0] = pressed; break;
		case GDK_KEY_numbersign: key[5][6] = pressed; break;
		case GDK_KEY_greater: key[5][5] = pressed; break;
		case GDK_KEY_4: case GDK_KEY_KP_4: key[5][4] = pressed; break;
		case GDK_KEY_5: case GDK_KEY_KP_5: key[5][3] = pressed; break;
		case GDK_KEY_6: case GDK_KEY_KP_6: key[5][2] = pressed; break;
		case GDK_KEY_minus: case GDK_KEY_KP_Subtract: key[5][1] = pressed; break;
		case GDK_KEY_Right: case GDK_KEY_KP_Right: key[5][0] = pressed; break;
		case GDK_KEY_dollar: key[6][6] = pressed; break;
		case GDK_KEY_Tab: key[6][5] = pressed; break;
		case GDK_KEY_1: case GDK_KEY_KP_1: key[6][4] = pressed; break;
		case GDK_KEY_2: case GDK_KEY_KP_2: key[6][3] = pressed; break;
		case GDK_KEY_3: case GDK_KEY_KP_3: key[6][2] = pressed; break;
		case GDK_KEY_plus: case GDK_KEY_KP_Add: key[6][1] = pressed; break;
		case GDK_KEY_Left: case GDK_KEY_KP_Left: key[6][0] = pressed; break;
		case GDK_KEY_percent: key[7][6] = pressed; break;
		case GDK_KEY_0: case GDK_KEY_KP_0: key[7][4] = pressed; break;
		case GDK_KEY_period: case GDK_KEY_KP_Decimal: key[7][3] = pressed; break;
		case GDK_KEY_underscore: key[7][2] = pressed; break;
		case GDK_KEY_Return: case GDK_KEY_KP_Enter: key[7][1] = pressed; break;
		case GDK_KEY_Down: case GDK_KEY_KP_Down: key[7][0] = pressed; break;
#define MOD_2ND reg4w(0x169, reg4r(0x169) & 0xC);\
	reg4w(0x1AE, (reg4r(0x1AE) & 0xD) | (pressed << 1))
		case GDK_KEY_bar:
			MOD_2ND; onKey = pressed; reg4w(0x109, reg4r(0x109)); break;
		case GDK_KEY_KP_Insert: MOD_2ND; key[0][6] = pressed; break;
		case GDK_KEY_Escape: MOD_2ND; key[1][6] = pressed; break;
		case GDK_KEY_Greek_PI: case GDK_KEY_Greek_pi:
			MOD_2ND; key[2][1] = pressed; break;
		case GDK_KEY_braceleft: MOD_2ND; key[3][3] = pressed; break;
		case GDK_KEY_braceright: MOD_2ND; key[3][2] = pressed; break;
		case GDK_KEY_colon: MOD_2ND; key[7][3] = pressed; break;
#define MOD_ALPHA reg4w(0x1AE, reg4r(0x1AE) & 0xD);\
	reg4w(0x169, (reg4r(0x169) & 0xE) | pressed | ((reg4r(0x169) >> 1) & 0x1))
		case GDK_KEY_A: case GDK_KEY_a: MOD_ALPHA; key[1][5] = pressed; break;
		case GDK_KEY_B: case GDK_KEY_b: MOD_ALPHA; key[1][4] = pressed; break;
		case GDK_KEY_C: case GDK_KEY_c: MOD_ALPHA; key[1][3] = pressed; break;
		case GDK_KEY_D: case GDK_KEY_d: MOD_ALPHA; key[2][5] = pressed; break;
		case GDK_KEY_E: case GDK_KEY_e: MOD_ALPHA; key[2][4] = pressed; break;
		case GDK_KEY_F: case GDK_KEY_f: MOD_ALPHA; key[2][3] = pressed; break;
		case GDK_KEY_G: case GDK_KEY_g: MOD_ALPHA; key[2][2] = pressed; break;
		case GDK_KEY_H: case GDK_KEY_h: MOD_ALPHA; key[2][1] = pressed; break;
		case GDK_KEY_I: case GDK_KEY_i: MOD_ALPHA; key[3][5] = pressed; break;
		case GDK_KEY_J: case GDK_KEY_j: MOD_ALPHA; key[3][4] = pressed; break;
		case GDK_KEY_K: case GDK_KEY_k: MOD_ALPHA; key[3][3] = pressed; break;
		case GDK_KEY_L: case GDK_KEY_l: MOD_ALPHA; key[3][2] = pressed; break;
		case GDK_KEY_M: case GDK_KEY_m: MOD_ALPHA; key[3][1] = pressed; break;
		case GDK_KEY_N: case GDK_KEY_n: MOD_ALPHA; key[4][5] = pressed; break;
		case GDK_KEY_O: case GDK_KEY_o: MOD_ALPHA; key[4][4] = pressed; break;
		case GDK_KEY_P: case GDK_KEY_p: MOD_ALPHA; key[4][3] = pressed; break;
		case GDK_KEY_Q: case GDK_KEY_q: MOD_ALPHA; key[4][2] = pressed; break;
		case GDK_KEY_R: case GDK_KEY_r: MOD_ALPHA; key[4][1] = pressed; break;
		case GDK_KEY_S: case GDK_KEY_s: MOD_ALPHA; key[5][5] = pressed; break;
		case GDK_KEY_T: case GDK_KEY_t: MOD_ALPHA; key[5][4] = pressed; break;
		case GDK_KEY_U: case GDK_KEY_u: MOD_ALPHA; key[5][3] = pressed; break;
		case GDK_KEY_V: case GDK_KEY_v: MOD_ALPHA; key[5][2] = pressed; break;
		case GDK_KEY_W: case GDK_KEY_w: MOD_ALPHA; key[5][1] = pressed; break;
		case GDK_KEY_X: case GDK_KEY_x: MOD_ALPHA; key[6][5] = pressed; break;
		case GDK_KEY_Y: case GDK_KEY_y: MOD_ALPHA; key[6][4] = pressed; break;
		case GDK_KEY_Z: case GDK_KEY_z: MOD_ALPHA; key[6][3] = pressed; break;
		case GDK_KEY_equal: case GDK_KEY_Greek_THETA: case GDK_KEY_Greek_theta:
			MOD_ALPHA; key[6][2] = pressed; break;
		case GDK_KEY_quotedbl: MOD_ALPHA; key[6][1] = pressed; break;
		case GDK_KEY_space: MOD_ALPHA; key[7][4] = pressed; break;
		case GDK_KEY_question: MOD_ALPHA; key[7][2] = pressed; break;
		default: return FALSE;
	}
	if(stopped) debugRedraw();
	return TRUE;
}

// TODO: CHECK
const long timing[8] = {5040, 2100, 1575, 1050, 350, 252, 180, 105};
// TODO: FIX TIMING & TIMERS
static gboolean run() {
	static int variableTimer = 0, fixedTimer = 0;
	static long time = 0;
	gint64 beginning = g_get_monotonic_time();
	do {
		int cycles = step();
		time += timing[reg[0x10D>>1]>>5] * cycles;
		if(breakpoint[PC]) {stopped = 1; debugWindow();debug("Reached breakpoint");}
		if(PC == overBreakpoint) {stopped =1;debugWindow();overBreakpoint = 0xFFFF;}
		if(!(reg[0x10D>>1] & 0x10) && !(reg[0x10F>>1] & 0xC0)) {
			if((fixedTimer += cycles * 10) >= 131072*2) {
				fixedTimer -= 131072*2;
				reg[0x108>>1] = (reg[0x108>>1] & 0xF0) | ((reg[0x108>>1]+1) & 0xF);
			}
			if(reg[0x10F>>1] & 0x10) {
				int stride = 40960 >> (((reg[0x10B>>1]>>4) & 3) << 2);
				if((variableTimer += cycles * stride) >= 131072*2) {
					variableTimer -= 131072*2;
					if(--reg[0x11A>>1] == 0xFF) {
						reg[0x11A>>1] = reg[0x7A]; reg[0x109>>1] |= 0x20;
#ifdef TIEMU_LINK
						linkReset();
#endif
					}
				}
			} else variableTimer = 0;
		}
	} while(!stopped && time < 450000*4);
	time -= 450000*4;
	redraw(); debugRedraw();
	gint64 delta = 1000 / 35 - (g_get_monotonic_time() - beginning) / 1000;
	if(!stopped) g_timeout_add(delta < 0 ? 0 : delta, run, NULL);
	return FALSE;
}

void start() {
	if(!stopped) return;
	stopped = 0;
	g_timeout_add(1000 / 35, run, NULL);
}
void userBreak() {stopped = 1; debugWindow(); debug("User-initiated break");}
void toggleBreakpoint() {breakpoint[PC] = !breakpoint[PC];}
void singleStep() {
	debug(""); step(); stopped = 1; debugWindow();
	redraw(); debugRedraw();
}
void stepOver() {overBreakpoint = PC + 2; start();}

GtkWidget *calcWindow() {
	w = gtk_window_new(GTK_WINDOW_TOPLEVEL);
	gtk_window_set_title(GTK_WINDOW(w), "TI-80 Emulator");
	gtk_window_set_default_size(GTK_WINDOW(w), WIDTH, HEIGHT);

	GtkAccelGroup *ag = gtk_accel_group_new();
	GtkWidget *mb = gtk_menu_bar_new(), *mi, *m;
	mi = gtk_menu_item_new_with_mnemonic("_File");
	m = gtk_menu_new();
		GtkWidget *mfo = gtk_image_menu_item_new_from_stock(GTK_STOCK_OPEN, ag);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), mfo);
		GtkWidget *mfs = gtk_image_menu_item_new_from_stock(GTK_STOCK_SAVE, ag);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), mfs);
		gtk_widget_add_accelerator(mfs, "activate", ag, GDK_KEY_F12, 0, 0);
		GtkWidget *mfsa = gtk_image_menu_item_new_from_stock(GTK_STOCK_SAVE_AS, ag);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), mfsa);
		GtkWidget *mfr =
			gtk_image_menu_item_new_from_stock(GTK_STOCK_REVERT_TO_SAVED, ag);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), mfr);
		gtk_widget_add_accelerator(mfr, "activate", ag, GDK_KEY_F11, 0, 0);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), gtk_separator_menu_item_new());
		GtkWidget *mfq = gtk_image_menu_item_new_from_stock(GTK_STOCK_QUIT, ag);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), mfq);
	gtk_menu_item_set_submenu(GTK_MENU_ITEM(mi), m);
	gtk_menu_shell_append(GTK_MENU_SHELL(mb), mi);
	mi = gtk_menu_item_new_with_mnemonic("_Edit");
	m = gtk_menu_new();
		meu = gtk_image_menu_item_new_from_stock(GTK_STOCK_UNDO, ag);
		gtk_widget_add_accelerator(meu, "activate", ag, GDK_KEY_Z, GDK_CONTROL_MASK,
		 GTK_ACCEL_VISIBLE);
		gtk_widget_set_sensitive(meu, FALSE);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), meu);
		mer = gtk_image_menu_item_new_from_stock(GTK_STOCK_REDO, ag);
		gtk_widget_add_accelerator(mer, "activate", ag, GDK_KEY_Z,
		 GDK_CONTROL_MASK | GDK_SHIFT_MASK, GTK_ACCEL_VISIBLE);
		gtk_widget_set_sensitive(mer, FALSE);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), mer);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), gtk_separator_menu_item_new());
		mec = gtk_image_menu_item_new_from_stock(GTK_STOCK_COPY, ag);
		gtk_widget_set_sensitive(mec, FALSE);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), mec);
		mep = gtk_image_menu_item_new_from_stock(GTK_STOCK_PASTE, ag);
		gtk_widget_set_sensitive(mep, FALSE);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), mep);
	gtk_menu_item_set_submenu(GTK_MENU_ITEM(mi), m);
	gtk_menu_shell_append(GTK_MENU_SHELL(mb), mi);
	mi = gtk_menu_item_new_with_mnemonic("_Debug");
	m = gtk_menu_new();
		GtkWidget *mdd = gtk_menu_item_new_with_mnemonic("Show _debugger");
		gtk_menu_shell_append(GTK_MENU_SHELL(m), mdd);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), gtk_separator_menu_item_new());
		GtkWidget *mdp = gtk_menu_item_new_with_mnemonic("Toggle _power switch");
		gtk_menu_shell_append(GTK_MENU_SHELL(m), mdp);
		GtkWidget *mdh = gtk_menu_item_new_with_mnemonic("_Hard reset");
		gtk_menu_shell_append(GTK_MENU_SHELL(m), mdh);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), gtk_separator_menu_item_new());
		GtkWidget *mdr = gtk_menu_item_new_with_mnemonic("_Run");
		gtk_widget_add_accelerator(mdr, "activate", ag, GDK_KEY_F5, 0,
		 GTK_ACCEL_VISIBLE);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), mdr);
		GtkWidget *mdb = gtk_menu_item_new_with_mnemonic("_Break");
		gtk_widget_add_accelerator(mdb, "activate", ag, GDK_KEY_F6, 0,
		 GTK_ACCEL_VISIBLE);
		gtk_widget_add_accelerator(mdb, "activate", ag, GDK_KEY_Break, 0, 0);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), mdb);
		GtkWidget *mdt = gtk_menu_item_new_with_mnemonic("_Toggle breakpoint");
		gtk_widget_add_accelerator(mdt, "activate", ag, GDK_KEY_F9, 0,
		 GTK_ACCEL_VISIBLE);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), mdt);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), gtk_separator_menu_item_new());
		GtkWidget *mds = gtk_menu_item_new_with_mnemonic("_Step");
		gtk_widget_add_accelerator(mds, "activate", ag, GDK_KEY_F8, 0,
		 GTK_ACCEL_VISIBLE);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), mds);
		GtkWidget *mdo = gtk_menu_item_new_with_mnemonic("Step _over");
		gtk_widget_add_accelerator(mdo, "activate", ag, GDK_KEY_F7, 0,
		 GTK_ACCEL_VISIBLE);
		gtk_menu_shell_append(GTK_MENU_SHELL(m), mdo);
	gtk_menu_item_set_submenu(GTK_MENU_ITEM(mi), m);
	gtk_menu_shell_append(GTK_MENU_SHELL(mb), mi);
	gtk_window_add_accel_group(GTK_WINDOW(w), ag);

	/*GtkWidget *tb = gtk_toolbar_new();
	GtkWidget *tbs = GTK_WIDGET(gtk_tool_button_new_from_stock(GTK_STOCK_SAVE));
	gtk_toolbar_insert(GTK_TOOLBAR(tb), GTK_TOOL_ITEM(tbs), 0);
	gtk_toolbar_insert(GTK_TOOLBAR(tb), gtk_separator_tool_item_new(), 1);
	tbu = GTK_WIDGET(gtk_tool_button_new_from_stock(GTK_STOCK_UNDO));
	gtk_widget_set_sensitive(tbu, FALSE);
	gtk_toolbar_insert(GTK_TOOLBAR(tb), GTK_TOOL_ITEM(tbu), 2);
	tbr = GTK_WIDGET(gtk_tool_button_new_from_stock(GTK_STOCK_REDO));
	gtk_widget_set_sensitive(tbr, FALSE);
	gtk_toolbar_insert(GTK_TOOLBAR(tb), GTK_TOOL_ITEM(tbr), 3);
	gtk_toolbar_insert(GTK_TOOLBAR(tb), gtk_separator_tool_item_new(), 4);
	tbx = GTK_WIDGET(gtk_tool_button_new_from_stock(GTK_STOCK_CUT));
	gtk_widget_set_sensitive(tbx, FALSE);
	gtk_toolbar_insert(GTK_TOOLBAR(tb), GTK_TOOL_ITEM(tbx), 5);
	tbc = GTK_WIDGET(gtk_tool_button_new_from_stock(GTK_STOCK_COPY));
	gtk_widget_set_sensitive(tbc, FALSE);
	gtk_toolbar_insert(GTK_TOOLBAR(tb), GTK_TOOL_ITEM(tbc), 6);
	tbp = GTK_WIDGET(gtk_tool_button_new_from_stock(GTK_STOCK_PASTE));
	gtk_widget_set_sensitive(tbp, FALSE);
	gtk_toolbar_insert(GTK_TOOLBAR(tb), GTK_TOOL_ITEM(tbp), 7);*/

	da = gtk_drawing_area_new();
	gtk_widget_set_size_request(da, WIDTH, HEIGHT);
	gtk_widget_add_events(da, GDK_BUTTON1_MOTION_MASK | GDK_BUTTON_PRESS_MASK |
	 GDK_BUTTON_RELEASE_MASK | GDK_KEY_PRESS_MASK | GDK_KEY_RELEASE_MASK);
	g_object_set(G_OBJECT(da), "can-focus", TRUE, NULL);

	screen = gdk_pixbuf_new(GDK_COLORSPACE_RGB, TRUE, 8, WIDTH, HEIGHT);

	GtkWidget *vb = gtk_vbox_new(FALSE, 0);
	gtk_box_pack_start(GTK_BOX(vb), mb, FALSE, FALSE, 0);
	gtk_box_pack_start(GTK_BOX(vb), da, TRUE, TRUE, 0);
	gtk_container_add(GTK_CONTAINER(w), vb);

	g_signal_connect(G_OBJECT(w), "delete_event", G_CALLBACK(quit), NULL);

	g_signal_connect(G_OBJECT(mfo), "activate", G_CALLBACK(open), NULL);
	//g_signal_connect(G_OBJECT(tbo), "clicked", G_CALLBACK(open), NULL);
	g_signal_connect(G_OBJECT(mfs), "activate", G_CALLBACK(save), NULL);
	//g_signal_connect(G_OBJECT(tbs), "clicked", G_CALLBACK(save), NULL);
	g_signal_connect(G_OBJECT(mfsa), "activate", G_CALLBACK(saveAs), NULL);
	g_signal_connect(G_OBJECT(mfr), "activate", G_CALLBACK(reload), NULL);
	g_signal_connect(G_OBJECT(mfq), "activate", G_CALLBACK(quit), NULL);
	//g_signal_connect(G_OBJECT(meu), "activate", G_CALLBACK(undo), NULL);
	//g_signal_connect(G_OBJECT(tbu), "clicked", G_CALLBACK(undo), NULL);
	//g_signal_connect(G_OBJECT(mer), "activate", G_CALLBACK(redo), NULL);
	//g_signal_connect(G_OBJECT(tbr), "clicked", G_CALLBACK(redo), NULL);
	g_signal_connect(G_OBJECT(mec), "activate", G_CALLBACK(copy), NULL);
	//g_signal_connect(G_OBJECT(tbc), "clicked", G_CALLBACK(copy), NULL);
	g_signal_connect(G_OBJECT(mep), "activate", G_CALLBACK(paste), NULL);
	//g_signal_connect(G_OBJECT(tbp), "clicked", G_CALLBACK(paste), NULL);
	g_signal_connect(G_OBJECT(mdd), "activate", G_CALLBACK(debugWindow), NULL);
	g_signal_connect(G_OBJECT(mdp), "activate", G_CALLBACK(powerCycle), NULL);
	g_signal_connect(G_OBJECT(mdh), "activate", G_CALLBACK(hardReset), NULL);
	g_signal_connect(G_OBJECT(mdr), "activate", G_CALLBACK(start), NULL);
	g_signal_connect(G_OBJECT(mdb), "activate", G_CALLBACK(userBreak), NULL);
	g_signal_connect(G_OBJECT(mdt), "activate", G_CALLBACK(toggleBreakpoint),
	 NULL);
	g_signal_connect(G_OBJECT(mds), "activate", G_CALLBACK(singleStep), NULL);
	g_signal_connect(G_OBJECT(mdo), "activate", G_CALLBACK(stepOver), NULL);

	g_signal_connect(G_OBJECT(da), "expose_event", G_CALLBACK(redraw), NULL);
	g_signal_connect(G_OBJECT(da), "button_press_event", G_CALLBACK(buttonEvent),
	 NULL);
	g_signal_connect(G_OBJECT(da), "button_release_event",
	 G_CALLBACK(buttonEvent), NULL);
	g_signal_connect(G_OBJECT(da), "key_press_event", G_CALLBACK(keyEvent), NULL);
	g_signal_connect(G_OBJECT(da), "key_release_event", G_CALLBACK(keyEvent),
	 NULL);

	g_signal_connect(gtk_clipboard_get(GDK_SELECTION_CLIPBOARD), "owner_change",
	 G_CALLBACK(clipOwnerChange), NULL);

	gtk_widget_show_all(w);
	gtk_widget_grab_focus(da);

	reload();
	stopped = 1; start();

	return w;
}
