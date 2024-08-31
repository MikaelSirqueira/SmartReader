import { FastifyInstance } from "fastify";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../lib/prisma";
import z from "zod";
import dotenv from "dotenv";

dotenv.config();

export async function upload(app: FastifyInstance) {
  app.post('/upload', async (request, reply) => {
    const uploadBody = z.object({
      image: z.string().regex(
        /^data:image\/[a-zA-Z]+;base64,[^\s]+$/,
        "Invalid base64 image format"
      ),
      customer_code: z.string().uuid(),
      measure_datetime: z.string().datetime(),
      measure_type: z.enum(['WATER', 'GAS'])
    });

    try {
      const { image, customer_code, measure_datetime, measure_type } = uploadBody.parse(request.body);

      const existingReading = await prisma.measure.findFirst({
        where: {
          customer_code: customer_code,
          measure_type: measure_type,
          measure_datetime: {
            gte: new Date(new Date(measure_datetime).getFullYear(), new Date(measure_datetime).getMonth(), 1), // Início do mês
            lt: new Date(new Date(measure_datetime).getFullYear(), new Date(measure_datetime).getMonth() + 1, 1) // Início do próximo mês
          }
        }
      });

      if (existingReading) {
        reply.code(409).send({
          error_code: "DOUBLE_REPORT",
          error_description: "Leitura do mês já realizada"
        });
        return
      }

      const response = await getResponseIA(image);
      const measureValue = parseFloat(response.text().trim());

      if (!measureValue) {
        throw new Error("Falha ao extrair uma leitura de medidor válida da imagem");
      }

      const measurement = await prisma.measure.create({
        data: {
          customer_code: customer_code,
          measure_datetime: new Date(measure_datetime),
          measure_type: measure_type,
          image_url: image,
          confirmed_value: measureValue,
          has_confirmed: false
        }
      });

      reply.code(200).send({
        measure_value: measureValue,
        measure_uuid: measurement.measure_uuid,
        image_url: image,
      });

    } catch (error) {
      reply.code(400).send({
        error_code: "INVALID_DATA",
        error_description: error instanceof Error ? error.message : 'Os dados fornecidos no corpo da requisição são inválidos'
      });
    }
  });

}

function base64ToGenerativePart(base64Data: string, mimeType: string) {
  const base64Content = base64Data.split(',')[1];
  return {
    inlineData: {
      data: base64Content,
      mimeType,
    }
  };
}

function getModelIA() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) { throw new Error("GEMINI_API_KEY não está definida no arquivo .env"); }
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
}

async function getResponseIA(image: string) {
  const prompt = "Analyze this image and extract the meter reading value. Return only the numeric value without any additional text.";
  const imageParts = [base64ToGenerativePart(image, 'image/jpeg')];

  const result = await getModelIA().generateContent([prompt, ...imageParts]);
  const response = result.response;

  return response;
}