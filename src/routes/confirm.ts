import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import z from "zod";

export async function confirm(app: FastifyInstance) {
  app.patch('/confirm', async (request, reply) => {

    const confirmBody = z.object({
      measure_uuid: z.string().uuid(),
      confirmed_value: z.number()
    });

    try {
      const { measure_uuid, confirmed_value } = confirmBody.parse(request.body);

      const measureObject = await prisma.measure.findFirst({
        where: {
          measure_uuid: measure_uuid
        }
      });

      if (!measureObject) {
        reply.code(404).send({
          error_code: "MEASURE_NOT_FOUND",
          error_description: "Leitura não encontrada"
        });
        return
      }

      if (measureObject.has_confirmed) {
        reply.code(409).send({
          error_code: "MEASURE_ALREADY_CONFIRMED",
          error_description: "Leitura já confirmada"
        });
        return
      }

      await prisma.measure.update({
        where: {
          measure_uuid: measure_uuid,
        },
        data: {
          confirmed_value: confirmed_value,
          has_confirmed: true
        }
      });

      reply.code(200).send({ sucess: true });

    } catch (error) {
      reply.code(400).send({
        error_code: "INVALID_DATA",
        error_description: error instanceof Error ? error.message : 'Os dados fornecidos no corpo da requisição são inválidos'
      });
    }

  })
}