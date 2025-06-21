import os

# Cargar variables de entorno de forma segura
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # Si dotenv no está disponible, continuar sin él
    pass

# Configuración de MongoDB con parámetros compatibles para Render
# Para desarrollo local (funciona bien)
MONGO_URI_LOCAL = 'mongodb+srv://Siempre_Frida:Enzo430093@cluster0.zcyyx9n.mongodb.net/siemprefrida?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true'

# Para Render (URI mínima sin parámetros SSL)
MONGO_URI_RENDER = 'mongodb+srv://Siempre_Frida:Enzo430093@cluster0.zcyyx9n.mongodb.net/siemprefrida'

# Usar la URI de Render si está en producción, sino la local
MONGO_URI = os.getenv('MONGO_URI', MONGO_URI_LOCAL)
MONGO_DBNAME = os.getenv('MONGO_DBNAME', 'siemprefrida')
SECRET_KEY = os.getenv('SECRET_KEY', 'siemprefrida_secret_key_2024')
UPLOAD_FOLDER = 'static/img'

# Configuración para Flask-Mail
MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
MAIL_PORT = int(os.getenv('MAIL_PORT', '587'))
MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', 'False').lower() == 'true'
MAIL_USERNAME = os.getenv('MAIL_USERNAME', 'siemprefridacases@gmail.com')
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', 'wcui aqxg hojf sejr')
MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'siemprefridacases@gmail.com')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'siemprefridacases@gmail.com')

# Configuración adicional para mejorar la conexión
MAIL_MAX_EMAILS = int(os.getenv('MAIL_MAX_EMAILS', '10'))
MAIL_ASCII_ATTACHMENTS = os.getenv('MAIL_ASCII_ATTACHMENTS', 'False').lower() == 'true'
MAIL_SUPPRESS_SEND = os.getenv('MAIL_SUPPRESS_SEND', 'False').lower() == 'true'

# Configuración adicional para MongoDB
MONGO_OPTIONS = {
    'serverSelectionTimeoutMS': 30000,
    'socketTimeoutMS': 30000,
    'connectTimeoutMS': 30000,
    'maxPoolSize': 10,
    'minPoolSize': 1,
    'ssl': False,
    'ssl_cert_reqs': 'CERT_NONE',
    'tlsAllowInvalidCertificates': True
} 