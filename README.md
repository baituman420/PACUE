# PACUE — Subtitle Production Workspace

> **Puesto Avanzado de Corrección, Unificación y Edición**  
> Workspace profesional para subtitulado y control de calidad (QC) en streaming y broadcast.

[![Deploy PACUE to GitHub Pages](https://github.com/baituman420/PACUE/actions/workflows/deploy.yml/badge.svg)](https://github.com/baituman420/PACUE/actions/workflows/deploy.yml)
[![Demo en Vivo](https://img.shields.io/badge/Demo%20en%20Vivo-GitHub%20Pages-B79D72?style=flat-square)](https://baituman420.github.io/PACUE/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3A352E?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-3A352E?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-3A352E?style=flat-square&logo=vite)](https://vitejs.dev/)

---

## 📽️ Demo en Vivo

Acceso directo a la versión desplegada en producción:  
👉 **[https://baituman420.github.io/PACUE/](https://baituman420.github.io/PACUE/)**

---

## ✨ Características Principales

### 1. Enfoque Timeline-First
- **Visualización espacial continua**: Cada bloque se posiciona horizontalmente según su `startTime` y su ancho refleja su duración exacta (`endTime - startTime`).
- **Ajuste interactivo con Pointer Events**:
  - Desplazamiento horizontal de bloques.
  - Tiradores (handles) interactivos de **IN** y **OUT** con snap configurable al fotograma del proyecto (24, 25, 29.97, 30 fps).
  - Recálculo en tiempo real con `requestAnimationFrame` para evitar bloqueos del hilo principal.
- **Waveform de Audio Real**:
  - Decodificación y renderizado de picos de audio directamente en el navegador mediante **Web Audio API**.
  - Fallback automático a waveform sintética si el códec del contenedor local no es compatible directamente con el navegador.
  - Zoom de visualización de timeline y altura de pista ajustable.

### 2. Control de Calidad (QC) en Tiempo Real
- **Motor de validación instantánea**:
  - Detección de solapamientos (*overlaps*) entre subtítulos adyacentes.
  - Verificación de velocidad de lectura (CPS - Caracteres por Segundo).
  - Longitud de línea (CPL - Caracteres por Línea).
  - Pausas mínimas entre subtítulos (*shot change / gap check*).
  - Duración mínima (ej. < 1.0s) y máxima (ej. > 7.0s).
- **Acceso directo a la norma**: Enlace directo "Ver Regla" desde cada incidencia para consultar la guía de estilo aplicable.

### 3. Sistema de Reglas de Subtitulado
- Reglas estructuradas en tres niveles:
  1. Generales de la industria (EBU, Netflix, broadcast estándar).
  2. Perfil de cliente.
  3. Proyecto específico.
- Categorías: Puntuación, segmentación de líneas, hablantes, velocidad de lectura, no verbales y convenciones de formato.

### 4. Gestión de Hablantes (Speakers)
- Normalización y listado centralizado de personajes.
- Asignación rápida por bloque con etiqueta e indicador de color.
- Filtrado por hablante para revisión de coherencia de diálogos.

### 5. Privacidad y Funcionamiento Zero-Backend
- **100% en el cliente**: Ningún vídeo ni subtítulo se sube a servidores remotos.
- **Vídeo local**: Carga y reproducción fluida mediante `File` y `URL.createObjectURL()`.
- **Importación/Exportación SRT**: Parser y serializador conforme al estándar `.srt`.

### 6. Estética Broadcast Anti-Fatiga
- Diseñado para jornadas intensivas de trabajo (6–8 horas).
- Paleta cálida basada en charcoal terroso (`#1B1916`, `#24211D`), tonos perla (`#D8D1C5`, `#BEB6AA`) y acentos champagne (`#B79D72`).
- Jerarquía tipográfica con fuente Sans general e Inter / JetBrains Mono para códigos de tiempo y datos técnicos.

---

## ⌨️ Atajos de Teclado Profesionales

| Atajo | Acción |
| :--- | :--- |
| `Espacio` | Reproducir / Pausar vídeo |
| `←` / `→` | Retroceder / Avanzar 1 fotograma |
| `Shift` + `←` / `→` | Retroceder / Avanzar 1 segundo |
| `I` | Ajustar **IN** del bloque seleccionado a la posición actual |
| `O` | Ajustar **OUT** del bloque seleccionado a la posición actual |
| `J` / `K` o `Alt` + `↑` / `↓` | Seleccionar bloque anterior / siguiente |
| `Ctrl / Cmd` + `Z` | Deshacer edición de texto / tiempo |

> *Nota: Los atajos se silencian automáticamente cuando el foco se encuentra en un campo de texto o área de edición.*

---

## 🚀 Flujos de Trabajo Recomendados

### Flujo A: Cola de Trabajos y Demo Precargada
1. Entra en la pestaña **Cola**.
2. Haz clic en **Tomar Trabajo** en el encargo de muestra (ej. *Cien Años de Soledad*).
3. Se abrirá automáticamente el **Editor** con el vídeo simulado y la transcripción completa.
4. Ajusta los timecodes en el timeline, revisa las alertas en el panel **QC** y exporta el archivo final desde el botón **Exportar SRT**.

### Flujo B: Trabajo con Vídeo y Subtítulos Propios
1. En el reproductor, pulsa sobre **Cargar Vídeo Local** (o arrastra un archivo `.mp4`, `.webm`).
2. Pulsa en **Importar SRT** y selecciona tu archivo de subtítulos.
3. El editor extraerá el audio, generará el waveform y segmentará los bloques.
4. Edita el texto, asigna hablantes y pulsa en **Exportar SRT** para descargar el resultado depurado.

---

## 🛠️ Stack Tecnológico

- **Framework:** [React 18](https://react.dev/) con Hooks y Context API.
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) para tipado estricto de timecodes y modelos QC.
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) con sistema de diseño a medida.
- **Iconos:** [Lucide React](https://lucide.dev/).
- **Build Tool:** [Vite](https://vitejs.dev/) con preconfiguración para GitHub Pages.
- **CI/CD:** [GitHub Actions](https://github.com/features/actions) con despliegue automatizado en cada push a `main`.

---

## 💻 Desarrollo Local

Para clonar y ejecutar el proyecto en tu entorno local:

```bash
# 1. Clonar el repositorio
git clone git@github.com:baituman420/PACUE.git
cd PACUE

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Compilar para producción
npm run build

# 5. Previsualizar bundle de producción localmente
npm run preview
```

---

## 📄 Licencia

Este proyecto está disponible bajo la licencia MIT.
