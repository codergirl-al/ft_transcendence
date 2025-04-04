
FROM owasp/modsecurity-crs:4.11.0-nginx-alpine-202502070602

COPY nginx.conf /etc/nginx/templates/conf.d/default.conf.template
COPY modsecurity.conf /etc/nginx/templates/conf.d/modsecurity.conf

COPY /crt/teamsafari_xyz.crt /etc/nginx/conf/server.crt
COPY /crt/teamsafari.key /etc/nginx/conf/server.key

EXPOSE 443 80

CMD ["nginx", "-g", "daemon off;"]
