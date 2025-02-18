layui.define((exports) => {
  const { data, $ } = layui;

  const translationModule = {
    async init() {
      this.setDefaultLanguage();
      await this.updateTranslation();
    },

    setDefaultLanguage() {
      if (!data('lang').lang) {
        // set default language to japanese
        data('lang', {
          key: 'lang',
          value: 'ja',
        });
      }
    },

    async getTranslation() {
      return await $.ajax({
        url: '../../../data/translationDB.json',
        method: 'GET',
        dataType: 'json',
      });
    },

    async updateTranslation() {
      const translations = await this.getTranslation();

      data('translations', {
        key: 'translations',
        value: translations,
      });
    },

    async changeLanguage(lang) {
      await this.updateTranslation();

      if (lang === data('lang').lang) {
        return;
      }

      data('lang', {
        key: 'lang',
        value: lang,
      });
      window.location.reload();
    },
  };

  exports('translationModule', translationModule);
});
