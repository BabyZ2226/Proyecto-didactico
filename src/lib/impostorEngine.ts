import { ImpostorGamePack, ImpostorMatchState, ImpostorRound } from '../types';

export const SEED_IMPOSTOR_LIBRARY: ImpostorGamePack[] = [
  {
    id: 'impostor-seed-quimica',
    title: 'El Impostor: Enlaces, Átomos y Reacciones Químicas',
    description:
      'Tres afirmaciones químicas son 100% verdaderas y una contiene un error sutil. Analiza cada opción de forma individual y vota para expulsar al impostor.',
    subject: 'Química',
    authorName: 'Comunidad AulaPlay',
    createdAt: 1735000000000,
    playsCount: 48,
    likesCount: 29,
    tags: ['química', 'octeto', 'enlaces', 'pensamiento crítico'],
    rounds: [
      {
        id: 'imp-q-1',
        topicTitle: 'Ronda 1: Regla del Octeto y Electrones de Valencia',
        prompt:
          'Analicen estas 4 afirmaciones sobre la estructura electrónica y los enlaces químicos. Tres son verdaderas y UNA tiene un error conceptual sutil (El Impostor). ¿Cuál expulsan?',
        subject: 'Química',
        statements: [
          {
            id: 's1',
            label: 'Tripulante Rojo',
            crewColor: 'red',
            text: 'El átomo de Carbono (Grupo 14) posee 4 electrones de valencia y puede formar hasta 4 enlaces covalentes para completar su octeto.',
            isImpostor: false,
          },
          {
            id: 's2',
            label: 'Tripulante Cian',
            crewColor: 'cyan',
            text: 'En el enlace iónico del Cloruro de Sodio (NaCl), el Sodio (Na) cede su electrón de valencia al Cloro (Cl), quedando como catión Na⁺ y anión Cl⁻.',
            isImpostor: false,
          },
          {
            id: 's3',
            label: 'Tripulante Lima',
            crewColor: 'lime',
            text: 'El Hidrógeno (H) necesita alcanzar 8 electrones en su capa de valencia (1s) para lograr la estabilidad química en la molécula de agua (H₂O).',
            isImpostor: true,
          },
          {
            id: 's4',
            label: 'Tripulante Ámbar',
            crewColor: 'amber',
            text: 'En la molécula de Dióxido de Carbono (O=C=O), el átomo central de Carbono comparte dos pares de electrones con cada átomo de Oxígeno.',
            isImpostor: false,
          },
        ],
        justificationOptions: [
          'Porque el Hidrógeno cumple la regla del dueto (se estabiliza con 2 electrones en el orbital 1s, igual que el Helio), no con 8.',
          'Porque el Carbono tiene 6 electrones de valencia y no 4.',
          'Porque el NaCl es un enlace covalente triple y no iónico.',
          'Porque el Dióxido de Carbono solo tiene enlaces simples.',
        ],
        correctJustificationIndex: 0,
        impostorExplanation:
          '¡El Tripulante Lima era el Impostor! El Hidrógeno solo posee el nivel 1s, el cual se llena con 2 electrones (Regla del Dueto, configuración del gas noble Helio), nunca con 8 electrones.',
      },
      {
        id: 'imp-q-2',
        topicTitle: 'Ronda 2: Ácidos, Bases y Escala de pH',
        prompt:
          'Revisen las siguientes propiedades de las disoluciones acuosas y el pH. Tres son correctas y UNA es el Impostor.',
        subject: 'Química',
        statements: [
          {
            id: 's1',
            label: 'Tripulante Rojo',
            crewColor: 'red',
            text: 'A 25 °C, una disolución neutra como el agua pura tiene un pH exactamente igual a 7, donde [H⁺] = [OH⁻].',
            isImpostor: false,
          },
          {
            id: 's2',
            label: 'Tripulante Cian',
            crewColor: 'cyan',
            text: 'Al disminuir el valor numérico del pH de 6 a 4, la acidez disminuye y la concentración de iones H⁺ se vuelve 100 veces menor.',
            isImpostor: true,
          },
          {
            id: 's3',
            label: 'Tripulante Lima',
            crewColor: 'lime',
            text: 'El Hidróxido de Sodio (NaOH) es una base fuerte que en agua se disocia liberando iones hidroxilo (OH⁻) y tiene un pH mayor a 7.',
            isImpostor: false,
          },
          {
            id: 's4',
            label: 'Tripulante Ámbar',
            crewColor: 'amber',
            text: 'La reacción de neutralización entre un ácido fuerte (HCl) y una base fuerte (NaOH) produce una sal (NaCl) y agua (H₂O).',
            isImpostor: false,
          },
        ],
        justificationOptions: [
          'Porque el agua pura tiene pH 14 y no pH 7.',
          'Porque en la escala logarítmica de pH, un número menor indica MAYOR acidez: pasar de pH 6 a pH 4 significa que [H⁺] es 100 veces MAYOR.',
          'Porque el NaOH es un ácido diprótico.',
          'Porque un ácido más una base nunca producen agua.',
        ],
        correctJustificationIndex: 1,
        impostorExplanation:
          '¡El Tripulante Cian era el Impostor! Como pH = -log[H⁺], al bajar de pH 6 a pH 4 la solución es MÁS ácida y tiene 10² = 100 veces más iones H⁺.',
      },
      {
        id: 'imp-q-3',
        topicTitle: 'Ronda 3: Gases Nobles y Tabla Periódica',
        prompt:
          'Cuatro reportes de laboratorio describen las familias de la Tabla Periódica. Encuentren cuál afirmación sabotea los datos reales.',
        subject: 'Química',
        statements: [
          {
            id: 's1',
            label: 'Tripulante Rojo',
            crewColor: 'red',
            text: 'Los metales alcalinos (Grupo 1: Li, Na, K) tienen 1 electrón de valencia y reaccionan vigorosamente con el agua.',
            isImpostor: false,
          },
          {
            id: 's2',
            label: 'Tripulante Cian',
            crewColor: 'cyan',
            text: 'Los halógenos (Grupo 17: F, Cl, Br, I) poseen 7 electrones de valencia y alta electronegatividad, tendiendo a ganar 1 electrón.',
            isImpostor: false,
          },
          {
            id: 's3',
            label: 'Tripulante Lima',
            crewColor: 'lime',
            text: 'La electronegatividad en un mismo periodo disminuye de izquierda a derecha, siendo el Francio el elemento más electronegativo.',
            isImpostor: true,
          },
          {
            id: 's4',
            label: 'Tripulante Ámbar',
            crewColor: 'amber',
            text: 'Los gases nobles (Grupo 18: He, Ne, Ar) presentan su capa de valencia completa, lo que les confiere mínima reactividad química.',
            isImpostor: false,
          },
        ],
        justificationOptions: [
          'Porque la electronegatividad AUMENTA de izquierda a derecha en un periodo, y el elemento más electronegativo es el Flúor (F), no el Francio.',
          'Porque los gases nobles tienen solo 3 electrones de valencia.',
          'Porque el Litio y el Sodio son gases nobles.',
          'Porque los halógenos pertenecen al Grupo 2.',
        ],
        correctJustificationIndex: 0,
        impostorExplanation:
          '¡El Tripulante Lima era el Impostor! La electronegatividad aumenta de izquierda a derecha y de abajo hacia arriba; el Flúor (4.0) es el más electronegativo, mientras que el Francio es de los menos electronegativos.',
      },
      {
        id: 'imp-q-4',
        topicTitle: 'Ronda 4: Ley de Conservación de la Materia y Estequiometría',
        prompt:
          'Inspeccionen estas ecuaciones y principios químicos. Tres cumplen las leyes de Lavoisier y UNA tiene una trampa.',
        subject: 'Química',
        statements: [
          {
            id: 's1',
            label: 'Tripulante Rojo',
            crewColor: 'red',
            text: 'En toda reacción química ordinaria, la masa total de los reactivos es exactamente igual a la masa total de los productos.',
            isImpostor: false,
          },
          {
            id: 's2',
            label: 'Tripulante Cian',
            crewColor: 'cyan',
            text: 'La ecuación 2H₂ + O₂ → 2H₂O está perfectamente balanceada porque hay 4 átomos de H y 2 átomos de O en ambos lados.',
            isImpostor: false,
          },
          {
            id: 's3',
            label: 'Tripulante Lima',
            crewColor: 'lime',
            text: 'En la combustión completa del metano (CH₄ + 2O₂ → CO₂ + 2H₂O), por cada mol de CH₄ se producen 2 moles de agua.',
            isImpostor: false,
          },
          {
            id: 's4',
            label: 'Tripulante Ámbar',
            crewColor: 'amber',
            text: 'Para balancear una ecuación química correctamente, está permitido modificar los subíndices de las fórmulas (por ejemplo, cambiar H₂O por H₂O₂).',
            isImpostor: true,
          },
        ],
        justificationOptions: [
          'Porque al balancear ecuaciones SOLO se pueden modificar los coeficientes estequiométricos; cambiar los subíndices altera la identidad química de la sustancia.',
          'Porque la masa siempre desaparece en las reacciones exotérmicas.',
          'Porque 2H₂ + O₂ produce metano y no agua.',
          'Porque Lavoisier demostró que los átomos se destruyen al calentarse.',
        ],
        correctJustificationIndex: 0,
        impostorExplanation:
          '¡El Tripulante Ámbar era el Impostor! Cambiar un subíndice (de H₂O a H₂O₂) transforma el agua en peróxido de hidrógeno. Solo deben ajustarse los coeficientes delante de las fórmulas.',
      },
      {
        id: 'imp-q-5',
        topicTitle: 'Ronda 5: Termoquímica y Catalizadores',
        prompt:
          'Ronda final de laboratorio: identifiquen cuál de estas 4 afirmaciones sobre energía y velocidad de reacción es falsa.',
        subject: 'Química',
        statements: [
          {
            id: 's1',
            label: 'Tripulante Rojo',
            crewColor: 'red',
            text: 'Una reacción exotérmica libera energía en forma de calor hacia el entorno y su cambio de entalpía (ΔH) tiene signo negativo.',
            isImpostor: false,
          },
          {
            id: 's2',
            label: 'Tripulante Cian',
            crewColor: 'cyan',
            text: 'Un catalizador positivo acelera la velocidad de reacción porque disminuye la energía de activación necesaria.',
            isImpostor: false,
          },
          {
            id: 's3',
            label: 'Tripulante Lima',
            crewColor: 'lime',
            text: 'El catalizador se consume por completo durante la reacción para transformarse en el producto principal y aumentar el rendimiento.',
            isImpostor: true,
          },
          {
            id: 's4',
            label: 'Tripulante Ámbar',
            crewColor: 'amber',
            text: 'En una reacción endotérmica (como la fotosíntesis), el sistema absorbe energía del entorno y tiene ΔH > 0.',
            isImpostor: false,
          },
        ],
        justificationOptions: [
          'Porque las reacciones exotérmicas tienen ΔH positivo.',
          'Porque un catalizador NO se consume en la reacción global (se recupera al final) ni altera el ΔH o equilibrio, solo ofrece una ruta de menor energía de activación.',
          'Porque la fotosíntesis es una reacción nuclear.',
          'Porque los catalizadores aumentan la energía de activación al doble.',
        ],
        correctJustificationIndex: 1,
        impostorExplanation:
          '¡El Tripulante Lima era el Impostor! La característica fundamental de un catalizador es que participa reduciendo la energía de activación pero se regenera intacto al final del ciclo.',
      },
    ],
  },
  {
    id: 'impostor-seed-matematicas-fisica',
    title: 'El Impostor: Fórmulas de Física y Álgebra',
    description:
      'Detecta el error oculto en fórmulas clásicas de álgebra, cinemática, leyes de Newton y energía.',
    subject: 'Física y Matemáticas',
    authorName: 'Comunidad AulaPlay',
    createdAt: 1735010000000,
    playsCount: 37,
    likesCount: 24,
    tags: ['física', 'matemáticas', 'fórmulas', 'álgebra'],
    rounds: [
      {
        id: 'imp-mf-1',
        topicTitle: 'Ronda 1: Productos Notables y Álgebra',
        prompt:
          'Cuatro igualdades algebraicas están escritas en el pizarrón. Tres son identidades verdaderas para cualquier valor real y UNA es el clásico Impostor.',
        subject: 'Matemáticas',
        statements: [
          {
            id: 's1',
            label: 'Tripulante Rojo',
            crewColor: 'red',
            text: 'Diferencia de cuadrados: a² - b² = (a + b)(a - b)',
            isImpostor: false,
          },
          {
            id: 's2',
            label: 'Tripulante Cian',
            crewColor: 'cyan',
            text: 'Binomio al cuadrado: (a + b)² = a² + b²',
            isImpostor: true,
          },
          {
            id: 's3',
            label: 'Tripulante Lima',
            crewColor: 'lime',
            text: 'Leyes de los exponentes: (xᵃ) · (xᵇ) = xᵃ⁺ᵇ',
            isImpostor: false,
          },
          {
            id: 's4',
            label: 'Tripulante Ámbar',
            crewColor: 'amber',
            text: 'Teorema de Pitágoras en un triángulo rectángulo: c² = a² + b²',
            isImpostor: false,
          },
        ],
        justificationOptions: [
          'Porque al desarrollar (a + b)² falta el término central del doble producto: lo correcto es (a + b)² = a² + 2ab + b².',
          'Porque la diferencia de cuadrados no se puede factorizar.',
          'Porque al multiplicar potencias de la misma base los exponentes se dividen.',
          'Porque el Teorema de Pitágoras usa resta en la hipotenusa.',
        ],
        correctJustificationIndex: 0,
        impostorExplanation:
          '¡El Tripulante Cian era el Impostor! Olvidar el término central +2ab es el error más famoso del álgebra: (a + b)² = a² + 2ab + b².',
      },
      {
        id: 'imp-mf-2',
        topicTitle: 'Ronda 2: Leyes de Newton y Gravedad',
        prompt:
          'Analicen los principios de la mecánica clásica. ¿Cuál de los 4 enunciados contiene una falacia física?',
        subject: 'Física',
        statements: [
          {
            id: 's1',
            label: 'Tripulante Rojo',
            crewColor: 'red',
            text: 'Segunda Ley de Newton: La aceleración de un objeto es directamente proporcional a la fuerza neta e inversamente proporcional a su masa (F = m · a).',
            isImpostor: false,
          },
          {
            id: 's2',
            label: 'Tripulante Cian',
            crewColor: 'cyan',
            text: 'Tercera Ley de Newton: Si un cuerpo A ejerce una fuerza sobre un cuerpo B, el cuerpo B ejerce una fuerza de igual magnitud y sentido opuesto sobre A.',
            isImpostor: false,
          },
          {
            id: 's3',
            label: 'Tripulante Lima',
            crewColor: 'lime',
            text: 'En el vacío (sin resistencia del aire), una bola de boliche de 7 kg cae al suelo mucho más rápido que una pluma porque tiene mayor masa.',
            isImpostor: true,
          },
          {
            id: 's4',
            label: 'Tripulante Ámbar',
            crewColor: 'amber',
            text: 'La masa de un astronauta (en kg) es la misma en la Tierra que en la Luna, aunque su peso (en Newtons) sea menor en la Luna.',
            isImpostor: false,
          },
        ],
        justificationOptions: [
          'Porque en el vacío todos los cuerpos caen exactamente con la misma aceleración gravitatoria (g ≈ 9.8 m/s²) sin importar su masa, llegando al suelo al mismo tiempo.',
          'Porque la masa cambia según la gravedad del planeta.',
          'Porque F = m / a.',
          'Porque las fuerzas de acción y reacción actúan sobre el mismo cuerpo.',
        ],
        correctJustificationIndex: 0,
        impostorExplanation:
          '¡El Tripulante Lima era el Impostor! Como demostró Galileo y se comprobó en la misión Apolo 15, en ausencia de aire una pluma y un objeto pesado caen exactamente al mismo ritmo.',
      },
      {
        id: 'imp-mf-3',
        topicTitle: 'Ronda 3: Energía Cinética y Potencial',
        prompt:
          'Tres fórmulas y conceptos sobre trabajo y energía son correctos y uno fue alterado por el Impostor.',
        subject: 'Física',
        statements: [
          {
            id: 's1',
            label: 'Tripulante Rojo',
            crewColor: 'red',
            text: 'La energía potencial gravitatoria cerca de la superficie terrestre se calcula como Ep = m · g · h.',
            isImpostor: false,
          },
          {
            id: 's2',
            label: 'Tripulante Cian',
            crewColor: 'cyan',
            text: 'La energía cinética de un cuerpo es Ec = ½ · m · v², por lo que si su velocidad se duplica, su energía cinética se cuadruplica.',
            isImpostor: false,
          },
          {
            id: 's3',
            label: 'Tripulante Lima',
            crewColor: 'lime',
            text: 'En el Sistema Internacional (SI), tanto el Trabajo mecánico como el Calor y la Energía se miden en Joules (J).',
            isImpostor: false,
          },
          {
            id: 's4',
            label: 'Tripulante Ámbar',
            crewColor: 'amber',
            text: 'Cuando un objeto cae libremente sin fricción, su energía potencial disminuye y su energía cinética también disminuye hasta llegar a cero justo antes de tocar el suelo.',
            isImpostor: true,
          },
        ],
        justificationOptions: [
          'Porque por conservación de la energía mecánica, al caer el objeto la energía potencial que pierde se transforma en un AUMENTO de energía cinética (alcanza su velocidad máxima justo antes de tocar el suelo).',
          'Porque la energía cinética se mide en Watts y no en Joules.',
          'Porque al duplicar la velocidad la energía cinética se reduce a la mitad.',
          'Porque Ep = m / h.',
        ],
        correctJustificationIndex: 0,
        impostorExplanation:
          '¡El Tripulante Ámbar era el Impostor! Durante la caída libre, toda la energía potencial gravitatoria se convierte en energía cinética, alcanzando su valor máximo justo antes del impacto.',
      },
    ],
  },
  {
    id: 'impostor-seed-biologia',
    title: 'El Impostor: Biología Celular, ADN y Ecosistemas',
    description:
      'Debate científico sobre orgánulos celulares, fotosíntesis, genética mendeliana y cadenas tróficas.',
    subject: 'Biología',
    authorName: 'Comunidad AulaPlay',
    createdAt: 1735020000000,
    playsCount: 31,
    likesCount: 20,
    tags: ['biología', 'célula', 'genética', 'adn'],
    rounds: [
      {
        id: 'imp-bio-1',
        topicTitle: 'Ronda 1: Célula Eucariota, Fotosíntesis y Respiración',
        prompt:
          'Cuatro reportes describen el metabolismo celular. Tres son verdaderos y uno tiene un error infiltrado.',
        subject: 'Biología',
        statements: [
          {
            id: 's1',
            label: 'Tripulante Rojo',
            crewColor: 'red',
            text: 'Las mitocondrias producen ATP mediante la respiración celular aeróbica y están presentes tanto en células animales como en células vegetales.',
            isImpostor: false,
          },
          {
            id: 's2',
            label: 'Tripulante Cian',
            crewColor: 'cyan',
            text: 'Los cloroplastos contienen clorofila y convierten energía luminosa, CO₂ y H₂O en glucosa y oxígeno (O₂).',
            isImpostor: false,
          },
          {
            id: 's3',
            label: 'Tripulante Lima',
            crewColor: 'lime',
            text: 'Las plantas realizan fotosíntesis de día, pero carecen de mitocondrias y nunca realizan respiración celular ni consumen oxígeno.',
            isImpostor: true,
          },
          {
            id: 's4',
            label: 'Tripulante Ámbar',
            crewColor: 'amber',
            text: 'La pared celular de las plantas está compuesta principalmente por celulosa y brinda soporte estructural.',
            isImpostor: false,
          },
        ],
        justificationOptions: [
          'Porque las células vegetales SÍ tienen mitocondrias y realizan respiración celular las 24 horas del día para obtener ATP a partir de la glucosa.',
          'Porque las células animales tienen cloroplastos.',
          'Porque la fotosíntesis consume oxígeno y libera dióxido de carbono.',
          'Porque la pared vegetal está hecha de colesterol puro.',
        ],
        correctJustificationIndex: 0,
        impostorExplanation:
          '¡El Tripulante Lima era el Impostor! Es un mito muy común creer que las plantas no respiran: las células vegetales poseen tanto cloroplastos (para sintetizar glucosa) como mitocondrias (para respirar y producir ATP).',
      },
      {
        id: 'imp-bio-2',
        topicTitle: 'Ronda 2: Estructura del ADN y ARN',
        prompt:
          'Examinen las bases nitrogenadas y la estructura de los ácidos nucleicos. ¿Quién es el Impostor?',
        subject: 'Biología',
        statements: [
          {
            id: 's1',
            label: 'Tripulante Rojo',
            crewColor: 'red',
            text: 'En la doble hélice del ADN, la Adenina (A) siempre se empareja con la Timina (T) y la Citocina (C) con la Guanina (G).',
            isImpostor: false,
          },
          {
            id: 's2',
            label: 'Tripulante Cian',
            crewColor: 'cyan',
            text: 'El ARN mensajero (ARNm) utiliza la base Uracilo (U) en lugar de Timina (T) y contiene el azúcar ribosa.',
            isImpostor: false,
          },
          {
            id: 's3',
            label: 'Tripulante Lima',
            crewColor: 'lime',
            text: 'Los ribosomas leen los codones del ARNm durante la traducción para ensamblar aminoácidos y formar proteínas.',
            isImpostor: false,
          },
          {
            id: 's4',
            label: 'Tripulante Ámbar',
            crewColor: 'amber',
            text: 'En cualquier molécula de ADN de doble cadena, el porcentaje de Adenina (A) es siempre igual al porcentaje de Guanina (G), mientras que el Uracilo forma enlaces triples.',
            isImpostor: true,
          },
        ],
        justificationOptions: [
          'Porque según las reglas de Chargaff en el ADN, %A = %T y %C = %G, además de que el ADN no contiene Uracilo.',
          'Porque los ribosomas sintetizan lípidos y no proteínas.',
          'Porque el ADN tiene una sola hebra de ribosa.',
          'Porque la Citocina se une siempre con la Adenina.',
        ],
        correctJustificationIndex: 0,
        impostorExplanation:
          '¡El Tripulante Ámbar era el Impostor! En el ADN la Adenina se aparea con la Timina (%A = %T) y el Uracilo es exclusivo del ARN.',
      },
    ],
  },
];

