from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_pymongo import PyMongo
from werkzeug.utils import secure_filename
import os
from bson import ObjectId
from datetime import datetime
from config import MONGO_URI, SECRET_KEY, UPLOAD_FOLDER, MAIL_SERVER, MAIL_PORT, MAIL_USE_TLS, MAIL_USE_SSL, MAIL_USERNAME, MAIL_PASSWORD, MAIL_DEFAULT_SENDER, ADMIN_EMAIL, MAIL_MAX_EMAILS, MAIL_ASCII_ATTACHMENTS, MAIL_SUPPRESS_SEND, MONGO_OPTIONS
from flask_mail import Mail, Message
import smtplib
import ssl

app = Flask(__name__)
app.config["MONGO_URI"] = MONGO_URI
app.config['SECRET_KEY'] = SECRET_KEY
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAIL_SERVER'] = MAIL_SERVER
app.config['MAIL_PORT'] = MAIL_PORT
app.config['MAIL_USE_TLS'] = MAIL_USE_TLS
app.config['MAIL_USE_SSL'] = MAIL_USE_SSL
app.config['MAIL_USERNAME'] = MAIL_USERNAME
app.config['MAIL_PASSWORD'] = MAIL_PASSWORD
app.config['MAIL_DEFAULT_SENDER'] = MAIL_DEFAULT_SENDER
app.config['MAIL_MAX_EMAILS'] = MAIL_MAX_EMAILS
app.config['MAIL_ASCII_ATTACHMENTS'] = MAIL_ASCII_ATTACHMENTS
app.config['MAIL_SUPPRESS_SEND'] = MAIL_SUPPRESS_SEND

# Configuración adicional para timeouts
app.config['MAIL_TIMEOUT'] = 30
app.config['MAIL_USE_SSL'] = False

# Configuración adicional para MongoDB usando las opciones
for key, value in MONGO_OPTIONS.items():
    app.config[f'MONGO_{key.upper()}'] = value

mongo = PyMongo(app)
mail = Mail(app)

def test_smtp_connection():
    """Función para probar la conexión SMTP"""
    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT, timeout=30) as server:
            server.starttls(context=context)
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            return True
    except Exception as e:
        app.logger.error(f"Error de conexión SMTP: {e}")
        return False

def send_email_safe(subject, recipients, body, sender=None):
    """Función segura para enviar emails con mejor manejo de errores"""
    try:
        msg = Message(
            subject=subject,
            recipients=recipients,
            body=body,
            sender=sender or MAIL_DEFAULT_SENDER
        )
        mail.send(msg)
        return True
    except smtplib.SMTPAuthenticationError:
        app.logger.error("Error de autenticación SMTP. Verificar credenciales.")
        return False
    except smtplib.SMTPConnectError:
        app.logger.error("Error de conexión SMTP. Verificar configuración del servidor.")
        return False
    except smtplib.SMTPTimeoutError:
        app.logger.error("Timeout en conexión SMTP.")
        return False
    except Exception as e:
        app.logger.error(f"Error inesperado al enviar email: {e}")
        return False

