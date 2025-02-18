layui.use(async () => {
  const { auth, templateManager } = layui;

  // Load the login template with translations
  await templateManager.loadTemplates(
    [],
    './templates/loginTemplate.html',
    '#Login'
  );

  // Load the register template with translations
  await templateManager.loadTemplates(
    [],
    './templates/registerTemplate.html',
    '#Register'
  );

  // Initialize the auth module so that all the login and register events are bound
  auth.init();
});
