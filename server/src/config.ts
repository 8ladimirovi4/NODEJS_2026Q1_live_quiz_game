const port = process.env.PORT;
const host = process.env.HOST

export const PORT =  port ? parseInt(port, 10) : 3000;
export const HOST = host ? host.trim() : '127.0.0.1'
