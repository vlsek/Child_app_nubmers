#!/usr/bin/env bash
# Создаёт ключ подписи для Google Play. Запускать ОДИН РАЗ на своём компьютере (нужна Java: команда keytool).
# Файл krokodil-release.jks и пароли хранить в надёжном месте (менеджер паролей + копия на флешке):
# потеряете ключ — не сможете обновлять приложение в магазине. В репозиторий файл НЕ добавлять.
set -euo pipefail
KS="${1:-krokodil-release.jks}"
ALIAS="${2:-krokodil}"
keytool -genkeypair -v -keystore "$KS" -alias "$ALIAS" -keyalg RSA -keysize 2048 -validity 10000
echo
echo "Готово: $KS (алиас: $ALIAS)."
echo "Для GitHub (Settings → Secrets and variables → Actions → New repository secret) нужны 4 секрета:"
echo "  ANDROID_KEYSTORE_BASE64   = вывод команды:  base64 -w0 $KS   (на Mac: base64 -i $KS)"
echo "  ANDROID_KEYSTORE_PASSWORD = пароль хранилища"
echo "  ANDROID_KEY_ALIAS         = $ALIAS"
echo "  ANDROID_KEY_PASSWORD      = пароль ключа"
