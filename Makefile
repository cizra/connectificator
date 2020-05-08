SHELL := bash
.ONESHELL:
	.SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:
	MAKEFLAGS += --warn-undefined-variables
	MAKEFLAGS += --no-builtin-rules

JSFILES := $(filter-out concatenated.js,$(wildcard *.js))
CP := cp connectificator.html style.css concatenated.js

all: beta

clean:
	rm -f concatenated.js

.PHONY: clean

concatenated.js: $(JSFILES)
	cat $(JSFILES) > concatenated.js

beta: concatenated.js connectificator.html style.css
	$(CP) /var/www/html/elmo/

release: concatenated.js connectificator.html style.css
	sudo $(CP) /var/www/html/