export interface TeacherImpostorConfig {
  roundTimeSeconds?: number;
  maxRounds?: number;
  pointsPerHit?: number;
  wrongVotePenalty?: number;
  shuffleRounds?: boolean;
  shuffleStatements?: boolean;
  hideLiveVotes?: boolean;
  autoRevealWhenAllVote?: boolean;
}

const CREW_PALETTE: Array<{ label: string; crewColor: 'red' | 'cyan' | 'lime' | 'amber' }> = [
  { label: 'Tripulante Rojo', crewColor: 'red' },
  { label: 'Tripulante Cian', crewColor: 'cyan' },
  { label: 'Tripulante Lima', crewColor: 'lime' },
  { label: 'Tripulante Ámbar', crewColor: 'amber' },
];

export function createInitialImpostorMatchState(
  pack: ImpostorGamePack,
  config?: TeacherImpostorConfig
): ImpostorMatchState {
  let rounds: ImpostorRound[] = pack.rounds.map((r) => ({
    ...r,
    statements: r.statements.map((s) => ({ ...s })),
  }));

  if (config?.shuffleRounds) {
    rounds = [...rounds].sort(() => Math.random() - 0.5);
  }

  if (config?.maxRounds && config.maxRounds > 0 && config.maxRounds < rounds.length) {
    rounds = rounds.slice(0, config.maxRounds);
  }

  if (config?.shuffleStatements) {
    rounds = rounds.map((r) => {
      const shuffledStmts = [...r.statements].sort(() => Math.random() - 0.5);
      const relabeled = shuffledStmts.map((stmt, idx) => {
        const crew = CREW_PALETTE[idx % CREW_PALETTE.length];
        return {
          ...stmt,
          label: crew.label,
          crewColor: crew.crewColor,
        };
      });
      const impostorStmt = relabeled.find((s) => s.isImpostor);
      return {
        ...r,
        statements: relabeled,
        impostorExplanation: impostorStmt
          ? r.impostorExplanation.replace(
              /¡El Tripulante (Rojo|Cian|Lima|Ámbar) era el Impostor!/i,
              `¡El ${impostorStmt.label} era el Impostor!`
            )
          : r.impostorExplanation,
      };
    });
  }

  return {
    packId: pack.id,
    packTitle: pack.title,
    rounds,
    currentRoundIndex: 0,
    phase: 'debate',
    playerScores: {},
    votes: {},
    ejectedStatementIndex: null,
    roundTimeSeconds: config?.roundTimeSeconds ?? 0,
    pointsPerHit: config?.pointsPerHit ?? 100,
    wrongVotePenalty: config?.wrongVotePenalty ?? 0,
    hideLiveVotes: config?.hideLiveVotes ?? false,
    autoRevealWhenAllVote: config?.autoRevealWhenAllVote ?? false,
  };
}
