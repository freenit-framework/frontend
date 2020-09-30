.include <name.ini>

DEVEL_MODE = YES
SERVICE != echo ${app_name}
REGGAE_PATH := /usr/local/share/reggae

lib:
	@sudo cbsd jexec jname=${SERVICE} user=devel cmd="/usr/src/bin/build.sh"

release: lib
	@sudo cbsd jexec jname=${SERVICE} user=devel cmd="/usr/src/bin/release.sh"

.include <${REGGAE_PATH}/mk/service.mk>
