<!-- Locale combo -->
<template>
    <div></div>
</template>

<script>
import { Combo, LocaleManager, LocaleHelper } from '@bryntum/schedulerpro';

export default {
    name : 'locale-combo',
    mounted() {
        const config  = {
                label      : 'Select Language',
                width      : '20em',
                labelWidth : 120,
                height     : '2.7em',
                editable   : false,
                onChange   : this.onLocaleChange,
                store      : Object.values(LocaleHelper.locales).map(l => ({ id : l.localeName, text : l.localeDesc })),
                value      : LocaleHelper.locale.localeName,
                adopt      : this.$el
            },
            i18next = this.$i18n.i18next;
        const combo = (this.combo = new Combo(config));

        this.onLocaleChange({ value : combo.value });

        i18next.on('languageChanged', () => {
            document.title = i18next.t('title');
            combo.label = i18next.t('selectLanguage');
        });
    },

    methods : {
        onLocaleChange({ value }) {
            LocaleManager.applyLocale(value);
            this.$i18n.i18next.changeLanguage(LocaleHelper.locales[value].localeCode.split('-')[0]);
        }
    }
};
</script>
