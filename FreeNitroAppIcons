// ============================================
// 🔓 Free App Icons - Enmity Mobile Plugin
// ============================================

const { Plugin } = require('enmity');
const { Patcher } = require('enmity/patcher');
const { getModule } = require('enmity/metro');
const { React } = require('enmity/metro/common');

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
            // Patch the Nitro check
            await this.patchNitroCheck();
            // Unlock icons
            await this.patchIconUI();
            // Hide badge
            await this.patchBadge();

            console.log('[FreeAppIcons] ✅ All patches applied!');
        } catch (error) {
            console.error('[FreeAppIcons] Error:', error);
        }
    }

    stop() {
        Patcher.unpatchAll();
    }

    async patchNitroCheck() {
        try {
            const nitroModule = await getModule(
                m => m?.getNitroSubscriptionType || m?.isNitroAvailable
            );

            if (nitroModule) {
                Patcher.after(nitroModule, 'getNitroSubscriptionType', (_, args, result) => {
                    if (args?.[0] === 'app_icon') {
                        return 1;
                    }
                    return result;
                });

                Patcher.after(nitroModule, 'isNitroAvailable', (_, args, result) => {
                    if (args?.[0] === 'app_icon') {
                        return true;
                    }
                    return result;
                });
            }

            const userModule = await getModule(m => m?.getCurrentUser);
            if (userModule) {
                Patcher.after(userModule, 'getCurrentUser', (_, __, user) => {
                    if (user) {
                        user.hasAppIconAccess = true;
                    }
                    return user;
                });
            }
        } catch (e) {
            console.warn('[FreeAppIcons] Nitro check patch failed:', e);
        }
    }

    async patchIconUI() {
        try {
            // Find app icon picker
            const iconModule = await getModule(
                m => m?.AppIconPicker || m?.AppIconSelector
            );

            if (iconModule) {
                Patcher.before(iconModule, 'default', (_, args) => {
                    if (args?.[0]?.icons) {
                        args[0].icons.forEach(icon => {
                            icon.isLocked = false;
                            icon.requiresNitro = false;
                        });
                    }
                });
            }
        } catch (e) {
            console.warn('[FreeAppIcons] Icon UI patch failed:', e);
        }
    }

    async patchBadge() {
        try {
            const badgeModule = await getModule(
                m => m?.NitroBadge || m?.ProfileBadgeNitro
            );

            if (badgeModule) {
                Patcher.before(badgeModule, 'default', (_, args) => {
                    if (args[0]) {
                        args[0].hide = true;
                        args[0].show = false;
                    }
                });
            }
        } catch (e) {
            console.warn('[FreeAppIcons] Badge patch failed:', e);
        }
    }
}

// Export for Enmity mobile
module.exports = new FreeAppIcons();
