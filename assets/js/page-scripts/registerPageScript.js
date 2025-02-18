layui.use(async () => {
  const { templateManager, auth } = layui;

  await templateManager.loadTemplates(
    [],
    './templates/registerTemplate.html',
    '#Register'
  );

  auth.init();
});
