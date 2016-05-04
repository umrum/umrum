/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Adds the systems that shape your system
var main_domain = "umrum.#{azk.default_domain}";
var webpack_host = "webpack-" + main_domain;
var webpack_port = "9999";

systems({
  umrum: {
    // Dependent systems
    depends: ["redis", "mongodb"],
    // More images:  http://images.azk.io
    image: {"docker": "node:0.12"},
    // Steps to execute before running instances
    provision: [
      "npm install",
      "./node_modules/.bin/grunt install build"
    ],
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    command: "npm start",
    wait: 30,
    mounts: {
      '/azk/#{manifest.dir}': sync("."),
      '/azk/#{manifest.dir}/public': persistent("umrum-public"),

      '/azk/#{manifest.dir}/.less_compile': persistent("umrum-lessc"),
      '/azk/#{manifest.dir}/compiled_jsx': persistent("umrum-jsxc"),

      '/azk/#{manifest.dir}/bower_modules': persistent("umrum-bower_modules"),
      '/azk/#{manifest.dir}/node_modules': persistent("umrum-modules"),
    },
    scalable: {"default": 1},
    http: {
      domains: [ main_domain ]
    },
    ports: {
      http: "8000",
    },
    envs: {
      // set instances variables
      NODE_ENV: "dev",
      NODE_PORT: "8000",
      NODE_IP: "0.0.0.0",
      UMRUM_SESSION_KEY: "umrum-secret",
      GITHUB_ID: "50e4a60802b87028b98f",
      GITHUB_SECRET: "59a86c98576017e0fe9d56b667f5748368595b7d",
      GITHUB_CALLBACK: "http://umrum.dev.azk.io/auth/github/callback",
      WEBPACK_HOST: webpack_host
    }
  },

  webpack: {
    // Dependent systems
    extends: "umrum",
    command: "npm run watch-webpack",
    http: {
      domains: [ webpack_host ]
    },
    ports: {
      http: webpack_port
    },
    envs: {
      NODE_ENV: "dev",
      WEBPACK_HOST: '0.0.0.0',
      WEBPACK_PORT: webpack_port
    }
  },

  redis: {
    image: { docker: "redis:3.0" },
    scalable: false,
    ports: {
      data: "6379/tcp",
    },
    export_envs: {
      REDIS_HOST: "#{net.host}",
      REDIS_PORT: "#{net.port.data}"
    },
    mounts: {
      '/data' : persistent('redis'),
    }
  },

  mongodb: {
    image: { docker: "mongo:3.0" },
    command: ['mongod', '--port', '27017'],
    scalable: false,
    ports: {
      data: "27017",
    },
    mounts: {
      '/data/db': persistent('mongodb'),
    },
    export_envs: {
      MONGO_URI: "mongodb://#{net.host}:#{net.port.data}/umrum_development",
    }
  }

});
