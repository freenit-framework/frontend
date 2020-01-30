.include <name.ini>

SERVICE != echo ${app_name}
REGGAE_PATH := /usr/local/share/reggae
DEVEL_MODE = YES

lib:
	@sudo cbsd jexec jname=${SERVICE} user=devel cmd="/usr/src/bin/build.sh"

release:
	@sudo cbsd jexec jname=${SERVICE} user=devel cmd="/usr/src/bin/release.sh"

.include <${REGGAE_PATH}/mk/service.mk>
