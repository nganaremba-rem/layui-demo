layui.define(['data', 'url', 'layer'], (exports) => {
  const { data, url, layer } = layui;

  const router = {
    routes: {
      '/login': '/pages/login.html',
      '/register': '/pages/register.html',
      '/': '/pages/homepage.html',
    },

    init() {
      this.checkAuth();
      // window.addEventListener('popstate', () => {
      //   this.checkAuth();
      // });
    },

    checkAuth() {
      const publicRoutes = ['/login', '/register'];
      layer({
        title: 'Hello',
        content: JSON.stringify(url),
        icon: 1,
        time: 2000,
      });
      return;
      // const currentPath = url.pathname.join('/');
      // const token = data('token');

      // if (!token && !publicRoutes.includes(currentPath)) {
      //   window.location.href = router.routes['/login'];
      // } else if (token && publicRoutes.includes(currentPath)) {
      //   window.location.href = router.routes['/'];
      // } else {
      //   window.location.href = router.routes[currentPath];
      // }
    },
  };

  exports('router', router);
});
