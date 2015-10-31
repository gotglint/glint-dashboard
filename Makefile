VERSION := $(shell git describe --tags)
DIST_DIRS := find * -type d -exec

build: bootstrap
	go build -o glint -ldflags "-X main.version=${VERSION}" main.go

install: build
	install -d ${DESTDIR}/usr/local/bin/
	install -m 755 ./glint ${DESTDIR}/usr/local/bin/glint

test:
	go test . ./cmd ./gb

clean:
	rm -f ./glint.test
	rm -f ./glint

bootstrap:
	go get -u github.com/ivpusic/rerun
	go get -u github.com/mitchellh/gox
	go get -u github.com/gin-gonic/gin
	go get -u github.com/gin-gonic/contrib/ginrus
	go get -u github.com/gin-gonic/contrib/static
	go get -u github.com/gorilla/websocket
	go get -u github.com/Sirupsen/logrus

build-all:
	gox -verbose \
	-ldflags "-X main.version=${VERSION}" \
	-os="linux darwin windows " \
	-arch="amd64 386" \
	-output="dist/{{.OS}}-{{.Arch}}/{{.Dir}}" .

dist: build-all
	cd dist && \
	$(DIST_DIRS) cp ../LICENSE.txt {} \; && \
	$(DIST_DIRS) cp ../README.md {} \; && \
	$(DIST_DIRS) zip -r glide-{}.zip {} \; && \
	cd ..

.PHONY: build test install clean bootstrap build-all dist
