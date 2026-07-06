FROM cr.registry.res.cloud.zhejianglab.com/datahub/nginx:1.27.2-alpine
COPY ./build /usr/share/nginx/html
COPY ./deploy/nginx/server.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["/bin/sh", "-c", "exec nginx -g 'daemon off;'"]