// Datos de ejemplo para los addons
const addonsData = [
    {
        id: 1,
        title: "Better Combat",
        description: "Mejora el sistema de combate de Minecraft con nuevas mecánicas y animaciones. Añade ataques especiales, combos y efectos visuales que transforman completamente la experiencia de combate en el juego.",
        cover_image: "./img/prueba.jpg",
        version: "1.21+",
        download_link: "TU_URL_DE_DESCARGA",
        tags: ["combat", "mechanics", "animations"],
        last_updated: "2025-10-4",
        file_size: "2.4 MB"
    },
    {
        id: 2,
        title: "Epic Structures",
        description: "Añade estructuras épicas y generación de edificios avanzados al mundo de Minecraft. Incluye castillos, ciudades antiguas, templos misteriosos y mucho más para explorar.",
        cover_image: "./img/prueba.jpg",
        version: "1.21+",
        download_link: "TU_URL_DE_DESCARGA",
        tags: ["structures", "worldgen", "exploration"],
        last_updated: "2025-10-4",
        file_size: "5.7 MB"
    }
];

// Configuración de JSONBin.io - TUS CREDENCIALES
const JSONBIN_BASE_URL = "https://api.jsonbin.io/v3/b";
const BIN_ID = "68e3f94dd0ea881f40978bff";
const MASTER_KEY = "$2a$10$llDNWie9.N2CafYjo7o3.OB/8XZpTocfzmyU2gCwG/bJGYAThWYyC";

// Función para obtener un addon por ID
function getAddonById(id) {
    return addonsData.find(addon => addon.id === parseInt(id));
}

// Función para obtener todos los addons
function getAllAddons() {
    return addonsData;
}

// Función para buscar addons
function searchAddons(query) {
    if (!query) {
        return addonsData;
    }
    
    const lowerQuery = query.toLowerCase();
    return addonsData.filter(addon => 
        addon.title.toLowerCase().includes(lowerQuery) ||
        addon.description.toLowerCase().includes(lowerQuery) ||
        addon.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
}

// Función para formatear fechas
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Sistema de reseñas
async function fetchReviews() {
    try {
        const response = await fetch(`${JSONBIN_BASE_URL}/${BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': MASTER_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar las reseñas');
        }
        
        const data = await response.json();
        return data.record || {};
    } catch (error) {
        console.error('Error al obtener reseñas:', error);
        // Retornar estructura vacía si hay error
        return {
            "1": [],
            "2": []
        };
    }
}

async function saveReviews(reviews) {
    try {
        const response = await fetch(`${JSONBIN_BASE_URL}/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify(reviews)
        });
        
        if (!response.ok) {
            throw new Error('Error al guardar las reseñas');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error al guardar reseñas:', error);
        throw error;
    }
}

// Obtener reseñas de un addon específico
async function getReviewsForAddon(addonId) {
    const reviews = await fetchReviews();
    return reviews[addonId] || [];
}

// Obtener reseña del usuario actual para un addon
async function getUserReviewForAddon(addonId) {
    const reviews = await getReviewsForAddon(addonId);
    const userId = getUserId();
    return reviews.find(review => review.userId === userId);
}

// Añadir o actualizar reseña
async function addOrUpdateReview(addonId, rating, comment) {
    const reviews = await fetchReviews();
    const userId = getUserId();
    
    // Asegurarse de que existe el array para este addon
    if (!reviews[addonId]) {
        reviews[addonId] = [];
    }
    
    // Buscar si ya existe una reseña del usuario
    const existingReviewIndex = reviews[addonId].findIndex(review => review.userId === userId);
    
    if (existingReviewIndex !== -1) {
        // Actualizar reseña existente
        reviews[addonId][existingReviewIndex] = {
            userId,
            rating,
            comment,
            timestamp: new Date().toISOString()
        };
    } else {
        // Añadir nueva reseña
        reviews[addonId].push({
            userId,
            rating,
            comment,
            timestamp: new Date().toISOString()
        });
    }
    
    await saveReviews(reviews);
    return reviews[addonId];
}

// Eliminar reseña
async function deleteReview(addonId) {
    const reviews = await fetchReviews();
    const userId = getUserId();
    
    if (reviews[addonId]) {
        reviews[addonId] = reviews[addonId].filter(review => review.userId !== userId);
        await saveReviews(reviews);
    }
    
    return reviews[addonId] || [];
}

// Calcular promedio de calificaciones
function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
}

// Generar ID único para usuario (simulado)
function getUserId() {
    let userId = localStorage.getItem('edwardmc_userId');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('edwardmc_userId', userId);
    }
    return userId;
}

// Renderizar estrellas
function renderStars(rating, interactive = false, size = 'medium') {
    const starSize = size === 'small' ? '1rem' : '1.5rem';
    let starsHtml = '';
    
    for (let i = 1; i <= 5; i++) {
        if (interactive) {
            starsHtml += `
                <span class="star ${i <= rating ? 'active' : ''}" data-rating="${i}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="${starSize}" height="${starSize}" viewBox="0 0 24 24" fill="${i <= rating ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                </span>
            `;
        } else {
            starsHtml += `
                <span class="star ${i <= rating ? 'active' : ''}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="${starSize}" height="${starSize}" viewBox="0 0 24 24" fill="${i <= rating ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                </span>
            `;
        }
    }
    
    return `<div class="stars ${interactive ? 'interactive' : ''} ${size}">${starsHtml}</div>`;
}