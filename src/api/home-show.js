import request from '@/utils/request'

export function listHomeShow(query) {
  return request({
    url: '/home/show/list',
    method: 'get',
    params: query
  })
}

export function createHomeShow(data) {
  return request({
    url: '/home/show/create',
    method: 'post',
    data
  })
}

export function readAd(data) {
  return request({
    url: '/ad/read',
    method: 'get',
    data
  })
}

export function updateHomeShow(data) {
  return request({
    url: '/home/show/update',
    method: 'post',
    data
  })
}

export function deleteAd(data) {
  return request({
    url: '/ad/delete',
    method: 'post',
    data
  })
}