# Decorador para proteger rutas
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            flash('Debes iniciar sesión para acceder a esta página.', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# --- Rutas Públicas ---
@app.route('/')
def home():
    page = request.args.get('page', 1, type=int)
    search_query = request.args.get('q', '')
    categoria_filter = request.args.get('categoria', '')
    per_page = 8

    query = {}
    if search_query:
        query['nombre'] = {'$regex': search_query, '$options': 'i'}
    if categoria_filter:
        query['categoria'] = categoria_filter

    productos_collection = mongo.db.productos
    total_productos = productos_collection.count_documents(query)
    total_pages = (total_productos + per_page - 1) // per_page
    
    productos_paginados = list(productos_collection.find(query).skip((page - 1) * per_page).limit(per_page))

    # Obtener todas las categorías disponibles
    categorias = productos_collection.distinct('categoria')
    categorias.sort()  # Ordenar alfabéticamente

    return render_template('index.html', productos=productos_paginados, year=datetime.now().year, 
                           current_page=page, total_pages=total_pages, search_query=search_query,
                           categorias=categorias, categoria_actual=categoria_filter)

# --- Rutas de Autenticación ---
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == 'siemprefrida' and password == 'alejandra':
            session['user'] = username
            flash('Inicio de sesión exitoso.', 'success')
            return redirect(url_for('admin'))
        else:
            flash('Usuario o contraseña incorrectos.', 'error')
    return render_template('login.html', year=datetime.now().year)

@app.route('/logout')
def logout():
    session.pop('user', None)
    flash('Has cerrado sesión.', 'success')
    return redirect(url_for('home'))

# --- Rutas de Administración ---
@app.route('/admin', methods=['GET', 'POST'])
@login_required
def admin():
    productos_collection = mongo.db.productos
    if request.method == 'POST':
        nombre = request.form['nombre']
        categoria = request.form['categoria']
        descripcion = request.form.get('descripcion', '')  # Campo opcional
        imagen = request.files['imagen']
        tiene_tamanos = request.form.get('tiene_tamanos') == 'on'

        # Manejar categoría personalizada
        if categoria == 'Otros':
            categoria_personalizada = request.form.get('categoria_personalizada', '').strip()
            if categoria_personalizada:
                categoria = categoria_personalizada
            else:
                flash('Por favor ingresa una categoría personalizada.', 'error')
                return redirect(url_for('admin'))

        if imagen and '.' in imagen.filename and imagen.filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}:
            filename = secure_filename(imagen.filename)
            imagen.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            
            nuevo_producto = {
                'nombre': nombre,
                'categoria': categoria,
                'descripcion': descripcion,
                'imagen': f'img/{filename}',
                'tiene_tamanos': tiene_tamanos
            }
            
            if tiene_tamanos:
                # Procesar precios por tamaño
                tamanos = request.form.getlist('tamanos[]')
                precios_tamanos = request.form.getlist('precios_tamanos[]')
                
                precios_por_tamano = {}
                for i in range(len(tamanos)):
                    if tamanos[i].strip() and precios_tamanos[i].strip():
                        precios_por_tamano[tamanos[i].strip()] = float(precios_tamanos[i])
                
                nuevo_producto['precios_por_tamano'] = precios_por_tamano
                nuevo_producto['precio'] = min(precios_por_tamano.values()) if precios_por_tamano else 0  # Precio mínimo para mostrar
            else:
                # Precio simple
                precio = float(request.form['precio'])
                nuevo_producto['precio'] = precio
            
            productos_collection.insert_one(nuevo_producto)
            flash('Producto añadido con éxito.', 'success')
        else:
            flash('Archivo de imagen no válido.', 'error')
        return redirect(url_for('admin'))

    productos = list(productos_collection.find())
    return render_template('admin.html', productos=productos, year=datetime.now().year)

@app.route('/admin/edit_product/<product_id>', methods=['GET', 'POST'])
@login_required
def edit_product(product_id):
    productos_collection = mongo.db.productos
    if request.method == 'POST':
        nombre = request.form['nombre']
        categoria = request.form['categoria']
        descripcion = request.form.get('descripcion', '')  # Campo opcional
        tiene_tamanos = request.form.get('tiene_tamanos') == 'on'
        
        # Manejar categoría personalizada
        if categoria == 'Otros':
            categoria_personalizada = request.form.get('categoria_personalizada', '').strip()
            if categoria_personalizada:
                categoria = categoria_personalizada
            else:
                flash('Por favor ingresa una categoría personalizada.', 'error')
                return redirect(url_for('edit_product', product_id=product_id))
        
        # Manejar imagen si se subió una nueva
        imagen = request.files.get('imagen')
        update_data = {
            'nombre': nombre,
            'categoria': categoria,
            'descripcion': descripcion,
            'tiene_tamanos': tiene_tamanos
        }
        
        if imagen and imagen.filename:
            if '.' in imagen.filename and imagen.filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}:
                filename = secure_filename(imagen.filename)
                imagen.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                update_data['imagen'] = f'img/{filename}'
            else:
                flash('Archivo de imagen no válido.', 'error')
                return redirect(url_for('edit_product', product_id=product_id))
        
        if tiene_tamanos:
            # Procesar precios por tamaño
            tamanos = request.form.getlist('tamanos[]')
            precios_tamanos = request.form.getlist('precios_tamanos[]')
            
            precios_por_tamano = {}
            for i in range(len(tamanos)):
                if tamanos[i].strip() and precios_tamanos[i].strip():
                    precios_por_tamano[tamanos[i].strip()] = float(precios_tamanos[i])
            
            update_data['precios_por_tamano'] = precios_por_tamano
            update_data['precio'] = min(precios_por_tamano.values()) if precios_por_tamano else 0  # Precio mínimo para mostrar
        else:
            # Precio simple
            precio = float(request.form['precio'])
            update_data['precio'] = precio
            # Limpiar datos de tamaños si existían
            update_data['precios_por_tamano'] = None
        
        productos_collection.update_one(
            {'_id': ObjectId(product_id)}, 
            {'$set': update_data}
        )
        flash('Producto actualizado con éxito.', 'success')
        return redirect(url_for('admin'))
    
    producto = productos_collection.find_one({'_id': ObjectId(product_id)})
    return render_template('edit_product.html', producto=producto, year=datetime.now().year)

