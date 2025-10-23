module.exports = {
    apps: [
      {
        name: "frontend",
        script: "npm",
        args: "run start",
        cwd: "/home/testing/Frontend", // ganti path sesuai lokasi project kamu
        env: {
          NODE_ENV: "production",
          PORT: 3000,
          HOST: "0.0.0.0"
        }
      }
    ]
  }
  