# MateCode Tasks — Gestor Estratégico de Tareas

> **Proyecto Integrador M4 — Henry Full Stack Web Development**  
> Aplicación web SPA (Single Page Application) para la gestión organizada, persistente y colaborativa de tareas diarias, desarrollada bajo un enfoque de arquitectura por capas, tipado estricto con TypeScript, persistencia en la nube y notificaciones seguras por correo electrónico.

---

## 🚀 Demo y Enlaces
- **Despliegue en Producción (Firebase Hosting):** [https://m4-stiven-zabala.web.app](https://m4-stiven-zabala.web.app)
- **Repositorio en GitHub:** [https://github.com/Stivenzbl/PROYECTOM4](https://github.com/Stivenzbl/PROYECTOM4)

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| **Frontend Framework** | React 18 + TypeScript | Componentización modular, tipado estático robusto y detección temprana de errores. |
| **Bundler & Tooling** | Vite | Tiempos de inicio ultrarrápidos en desarrollo y compilación optimizada con Rollup. |
| **Estilos & UI** | Tailwind CSS + Lucide Icons | Diseño responsive mobile-first, utilidades atómicas limpias e iconografía accesible. |
| **Autenticación** | Firebase Authentication | Manejo seguro de identidad con Email/Contraseña y proveedor OAuth de Google. |
| **Persistencia BaaS** | Cloud Firestore | Base de datos NoSQL con sincronización reactiva en tiempo real mediante `onSnapshot`. |
| **Notificaciones** | AWS SES + Vercel Functions | Envío transaccional de correos desde una función serverless sin exponer credenciales en el cliente. |
| **Testing** | Vitest + React Testing Library | Pruebas unitarias de lógica y pruebas de integración de componentes simulando eventos de usuario. |
| **Interacción Extra** | `@dnd-kit` + `canvas-confetti` | Reordenamiento de tareas mediante Drag & Drop y feedback lúdico al completar actividades. |

---

## 🏛️ Decisiones Arquitectónicas y Estructura

El proyecto sigue una estricta **arquitectura por capas** que separa las responsabilidades de presentación, lógica de negocio y comunicación con servicios externos:

```text
m4/
├─ api/
│  └─ send-summary.ts         # Vercel Serverless Function (comunicación segura con AWS SES)
├─ src/
│  ├─ components/             # Componentes de presentación (TodoForm, TodoList, TaskItem, Navbar)
│  ├─ features/
│  │  └─ auth/                # Lógica del dominio de autenticación (AuthContext)
│  ├─ hooks/                  # Custom hooks reutilizables (useAuth, useTasks)
│  ├─ pages/                  # Vistas principales (LoginPage, RegisterPage, TasksPage)
│  ├─ routes/                 # Rutas protegidas (ProtectedRoute, PublicOnlyRoute)
│  ├─ services/               # Integraciones con Firebase (Auth/Firestore) y API de emails
│  ├─ types/                  # Definición centralizada de interfaces y tipos TypeScript
│  └─ utils/                  # Utilidades y traducción de errores de Firebase
├─ tests/                     # Tests unitarios, tests de componentes y configuración de Vitest
├─ firestore.rules            # Reglas de seguridad para Firestore (aislamiento estricto por usuario)
├─ .env.example               # Plantilla de variables de entorno sin secretos
├─ .gitignore                 # Exclusión estricta de archivos .env y node_modules
└─ package.json               # Dependencias y scripts de ejecución
```

### Principios clave aplicados:
1. **Separación de Intereses (SoC):** Los componentes de interfaz (`TodoForm`, `TodoList`, `TaskItem`) únicamente se encargan de renderizar y capturar eventos. Las mutaciones y lecturas se delegan a hooks dedicados (`useTasks`, `useAuth`) y servicios puros (`taskService.ts`).
2. **Seguridad "Zero-Trust" en el Frontend:** Las credenciales maestras de AWS jamás tocan el código del cliente. La aplicación web se comunica mediante HTTPS con una Serverless Function en Vercel, que actúa como proxy seguro hacia AWS SES.
3. **Manejo de Ciclo de Vida y Memory Leaks:** Las suscripciones de Firestore (`onSnapshot`) y de autenticación (`onAuthStateChanged`) retornan explícitamente sus funciones de cancelación (`unsubscribe`) en la fase de limpieza de los efectos (`useEffect`).
4. **Prevención de Redirecciones Prematuras:** El componente `ProtectedRoute` gestiona un estado `loading` inicial para evitar falsos positivos de falta de sesión durante el arranque de la app.

---

## 🔐 Reglas de Seguridad en Cloud Firestore

Las reglas implementadas en [`firestore.rules`](file:///C:/Users/STEVEN/Desktop/UNIVERSIDAD/HENRRY/m4/firestore.rules) garantizan que **ningún usuario pueda leer, crear, modificar o eliminar tareas que pertenezcan a otro usuario**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      function isAuthenticated() {
        return request.auth != null;
      }
      function isOwner() {
        return isAuthenticated() && resource.data.userId == request.auth.uid;
      }

      allow read: if isAuthenticated() && (resource == null || resource.data.userId == request.auth.uid);
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isOwner() && request.resource.data.userId == request.auth.uid;
      allow delete: if isOwner();
    }
  }
}
```

---

## ✉️ Flujo de Envío de Emails con AWS SES

```
[Usuario en el Frontend]
         │  (Clic en "Enviar Resumen")
         ▼
