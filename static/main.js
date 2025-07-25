// Archivo JavaScript mejorado para responsive design
document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica del Carrito de Compras ---
    const cartIcon = document.querySelector('.cart-icon-container');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const cartOverlay = document.querySelector('.cart-overlay');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartItemsContainer = document.querySelector('.cart-body');
    const cartCountElement = document.querySelector('.cart-item-count');
    const cartTotalElement = document.getElementById('cart-total-price');
    const cartEmptyMessage = document.querySelector('.cart-empty-message');
    const confirmOrderBtn = document.querySelector('.btn-confirm-order');

    // Selectores del Modal de Confirmación
    const orderModal = document.getElementById('confirm-order-modal');
    const closeModalBtn = orderModal ? orderModal.querySelector('.close-modal-btn') : null;
    const orderForm = document.getElementById('order-form');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Detectar si es dispositivo móvil
    const isMobile = () => {
        return window.innerWidth <= 768 || ('ontouchstart' in window);
    };

    // Detectar si es dispositivo con pantalla táctil
    const isTouchDevice = () => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };

    // --- Funciones del Modal de Pedido ---
    const openOrderModal = () => {
        if (cart.length === 0) {
            showNotification("Tu carrito está vacío. Añade productos antes de confirmar.", 'warning');
            return;
        }
        if (orderModal) {
            orderModal.classList.add('open');
            // Prevenir scroll del body cuando el modal está abierto
            document.body.style.overflow = 'hidden';
        }
    };

    const closeOrderModal = () => {
        if (orderModal) {
            orderModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    };

    // Función para mostrar notificaciones
    const showNotification = (message, type = 'info') => {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Añadir estilos inline para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 350px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            font-size: 0.9rem;
        `;

        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        `;

        notification.querySelector('.notification-close').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        `;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Cerrar notificación
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        });

        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    };

    // Función para abrir el carrito
    const openCart = () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('open');
        // Prevenir scroll del body cuando el carrito está abierto en móviles
        if (isMobile()) {
            document.body.style.overflow = 'hidden';
        }
    };

    // Función para cerrar el carrito
    const closeCart = () => {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('open');
        document.body.style.overflow = '';
    };

    // Renderizar el carrito
    const renderCart = () => {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartEmptyMessage.style.display = 'block';
            cartItemsContainer.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
        } else {
            if(cartEmptyMessage) cartEmptyMessage.style.display = 'none';
            cart.forEach(item => {
                const displayName = item.displayName || item.name;
                const cartItemHTML = `
                    <div class="cart-item" data-id="${item.id}" data-size="${item.size || ''}">
                        <img src="${item.image}" alt="${displayName}" class="cart-item-img" loading="lazy">
                        <div class="cart-item-info">
                            <h4>${displayName}</h4>
                            <span class="price">$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div class="cart-item-controls">
                            <button class="quantity-change" data-action="decrease" aria-label="Reducir cantidad">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-change" data-action="increase" aria-label="Aumentar cantidad">+</button>
                        </div>
                        <button class="remove-from-cart-btn" aria-label="Eliminar del carrito">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                        </button>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
            });
        }
        updateCartInfo();
    };

    // Actualizar contador y total
    const updateCartInfo = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        cartCountElement.textContent = totalItems;
        cartTotalElement.textContent = `$${totalPrice.toFixed(2)}`;
        
        // Animación en el contador solo si hay cambios
        if (totalItems > 0) {
            cartCountElement.style.transform = 'scale(1.3)';
            setTimeout(() => {
                cartCountElement.style.transform = 'scale(1)';
            }, 200);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
    };

    // Añadir al carrito
    const addToCart = (product) => {
        // Si el producto tiene tamaños, obtener el tamaño seleccionado
        if (product.hasSizes) {
            const productElement = document.querySelector(`[data-product-id="${product.id}"]`);
            const sizeSelector = productElement.querySelector('.tamano-selector');
            if (sizeSelector) {
                const selectedSize = sizeSelector.value;
                const selectedOption = sizeSelector.options[sizeSelector.selectedIndex];
                const selectedPrice = parseFloat(selectedOption.dataset.precio);
                
                product.size = selectedSize;
                product.price = selectedPrice;
                product.displayName = `${product.name} (${selectedSize})`;
            }
        }
        
        const existingItem = cart.find(item => 
            item.id === product.id && 
            (!item.size || item.size === product.size)
        );
        
        if (existingItem) {
            existingItem.quantity++;
            showNotification(`Cantidad de "${product.displayName || product.name}" aumentada`, 'success');
        } else {
            cart.push({ ...product, quantity: 1 });
            showNotification(`"${product.displayName || product.name}" añadido al carrito`, 'success');
        }
        renderCart();
    };

    // Función para actualizar precios dinámicamente cuando se cambia el tamaño
    const updatePriceForSize = (sizeSelector) => {
        const productElement = sizeSelector.closest('.producto');
        const priceElement = productElement.querySelector('.precio-dinamico');
        const selectedOption = sizeSelector.options[sizeSelector.selectedIndex];
        
        if (priceElement && selectedOption) {
            const newPrice = selectedOption.dataset.precio;
            
            // Agregar clase de animación
            priceElement.classList.add('updating');
            
            setTimeout(() => {
                priceElement.textContent = `$${newPrice}`;
                priceElement.classList.remove('updating');
                
                // Efecto de brillo
                priceElement.style.boxShadow = '0 8px 25px rgba(160, 132, 202, 0.3)';
                setTimeout(() => {
                    priceElement.style.boxShadow = '';
                }, 500);
            }, 300);
            
            // Actualizar el precio en el botón de añadir al carrito
            const addToCartBtn = productElement.querySelector('.add-to-cart-btn');
            if (addToCartBtn) {
                addToCartBtn.dataset.productPrice = newPrice;
            }
        }
    };

    // Cambiar cantidad o eliminar
    const handleCartActions = (e) => {
        const target = e.target;
        const parentItem = target.closest('.cart-item');
        if (!parentItem) return;
        const productId = parentItem.dataset.id;
        const productSize = parentItem.dataset.size;
        
        if (target.closest('.quantity-change')) {
            const action = target.closest('.quantity-change').dataset.action;
            const item = cart.find(i => i.id === productId && (!i.size || i.size === productSize));
            if (action === 'increase') {
                item.quantity++;
                showNotification(`Cantidad de "${item.displayName || item.name}" aumentada`, 'info');
            } else if (action === 'decrease') {
                if (item.quantity > 1) {
                    item.quantity--;
                    showNotification(`Cantidad de "${item.displayName || item.name}" reducida`, 'info');
                } else {
                    cart = cart.filter(i => !(i.id === productId && (!i.size || i.size === productSize)));
                    showNotification(`"${item.displayName || item.name}" eliminado del carrito`, 'warning');
                }
            }
        }

        if (target.closest('.remove-from-cart-btn')) {
            const item = cart.find(i => i.id === productId && (!i.size || i.size === productSize));
            cart = cart.filter(i => !(i.id === productId && (!i.size || i.size === productSize)));
            showNotification(`"${item.displayName || item.name}" eliminado del carrito`, 'warning');
        }
        
        renderCart();
    };

    // Enviar el pedido al servidor
    const submitOrder = async (e) => {
        e.preventDefault();
        const customerName = document.getElementById('customer-name').value;
        const customerContact = document.getElementById('customer-contact').value;

        if (!customerName.trim() || !customerContact.trim()) {
            showNotification('Por favor, completa tu nombre y contacto.', 'error');
            return;
        }

        const orderData = {
            customer_info: {
                name: customerName,
                contact: customerContact
            },
            cart: cart.map(item => ({
                id: item.id,
                name: item.displayName || item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size || null
            }))
        };

        try {
            // Mostrar indicador de carga
            const submitBtn = e.target.querySelector('.btn-submit-order');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;

            const response = await fetch('/create_order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (result.success) {
                showNotification('¡Pedido enviado con éxito! Nos pondremos en contacto contigo pronto.', 'success');
                cart = []; // Limpiar carrito
                renderCart();
                closeCart();
                closeOrderModal();
                orderForm.reset();
            } else {
                showNotification(`Error al enviar el pedido: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Error de red:', error);
            showNotification('Hubo un problema de conexión al enviar tu pedido. Inténtalo de nuevo.', 'error');
        } finally {
            // Restaurar botón
            const submitBtn = e.target.querySelector('.btn-submit-order');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    };

    // --- Event Listeners Mejorados ---
    if (cartIcon) {
        // Usar touchstart para mejor respuesta en móviles
        if (isTouchDevice()) {
            cartIcon.addEventListener('touchstart', (e) => {
                e.preventDefault();
                openCart();
            });
        } else {
            cartIcon.addEventListener('click', openCart);
        }
    }

    if (closeCartBtn) {
        if (isTouchDevice()) {
            closeCartBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                closeCart();
            });
        } else {
            closeCartBtn.addEventListener('click', closeCart);
        }
    }

    if (cartOverlay) {
        if (isTouchDevice()) {
            cartOverlay.addEventListener('touchstart', (e) => {
                e.preventDefault();
                closeCart();
            });
        } else {
            cartOverlay.addEventListener('click', closeCart);
        }
    }

    if (confirmOrderBtn) {
        if (isTouchDevice()) {
            confirmOrderBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                openOrderModal();
            });
        } else {
            confirmOrderBtn.addEventListener('click', openOrderModal);
        }
    }

    if (closeModalBtn) {
        if (isTouchDevice()) {
            closeModalBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                closeOrderModal();
            });
        } else {
            closeModalBtn.addEventListener('click', closeOrderModal);
        }
    }

    if (orderForm) {
        orderForm.addEventListener('submit', submitOrder);
    }
    
    // Mejorar los botones de añadir al carrito
    addToCartButtons.forEach(button => {
        const handleAddToCart = (e) => {
            e.preventDefault();
            const productData = e.target.dataset;
            const product = {
                id: productData.productId,
                name: productData.productName,
                price: parseFloat(productData.productPrice),
                image: productData.productImage,
                hasSizes: productData.hasSizes === 'true'
            };
            
            // Si tiene tamaños, parsear los datos de tamaños
            if (product.hasSizes && productData.sizes) {
                try {
                    product.sizes = JSON.parse(productData.sizes);
                } catch (e) {
                    console.error('Error parsing sizes data:', e);
                }
            }
            
            addToCart(product);
            
            // En móviles, no abrir automáticamente el carrito para mejor UX
            if (!isMobile()) {
                openCart();
            }
        };

        if (isTouchDevice()) {
            button.addEventListener('touchstart', handleAddToCart);
        } else {
            button.addEventListener('click', handleAddToCart);
        }
    });

    // Event listeners para selectores de tamaño
    const sizeSelectors = document.querySelectorAll('.tamano-selector');
    sizeSelectors.forEach(selector => {
        const handleSizeChange = (e) => {
            updatePriceForSize(e.target);
        };

        if (isTouchDevice()) {
            selector.addEventListener('change', handleSizeChange);
        } else {
            selector.addEventListener('change', handleSizeChange);
        }
    });

    if (cartItemsContainer) {
        if (isTouchDevice()) {
            cartItemsContainer.addEventListener('touchstart', handleCartActions);
        } else {
            cartItemsContainer.addEventListener('click', handleCartActions);
        }
    }

    // Cerrar carrito/modal con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
            closeOrderModal();
        }
    });

    // Inicializar
    renderCart();

    // --- Mejoras de Scroll y Animaciones ---
    
    // Animación de aparición en scroll optimizada
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px' // Trigger un poco antes
        });

        animatedElements.forEach(element => observer.observe(element));
    } else {
        animatedElements.forEach(element => element.classList.add('is-visible'));
    }

    // Efecto de desplazamiento suave mejorado
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offset = isMobile() ? 80 : 100; // Offset diferente para móviles
                const targetPosition = targetElement.offsetTop - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Efecto de ondas en botones optimizado para móviles
    const buttons = document.querySelectorAll('.hero-button, .submit-button, .producto-button, .btn-confirm-order');
    buttons.forEach(button => {
        const handleRipple = (e) => {
            if(e.target.closest('.quantity-change') || e.target.closest('.remove-from-cart-btn')) return;

            let rect = this.getBoundingClientRect();
            let x, y;
            
            if (e.type === 'touchstart') {
                x = e.touches[0].clientX - rect.left;
                y = e.touches[0].clientY - rect.top;
            } else {
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
            }

            let ripples = document.createElement('span');
            ripples.classList.add('ripple-effect');
            ripples.style.left = x + 'px';
            ripples.style.top = y + 'px';
            
            this.appendChild(ripples);

            setTimeout(() => {
                ripples.remove();
            }, 1000);
        };

        if (isTouchDevice()) {
            button.addEventListener('touchstart', handleRipple);
        } else {
            button.addEventListener('click', handleRipple);
        }
    });

    // Optimización para dispositivos con preferencia de movimiento reducido
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Deshabilitar animaciones para usuarios que prefieren movimiento reducido
        const style = document.createElement('style');
        style.textContent = `
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Lazy loading para imágenes
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Mejorar la experiencia de scroll en móviles
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            isScrolling = true;
            document.body.classList.add('is-scrolling');
        }
        
        clearTimeout(window.scrollTimeout);
        window.scrollTimeout = setTimeout(() => {
            isScrolling = false;
            document.body.classList.remove('is-scrolling');
        }, 150);
    });

    // Prevenir zoom en inputs en iOS
    if (isMobile()) {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.fontSize = '16px'; // Prevenir zoom en iOS
            });
        });
    }

    // Función para filtrar por categoría
    function filtrarPorCategoria(categoria) {
        const currentUrl = new URL(window.location);
        const searchQuery = currentUrl.searchParams.get('q') || '';
        
        if (categoria) {
            currentUrl.searchParams.set('categoria', categoria);
        } else {
            currentUrl.searchParams.delete('categoria');
        }
        
        // Mantener la búsqueda si existe
        if (searchQuery) {
            currentUrl.searchParams.set('q', searchQuery);
        }
        
        // Resetear a la primera página
        currentUrl.searchParams.delete('page');
        
        window.location.href = currentUrl.toString() + '#productos';
    }
});
