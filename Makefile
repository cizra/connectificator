SHELL := bash
.ONESHELL:
	.SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:
	MAKEFLAGS += --warn-undefined-variables
	MAKEFLAGS += --no-builtin-rules

JSFILES := $(filter-out concatenated.js,$(wildcard *.js))

all: beta

clean:
	rm -f concatenated.js

.PHONY: clean

concatenated.js: $(JSFILES) connectificator.html style.css
	cat $(JSFILES) > concatenated.js

beta: concatenated.js
	cp connectificator.html style.css concatenated.js /var/www/html/elmo/

release: concatenated.js
	sudo cp connectificator.html style.css concatenated.js /var/www/html/