@app.route('/admin/delete_product/<product_id>', methods=['POST'])
@login_required
def delete_product(product_id):
    try:
        mongo.db.productos.delete_one({'_id': ObjectId(product_id)})
        flash('Producto eliminado con éxito.', 'success')
    except Exception as e:
        flash(f'Ocurrió un error al eliminar el producto: {e}', 'error')
    return redirect(url_for('admin'))

# --- Rutas para Pedidos (API y Admin) ---
@app.route('/contact', methods=['POST'])
def contact():
    if request.method == 'POST':
        nombre = request.form.get('nombre')
        email = request.form.get('email')
        mensaje = request.form.get('mensaje')
        
        if not nombre or not email or not mensaje:
            flash('Por favor completa todos los campos.', 'error')
            return redirect(url_for('home') + '#contacto')
        
        # Probar conexión SMTP antes de enviar
        if not test_smtp_connection():
            flash('Error de conexión con el servidor de email. Por favor intentá más tarde.', 'error')
            return redirect(url_for('home') + '#contacto')
        
        # Enviar email al admin
        admin_body = f"""Nueva consulta recibida desde el sitio web:

Nombre: {nombre}
Email: {email}
Mensaje:
{mensaje}

---
Enviado desde Siempre Frida - Formulario de Contacto"""

        admin_sent = send_email_safe(
            subject=f'Nueva consulta de {nombre} - Siempre Frida',
            recipients=[ADMIN_EMAIL],
            body=admin_body
        )
        
        # Enviar email de confirmación al cliente
        cliente_body = f"""¡Hola {nombre}!

Gracias por contactarnos. Hemos recibido tu mensaje y nos pondremos en contacto contigo pronto.

Tu mensaje:
{mensaje}

Mientras tanto, podés seguirnos en nuestras redes sociales:
- Instagram: @siemprefrida.creativa
- TikTok: @siemprefrida.creativa
- WhatsApp: +54 11 2744-6521

¡Gracias por elegir Siempre Frida!

Saludos,
Ale 💕
Siempre Frida"""

        cliente_sent = send_email_safe(
            subject='Gracias por tu consulta - Siempre Frida',
            recipients=[email],
            body=cliente_body
        )
        
        if admin_sent and cliente_sent:
            flash('¡Mensaje enviado con éxito! Te responderemos pronto.', 'success')
        elif admin_sent:
            flash('Mensaje recibido. Te responderemos pronto.', 'success')
        else:
            flash('Hubo un error al enviar el mensaje. Por favor intentá nuevamente o contactanos por WhatsApp.', 'error')
        
        return redirect(url_for('home') + '#contacto')

