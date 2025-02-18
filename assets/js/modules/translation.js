layui.define((exports) => {
  const { data, $, auth, element, templateManager } = layui;

  let lang;
  if (data('lang').lang) {
    lang = data('lang');
  } else {
    // set default language to japanese
    data('lang', {
      key: 'lang',
      value: 'ja',
    });

    lang = data('lang');
  }

  const translationModule = {
    translatedData: {},

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

    async init() {
      await this.updateTranslation();
      this.render();
    },

    bindEvents() {
      $('#jaBtn').on('click', () => {
        data('lang', {
          key: 'lang',
          value: 'ja',
        });
        this.render();
      });

      $('#enBtn').on('click', () => {
        data('lang', {
          key: 'lang',
          value: 'en',
        });
        this.render();
      });
    },

    async render() {
      await this.updateTranslation();

      const lang = data('lang');

      this.translatedData = Object.entries(
        data('translations').translations
      ).reduce((acc, [key, value]) => {
        acc[key] = value[lang.lang];
        return acc;
      }, {});

      await templateManager.loadTemplates(this.translatedData);
      this.bindEvents();
      auth.init();
      element.render();
    },
  };

  exports('translationModule', translationModule);
});
