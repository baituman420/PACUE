import { Job, ClientProfile, Speaker, SubtitleSegment, DeliveryRecord, QCProfile } from '../types';

export const DEFAULT_QC_PROFILE_RTVE: QCProfile = {
  id: 'qc_rtve_sdh',
  name: 'RTVE Norma Técnica SDH',
  minDurationMs: 800,
  maxDurationMs: 6500,
  maxCps: 18,
  maxCharactersPerLine: 37,
  maxLines: 2,
  requireSpeakerConfirmed: true,
  detectOverlap: true,
};

export const DEFAULT_QC_PROFILE_AMAZON: QCProfile = {
  id: 'qc_amazon_std',
  name: 'Amazon Prime Video ES Presets',
  minDurationMs: 800,
  maxDurationMs: 7000,
  maxCps: 20,
  maxCharactersPerLine: 42,
  maxLines: 2,
  requireSpeakerConfirmed: true,
  detectOverlap: true,
};

export const MOCK_CLIENTS: Record<string, ClientProfile> = {
  'client_rtve': {
    id: 'client_rtve',
    name: 'RTVE',
    code: 'RTVE',
    serviceDefault: 'Subtitulado SDH',
    outputFormat: 'PAC',
    defaultFps: 25,
    tools: ['EZTitles', 'FAB Subtitler', 'Subtitle Edit'],
    deliveryFolder: 'Drive / RTVE / Entregados',
    namingRules: 'RTVE_{PROGRAM}_{YYYYMMDD}_{LANG}.pac',
    qcProfile: DEFAULT_QC_PROFILE_RTVE,
    notes: 'Revisión obligatoria de colores SDH y sincronización estricta a 25 cuadros por segundo.'
  },
  'client_amazon': {
    id: 'client_amazon',
    name: 'Amazon Demo',
    code: 'AMZN',
    serviceDefault: 'Subtitulado ES',
    outputFormat: 'PAC / configurable',
    defaultFps: 25,
    tools: ['Subtitle Edit', 'EZTitles'],
    deliveryFolder: 'Drive / Amazon / Staging',
    namingRules: 'AMZN_{SERIE}_{EP}_{LANG}.pac',
    qcProfile: DEFAULT_QC_PROFILE_AMAZON,
    notes: 'Transcripción automática previa permitida. Validación rigurosa de CPS máximo a 20.'
  }
};

export const INITIAL_SPEAKERS: Record<string, Speaker> = {
  'spk_01': {
    id: 'spk_01',
    displayName: 'JUAN',
    confirmed: true,
    color: '#38bdf8', // Neon Sky Blue
    role: 'Presentador de plató'
  },
  'spk_02': {
    id: 'spk_02',
    displayName: 'ELENA',
    confirmed: true,
    color: '#a78bfa', // Purple
    role: 'Corresponsal en exteriores'
  },
  'spk_03': {
    id: 'spk_03',
    displayName: 'Speaker 03',
    confirmed: false,
    color: '#f59e0b', // Amber
    role: 'Sin identificar'
  },
  'spk_04': {
    id: 'spk_04',
    displayName: 'Speaker 04',
    confirmed: false,
    color: '#ec4899', // Pink
    role: 'Sin identificar'
  },
  'spk_05': {
    id: 'spk_05',
    displayName: 'Speaker 05',
    confirmed: false,
    color: '#10b981', // Emerald
    role: 'Sin identificar'
  }
};

