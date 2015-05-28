/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Adds the systems that shape your system
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
    command: "./node_modules/.bin/grunt server",
    wait: {"retry": 20, "timeout": 10000},
    mounts: {
      '/azk/#{manifest.dir}': path(".", { vbox: true } ),
      '/azk/#{manifest.dir}/node_modules': persistent("umrum-modules"),
    },
    scalable: {"default": 1},
    http: {
      domains: [ "#{system.name}.#{azk.default_domain}" ]
    },
    ports: {
      http: "8000"
    },
    envs: {
      // set instances variables
      NODE_ENV: "dev",
      NODE_PORT: "8000",
      NODE_IP: "0.0.0.0",
      UMRUM_SESSION_KEY: "umrum-secret",
      GITHUB_ID: "d9f4d009c90281dc9794",
      GITHUB_SECRET: "620a4c620fc24d47d46ae1dfb086a067635934d1",
      GITHUB_CALLBACK: "http://umrum.dev.azk.io/auth/github/callback"
    }
  },

  redis: {
    image: { docker: "redis" },
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
    command: 'mongod --rest --httpinterface --bind_ip 0.0.0.0',
    scalable: false,
    wait: {"retry": 20, "timeout": 5000},
    ports: {
      http: "28017",
    },
    http: {
      domains: [ "#{manifest.dir}-#{system.name}.#{azk.default_domain}" ],
    },
    mounts: {
      '/data/db': persistent('mongodb'),
    },
    export_envs: {
      MONGO_URI: "mongodb://#{net.host}:#{net.port[27017]}/umrum_development",
    }
  }

});
