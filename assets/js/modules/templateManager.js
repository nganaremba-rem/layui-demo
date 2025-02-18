// Template Manager
// This module is responsible for managing the templates
// It will be used to load the templates and render them

layui.define((exports) => {
  const { laytpl, $ } = layui;

  const templateManager = {
    loadTemplates(templateData = [], templatePath = null) {
      return new Promise((resolve, reject) => {
        let templateUrl = templatePath;

        if (!templateUrl) {
          // Get current URL path
          const currentPath = layui.url().pathname.pop().replace('.html', '');
          templateUrl = `/pages/templates/${currentPath}Template.html`;
        }

        $.ajax({
          url: templateUrl,
          method: 'GET',
          dataType: 'html',
          success: (htmlFromGetRequest) => {
            // Render the template
            laytpl(htmlFromGetRequest).render(templateData, (html) => {
              $('#root').html(html);
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