export const MOCK_JOBS: Job[] = [
  {
    id: 'job_rtve_01',
    clientId: 'client_rtve',
    clientName: 'RTVE',
    title: 'Informativo Territorial 16/09',
    duration: '00:42:16',
    durationSeconds: 2536,
    serviceType: 'Subtitulado SDH',
    deadline: 'Hoy 15:30',
    priority: 'Alta',
    expectedFormat: 'PAC',
    fps: 25,
    language: 'es-ES',
    status: 'Disponible',
    currentStage: 'editar',
    videoFileName: 'RTVE_INFO_20260916_MASTER.mp4'
  },
  {
    id: 'job_amzn_02',
    clientId: 'client_amazon',
    clientName: 'Amazon',
    title: 'Serie Demo — Episodio 04',
    duration: '00:51:32',
    durationSeconds: 3092,
    serviceType: 'Subtitulado ES',
    deadline: 'Mañana 12:00',
    priority: 'Media',
    expectedFormat: 'PAC',
    fps: 25,
    language: 'es-ES',
    status: 'Disponible',
    currentStage: 'editar',
    videoFileName: 'AMZN_S01_E04_ROUGHCUT.mp4'
  },
  {
    id: 'job_rtve_03',
    clientId: 'client_rtve',
    clientName: 'RTVE',
    title: 'Documental Demo',
    duration: '01:17:08',
    durationSeconds: 4628,
    serviceType: 'Subtitulado SDH',
    deadline: '18/09',
    priority: 'Baja',
    expectedFormat: 'PAC',
    fps: 25,
    language: 'es-ES',
    status: 'Disponible',
    currentStage: 'preparar',
    videoFileName: 'RTVE_DOC_BIODIVERSIDAD_01.mp4'
  }
];

export const MOCK_HISTORY: DeliveryRecord[] = [
  {
    id: 'hist_01',
    jobId: 'job_hist_prev_01',
    clientName: 'RTVE',
    projectTitle: 'Informativo 16/09 — Edición Matinal',
    technician: 'Ane García',
    startedAt: '09:43',
    completedAt: '12:37',
    durationFormatted: '2h 54m',
    format: 'PAC',
    fileName: 'RTVE_INFO_20260916_MAT_ES.pac',
    fileSize: '48.2 KB',
    destinationFolder: 'Drive / RTVE / Entregados',
    status: 'Finalizado',
    isSimulated: true,
  },
  {
    id: 'hist_02',
    jobId: 'job_hist_prev_02',
    clientName: 'Amazon',
    projectTitle: 'Serie Demo EP03',
    technician: 'Iker',
    startedAt: '08:31',
    completedAt: '11:22',
    durationFormatted: '2h 51m',
    format: 'PAC',
    fileName: 'AMZN_SERIEDEMO_S01E03_ES.pac',
    fileSize: '62.4 KB',
    destinationFolder: 'Drive / Amazon / Staging',
    status: 'Finalizado',
    isSimulated: true,
  }
];

/**
 * 114 Realistic Subtitle segments.
 * Exactly 24 segments assigned to 'spk_03' (ready to identify as MARTA).
 * 12 assigned to 'spk_04', 5 assigned to 'spk_05'.
 * Remaining assigned to 'spk_01' (JUAN) and 'spk_02' (ELENA).
 */
