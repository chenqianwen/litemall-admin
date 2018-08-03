import request from '@/utils/request'

export function listCouponKill(query) {
  return request({
    url: '/coupon/kill/list',
    method: 'get',
    params: query
  })
}

export function createCouponKill(data) {
  return request({
    url: '/coupon/kill/create',
    method: 'post',
    data
  })
}

export function updateCouponKill(data) {
  return request({
    url: '/coupon/kill/update',
    method: 'post',
    data
  })
}

export function deleteCouponKill(data) {
  return request({
    url: '/coupon/kill/delete',
    method: 'post',
    data
  })
}

export function getValidCouponKill() {
  return request({
    url: '/coupon/kill/valid',
    method: 'get'
  })
}

