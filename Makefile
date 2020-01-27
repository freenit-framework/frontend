.include <name.ini>

SERVICE != echo ${app_name}
REGGAE_PATH := /usr/local/share/reggae
DEVEL_MODE = YES

lib:
	@sudo cbsd jexec jname=${SERVICE} user=devel cmd="/usr/src/bin/build.sh"

.include <${REGGAE_PATH}/mk/service.mk>
