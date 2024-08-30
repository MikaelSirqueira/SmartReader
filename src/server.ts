import fastify from 'fastify';
import { upload } from './routes/upload';

const app = fastify();

app.register(upload)

app.listen({ port: 3333 }).then(() => {
  console.log('Server running!')
})

