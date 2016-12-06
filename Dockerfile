FROM debian:jessie
MAINTAINER "OpenPass Team"

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 6.5.0
ENV NGINX_VERSION 1.11.6-1~jessie

# Install nginx
RUN apt-key adv --keyserver hkp://pgp.mit.edu:80 --recv-keys 573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62 \
  && echo "deb http://nginx.org/packages/mainline/debian/ jessie nginx" >> /etc/apt/sources.list \
  && apt-get update \
  && apt-get install --no-install-recommends --no-install-suggests -y \
            ca-certificates \
            nginx=${NGINX_VERSION} \
            nginx-module-xslt \
            nginx-module-geoip \
            nginx-module-image-filter \
            nginx-module-perl \
            nginx-module-njs \
            gettext-base \
  && sed -i 's/user  nginx/user root/g' /etc/nginx/nginx.conf

# Install nodejs
## gpg keys listed at https://github.com/nodejs/node
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
  done
RUN apt-get update \
  && apt-get install curl openssl -y \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.gz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.gz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs \
  && apt-get clean && rm -rf /var/lib/apt/*

ADD . /usr/src/app
WORKDIR /usr/src/app
COPY templates/nginx/index.html /usr/share/nginx/html/index.html
RUN openssl req -subj "/C=FR/ST=Paris/L=Paris/O=Linagora Ltd/CN=*.beta.data.gouv.fr" -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/conf.d/nginx.key -out /etc/nginx/conf.d/nginx.crt

RUN npm install --production
VOLUME /etc/nginx/conf.d
EXPOSE 8080 80 443
CMD [ "./entrypoint.sh" ]
