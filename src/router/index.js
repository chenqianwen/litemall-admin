import Vue from 'vue'
import Router from 'vue-router'
const _import = require('./_import_' + process.env.NODE_ENV)
// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/** note: submenu only apppear when children.length>=1
*   detail see  https://panjiachen.github.io/vue-element-admin-site/#/router-and-nav?id=sidebar
**/

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    roles: ['admin','editor']     will control the page roles (you can set multiple roles)
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
    noCache: true                if fasle ,the page will no be cached(default is false)
  }
**/
export const constantRouterMap = [
  { path: '/login', component: _import('login/index'), hidden: true },
  { path: '/authredirect', component: _import('login/authredirect'), hidden: true },
  { path: '/404', component: _import('error/404'), hidden: true },
  { path: '/401', component: _import('error/401'), hidden: true },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [{
      path: 'dashboard',
      component: _import('dashboard/index'),
      name: 'dashboard',
      meta: { title: '首页', icon: 'dashboard', noCache: true }
    }]
  }
]

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  {
    path: '/user',
    component: Layout,
    redirect: 'noredirect',
    name: 'userManage',
    meta: {
      title: '会员管理',
      icon: 'chart'
    },
    children: [
      { path: 'user', component: _import('user/user'), name: 'user', meta: { title: '会员管理', noCache: true }},
      { path: 'address', component: _import('user/address'), name: 'address', meta: { title: '收货地址', noCache: true }},
      { path: 'collect', component: _import('user/collect'), name: 'collect', meta: { title: '会员收藏', noCache: true }},
      { path: 'footprint', component: _import('user/footprint'), name: 'footprint', meta: { title: '会员足迹', noCache: true }},
      { path: 'history', component: _import('user/history'), name: 'history', meta: { title: '搜索历史', noCache: true }}
    ]
  },

  {
    path: '/mall',
    component: Layout,
    redirect: 'noredirect',
    name: 'mallManage',
    meta: {
      title: '商场管理',
      icon: 'chart'
    },
    children: [
      { path: 'ad', component: _import('mall/ad'), name: 'ad', meta: { title: '广告列表', noCache: true }},
      { path: 'show', component: _import('mall/show'), name: 'show', meta: { title: '首页展示', noCache: true }},
      { path: 'region', component: _import('mall/region'), name: 'region', meta: { title: '行政区域', noCache: true }},
      { path: 'hospital', component: _import('mall/hospital'), name: 'hospital', meta: { title: '诊所管理', noCache: true }},
      { path: 'category', component: _import('mall/category'), name: 'category', meta: { title: '商品类目', noCache: true }},
      { path: 'order', component: _import('mall/order'), name: 'order', meta: { title: '订单管理', noCache: true }},
      { path: 'issue', component: _import('mall/issue'), name: 'issue', meta: { title: '通用问题', noCache: true }},
      { path: 'keyword', component: _import('mall/keyword'), name: 'keyword', meta: { title: '关键词', noCache: true }},
      { path: 'coupon', component: _import('mall/coupon'), name: 'coupon', meta: { title: '优惠券', noCache: true }},
      { path: 'couponKill', component: _import('mall/couponKill'), name: 'couponKill', meta: { title: '优惠券秒杀', noCache: true }}
    ]
  },

  {
    path: '/goods',
    component: Layout,
    redirect: 'noredirect',
    name: 'goodsManage',
    meta: {
      title: '商品管理',
      icon: 'chart'
    },
    children: [
      { path: 'goods', component: _import('goods/goods'), name: 'goods', meta: { title: '商品管理', noCache: true }},
      { path: 'attribute', component: _import('goods/attribute'), name: 'attribute', meta: { title: '商品参数', noCache: true }},
      { path: 'specification', component: _import('goods/specification'), name: 'specification', meta: { title: '商品规格', noCache: true }},
      { path: 'product', component: _import('goods/product'), name: 'product', meta: { title: '货品管理', noCache: true }},
      { path: 'comment', component: _import('goods/comment'), name: 'comment', meta: { title: '用户评论', noCache: true }}
    ]
  },
  {
    path: '/sys',
    component: Layout,
    redirect: 'noredirect',
    name: 'sysManage',
    children: [
      { path: 'admin', component: _import('sys/admin'), name: 'admin', meta: { title: '系统管理员',icon: 'user', noCache: true }}
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]
