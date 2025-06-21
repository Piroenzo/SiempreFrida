#!/bin/bash

echo "🚀 Preparando despliegue de Siempre Frida..."

# Verificar si git está inicializado
if [ ! -d ".git" ]; then
    echo "📁 Inicializando repositorio Git..."
    git init
fi

# Agregar todos los archivos
echo "📦 Agregando archivos al repositorio..."
git add .

# Hacer commit
echo "💾 Haciendo commit de los cambios..."
git commit -m "Deploy: Sistema completo con emails automáticos - $(date)"

# Verificar si el remote existe
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No se encontró el repositorio remoto."
    echo "Por favor, agrega tu repositorio con:"
    echo "git remote add origin https://github.com/TU_USUARIO/siempre-frida.git"
    echo ""
    echo "Luego ejecuta: git push -u origin main"
else
    echo "🚀 Subiendo a GitHub..."
    git push origin main
fi

echo ""
echo "✅ Despliegue completado!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ve a https://render.com"
echo "2. Crea una cuenta y conecta tu repositorio"
echo "3. Crea un nuevo Web Service"
echo "4. Configura las variables de entorno (ver README.md)"
echo "5. ¡Tu sitio estará online!"
echo ""
echo "🔗 Variables de entorno necesarias en Render:"
echo "MONGO_URI=mongodb+srv://Siempre_Frida:Enzo430093@cluster0.zcyyx9n.mongodb.net/siemprefrida?retryWrites=true&w=majority"
echo "MONGO_DBNAME=siemprefrida"
echo "SECRET_KEY=siemprefrida_secret_key_2024_production"
echo "MAIL_SERVER=smtp.gmail.com"
echo "MAIL_PORT=587"
echo "MAIL_USE_TLS=True"
echo "MAIL_USE_SSL=False"
echo "MAIL_USERNAME=siemprefridacases@gmail.com"
echo "MAIL_PASSWORD=wcui aqxg hojf sejr"
echo "MAIL_DEFAULT_SENDER=siemprefridacases@gmail.com"
echo "ADMIN_EMAIL=siemprefridacases@gmail.com" 