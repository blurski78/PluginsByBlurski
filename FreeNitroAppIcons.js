// ============================================
// 🔓 Free App Icons - Enmity Mobile Plugin
// ============================================

const { Plugin } = require('enmity');
const { Patcher } = require('enmity/patcher');
const { getModule } = require('enmity/metro');
const { React, Toasts } = require('enmity/metro/common');

class FreeAppIcons extends Plugin {
    constructor() {
        super();
        this.name = 'FreeAppIcons';
        this.displayName = '🔓 Free App Icons';
        this.description = 'Unlock all Nitro app icons without the badge';
        this.version = '1.0.0';
        this.author = 'Blurski';
    }

    async start() {
        console.log('[FreeAppIcons] Starting...');

        try {
            await this.patchNitroCheck();
            await this.patchIconUI();
            await this.patchBadge();

            Toasts.open({
                content: '✅ Free App Icons enabled!',
                source: 'FreeAppIcons'
            });

            console.log('[FreeAppIcons] ✅ All patches applied!');
        } catch (error) {
            console.error('[FreeAppIcons] Error:', error);
            Toasts.open({
                content: '❌ FreeAppIcons failed to start',
                source: 'FreeAppIcons'
            });
        }
    }

    stop() {
        Patcher.unpatchAll();
        console.log('[FreeAppIcons] Stopped');
    }

    async patchNitroCheck() {
        try {
            // Patch Nitro subscription check
            const nitroModule = await getModule(
                (m) => m?.getNitroSubscriptionType || m?.isNitroAvailable
            );

            if (nitroModule) {
                Patcher.after(nitroModule, 'getNitroSubscriptionType', (_, args, result) => {
                    if (args && args[0] === 'app_icon') {
                        return 1;
                    }
                    return result;
                });

                Patcher.after(nitroModule, 'isNitroAvailable', (_, args, result) => {
                    if (args && args[0] === 'app_icon') {
                        return true;
                    }
                    return result;
                });

                console.log('[FreeAppIcons] ✅ Nitro check patched');
            }

            // Patch user object
            const userModule = await getModule((m) => m?.getCurrentUser);
            if (userModule) {
                Patcher.after(userModule, 'getCurrentUser', (_, __, user) => {
                    if (user) {
                        user.hasAppIconAccess = true;
                        user.canUseAppIcon = () => true;
                    }
                    return user;
                });
                console.log('[FreeAppIcons] ✅ User object patched');
            }
        } catch (e) {
            console.warn('[FreeAppIcons] Nitro check patch failed:', e);
        }
    }

    async patchIconUI() {
        try {
            // Find app icon picker component
            const iconModule = await getModule(
                (m) => m?.AppIconPicker || m?.AppIconSelector
            );

            if (iconModule) {
                Patcher.before(iconModule, 'default', (_, args) => {
                    if (args && args[0] && args[0].icons) {
                        args[0].icons.forEach(icon => {
                            icon.isLocked = false;
                            icon.requiresNitro = false;
                            icon.locked = false;
                        });
                    }
                });
                console.log('[FreeAppIcons] ✅ Icon UI patched');
            }
        } catch (e) {
            console.warn('[FreeAppIcons] Icon UI patch failed:', e);
        }
    }

    async patchBadge() {
        try {
            // Find Nitro badge component
            const badgeModule = await getModule(
                (m) => m?.NitroBadge || m?.ProfileBadgeNitro
            );

            if (badgeModule) {
                Patcher.before(badgeModule, 'default', (_, args) => {
                    if (args && args[0]) {
                        args[0].hide = true;
                        args[0].show = false;
                    }
                });
                console.log('[FreeAppIcons] ✅ Badge patched');
            }
        } catch (e) {
            console.warn('[FreeAppIcons] Badge patch failed:', e);
        }
    }
}

// ============================================
// ✅ CORRECT EXPORT FOR ENMITY MOBILE
// ============================================
module.exports = { default: new FreeAppIcons() };
