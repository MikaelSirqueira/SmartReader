import { FastifyInstance, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";
import z from "zod";

export async function getMeasures(app: FastifyInstance) {
  app.get('/:customer_code/list', async (request, reply) => {

    const getMeasuresParams = z.object({
      customer_code: z.string()
    });

    const getMeasuresQuery = z.object({
      measure_type: z.string().optional()
    });

    const { customer_code } = getMeasuresParams.parse(request.params);
    const { measure_type } = getMeasuresQuery.parse(request.query);

    if (measure_type && !['GAS', 'WATER'].includes(measure_type.toUpperCase())) {
      reply.code(400).send({
        error_code: 'INVALID_TYPE',
        error_description: 'Tipo de medição não permitida'
      });
      return
    }

    const measures = await prisma.measure.findMany({
      where: {
        customer_code: customer_code,
        measure_type: measure_type ? measure_type.toUpperCase() : undefined
      }
    });

    if (!measures) {
      reply.code(404).send({
        error_code: 'MEASURES_NOT_FOUND',
        error_description: 'Nenhuma leitura encontrada'
      });
      return
    }

    reply.code(200).send({
      customer_code: customer_code,
      measures: measures.map(measure => ({
        measure_uuid: measure.measure_uuid,
        measure_datetime: measure.measure_datetime,
        measure_type: measure.measure_type,
        has_confirmed: measure.has_confirmed,
        image_url: measure.image_url
      }))
    });

  })
}