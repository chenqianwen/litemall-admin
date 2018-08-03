import request from '@/utils/request'

export function listOrder(query) {
  return request({
    url: '/order/list',
    method: 'get',
    params: query
  })
}

export function createOrder(data) {
  return request({
    url: '/order/create',
    method: 'post',
    data
  })
}

export function readOrder(data) {
  return request({
    url: '/order/read',
    method: 'get',
    data
  })
}

export function updateOrder(data) {
  return request({
    url: '/order/update',
    method: 'post',
    data
  })
}

export function deleteOrder(data) {
  return request({
    url: '/order/delete',
    method: 'post',
    data
  })
}

export function formateOrderStatus(row, column) {
  let orderStatus = row.orderStatus
  if (orderStatus === 101) {
    return '未付款'
  } else if (orderStatus === 102) {
    return '已取消'
  } else if (orderStatus === 103) {
    return '已取消(系统)'
  } else if (orderStatus === 201) {
    return '已付款'
  } else if (orderStatus === 202) {
    return '订单取消，退款中'
  } else if (orderStatus === 203) {
    return '已退款'
  } else if (orderStatus === 301) {
    return '已发货'
  } else if (orderStatus === 401) {
    return '已收货'
  } else if (orderStatus === 402) {
    return '已收货(系统)'
  }
  return row.address
}
