.PHONY: build deploy watch

watch:
	./node_modules/.bin/gulp watch

build:
	./node_modules/.bin/gulp build

commit:
	git commit -A . && git commit -m 'fast commit' && git push;

deploy: build commit
	echo 'deploy'