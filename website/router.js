/*
 * @Author: 焦质晔
 * @Date: 2021-03-17 12:55:34
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-06-18 12:54:52
 */
import { defineAsyncComponent } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import navList from './nav.config';

const LoadingComponent = {
  template: `<div style="text-align: center;padding-top: 200px;"></div>`,
};

const ErrorComponent = {
  template: `<div style="text-align: center;padding-top: 200px;">Loading error. Please refresh the page and try again</div>`,
};

const getAsyncComponent = (func) => {
  return defineAsyncComponent({
    loader: func,
    delay: 0,
    timeout: 30000,
    errorComponent: ErrorComponent,
    loadingComponent: LoadingComponent,
  });
};

const load = (name) => {
  return getAsyncComponent(() => import(`./pages/${name}.vue`));
};

const loadDocs = (path) => {
  return getAsyncComponent(() => import(`./docs/${path}.md`));
};

const registerRoute = (navs) => {
  let route = [];

  route.push({
    path: `/component`,
    redirect: `/component/installation`,
    component: load('component'),
    children: [],
  });

  navs.forEach((nav) => {
    if (nav.children) {
      nav.children.forEach((nav) => {
        addRoute(nav);
      });
    } else {
      addRoute(nav);
    }
  });

  function addRoute(page) {
    const component = loadDocs(page.path.slice(1));
    let child = {
      path: page.path.slice(1),
      meta: {
        title: page.title || page.name,
        description: page.description,
      },
      name: 'component-' + (page.title || page.name),
      component: component.default || component,
    };
    route[0].children.push(child);
  }

  return route;
};

let route = registerRoute(navList);

route = route.concat([
  {
    path: '/',
    redirect: { path: `/component` },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { path: `/component` },
  },
]);

const router = createRouter({
  history: createWebHashHistory(),
  routes: route,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
