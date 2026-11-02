

export const HISTORICO_MAXIMO = 30;
export const BASELINE_MINIMO = 8;
const Z_SCORE_LIMITE = 2.0;

export const LIMITES = {
  CAO:    { temp: [37.5, 39.2], hr: [60,  120] },
  GATO:   { temp: [38.0, 39.5], hr: [120, 220] },
  COELHO: { temp: [38.5, 40.0], hr: [140, 300] },
  OUTRO:  { temp: [37.5, 39.2], hr: [60,  120] },
};

export function limitesDaEspecie(especie) {
  return LIMITES[especie] || LIMITES.OUTRO;
}

function media(valores) {
  return valores.reduce((soma, v) => soma + v, 0) / valores.length;
}

function desvioPadrao(valores, m) {
  const variancia = valores.reduce((soma, v) => soma + (v - m) ** 2, 0) / valores.length;
  return Math.sqrt(variancia) || 0.01;
}

export function nivelTemperatura(temp, limites) {
  if (temp > limites.temp[1]) return "alto";
  if (temp < limites.temp[0]) return "baixo";
  return "normal";
}

export function nivelFrequencia(hr, limites) {
  if (hr > limites.hr[1]) return "alto";
  if (hr < limites.hr[0]) return "baixo";
  return "normal";
}


export function avaliarAnomalia(petNome, historico) {
  if (historico.length < BASELINE_MINIMO + 1) return null;

  const anteriores = historico.slice(0, -1);
  const atual = historico[historico.length - 1];

  const temps = anteriores.map((r) => r.sensors.temperature_celsius);
  const atividades = anteriores.map((r) => r.sensors.activity_score);

  const muTemp = media(temps);
  const sigmaTemp = desvioPadrao(temps, muTemp);
  const muAtividade = media(atividades);
  const sigmaAtividade = desvioPadrao(atividades, muAtividade);

  const zTemp = (atual.sensors.temperature_celsius - muTemp) / sigmaTemp;
  const zAtividade = (atual.sensors.activity_score - muAtividade) / sigmaAtividade;

  const signals = [];
  let severidadeScore = 0;

  if (zTemp > Z_SCORE_LIMITE) {
    signals.push(
      `Temperatura ${atual.sensors.temperature_celsius}°C acima da linha de base (${muTemp.toFixed(1)}°C ± ${sigmaTemp.toFixed(2)}), z-score=${zTemp.toFixed(2)}`
    );
    severidadeScore += zTemp > Z_SCORE_LIMITE * 1.5 ? 2 : 1;
  }

  if (zAtividade < -Z_SCORE_LIMITE) {
    signals.push(
      `Nível de atividade muito abaixo da linha de base (${muAtividade.toFixed(2)} ± ${sigmaAtividade.toFixed(2)}), z-score=${zAtividade.toFixed(2)}`
    );
    severidadeScore += zAtividade < -Z_SCORE_LIMITE * 1.5 ? 2 : 1;
  }

  if (signals.length === 0) return null;

  let severity, recommendation;
  if (severidadeScore >= 3) {
    severity = "critica";
    recommendation = "Agendar consulta veterinária com urgência (mesmo dia).";
  } else if (severidadeScore === 2) {
    severity = "media";
    recommendation = "Observar o pet nas próximas horas e considerar agendar consulta.";
  } else {
    severity = "baixa";
    recommendation = "Monitorar continuamente; nenhuma ação imediata necessária.";
  }

  return {
    severity,
    message: `Anomalia detectada para o pet '${petNome}'.`,
    signals,
    recommendation,
  };
}
