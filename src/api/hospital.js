import request from '@/utils/request'

export function listHospital(query) {
  return request({
    url: '/hospital/list',
    method: 'get',
    params: query
  })
}

export function createHospital(data) {
  return request({
    url: '/hospital',
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

export function updateHospital(data) {
  return request({
    url: '/hospital',
    method: 'put',
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
