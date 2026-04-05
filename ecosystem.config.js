module.exports = {
  apps: [
    {
      name: "web-cha",
      cwd: "/root/apps/cha-de-panela/web",
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