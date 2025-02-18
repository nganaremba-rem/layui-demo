// Template Manager
// This module is responsible for managing the templates
// It will be used to load the templates and render them

layui.define((exports) => {
  const { laytpl, $, data } = layui;

  const templateManager = {
    loadTemplates(
      templateData = [],
      templatePath = null,
      idToRender = '#root'
    ) {
      return new Promise((resolve, reject) => {
        const translations = Object.entries(
          data('translations').translations
        ).reduce((acc, [key, value]) => {
          acc[key] = value[data('lang').lang];
          return acc;
        }, {});

        // append the language data to the template data
        const dataToRender = {
          data: templateData,
          translations,
        };
        console.log('dataToRender', dataToRender);

        if (!templatePath) {
          return reject(new Error('Template path is required'));
        }

        $.ajax({
          url: templatePath,
          method: 'GET',
          dataType: 'html',
          success: (htmlFromGetRequest) => {
            // Render the template
            laytpl(htmlFromGetRequest).render(dataToRender, (html) => {
              $(idToRender).html(html);
            });
            resolve();
          },
          error: (error) => {
            console.error('Error loading template:', error);
            reject(error);
          },
        });
      });
    },
  };
  exports('templateManager', templateManager);
});
