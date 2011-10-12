#include "shared.h"

GtkWidget *w = NULL;

void openROM() {
	GtkWidget *fc = gtk_file_chooser_dialog_new("Load ROM",
	 GTK_WINDOW(w), GTK_FILE_CHOOSER_ACTION_OPEN, GTK_STOCK_CANCEL,
	 GTK_RESPONSE_CANCEL, GTK_STOCK_OPEN, GTK_RESPONSE_ACCEPT, NULL);
	if(gtk_dialog_run(GTK_DIALOG(fc)) == GTK_RESPONSE_ACCEPT) {
		gchar *filename = gtk_file_chooser_get_filename(GTK_FILE_CHOOSER(fc));
		loadROM(filename);
		g_free(filename);
	} else exit(EXIT_FAILURE);
	gtk_widget_destroy(fc);
}

int main(int q, char **Q) {
	gtk_init(&q, &Q);
	g_set_application_name("TI-80 Emulator");
#ifdef TIEMU_LINK
	linkInit();
#endif
	if(q > 1) loadROM(Q[1]); else openROM();
	if(q > 2) stateFile = g_strdup(Q[2]);
	for(int i = 0; i < 7; i++) for(int j = 0; j < 8; j++) key[i][j] = 0;
	w = calcWindow();
	gtk_main();
	return EXIT_SUCCESS;
}
