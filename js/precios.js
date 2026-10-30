/* Precios orientativos de Isoterma (euros, IVA incluido). Son estimaciones de mercado en Valencia (2026)
   para que los socios las ajusten: cambiar aquí y la calculadora se actualiza sola.
   Cada precio es el MÍNIMO de la horquilla; el máximo sale de multiplicar por MARGEN, salvo que se dé [mín, máx]. */
window.ISOTERMA = {
  telefono: '34624931947',
  MARGEN: 1.2,

  instalacion: {
    // Equipo + instalación estándar (hasta 3 m de línea, soportes, desagüe a menos de 2 m y puesta en marcha)
    split: {        // por tamaño de la estancia: hasta 15 · 15–25 · 25–35 · más de 35 m²
      esencial: [690, 820, 1090, 1590],
      confort:  [890, 1040, 1390, 1990],
      premium:  [1150, 1350, 1790, 2490],
    },
    multisplit: {   // por número de estancias: 2 · 3 · 4
      esencial: [1650, 2350, 2990],
      confort:  [2050, 2890, 3690],
      premium:  [2650, 3690, 4690],
    },
    conductos: {    // por superficie de la vivienda: hasta 70 · 70–100 · 100–140 · más de 140 m²
      esencial: [3390, 4190, 5190, 6490],
      confort:  [4090, 4990, 6290, 7890],
      premium:  [5090, 6190, 7790, 9790],
    },
    // Solo mano de obra, si el cliente ya tiene el equipo
    soloInstalacion: { split: [290, 390], multisplit: [[520, 690], [720, 950], [920, 1220]], conductos: [1190, 1890] },
    // Extras por cada unidad interior (en conductos cuentan como 1)
    distancia: [null, [120, 180], [250, 380]],   // hasta 3 m (incluido) · 3–6 m · 6–10 m
    retirar: [60, 90],
    bomba: [110, 160],
    altura: [90, 250],                            // una vez por obra
  },

  aerotermia: {
    acs: [1890, 2690],                            // solo agua caliente (equipo de 200 L instalado)
    calefaccion: [[7490, 10490], [8990, 12490], [10990, 15490]],   // por superficie: hasta 90 · 90–140 · más de 140 m²
    frio: [1490, 3490],                           // suplemento por refrigeración (suelo refrescante o fancoils)
    caldera: [150, 350],                          // retirar la caldera o el termo antiguo
  },

  mantenimiento: {
    puntual: { primero: [75, 95], siguiente: [45, 60] },
    anual:   { primero: [95, 120], siguiente: [55, 70] },
  },

  reparacion: {
    diagnostico: [45, 60],
    sintomas: {
      noEnfria: { texto: 'No enfría o no calienta', rango: [150, 380], nota: 'Suele ser una fuga y una carga de gas, o un sensor.' },
      gotea:    { texto: 'Gotea agua', rango: [60, 150], nota: 'Casi siempre es el desagüe obstruido o mal nivelado.' },
      ruido:    { texto: 'Hace ruido', rango: [70, 220], nota: 'Ventilador, soportes o compresor: depende de dónde suene.' },
      error:    { texto: 'No enciende o da error', rango: [90, 350], nota: 'Placa, sensor o alimentación; lo vemos con el código de error.' },
      otro:     { texto: 'Otra cosa', rango: [60, 300], nota: 'Cuéntanoslo por WhatsApp y afinamos el precio.' },
    },
  },
};
