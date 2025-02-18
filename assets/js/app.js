layui.use(['auth', 'translationModule'], () => {
  const { auth, translationModule } = layui;
  // templateManager.init();
  translationModule.init();
  auth.init();
});