export function buildDemoSegments(): SubtitleSegment[] {
  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 1000);
    return `00:${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
  };

  const rawDialogue: Array<{ spk: string; text: string; dur: number; gap: number }> = [
    // 1 - 10: Introduction by JUAN and handoff to ELENA
    { spk: 'spk_01', text: 'Buenas tardes. Comenzamos este informativo territorial con la última hora económica.', dur: 3.5, gap: 0.5 },
    { spk: 'spk_01', text: 'El parque tecnológico de Zamudio ha presentado hoy su plan de sostenibilidad para 2030.', dur: 4.2, gap: 0.4 },
    { spk: 'spk_01', text: 'Una inversión de más de cuarenta millones de euros en transición energética e infraestructuras.', dur: 4.0, gap: 0.3 },
    { spk: 'spk_01', text: 'Nuestra compañera Elena se encuentra en directo en el recinto ferial.', dur: 3.1, gap: 0.4 },
    { spk: 'spk_01', text: 'Elena, ¿cuáles han sido los anuncios más destacados de esta mañana?', dur: 3.2, gap: 0.6 },
    { spk: 'spk_02', text: 'Efectivamente, Juan. El ambiente aquí ha sido de máxima expectación durante toda la rueda de prensa.', dur: 4.5, gap: 0.4 },
    { spk: 'spk_02', text: 'El anuncio principal se centra en la remodelación completa de las naves auxiliares del campus central.', dur: 4.8, gap: 0.3 },
    { spk: 'spk_02', text: 'Se instalarán más de dos mil paneles solares y nuevos puntos de recarga ultrarrápida.', dur: 4.1, gap: 0.5 },
    { spk: 'spk_02', text: 'Pero la atención ha estado puesta en las declaraciones de los portavoces de la asociación industrial.', dur: 4.4, gap: 0.6 },
    { spk: 'spk_02', text: 'Escuchamos en primer lugar a la directora de operaciones de la federación.', dur: 3.6, gap: 0.8 },

    // 11 - 22: First block of SPK_03 (MARTA - unassigned, 12 segments here)
    { spk: 'spk_03', text: '¿Qué estás haciendo aquí?', dur: 2.1, gap: 0.4 }, // #11 Iconic dialogue test from prompt
    { spk: 'spk_03', text: 'Llevamos meses trabajando de forma coordinada con las administraciones públicas.', dur: 3.9, gap: 0.3 },
    { spk: 'spk_03', text: 'La competitividad de nuestras empresas depende directamente del coste de la energía limpia.', dur: 4.3, gap: 0.4 },
    { spk: 'spk_03', text: 'Si no aseguramos un suministro estable y predecible, los costes operativos se dispararán.', dur: 4.5, gap: 0.4 },
    { spk: 'spk_03', text: 'Por eso este acuerdo representa un paso decisivo para todos los fabricantes del sector.', dur: 4.0, gap: 0.3 },
    { spk: 'spk_03', text: 'Hemos comprometido recursos propios junto a las ayudas europeas para acelerar las obras.', dur: 4.2, gap: 0.5 },
    { spk: 'spk_03', text: 'El calendario es ambicioso: queremos que la primera fase esté operativa antes de diciembre.', dur: 4.4, gap: 0.3 },
    { spk: 'spk_03', text: 'Sabemos que hay dudas sobre la disponibilidad de personal técnico cualificado en la comarca.', dur: 4.6, gap: 0.4 },
    { spk: 'spk_03', text: 'Pero hemos suscrito convenios formativos con la universidad y los centros de formación profesional.', dur: 4.8, gap: 0.4 },
    { spk: 'spk_03', text: 'Los estudiantes podrán realizar prácticas remuneradas en entornos reales desde el primer semestre.', dur: 4.5, gap: 0.3 },
    { spk: 'spk_03', text: 'Es una oportunidad histórica de arraigo del talento local que no podemos dejar escapar.', dur: 4.1, gap: 0.5 },
    { spk: 'spk_03', text: 'Confiamos plenamente en la respuesta del tejido empresarial en las próximas semanas.', dur: 3.8, gap: 0.6 },

    // 23 - 30: ELENA and SPK_04 (Local witness, 6 segments)
    { spk: 'spk_02', text: 'Palabras claras que contrastan con la opinión de algunos residentes de las zonas limítrofes.', dur: 4.3, gap: 0.4 },
    { spk: 'spk_02', text: 'Nos acompaña ahora un representante vecinal del barrio contiguo.', dur: 3.2, gap: 0.5 },
    { spk: 'spk_04', text: 'Nuestra principal inquietud sigue siendo el aumento del tráfico pesado durante las obras.', dur: 4.1, gap: 0.3 },
    { spk: 'spk_04', text: 'Las vías de acceso actuales son estrechas y ya sufren saturación en horas punta.', dur: 3.9, gap: 0.4 },
    { spk: 'spk_04', text: 'Pedimos que se habilite una variante provisional para los camiones de gran tonelaje.', dur: 4.2, gap: 0.3 },
    { spk: 'spk_04', text: 'Si no se toman medidas, la convivencia vecinal se verá gravemente afectada.', dur: 3.7, gap: 0.4 },
    { spk: 'spk_04', text: 'Esperamos que el ayuntamiento nos reciba formalmente este próximo jueves.', dur: 3.5, gap: 0.4 },
    { spk: 'spk_04', text: 'Queremos soluciones antes de que comience el movimiento de tierras en la ladera norte.', dur: 4.0, gap: 0.5 },

    // 31 - 42: ELENA and SPK_03 (MARTA - second block, 12 segments -> total 24!)
    { spk: 'spk_02', text: 'Volvemos con la portavoz para conocer la respuesta a esta demanda de los vecinos.', dur: 4.1, gap: 0.4 },
    { spk: 'spk_03', text: 'Entendemos perfectamente la inquietud de los vecinos y estamos en contacto permanente con ellos.', dur: 4.6, gap: 0.3 },
    { spk: 'spk_03', text: 'El plan de tráfico ya contempla accesos restringidos y desvíos fuera de las calles residenciales.', dur: 4.8, gap: 0.4 },
    { spk: 'spk_03', text: 'Ningún vehículo pesado atravesará el núcleo urbano durante el horario de entrada a las escuelas.', dur: 4.5, gap: 0.3 },
    { spk: 'spk_03', text: 'Instalaremos además sonómetros y pantallas fonoabsorbentes en todo el perímetro exterior.', dur: 4.3, gap: 0.4 },
    { spk: 'spk_03', text: 'La seguridad y el descanso de las familias son una prioridad irrenunciable para nosotros.', dur: 4.1, gap: 0.3 },
    { spk: 'spk_03', text: 'El diálogo está abierto y asistiremos a la reunión del jueves con propuestas concretas.', dur: 4.2, gap: 0.4 },
    { spk: 'spk_03', text: 'Queremos que este proyecto sea motivo de orgullo para todo el municipio, no de fricción.', dur: 4.4, gap: 0.3 },
    { spk: 'spk_03', text: 'Habrá un canal de comunicación directo para reportar cualquier incidencia en tiempo real.', dur: 4.0, gap: 0.4 },
    { spk: 'spk_03', text: 'Los resultados medioambientales se publicarán trimestralmente en un portal abierto.', dur: 3.9, gap: 0.3 },
    { spk: 'spk_03', text: 'Estamos convencidos de que lograremos un equilibrio satisfactorio para ambas partes.', dur: 3.8, gap: 0.4 },
    { spk: 'spk_03', text: 'Agradecemos la disposición constructiva que siempre han demostrado las asociaciones.', dur: 3.7, gap: 0.6 },

    // 43 - 52: ELENA and JUAN transition
    { spk: 'spk_02', text: 'Una respuesta conciliadora que abre la puerta a un entendimiento entre empresa y vecindario.', dur: 4.5, gap: 0.4 },
    { spk: 'spk_02', text: 'Estaremos muy pendientes del resultado de esa mesa técnica convocada para pasado mañana.', dur: 4.2, gap: 0.3 },
    { spk: 'spk_02', text: 'Desde el parque tecnológico, esto es todo por ahora. Devolvemos la conexión a plató.', dur: 3.9, gap: 0.5 },
    { spk: 'spk_01', text: 'Gracias Elena por esa completa crónica en directo.', dur: 2.5, gap: 0.4 },
    { spk: 'spk_01', text: 'Pasamos ahora a repasar otras noticias destacadas de la jornada.', dur: 3.2, gap: 0.3 },
    { spk: 'spk_01', text: 'La Agencia Vasca de Meteorología ha desactivado la alerta naranja por precipitaciones intensas.', dur: 4.4, gap: 0.4 },
    { spk: 'spk_01', text: 'Los cauces de los ríos principales han recuperado niveles seguros tras el cese de las lluvias.', dur: 4.1, gap: 0.3 },
    { spk: 'spk_01', text: 'No obstante, se recomienda precaución en las carreteras de montaña por riesgo de desprendimientos.', dur: 4.7, gap: 0.4 },
    { spk: 'spk_01', text: 'Los servicios de mantenimiento siguen retirando ramas caídas en la comarca de Enkarterri.', dur: 4.0, gap: 0.5 },
    { spk: 'spk_01', text: 'Vamos ahora con los datos del paro registrado en el mes de agosto.', dur: 3.2, gap: 0.4 },

    // 53 - 62: Economic and sports news by JUAN with SPK_05 (Expert, 5 segments)
    { spk: 'spk_01', text: 'El desempleo experimentó un ligero repunte del cero coma tres por ciento en los servicios.', dur: 4.3, gap: 0.3 },
    { spk: 'spk_01', text: 'Sin embargo, la cifra global de afiliaciones a la seguridad social se mantiene en máximos.', dur: 4.1, gap: 0.4 },
    { spk: 'spk_01', text: 'Hablamos a continuación con un analista del observatorio económico.', dur: 3.1, gap: 0.5 },
    { spk: 'spk_05', text: 'El comportamiento del empleo estival ha sido notablemente más estable que en años anteriores.', dur: 4.4, gap: 0.3 },
    { spk: 'spk_05', text: 'La contratación indefinida ha demostrado ser un cortafuegos eficaz contra la volatilidad.', dur: 4.2, gap: 0.4 },
    { spk: 'spk_05', text: 'Los sectores tecnológico e industrial continúan creando puestos de trabajo cualificados.', dur: 4.0, gap: 0.3 },
    { spk: 'spk_05', text: 'La previsión para el último trimestre del ejercicio se orienta hacia una suave aceleración.', dur: 4.3, gap: 0.4 },
    { spk: 'spk_05', text: 'El mayor desafío continuará siendo la inflación subyacente en la cesta básica de consumo.', dur: 4.1, gap: 0.6 },
    { spk: 'spk_01', text: 'Un análisis esperanzador que confirma la resiliencia de nuestro tejido productivo.', dur: 3.8, gap: 0.4 },
    { spk: 'spk_01', text: 'En clave cultural, el Festival Internacional de Cine de San Sebastián calienta ya motores.', dur: 4.2, gap: 0.3 },

    // 63 - 74: Cultural notes with SPK_04 (remaining 6 segments -> total 12 for spk_04)
    { spk: 'spk_01', text: 'La alfombra roja del Kursaal acogerá a más de doscientas personalidades cinematográficas.', dur: 4.1, gap: 0.4 },
    { spk: 'spk_01', text: 'La venta de entradas comenzó esta mañana a las nueve con largas colas virtuales en la web.', dur: 4.5, gap: 0.3 },
    { spk: 'spk_01', text: 'Nos atiende uno de los programadores de la sección oficial.', dur: 3.0, gap: 0.4 },
    { spk: 'spk_04', text: 'Hemos recibido cerca de tres mil candidaturas de setenta y cuatro países distintos.', dur: 4.2, gap: 0.3 },
    { spk: 'spk_04', text: 'La calidad de las producciones iberoamericanas de este año es sencillamente extraordinaria.', dur: 4.3, gap: 0.4 },
    { spk: 'spk_04', text: 'Habrá estrenos mundiales muy esperados que competirán directamente por la Concha de Oro.', dur: 4.1, gap: 0.3 },
    { spk: 'spk_04', text: 'También dedicamos un espacio preferente al cine documental y a las óperas primas jóvenes.', dur: 4.4, gap: 0.4 },
    { spk: 'spk_04', text: 'Las salas de proyección están listas y los protocolos de accesibilidad están garantizados.', dur: 4.2, gap: 0.3 },
    { spk: 'spk_04', text: 'Queremos que todo el público disfrute de la gran fiesta del cine con total comodidad.', dur: 3.9, gap: 0.5 },
    { spk: 'spk_01', text: 'Recordamos que la gala inaugural tendrá lugar el próximo viernes a las veintiuna horas.', dur: 4.2, gap: 0.3 },
    { spk: 'spk_01', text: 'Podrán seguirla en riguroso directo a través de La 1 y de RTVE Play.', dur: 3.7, gap: 0.4 },
    { spk: 'spk_01', text: 'Tiempo ahora para la actualidad deportiva con el entrenamiento del Athletic Club en Lezama.', dur: 4.3, gap: 0.4 },

    // 75 - 86: Sports news by JUAN and ELENA
    { spk: 'spk_01', text: 'El conjunto rojiblanco prepara el crucial choque liguero frente al Sevilla de este domingo.', dur: 4.2, gap: 0.3 },
    { spk: 'spk_01', text: 'Ernesto Valverde ha podido contar con toda la plantilla al completo en la sesión matinal.', dur: 4.0, gap: 0.4 },
    { spk: 'spk_01', text: 'El delantero Nico Williams ha completado los noventa minutos con el grupo sin molestias.', dur: 4.1, gap: 0.3 },
    { spk: 'spk_01', text: 'Todo apunta a que estará en el once inicial en el estadio Sánchez Pizjuán.', dur: 3.6, gap: 0.4 },
    { spk: 'spk_02', text: 'La afición desplazada superará los mil quinientos seguidores en las gradas sevillanas.', dur: 4.1, gap: 0.3 },
    { spk: 'spk_02', text: 'El club ha organizado vuelos chárter y autobuses directos para los socios y peñistas.', dur: 4.3, gap: 0.4 },
    { spk: 'spk_02', text: 'La ilusión es máxima tras sumar siete de los últimos nueve puntos en juego.', dur: 3.7, gap: 0.3 },
    { spk: 'spk_02', text: 'El vestuario apela a la concentración defensiva para mantener la racha de imbatibilidad.', dur: 4.2, gap: 0.4 },
    { spk: 'spk_01', text: 'Y en baloncesto, el Bilbao Basket disputa esta tarde su último amistoso de pretemporada.', dur: 4.3, gap: 0.3 },
    { spk: 'spk_01', text: 'El rival será el Oporto en el pabellón de Miribilla con entrada libre para los abonados.', dur: 4.1, gap: 0.4 },
    { spk: 'spk_01', text: 'El técnico Jaume Ponsarnau busca afinar automatismos antes del debut en la Liga Endesa.', dur: 4.4, gap: 0.4 },
    { spk: 'spk_01', text: 'Las nuevas incorporaciones han dejado muy buenas sensaciones en los partidos previos.', dur: 3.9, gap: 0.5 },

    // 87 - 98: Infrastructure, science and local community
    { spk: 'spk_01', text: 'En infraestructuras ferroviarias, Adif inicia la remodelación de andenes en la estación central.', dur: 4.4, gap: 0.3 },
    { spk: 'spk_01', text: 'Los trabajos permitirán mejorar la accesibilidad a personas con movilidad reducida.', dur: 4.0, gap: 0.4 },
    { spk: 'spk_01', text: 'Se instalarán cuatro nuevos ascensores panorámicos y pavimento táctil en todas las vías.', dur: 4.3, gap: 0.3 },
    { spk: 'spk_01', text: 'Las obras se prolongarán durante diez meses pero no afectarán a la frecuencia de los trenes.', dur: 4.6, gap: 0.4 },
    { spk: 'spk_02', text: 'Los usuarios de cercanías celebran una mejora largamente reclamada en la red metropolitana.', dur: 4.5, gap: 0.3 },
    { spk: 'spk_02', text: 'Especialmente los colectivos de mayores y familias con carritos infantiles.', dur: 3.6, gap: 0.4 },
    { spk: 'spk_02', text: 'El presupuesto total asciende a doce millones trescientos mil euros con cargo a los fondos Next.', dur: 4.7, gap: 0.4 },
    { spk: 'spk_02', text: 'El delegado de gobierno ha calificado la actuación de salto cualitativo en cohesión social.', dur: 4.4, gap: 0.4 },
    { spk: 'spk_01', text: 'Nos acercamos al final con una mirada a la ciencia marina en el centro tecnológico de Sukarrieta.', dur: 4.6, gap: 0.4 },
    { spk: 'spk_01', text: 'Un equipo de biólogos monitoriza la recuperación del ecosistema de la ría tras tres décadas de depuración.', dur: 5.1, gap: 0.4 },
    { spk: 'spk_01', text: 'Han catalogado más de sesenta especies de peces que han regresado a aguas interiores.', dur: 4.2, gap: 0.3 },
    { spk: 'spk_01', text: 'Un hito medioambiental que demuestra la eficacia de las inversiones sostenidas en saneamiento.', dur: 4.5, gap: 0.4 },

    // 99 - 110: Weather forecast and closing by JUAN and ELENA
    { spk: 'spk_01', text: 'Vamos ahora con la previsión del tiempo detallada para las próximas cuarenta y ocho horas.', dur: 4.3, gap: 0.4 },
    { spk: 'spk_02', text: 'Mañana jueves amaneceremos con cielos despejados y brumas matinales en los valles del interior.', dur: 4.8, gap: 0.3 },
    { spk: 'spk_02', text: 'Las temperaturas máximas subirán de forma generalizada hasta alcanzar los veinticinco grados.', dur: 4.6, gap: 0.4 },
    { spk: 'spk_02', text: 'En la franja litoral el viento soplará suave del nordeste a partir de mediodía.', dur: 4.1, gap: 0.3 },
    { spk: 'spk_02', text: 'El viernes continuará la estabilidad con ambiente soleado y agradable para pasear.', dur: 4.2, gap: 0.4 },
    { spk: 'spk_02', text: 'El fin de semana se presenta propicio para actividades y excursiones al aire libre.', dur: 4.0, gap: 0.5 },
    { spk: 'spk_01', text: 'Termina aquí este repaso a las noticias más relevantes de nuestra comunidad.', dur: 3.6, gap: 0.4 },
    { spk: 'spk_01', text: 'Toda la actualidad sigue minuto a minuto en Radio Nacional de España y en RTVE Noticias.', dur: 4.4, gap: 0.3 },
    { spk: 'spk_01', text: 'Volvemos a las veinte horas con la segunda edición de este informativo territorial.', dur: 3.9, gap: 0.4 },
    { spk: 'spk_01', text: 'Hasta entonces, que pasen una muy buena tarde. Agur.', dur: 3.1, gap: 0.5 },

    // 111 - 114: Credits and SDH technical identification markers (Exact 114 total segments!)
    { spk: 'spk_01', text: 'Subtitulado realizado por el departamento de accesibilidad audiovisual.', dur: 3.8, gap: 0.4 },
    { spk: 'spk_01', text: 'Control de emisión: RTVE Servicios Centrales.', dur: 2.8, gap: 0.3 },
    { spk: 'spk_01', text: 'Transcripción y sincronización profesional según norma UNE 153010.', dur: 3.9, gap: 0.4 },
    { spk: 'spk_01', text: 'Fin de emisión.', dur: 1.8, gap: 0.5 },
  ];

  // Specific intentional QC cases injected to make QC demo live and realistic:
  // - High CPS test: segment #42 has high speed (e.g. 21.8 CPS)
  // - Short duration test: segment #114 is 700ms (< 800ms)
  // - Overlap test: segment #8 has start overlapping segment #7 by 80ms
  let currentTime = 12.0; // Start at 12 seconds in video
  
  return rawDialogue.map((item, idx) => {
    let dur = item.dur;
    let gap = item.gap;

    if (idx === 113) {
      dur = 0.70; // #114 duration 700ms triggers too_short warning (< 800ms)
    }

    let start = currentTime;
    if (idx === 7) {
      // Overlap with previous segment by 100ms
      start = currentTime - 0.10;
    }

    const end = start + dur;
    currentTime = end + gap;

    return {
      id: `seg_${idx + 1}`,
      number: idx + 1,
      startTime: fmt(start),
      endTime: fmt(end),
      startSeconds: Number(start.toFixed(3)),
      endSeconds: Number(end.toFixed(3)),
      speakerId: item.spk,
      text: item.text,
      status: 'pending'
    };
  });
}
