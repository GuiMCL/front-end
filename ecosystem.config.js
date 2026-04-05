module.exports = {
  apps: [
    {
      name: "web-cha",
      cwd: "/root/apps/front-end",
      script: "npm",
      args: "run start",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};