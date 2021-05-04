.include <name.ini>

USE_FREENIT = YES
SERVICE != echo ${app_name}front
REGGAE_PATH :=/usr/local/share/reggae

.include <${REGGAE_PATH}/mk/service.mk>
