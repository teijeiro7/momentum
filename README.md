# Habit Tracker MVP

Un **MVP Full Stack** que demuestra dominio de Python mediante procesamiento de datos con **Pandas**, visualización con **ApexCharts**, y arquitectura moderna con **FastAPI + React**.

## 🎯 Objetivo

Demostrar habilidades en:
- **Backend Python**: FastAPI, SQLAlchemy 2.0, Pydantic V2
- **Data Science**: Pandas para transformación y análisis de datos
- **Frontend Moderno**: React + TypeScript + TailwindCSS
- **Visualización**: ApexCharts (Heatmap tipo GitHub)

## 🏗️ Stack Tecnológico

### Backend
- **FastAPI**: Framework web moderno y rápido
- **SQLAlchemy 2.0**: ORM para gestión de base de datos
- **Pydantic V2**: Validación de datos
- **Pandas**: Procesamiento y análisis de datos
- **SQLite**: Base de datos ligera

### Frontend
- **React 18**: Biblioteca UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool ultra-rápido
- **TailwindCSS**: Framework CSS utility-first
- **ApexCharts**: Librería de gráficos interactivos
- **Axios**: Cliente HTTP

## 📊 Arquitectura de Datos

### Modelos de Base de Datos

1. **Habit**
   - `id`: Integer (PK)
   - `name`: String
   - `goal`: String
   - `created_at`: DateTime

2. **HabitLog**
   - `id`: Integer (PK)
   - `habit_id`: Integer (FK)
   - `date`: DateTime
   - `value`: Boolean (True = completado, False = no completado)

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Python 3.8+
- Node.js 18+
- npm o yarn

### Opción 1: Script Automático (Recomendado)

```bash
# 1. Hacer ejecutables los scripts
chmod +x setup.sh run.sh

# 2. Ejecutar setup (solo una vez)
./setup.sh

# 3. Iniciar la aplicación
./run.sh
```

### Opción 2: Manual

#### Backend

```bash
# Navegar a la carpeta backend
cd backend

# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
python main.py
```

El backend estará disponible en: http://localhost:8000
API Docs (Swagger): http://localhost:8000/docs

#### Frontend

```bash
# En otra terminal, navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: http://localhost:5173

## 📦 Funcionalidades

### 1. CRUD Completo de Hábitos
- ✅ Crear hábitos con nombre y objetivo
- ✅ Listar todos los hábitos
- ✅ Actualizar hábitos existentes
- ✅ Eliminar hábitos

### 2. Registro de Logs
- ✅ Marcar hábito como completado/no completado
- ✅ Registro por fecha
- ✅ Vista rápida del estado actual

### 3. Analytics con Pandas (CRÍTICO)
- ✅ Endpoint `/analytics/{habit_id}/heatmap`
- ✅ Procesamiento de datos con **Pandas**:
  - Carga de logs desde DB
  - Relleno de fechas faltantes con valor 0
  - Transformación a formato para ApexCharts
- ✅ Visualización de últimos 30 días
- ✅ Heatmap tipo GitHub contributions

### 4. Visualización Interactiva
- ✅ Heatmap con ApexCharts
- ✅ Cálculo de tasa de completitud
- ✅ Cálculo de racha actual (streak)
- ✅ Tema oscuro (Dark Mode)

## 🎨 Capturas de Pantalla

```
┌─────────────────────────────────────────────────────┐
│  Habit Tracker MVP                                  │
│  Python + FastAPI + React Demo                     │
├─────────────┬───────────────────────────────────────┤
│  My Habits  │  Quick Log                            │
│             │  [Mark as Done]                       │
│  + New      │                                       │
│             │  Heatmap - Last 30 Days               │
│  Habit 1    │  ████░░░████░░░████                   │
│  Habit 2    │                                       │
│  Habit 3    │  Completion Rate: 65%                 │
│             │  Streak: 3 days                       │
└─────────────┴───────────────────────────────────────┘
```

## 🧪 Endpoints API

### Habits
- `GET /habits` - Listar hábitos
- `POST /habits` - Crear hábito
- `GET /habits/{id}` - Obtener hábito
- `PUT /habits/{id}` - Actualizar hábito
- `DELETE /habits/{id}` - Eliminar hábito

### Logs
- `GET /habits/{id}/logs` - Listar logs
- `POST /habits/{id}/logs` - Crear log
- `DELETE /habits/{id}/logs/{log_id}` - Eliminar log

### Analytics (Python Mastery)
- `GET /analytics/{id}/heatmap` - Heatmap con Pandas

## 🔍 Detalles Técnicos

### Backend: Lógica de Pandas

El endpoint más importante (`/analytics/{habit_id}/heatmap`) demuestra el uso de Pandas:

```python
# 1. Cargar logs desde DB
logs = db.query(HabitLog).filter(HabitLog.habit_id == habit_id).all()

# 2. Convertir a DataFrame
df = pd.DataFrame([{
    'date': log.date.date(),
    'value': 1 if log.value else 0
} for log in logs])

# 3. Rellenar fechas faltantes
date_range = pd.date_range(start=start_date, end=end_date, freq='D')
df = df.reindex(date_range, fill_value=0)

# 4. Formatear para ApexCharts
heatmap_data = [
    {'date': date.strftime('%Y-%m-%d'), 'value': df.loc[date, 'value']}
    for date in date_range
]
```

### Frontend: ApexCharts Configuration

```typescript
const options: ApexOptions = {
  chart: { type: 'heatmap' },
  theme: { mode: 'dark' },
  plotOptions: {
    heatmap: {
      colorScale: {
        ranges: [
          { from: 0, to: 0, color: '#1f2937', name: 'Not Done' },
          { from: 1, to: 1, color: '#10b981', name: 'Done' }
        ]
      }
    }
  }
}
```

## 🛠️ Decisiones de Diseño

1. **SQLAlchemy Sync (no Async)**: Para un MVP con SQLite, sync es más simple y suficiente.
2. **Pandas para rellenar gaps**: Uso justificado para demostrar capacidad de procesamiento de datos.
3. **Heatmap de 30 días**: Visualización tipo GitHub contributions.
4. **Value booleano**: Simplifica lógica (Done/Not Done).
5. **Dark Mode por defecto**: Mejor para desarrollo y presentación.

## 📝 Notas

- La base de datos SQLite (`habits.db`) se crea automáticamente al iniciar el backend
- Los datos persisten entre reinicios
- El frontend se recarga automáticamente en desarrollo
- CORS está configurado para `localhost:5173`

## 🐛 Troubleshooting

### Backend no inicia
```bash
# Verificar que el puerto 8000 esté libre
lsof -i :8000

# Reinstalar dependencias
cd backend
pip install -r requirements.txt --force-reinstall
```

### Frontend no inicia
```bash
# Limpiar cache y reinstalar
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Error de CORS
Verificar que el backend esté corriendo en `http://localhost:8000`

## 📚 Recursos

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Tutorial](https://docs.sqlalchemy.org/en/20/tutorial/)
- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [ApexCharts React](https://apexcharts.com/docs/react-charts/)
- [TailwindCSS](https://tailwindcss.com/docs)

## 📄 Licencia

MIT License - Proyecto de demostración educativa.

---

**Construido con ❤️ para demostrar Python mastery**
