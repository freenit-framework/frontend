.include <name.ini>

USE_FREENIT = YES
DEVEL_MODE = YES
SERVICE != echo ${app_name}
REGGAE_PATH := /usr/local/share/reggae

.include <${REGGAE_PATH}/mk/service.mk>

lib: up
	@sudo cbsd jexec jname=${SERVICE} user=devel /usr/src/bin/build.sh

release: lib
	@sudo cbsd jexec jname=${SERVICE} user=devel /usr/src/bin/release.sh

doc: up
	@sudo cbsd jexec jname=${SERVICE} user=devel /usr/src/bin/doc.sh

doc_build: up
	@sudo cbsd jexec jname=${SERVICE} user=devel /usr/src/bin/doc-build.sh

doc_publish: doc_build
.if !defined(server)
	@echo "Usage: make publish server=<server> domain=<domain>"
	@fail
.endif
.if !defined(domain)
	@echo "Usage: make publish server=<server> domain=<domain>"
	@fail
.endif
	@rsync -avc --progress --delete-after styleguide/ deploy@${server}:/usr/cbsd/jails-data/nginx-data/usr/local/www/${domain}/
