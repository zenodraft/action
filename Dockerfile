FROM node:14

RUN npm install -g git+https://github.com/zenodraft/zenodraft

ENTRYPOINT ["zenodraft"]