@app.route('/create_order', methods=['POST'])
def create_order():
    data = request.get_json()
    if not data or 'cart' not in data or 'customer_info' not in data:
        return jsonify({'success': False, 'message': 'Datos inválidos.'}), 400

    try:
        orders_collection = mongo.db.orders
        order = {
            'customer_name': data['customer_info']['name'],
            'customer_contact': data['customer_info']['contact'],
            'products': data['cart'],
            'total_price': sum(float(item['price']) * item['quantity'] for item in data['cart']),
            'status': 'pendiente',
            'created_at': datetime.utcnow()
        }
        orders_collection.insert_one(order)

        # Enviar email al admin si está configurado
        if ADMIN_EMAIL:
            productos_txt = '\n'.join([f"- {item['quantity']} x {item['name']} (${item['price']})" for item in data['cart']])
            admin_body = f"""🛒 NUEVO PEDIDO RECIBIDO

👤 CLIENTE:
Nombre: {order['customer_name']}
Contacto: {order['customer_contact']}

📦 PRODUCTOS:
{productos_txt}

💰 TOTAL: ${order['total_price']:.2f}

📅 FECHA: {order['created_at'].strftime('%d/%m/%Y %H:%M')}
📊 ESTADO: Pendiente

---
Enviado automáticamente desde Siempre Frida - Sistema de Pedidos"""

            admin_sent = send_email_safe(
                subject='🛒 Nuevo pedido recibido - Siempre Frida',
                recipients=[ADMIN_EMAIL],
                body=admin_body
            )
            
            if not admin_sent:
                app.logger.error("No se pudo enviar el email de aviso al admin")
            
            # Enviar email de confirmación al cliente si proporcionó email
            if '@' in order['customer_contact']:
                productos_cliente = '\n'.join([f"• {item['quantity']} x {item['name']} - ${item['price']}" for item in data['cart']])
                cliente_body = f"""¡Hola {order['customer_name']}! 💕

¡Gracias por tu pedido! Hemos recibido tu solicitud y nos pondremos en contacto contigo pronto para coordinar el pago y la entrega.

📋 RESUMEN DE TU PEDIDO:
{productos_cliente}

💰 TOTAL: ${order['total_price']:.2f}

📅 FECHA: {order['created_at'].strftime('%d/%m/%Y %H:%M')}

📞 CONTACTO:
- WhatsApp: +54 11 2744-6521
- Email: siemprefridacases@gmail.com

📱 SEGUINOS:
- Instagram: @siemprefrida.creativa
- TikTok: @siemprefrida.creativa

¡Gracias por elegir Siempre Frida! 🌸✨

Saludos,
Ale 💕
Siempre Frida"""

                cliente_sent = send_email_safe(
                    subject='🛒 ¡Tu pedido ha sido recibido! - Siempre Frida',
                    recipients=[order['customer_contact']],
                    body=cliente_body
                )
                
                if not cliente_sent:
                    app.logger.error("No se pudo enviar el email de confirmación al cliente")

        return jsonify({'success': True, 'message': 'Pedido recibido con éxito.'})
    except Exception as e:
        app.logger.error(f"Error al crear el pedido: {e}")
        return jsonify({'success': False, 'message': 'Error interno del servidor.'}), 500

@app.route('/admin/orders')
@login_required
def admin_orders():
    orders_collection = mongo.db.orders
    pedidos = list(orders_collection.find().sort("created_at", -1))
    return render_template('admin_orders.html', pedidos=pedidos, year=datetime.now().year)

@app.route('/admin/orders/update_status/<order_id>', methods=['POST'])
@login_required
def update_order_status(order_id):
    new_status = request.form.get('status')
    if not new_status:
        flash('No se proporcionó un nuevo estado.', 'error')
        return redirect(url_for('admin_orders'))

    try:
        mongo.db.orders.update_one(
            {'_id': ObjectId(order_id)},
            {'$set': {'status': new_status}}
        )
        flash('Estado del pedido actualizado con éxito.', 'success')
    except Exception as e:
        flash(f'Error al actualizar el estado: {e}', 'error')
    
    return redirect(url_for('admin_orders'))

@app.route('/test-email')
def test_email():
    """Ruta para probar la conexión de email"""
    if test_smtp_connection():
        return jsonify({'success': True, 'message': 'Conexión SMTP exitosa'})
    else:
        return jsonify({'success': False, 'message': 'Error en conexión SMTP'})

if __name__ == '__main__':
    # En desarrollo
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
else:
    # En producción (Render)
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000))) 