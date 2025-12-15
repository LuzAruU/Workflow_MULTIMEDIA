# veriflow - Sistema profesional de gestión QA

Un sistema integral de gestión de proyectos diseñado específicamente para equipos de aseguramiento de la calidad, construido con React, Next.js 16, TypeScript y Tailwind CSS.


## Características

### 1. Autenticación y gestión de usuarios
- Inicio de sesión sencillo sin roles iniciales
- Códigos únicos de usuario para invitaciones a proyectos
- La asignación de roles ocurre a nivel de proyecto (ORGANIZADOR, EJECUTOR, QA)

### 2. Gestión de proyectos
- Crear y gestionar múltiples proyectos de QA
- Configuración y ajustes por proyecto
- Gestión de miembros del equipo con asignación de roles
- Añadir miembros usando códigos de usuario únicos
- Seguimiento del progreso por proyecto

### 3. Espacio de trabajo de tareas
- **Tablero Kanban**: Flujo visual de tareas a través de 7 estados
   - Backlog
   - Asignada
   - En Progreso
   - Pendiente QA
   - En Revisión
   - Necesita Corrección
   - Completada
- Niveles de prioridad de tareas (Baja, Media, Alta, Crítica)
- Vista de lista de tareas
- Integración con calendario

### 4. Flujo de aseguramiento de calidad
- **Entrega del Ejecutor**: Enviar trabajo con resumen y detalles técnicos
- **Revisión QA**: Aprobar o rechazar con retroalimentación
- **Manejo de correcciones**: Retroalimentación clara para cambios necesarios
- Historial de entregas y línea de tiempo

### 5. Gestión de archivos
- Adjuntar archivos a las tareas (contextos: Solicitud y Evidencia de Entrega)
- Vista de repositorio de archivos
- Capacidades de subida y descarga

### 6. Sistema de temas
- Colores primarios configurables
- Opciones: Neutral, Azul Corporativo, Verde Bosque, Violeta
- Colores semánticos para estados (Rojo: Error, Verde: Éxito, Ámbar: Aviso)
- Soporte para modo oscuro

### 7. Vistas por rol
- **Organizador**: Crear proyectos, asignar tareas, gestionar el equipo
- **Ejecutor**: Completar tareas asignadas y enviar entregas
- **QA**: Revisar entregables y aprobar/rechazar

## Estructura del proyecto

\`\`\`
app/
├── layout.tsx                    # Root layout with theme provider
├── page.tsx                      # Login page
├── dashboard/                    # Dashboard view
├── projects/                     # Projects management
├── workspace/                    # Task workspace
├── settings/                     # Settings and preferences
└── calendar/                     # Calendar view

components/
├── layout/
│   ├── app-shell.tsx            # Main app container
│   ├── sidebar.tsx              # Left navigation
│   ├── navbar.tsx               # Top bar with role switcher
│   └── role-indicator.tsx       # Current role display
├── pages/
│   ├── login-page.tsx
│   ├── dashboard-content.tsx
│   ├── projects-content.tsx
│   ├── workspace-content.tsx
│   ├── settings-content.tsx
│   └── calendar-content.tsx
├── workspace/
│   ├── kanban-board.tsx         # Kanban view
│   ├── task-card.tsx            # Task card component
│   ├── task-list-view.tsx       # List view
│   ├── files-view.tsx           # Files repository
│   └── members-view.tsx         # Team members
├── dialogs/
│   ├── create-project-dialog.tsx
│   ├── project-settings-dialog.tsx
│   ├── create-task-dialog.tsx
│   ├── task-detail-panel.tsx    # Task detail with QA flow
│   ├── task-detail-left.tsx     # Task info & timeline
│   └── task-detail-right.tsx    # Task metadata
└── providers/
    └── theme-provider.tsx       # Theme system

globals.css                       # Design tokens and theme configuration
\`\`\`

## Alineación con la base de datos

El sistema sigue el esquema de base de datos propuesto:
- `usuarios`: Cuentas de usuario
- `proyectos`: Proyectos
- `miembros_proyecto`: Miembros del proyecto con roles por proyecto
- `tareas`: Tareas con solicitante, ejecutor, qa_id
- `entregas_tarea`: Entregas con seguimiento de versiones
- `revisiones_qa`: Revisiones QA con veredictos
- `adjuntos`: Archivos adjuntos con contexto

## Sistema de diseño

### Tokens de color
- **Primario**: Configurable (por defecto: neutral)
- **Colores semánticos**: Fijos para indicar estados
- **Badges de prioridad**: Baja (Gris), Media (Azul), Alta (Naranja), Crítica (Rojo)
- **Estados de tarea**: 7 colores distintos para visibilidad del flujo

### Tipografía
- Fuente: Geist (sans-serif)
- Jerarquía: Relación clara entre títulos y cuerpo
- Alturas de línea optimizadas para legibilidad

### Diseño y maquetación
- Enfoque basado en Flexbox
- Layout con sidebar + contenido principal
- Sistemas de grid responsivos
- Ancho mínimo del panel de detalle del 80%

## Cómo empezar

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador**:
   Accede a `http://localhost:3000`

4. **Inicio de demo**:
   - Correo: demo@veriflow.com
   - Contraseña: demo123

## Flujos principales

### Crear un proyecto
1. Ir a Proyectos
2. Hacer clic en "Nuevo Proyecto"
3. Añadir nombre y descripción del proyecto
4. Agregar miembros usando sus códigos de usuario
5. Asignar roles a cada miembro
6. Confirmar la creación

### Crear y asignar tareas
1. Entrar al espacio de trabajo
2. Hacer clic en "Nueva Tarea"
3. Completar los detalles de la tarea (sin asignar ejecutor inicialmente)
4. Guardar la tarea (va a Backlog)
5. El Organizador revisa las tareas sin asignar
6. Asignar al Ejecutor desde el detalle de la tarea

### Completar el flujo de QA
1. **Ejecutor**: Tarea asignada → completa el trabajo → envía entrega
2. **QA**: Recibe la entrega → revisa → aprueba o rechaza
3. **Ejecutor** (si es rechazado): Realiza correcciones → reenvía
4. **Sistema**: La tarea pasa a Completada cuando se aprueba

## Stack tecnológico

- **Framework frontend**: React 19.2 con Next.js 16
- **Estilos**: Tailwind CSS v4
- **Componentes UI**: Shadcn/UI
- **Iconos**: Lucide React
- **Gráficas**: Recharts
- **Gestión de estado**: React Context
- **Sistema de temas**: Variables CSS con atributos de datos

## Aspectos destacados de la arquitectura

- **Theme Provider**: Contexto global de tema con persistencia en localStorage
- **Role Indicator**: Cambio dinámico de rol para probar diferentes perspectivas
- **Diseño responsivo**: Enfoque mobile-first con puntos de quiebre adecuados
- **Accesibilidad**: Etiquetas ARIA y HTML semántico en toda la app
- **Rendimiento**: Re-renderizados optimizados mediante memoización adecuada

---

Construido con ♥ para equipos de QA
</parameter>
