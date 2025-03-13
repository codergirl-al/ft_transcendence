
FROM owasp/modsecurity-crs:4.11.0-nginx-alpine-202502070602

COPY nginx.conf /etc/nginx/templates/conf.d/default.conf.template
COPY modsecurity.conf /etc/nginx/templates/conf.d/modsecurity.conf

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
