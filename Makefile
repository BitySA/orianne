.PHONY: build build-watch clean test test-watch

build: node_modules
	npx tsc $(TSC_OPTS)
	cp package* ./dist/

build-watch: TSC_OPTS += -w
build-watch: build

clean:
	rm -rf dist node_modules

node_modules/: package.json package-lock.json
	rm -rf "$@"
	npm install

test: node_modules/
	npx jest $(JEST_OPTS)

test-watch: JEST_OPTS += --watchAll
test-watch: test