[POST /api/send-summary] (Vercel Serverless Function)
         │  Valida body, calcula métricas (Total, Pendientes, Completadas)
         │  Inyecta credenciales seguras de servidor (AWS_ACCESS_KEY_ID / SECRET)
         ▼
  [AWS SES Client]
         │  Despacha correo con plantilla HTML estructurada
         ▼
[Bandeja de Entrada del Usuario]
```

1. **Gatillado seguro:** El usuario autenticado solicita el resumen desde la barra de navegación.
2. **Procesamiento Serverless:** La función en `api/send-summary.ts` valida el payload, arma el reporte HTML enriquecido y autentica la llamada con AWS SES mediante el SDK oficial `@aws-sdk/client-ses`.
3. **Resiliencia en Desarrollo:** Si las variables de AWS SES aún no están configuradas en el entorno local, el endpoint opera en un modo de simulación inteligente que permite verificar el flujo completo de la interfaz sin fallos.

---

## 📦 Instalación y Ejecución Local

### Prerrequisitos
- Node.js versión 18 o superior.
- NPM versión 9 o superior.

### 1. Clonar el repositorio y navegar a la carpeta
```bash
git clone https://github.com/Stivenzbl/PROYECTOM4.git
cd PROYECTOM4
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia la plantilla `.env.example` para generar tu archivo `.env` local:
```bash
cp .env.example .env
```
Edita `.env` con tus credenciales de Firebase y AWS:

```env
# Variables de Cliente (Firebase)
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Variables de Servidor (AWS SES)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
AWS_SES_SENDER_EMAIL=tu_email_verificado@dominio.com
```

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

### 5. Ejecutar la suite de tests
```bash
# Ejecutar tests una vez
npm test

# Modo observación (watch)
npm run test:watch
```

### 6. Compilar para producción
```bash
npm run build
```

---

## 🤖 Documentación del Uso de Inteligencia Artificial (IA)

En concordancia con los objetivos de la consigna y la rúbrica del Módulo 4, este proyecto integró herramientas de Inteligencia Artificial como asistente de pair-programming técnico:

### 1. Prompts Principales Utilizados
- **Diseño de Reglas de Seguridad en Firestore:**
  > *"Diseña un conjunto de reglas de seguridad estrictas para Cloud Firestore que impidan accesos cruzados entre usuarios, exigiendo que tanto en operaciones de lectura como de escritura el campo userId coincida con request.auth.uid."*
- **Estructuración del Flujo Serverless de AWS SES:**
  > *"Genera una función serverless compatible con Vercel Functions en TypeScript que reciba una lista de tareas y envíe un correo formateado en HTML con AWS SES SDK v3, evitando exponer cualquier secreto en el cliente y contemplando un fallback de desarrollo."*
- **Estrategia de Testing con Mocks:**
  > *"Escribe pruebas de componentes con React Testing Library y Vitest para un formulario de tareas (TodoForm) y una lista con filtros (TodoList), simulando los eventos de usuario y verificando casos límite como títulos vacíos."*

### 2. Decisiones Tomadas y Aprendizajes
- **Comprensión sobre queries compuestas en Firestore:** Durante la integración de Firestore con ordenamiento dinámico, se identificó que combinar filtros de igualdad (`where('userId', '==', ...)`) con ordenamiento secundario puede requerir índices compuestos en Firestore. Para maximizar la estabilidad y fluidez sin fricciones de configuración, se optó por indexar por `userId` y realizar el ordenamiento fino de prioridades y Drag & Drop optimista en memoria.
- **Validación rigurosa de variables de entorno:** Se garantizó que ninguna credencial de AWS contenga el prefijo `VITE_`, asegurando a nivel de arquitectura que Vite no las incluya en el bundle público del navegador.
- **Experiencia de Usuario cuidada (UX):** La IA asistió en la creación de una matriz de mapeo para traducir códigos crudos de Firebase (`auth/user-not-found`, `auth/wrong-password`) a mensajes amigables y pedagógicos en español.

---

## 📄 Licencia
Este proyecto fue desarrollado con fines educativos para el **Módulo 4 de Henry**. Distribuido bajo licencia MIT.
