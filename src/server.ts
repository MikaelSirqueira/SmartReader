import fastify from 'fastify';
import { upload } from './routes/upload';
import { confirm } from './routes/confirm';

const app = fastify();

app.register(upload);
app.register(confirm);

app.listen({ port: 3333 }).then(() => {
  console.log('Server running!')
})

