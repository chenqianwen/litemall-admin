import axios from 'axios'
import { Message } from 'element-ui'

// create an axios instance
const service = axios.create({
  baseURL: process.env.OS_API, // api的base_url
  timeout: 5000 // request timeout
})

// respone interceptor
service.interceptors.response.use(
  response => {
    return response
  }, error => {
    console.log('err' + error)// for debug
    Message({
      message: '对象存储服务访问超时，请检查链接是否能够访问。',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  })

export function listStorage(query) {
  return service({
    url: '/storage/list',
    method: 'get',
    params: query
  })
}

export function createStorage(data) {
  return service({
    url: '/upload',
    method: 'post',
    data
  })
}


export function uploadFile(data, sCallback) {
  service({
    url: '/upload',
    method: 'post',
    data
  }).then(function (res) {
    // 请求成功
    if (res.status === 200) {
      if (res.data.errno === 0) {
        sCallback && sCallback(res.data.data)
      } else if (res.data.errno === -1) {
        Message({
          message: res.data.data,
          type: 'error',
          duration: 5 * 1000
        })
      }
    }
  }).catch(function (error) {
    if (error.response) {
      Message({
        message: '对象存储服务访问出错，请检查链接是否能够访问。',
        type: 'error',
        duration: 5 * 1000
      })
      console.log(JSON.stringify(error))
    }
  })
}


export function deleteFile(data, sCallback) {
  service({
    url: '/delete',
    method: 'get',
    params: {
      fileUrl: data
    }
  }).then(function (res) {
    // 请求成功
    if (res.status === 200) {
      if (res.data.errcode === "0") {
        sCallback && sCallback(res.data.data)
      } else if (res.data.errcode === "-1") {
        Message({
          message: res.data.data,
          type: 'error',
          duration: 5 * 1000
        })
      }
    }
  }).catch(function (error) {
    if (error.response) {
      Message({
        message: '对象存储服务访问出错，请检查链接是否能够访问。',
        type: 'error',
        duration: 5 * 1000
      })
      console.log(JSON.stringify(error))
    }
  })
}

export function readStorage(data) {
  return service({
    url: '/storage/read',
    method: 'get',
    data
  })
}

export function updateStorage(data) {
  return service({
    url: '/storage/update',
    method: 'post',
    data
  })
}

export function deleteStorage(data) {
  return service({
    url: '/storage/delete',
    method: 'post',
    data
  })
}
