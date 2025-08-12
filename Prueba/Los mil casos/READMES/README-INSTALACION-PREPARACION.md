# 🛠️ Guía de Instalación y Preparación - Todo lo que Necesitas Instalar

## 🎯 ¿Qué incluye esta guía?

Esta guía te ayudará a preparar tu computadora **ANTES** del examen, asegurándote de que tengas todo lo necesario instalado y configurado correctamente.

---

## 📋 Checklist de Preparación

### **✅ Software Básico (Obligatorio)**
- [ ] **Visual Studio Code** - Editor de código
- [ ] **Node.js** - Runtime de JavaScript
- [ ] **MySQL Workbench** - Gestión de base de datos
- [ ] **Postman** - Testing de APIs
- [ ] **Excel** - Preparación de datos

### **✅ Navegador Web**
- [ ] **Chrome, Firefox o Edge** - Para probar el frontend

### **✅ Extensiones de VS Code (Recomendadas)**
- [ ] **Live Server** - Para servir archivos HTML
- [ ] **MySQL** - Para conectar con bases de datos
- [ ] **JavaScript (ES6) code snippets** - Autocompletado
- [ ] **Auto Rename Tag** - Para HTML
- [ ] **Bracket Pair Colorizer** - Para mejor legibilidad

---

## 🚀 Instalación Paso a Paso

### **1. Visual Studio Code**

