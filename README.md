# Siempre Frida - Papelería & Librería

Sitio web moderno para la papelería y librería Siempre Frida, con catálogo de productos, carrito de compras y sistema de pedidos automático.

## 🌟 Características

- **Catálogo de productos** con categorías y filtros
- **Sistema de tamaños y precios dinámicos**
- **Carrito de compras funcional**
- **Formulario de contacto con emails automáticos**
- **Panel de administración completo**
- **Diseño responsive y moderno**
- **Tipografía Poppins moderna**
- **Sistema de emails automático**

## 🚀 Despliegue en Render

### 1. Preparar el repositorio

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit - Siempre Frida website"

# Agregar tu repositorio remoto
git remote add origin https://github.com/TU_USUARIO/siempre-frida.git

# Subir a GitHub
git push -u origin main
```

### 2. Configurar en Render

1. **Crear cuenta en Render**: Ve a [render.com](https://render.com) y crea una cuenta
2. **Conectar repositorio**: Conecta tu repositorio de GitHub
3. **Crear Web Service**: Selecciona tu repositorio y crea un nuevo Web Service

### 3. Configurar variables de entorno en Render

En la configuración del Web Service, agrega estas variables de entorno:

```
MONGO_URI=mongodb+srv://Siempre_Frida:Enzo430093@cluster0.zcyyx9n.mongodb.net/siemprefrida?retryWrites=true&w=majority
MONGO_DBNAME=siemprefrida
SECRET_KEY=siemprefrida_secret_key_2024_production
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USE_SSL=False
MAIL_USERNAME=siemprefridacases@gmail.com
MAIL_PASSWORD=wcui aqxg hojf sejr
MAIL_DEFAULT_SENDER=siemprefridacases@gmail.com
ADMIN_EMAIL=siemprefridacases@gmail.com
MAIL_MAX_EMAILS=10
MAIL_ASCII_ATTACHMENTS=False
MAIL_SUPPRESS_SEND=False
```

### 4. Configuración del Web Service

- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`
- **Plan**: Free (o el que prefieras)

## 🛠️ Desarrollo Local

### Instalar dependencias

```bash
pip install -r requirements.txt
```

### Ejecutar en desarrollo

```bash
python app.py
```

La aplicación estará disponible en `http://localhost:5000`

## 📁 Estructura del Proyecto

```
SIEMPREFRIDA/
├── app.py                 # Aplicación principal Flask
├── config.py             # Configuración y variables de entorno
├── requirements.txt      # Dependencias de Python
├── Procfile             # Configuración para Render
├── runtime.txt          # Versión de Python
├── .gitignore           # Archivos a ignorar en Git
├── README.md            # Este archivo
├── static/              # Archivos estáticos
│   ├── styles.css       # Estilos CSS
│   ├── main.js          # JavaScript
│   └── img/             # Imágenes
└── templates/           # Plantillas HTML
    ├── index.html       # Página principal
    ├── admin.html       # Panel de administración
    ├── login.html       # Página de login
    └── edit_product.html # Edición de productos
```

## 🔧 Funcionalidades del Admin

- **Login**: Usuario: `siemprefrida`, Contraseña: `alejandra`
- **Agregar productos** con imágenes, categorías y precios
- **Editar productos** existentes
- **Eliminar productos**
- **Ver pedidos** y actualizar estados
- **Sistema de categorías** con opción personalizada

## 📧 Sistema de Emails

- **Formulario de contacto**: Envía emails automáticos al admin y confirmación al cliente
- **Pedidos**: Notificación automática al admin y confirmación al cliente
- **Configuración SMTP**: Gmail con autenticación de aplicación

## 🎨 Diseño

- **Tipografía**: Poppins (Google Fonts)
- **Colores**: Paleta púrpura/morada
- **Estilo**: Glassmorphism moderno
- **Responsive**: Optimizado para móviles, tablets y desktop

## 🔒 Seguridad

- **Variables de entorno** para credenciales sensibles
- **Validación de formularios** en frontend y backend
- **Sanitización de archivos** subidos
- **Sesiones seguras** para el panel admin

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoints**: 360px, 480px, 600px, 768px, 1024px
- **Optimización** para diferentes tamaños de pantalla

## 🚀 Punto de Guardado

**Fecha**: 21 de Junio 2025
**Estado**: Sistema completo funcional con emails automáticos
**Versión**: 1.0.0

### Funcionalidades implementadas:
- ✅ Catálogo de productos con categorías
- ✅ Sistema de tamaños y precios dinámicos
- ✅ Carrito de compras funcional
- ✅ Formulario de contacto con emails automáticos
- ✅ Panel de administración completo
- ✅ Diseño moderno con tipografía Poppins
- ✅ Sistema de emails robusto con manejo de errores
- ✅ Configuración lista para Render
- ✅ Variables de entorno para producción

---

**Desarrollado con ❤️ para Siempre Frida** 