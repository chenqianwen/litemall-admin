#!/bin/bash

BUILD_TAG="1.0"
REGISTRY_URL="registry-internal.cn-hangzhou.aliyuncs.com"
NAME_SPACE="yangguoliang"
APP_NAME="litemall-admin-ui"

if [ "$2" != "" ];
    then
    BUILD_TAG="$2"
fi

# build_push_tag
push_tag()
{
    set -e
	#build
	cd $WORKSPACE
	cnpm install
  npm run build:prod

    # push node-datacenter
    docker build -t $APP_NAME:$BUILD_TAG .
    docker tag $APP_NAME:$BUILD_TAG $REGISTRY_URL/$NAME_SPACE/$APP_NAME:$BUILD_TAG
    docker push $REGISTRY_URL/$NAME_SPACE/$APP_NAME:$BUILD_TAG
	  docker rmi $APP_NAME:$BUILD_TAG
    docker rmi $REGISTRY_URL/$NAME_SPACE/$APP_NAME:$BUILD_TAG

   # rm -rf $WORKSPACE
}

if [ "$1" = "pro" ];
    then
    # login
    REGISTRY_URL="registry.cn-hangzhou.aliyuncs.com"
    NAME_SPACE="yangguoliang"
    docker login --username=19951761632 $REGISTRY_URL --password=19931203ygl
    push_tag
    echo '生产环境命令:dpush.sh pro'
else
    echo '测试环境参考命令:dpush.sh test test1001'
    echo '生产环境参考命令:dpush.sh prod prod1001'
fi
