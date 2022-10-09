// ahora en sugerencias.ts hacemos algo parecido
import { model, Schema } from 'mongoose';

export default model(
  'sugerencias',
  new Schema<sugerencias>({
    _id: String, // la ID personalizada de la sugerencia
    messageId: String, // la ID del mensaje
    votos: {
      up: { type: Number, default: 0 }, // los votos positivos, inician en 0
      down: { type: Number, default: 0 } // los votos negativos, inician en 0
    },
    respuestas: Array, // un array con las personas que votaron y sus respuestas
    status: {
      tipo: { type: String, default: 'Pendiente' }, // Ponemos que por defecto la sugerencia tenga estado pendiente (no respondido)
      razon: { type: String, default: null } // la razon se agrega al responder la sugerencia
    }
  })
);

// creamos otro interface
interface sugerencias {
  _id: string;
  messageId: string;
  votos: {
    up: number;
    down: number;
  };
  respuestas: Array<{ id: string; type: 'favor' | 'contra' }>;
  status: {
    tipo: 'Pendiente' | 'Aceptado' | 'Rechazado';
    razon: string;
  };
}