#### **Descarga e Instalación:**
1. Ve a [code.visualstudio.com](https://code.visualstudio.com/)
2. Descarga la versión para Windows
3. Ejecuta el instalador
4. **Importante:** Marca la opción "Add to PATH"

#### **Extensiones Recomendadas:**
```bash
# Instalar desde VS Code:
# Ctrl + Shift + X → Buscar e instalar:

1. "Live Server" (por Ritwick Dey)
2. "MySQL" (por Jun Han)
3. "JavaScript (ES6) code snippets" (por charalampos karypidis)
4. "Auto Rename Tag" (por Jun Han)
5. "Bracket Pair Colorizer" (por CoenraadS)
6. "Prettier - Code formatter" (por Prettier)
7. "ES7+ React/Redux/React-Native snippets" (por dsznajder)
```

### **2. Node.js**

#### **Descarga e Instalación:**
1. Ve a [nodejs.org](https://nodejs.org/)
2. Descarga la versión **LTS** (Long Term Support)
3. Ejecuta el instalador
4. **Verificar instalación:**
```bash
# Abrir CMD o PowerShell y escribir:
node --version
npm --version
```

#### **Configuración Inicial:**
```bash
# Configurar npm (una sola vez):
npm config set init-author-name "Tu Nombre"
npm config set init-license "MIT"
```

### **3. MySQL Workbench**

#### **Descarga e Instalación:**
1. Ve a [dev.mysql.com/downloads/workbench/](https://dev.mysql.com/downloads/workbench/)
2. Descarga la versión para Windows
3. Ejecuta el instalador
4. **Importante:** Anota la contraseña del root que configures

#### **Configuración Inicial:**
1. Abrir MySQL Workbench
2. Crear nueva conexión:
   - **Connection Name:** `localhost`
   - **Hostname:** `127.0.0.1`
   - **Port:** `3306`
   - **Username:** `root`
   - **Password:** `tu_contraseña`

#### **Verificar Conexión:**
```sql
-- En MySQL Workbench, ejecutar:
SHOW DATABASES;
```

### **4. Postman**

#### **Descarga e Instalación:**
1. Ve a [postman.com/downloads/](https://www.postman.com/downloads/)
2. Descarga la versión para Windows
3. Ejecuta el instalador
4. Crear cuenta gratuita (opcional pero recomendado)

#### **Configuración Inicial:**
1. Crear nueva colección: `Examen_API`
2. Crear environment: `Local`
3. Añadir variable: `base_url` = `http://localhost:3000/api`

### **5. Excel (Microsoft Office)**

#### **Si no tienes Office:**
- **Alternativa gratuita:** LibreOffice Calc
- **Descarga:** [libreoffice.org](https://www.libreoffice.org/)

---

## 🔧 Configuración del Entorno de Desarrollo

### **1. Crear Estructura de Carpetas**

```bash
# Crear carpeta del proyecto:
mkdir mi-proyecto-examen
cd mi-proyecto-examen

# Crear estructura básica:
mkdir backend
mkdir frontend
mkdir database
mkdir uploads
```

### **2. Configurar Variables de Entorno**

#### **Crear archivo `.env` en la carpeta backend:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=tienda_online
PORT=3000
NODE_ENV=development
```

### **3. Configurar Git (Opcional pero Recomendado)**

```bash
# Instalar Git desde: https://git-scm.com/
git --version

# Configurar Git:
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Inicializar repositorio:
git init
```

---

## 📦 Librerías y Dependencias

### **1. Inicializar Proyecto Node.js**

```bash
# En la carpeta backend:
cd backend
npm init -y

# Instalar dependencias básicas:
npm install express mysql2 cors dotenv multer csv-parser

# Instalar dependencias de desarrollo:
npm install nodemon --save-dev
```

### **2. Configurar package.json**

```json
{
  "name": "backend-examen",
  "version": "1.0.0",
  "description": "Backend para examen de bases de datos",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1",
    "csv-parser": "^3.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 🧪 Verificación de Instalación

### **1. Verificar Node.js**
```bash
# En CMD o PowerShell:
node --version
# Debe mostrar: v18.x.x o superior

npm --version
# Debe mostrar: 9.x.x o superior
```

### **2. Verificar MySQL**
```bash
# En MySQL Workbench:
SELECT VERSION();
# Debe mostrar la versión de MySQL
```

### **3. Verificar Postman**
- Abrir Postman
- Crear una nueva request GET
- URL: `https://httpbin.org/get`
- Debe devolver una respuesta JSON

### **4. Verificar VS Code**
- Abrir VS Code
- Crear archivo `test.js`
- Escribir: `console.log("Hello World");`
- Ejecutar con F5

---

## ⚠️ Solución de Problemas Comunes

### **Error: "Node no se reconoce como comando"**
**Solución:**
1. Reiniciar CMD/PowerShell después de instalar Node.js
2. Verificar que Node.js esté en el PATH
3. Reinstalar Node.js si es necesario

### **Error: "MySQL Connection Failed"**
**Solución:**
1. Verificar que MySQL esté ejecutándose
2. Verificar credenciales en `.env`
3. Verificar que el puerto 3306 esté libre

### **Error: "Port 3000 already in use"**
**Solución:**
```bash
# En CMD (como administrador):
netstat -ano | findstr :3000
taskkill /PID [número_del_proceso] /F
```

### **Error: "Cannot find module"**
**Solución:**
```bash
# En la carpeta backend:
npm install
# O instalar módulo específico:
npm install [nombre_del_módulo]
```

---

## 📝 Checklist Final de Verificación

### **✅ Software Instalado:**
- [ ] Visual Studio Code con extensiones
- [ ] Node.js (versión LTS)
- [ ] MySQL Workbench
- [ ] Postman
- [ ] Excel o LibreOffice

### **✅ Configuración Completada:**
- [ ] Variables de entorno configuradas
- [ ] Estructura de carpetas creada
- [ ] Proyecto Node.js inicializado
- [ ] Dependencias instaladas
- [ ] Conexión a MySQL probada

### **✅ Verificaciones Realizadas:**
- [ ] Node.js responde correctamente
- [ ] MySQL Workbench conecta
- [ ] Postman funciona
- [ ] VS Code con extensiones
- [ ] Proyecto base funcionando

---

## 🎓 Consejos para el Examen

### **Antes del Examen:**
1. **Haz una prueba completa** del flujo completo
2. **Verifica que todo funcione** en tu computadora
3. **Ten listos los comandos** más usados
4. **Prepara plantillas** de código comunes

### **Durante el Examen:**
1. **Lee cuidadosamente** el enunciado
2. **Sigue la estructura** de carpetas establecida
3. **Prueba cada paso** antes de continuar
4. **Mantén el código organizado**

### **Comandos Útiles:**
```bash
# Iniciar servidor:
npm run dev

# Instalar nueva dependencia:
npm install [nombre]

# Verificar puertos en uso:
netstat -ano | findstr :3000

# Reiniciar MySQL:
net stop mysql
net start mysql
```

---

## 📚 Recursos Adicionales

### **Documentación Oficial:**
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Postman Learning Center](https://learning.postman.com/)

### **Tutoriales Recomendados:**
- [Node.js Crash Course](https://www.youtube.com/watch?v=fBNz5xF-Kx4)
- [MySQL Tutorial](https://www.mysqltutorial.org/)
- [Postman Tutorial](https://www.youtube.com/watch?v=VywxIQ2ZXw4)

---

**¡Con esta preparación estarás listo para cualquier examen! 🚀**
