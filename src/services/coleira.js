// Fonte das leituras da coleira inteligente.
// Hoje as leituras são geradas por um simulador com valores fisiológicos
// de cada espécie. Para ligar a coleira real (ESP32 + MQTT), basta trocar
// as funções deste arquivo por chamadas à API do servidor IoT: as telas
// usam apenas o hook useLeiturasColeira e não precisam mudar.

import { BASELINE_MINIMO } from "./anomalias";

const BASE_POR_ESPECIE = {
  CAO:    { temp: 38.5, hr: 90,  steps: 60 },
  GATO:   { temp: 38.3, hr: 150, steps: 40 },
  COELHO: { temp: 38.9, hr: 220, steps: 50 },
  OUTRO:  { temp: 38.5, hr: 90,  steps: 60 },
};

export const FONTE_LEITURAS = "simulador";

export function gerarLeitura(pet, forcarAnomalia = false) {
  const base = BASE_POR_ESPECIE[pet.especie] || BASE_POR_ESPECIE.OUTRO;
  const simularAnomalia = forcarAnomalia || Math.random() < 0.2;

  const temperature_celsius = parseFloat(
    (simularAnomalia ? base.temp + 1.3 + Math.random() * 0.4 : base.temp + (Math.random() - 0.5) * 0.6).toFixed(1)
  );
  const activity_score = parseFloat(
    (simularAnomalia ? 0.03 + Math.random() * 0.05 : 0.3 + Math.random() * 0.5).toFixed(2)
  );

  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    timestamp: new Date(),
    species: pet.especie,
    sensors: {
      temperature_celsius,
      heart_rate_bpm:    Math.round(base.hr + (Math.random() - 0.5) * 18),
      activity_score,
      steps_last_minute: Math.round(base.steps + (Math.random() - 0.5) * 20),
      weight_kg:         pet.peso ?? null,
    },
  };
}

// Leituras normais usadas como linha de base quando o pet é aberto pela primeira vez
export async function buscarHistoricoInicial(pet) {
  return Array.from({ length: BASELINE_MINIMO + 2 }, () => gerarLeitura(pet, false));
}

export async function buscarNovaLeitura(pet) {
  return gerarLeitura(pet);
}
