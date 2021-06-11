FROM node:14

RUN npm install -g git+https://github.com/zenodraft/zenodraft

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
