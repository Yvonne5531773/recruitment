FROM docker.cargosmart.com/os/node:4.4.5

MAINTAINER Gordon Hu<gordon.hu@cargosmart.com>

WORKDIR /home/mean


# Make everything available for start
ADD . /home/mean

RUN npm install -g bower gulp

RUN npm install --ignore-scripts
RUN bower install --config.interactive=false --allow-root

# Port 3000 for server
# Port 35729 for livereload
EXPOSE 3000 35729

ENTRYPOINT ["gulp"]
