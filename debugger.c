#include "shared.h"

static const char hex[16] = "0123456789ABCDEF";

int breakOnDebug = 0;

static GtkWidget *w = NULL, *sb, *dis, *reg4[31], *regA, *regI, *regPC;
char status[64] = "";
int sbCID;

void updateStatus() {
	//if(*status) printf("%s\n", status);
	if(w == NULL) return;
	gtk_statusbar_remove_all(GTK_STATUSBAR(sb), sbCID);
	gtk_statusbar_push(GTK_STATUSBAR(sb), sbCID, status);
}

void debug(char *message, ...) {
	va_list args;
	va_start(args, message);
	vsnprintf(status, 64, message, args);
	va_end(args);
	updateStatus();
	if(breakOnDebug) {stopped = 1; debugWindow();}
}
void debugBreak(char *message, ...) {
	va_list args;
	va_start(args, message);
	vsnprintf(status, 64, message, args);
	va_end(args);
	updateStatus();
	stopped = errorStop = 1; debugWindow();
}

gboolean debugRedraw() {
	if(w == NULL) return FALSE;
	gchar s[17] = {hex[reg8r(0x0FF) >> 4], hex[reg4r(0x0FF)], 0, 0};
	gtk_entry_set_text(GTK_ENTRY(regA), s);
	for(int i = 0; i < 3; i++) s[i] = hex[reg4r(0x100 + 2 - i)];
	gtk_entry_set_text(GTK_ENTRY(regI), s);
	for(int i = 0; i < 4; i++) s[i] = hex[(PC >> (4 * (3 - i))) & 0xF];
	s[4] = 0;
	gtk_entry_set_text(GTK_ENTRY(regPC), s);
	s[1] = 0;
	for(int i = 0; i < 31; i++) {
		if(i == 15) continue;
		for(int j = 0; j < 16; j++) s[j] = hex[reg4rd(i * 16 + j)];
		s[16] = 0;
		gtk_entry_set_text(GTK_ENTRY(reg4[i]), s);
	}
	return TRUE;
}

static gboolean deleteWindow() {w = NULL; return FALSE;}

void debugWindow() {
	if(w != NULL) {debugRedraw(); return;}
	w = gtk_window_new(GTK_WINDOW_TOPLEVEL);
	gtk_window_set_title(GTK_WINDOW(w), "TI-80 Debugger");
	gtk_window_set_default_size(GTK_WINDOW(w), 512, 384);

	PangoFontDescription *font =
		pango_font_description_from_string("Courier New 10");

	dis = gtk_tree_view_new();
	gtk_widget_modify_font(dis, font);

	GtkWidget *regs = gtk_vbox_new(FALSE, 0);

	{
		GtkWidget *hb = gtk_hbox_new(FALSE, 0);

		regA = gtk_entry_new();
		gtk_entry_set_has_frame(GTK_ENTRY(regA), FALSE);
		gtk_widget_modify_font(regA, font);
		gtk_entry_set_max_length(GTK_ENTRY(regA), 2);
		gtk_entry_set_width_chars(GTK_ENTRY(regA), 2);
		gtk_box_pack_start(GTK_BOX(hb), regA, FALSE, FALSE, 0);

		regI = gtk_entry_new();
		gtk_entry_set_has_frame(GTK_ENTRY(regI), FALSE);
		gtk_widget_modify_font(regI, font);
		gtk_entry_set_max_length(GTK_ENTRY(regI), 3);
		gtk_entry_set_width_chars(GTK_ENTRY(regI), 3);
		gtk_box_pack_start(GTK_BOX(hb), regI, FALSE, FALSE, 0);

		regPC = gtk_entry_new();
		gtk_entry_set_has_frame(GTK_ENTRY(regPC), FALSE);
		gtk_widget_modify_font(regPC, font);
		gtk_entry_set_max_length(GTK_ENTRY(regPC), 4);
		gtk_entry_set_width_chars(GTK_ENTRY(regPC), 4);
		gtk_box_pack_start(GTK_BOX(hb), regPC, FALSE, FALSE, 0);

		gtk_box_pack_start(GTK_BOX(regs), hb, FALSE, FALSE, 0);
	}

	GtkWidget *sw = gtk_scrolled_window_new(NULL, NULL);
	gtk_scrolled_window_set_policy(GTK_SCROLLED_WINDOW(sw), GTK_POLICY_NEVER,
	 GTK_POLICY_AUTOMATIC);
	{
		GtkWidget *vb = gtk_vbox_new(FALSE, 0);
		for(int i = 0; i < 31; i++) {
			if(i == 15) continue;
			GtkWidget *hb = gtk_hbox_new(FALSE, 0);

			char s[] = {hex[i >> 4], hex[i & 0xF], '0', ':', 0};
			GtkWidget *l = gtk_label_new(s);
			gtk_widget_modify_font(l, font);
			gtk_label_set_text(GTK_LABEL(l), s);
			gtk_box_pack_start(GTK_BOX(hb), l, FALSE, FALSE, 0);

			reg4[i] = gtk_entry_new();
			gtk_entry_set_has_frame(GTK_ENTRY(reg4[i]), FALSE);
			gtk_widget_modify_font(reg4[i], font);
			gtk_entry_set_max_length(GTK_ENTRY(reg4[i]), 16);
			gtk_entry_set_width_chars(GTK_ENTRY(reg4[i]), 16);
			gtk_box_pack_start(GTK_BOX(hb), reg4[i], FALSE, FALSE, 0);

			gtk_box_pack_start(GTK_BOX(vb), hb, FALSE, FALSE, 0);
		}
		gtk_scrolled_window_add_with_viewport(GTK_SCROLLED_WINDOW(sw), vb);
	}
	gtk_box_pack_start(GTK_BOX(regs), sw, TRUE, TRUE, 0);

	pango_font_description_free(font);

	GtkWidget *hb = gtk_hbox_new(FALSE, 0);
	gtk_box_pack_start(GTK_BOX(hb), dis, TRUE, TRUE, 0);
	gtk_box_pack_start(GTK_BOX(hb), regs, FALSE, FALSE, 0);

	sb = gtk_statusbar_new();
	sbCID = gtk_statusbar_get_context_id(GTK_STATUSBAR(sb), "debug");
	updateStatus();

	GtkWidget *vb = gtk_vbox_new(FALSE, 0);
	gtk_box_pack_start(GTK_BOX(vb), hb, TRUE, TRUE, 0);
	gtk_box_pack_start(GTK_BOX(vb), sb, FALSE, FALSE, 0);
	gtk_container_add(GTK_CONTAINER(w), vb);

	debugRedraw();

	g_signal_connect(G_OBJECT(w), "delete_event", G_CALLBACK(deleteWindow), NULL);
	gtk_widget_show_all(w);
}
