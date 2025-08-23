// Variables globales
let currentView = "table";
let propertiesData = [];
let filteredProperties = [];
let currentPage = 1;
const propertiesPerPage = 5;
const API_BASE = 'http://localhost:3000/api';

// Inicialización cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", function () {
  checkAuthStatus();
  initializeProperties();
  setupEventListeners();
});

// Verificar estado de autenticación
function checkAuthStatus() {
  const token = localStorage.getItem('authToken');
  const loginBtn = document.querySelector('.nav-buttons .btn:first-child');
  const registerBtn = document.querySelector('.nav-buttons .btn:last-child');
  
  if (token) {
    // Cambiar botones a perfil y cerrar sesión
    if (loginBtn && registerBtn) {
      loginBtn.textContent = 'Mi Perfil';
      loginBtn.href = '#profile';
      registerBtn.textContent = 'Cerrar Sesión';
      registerBtn.href = '#';
      registerBtn.onclick = logout;
    }
  }
}

// Cerrar sesión
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.reload();
}

// Inicializar datos de propiedades desde la API
function initializeProperties() {
  fetch(`${API_BASE}/properties`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al cargar propiedades');
      }
      return response.json();
    })
    .then(data => {
      propertiesData = data.properties;
      filteredProperties = [...propertiesData];
      updatePropertiesDisplay();
      updatePagination();
    })
    .catch(error => {
      console.error('Error:', error);
      // Fallback a datos estáticos si la API no está disponible
      loadStaticProperties();
    });
}

// Cargar propiedades estáticas (fallback)
function loadStaticProperties() {
  const propertyRows = document.querySelectorAll(".properties-table tbody tr");
  
  propertyRows.forEach((row) => {
    const property = {
      element: row,
      id: row.getAttribute('data-id') || Math.random().toString(36).substr(2, 9),
      title: row.querySelector(".property-title").textContent,
      price: parseFloat(
        row
          .querySelector(".property-price")
          .textContent.replace("$", "")
          .replace(",", "")
      ),
      address: row.querySelector(".property-address").textContent.replace(/\s+/g, ' ').trim(),
      property_type: row.querySelector("td:nth-child(5)").textContent,
      status: row
        .querySelector(".status-badge")
        .classList.contains("status-sale")
        ? "venta"
        : "renta",
      bedrooms: parseInt(row.querySelector(".feature:nth-child(1)").textContent),
      bathrooms: parseInt(row.querySelector(".feature:nth-child(2)").textContent),
      area: parseFloat(row.querySelector(".feature:nth-child(3)").textContent),
      favorite: row.querySelector(".favorite-btn").classList.contains("active"),
    };
    propertiesData.push(property);
  });

  filteredProperties = [...propertiesData];
}

// Configurar event listeners
function setupEventListeners() {
  // Menú responsive
  const menuToggle = document.querySelector(".menu-toggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMobileMenu);
  }

  // Botones de vista (tabla/grid)
  const viewButtons = document.querySelectorAll(".view-btn");
  viewButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      switchView(this);
    });
  });

  // Botones de favoritos
  document.addEventListener('click', function(e) {
    if (e.target.closest('.favorite-btn')) {
      toggleFavorite(e.target.closest('.favorite-btn'));
    }
    
    if (e.target.closest('.contact-btn')) {
      contactAgent(e.target.closest('.contact-btn'));
    }
  });

  // Búsqueda de propiedades
  const searchInputs = document.querySelectorAll('input[type="text"]');
  searchInputs.forEach((input) => {
    input.addEventListener("input", function () {
      filterProperties();
    });
  });

  // Selector de categorías
  const categorySelect = document.querySelector(".search-select");
  if (categorySelect) {
    categorySelect.addEventListener("change", filterProperties);
  }

  // Botón de filtros
  const filtersBtn = document.querySelector(".filters-btn");
  if (filtersBtn) {
    filtersBtn.addEventListener("click", toggleFilters);
  }

  // Paginación
  const pageButtons = document.querySelectorAll(".page-btn");
  pageButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      handlePagination(this);
    });
  });

  // Formulario de búsqueda principal
  const searchForm = document.querySelector('.search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const searchInput = this.querySelector('.search-input');
      if (searchInput) {
        document.querySelector('.search-box input').value = searchInput.value;
        filterProperties();
      }
    });
  }
}

// Alternar menú móvil
function toggleMobileMenu() {
  const navLinks = document.querySelector(".nav-links");
  navLinks.classList.toggle("active");
}

// Cambiar entre vista de tabla y grid
function switchView(button) {
  // Quitar clase active de todos los botones
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Añadir clase active al botón clickeado
  button.classList.add("active");

  // Determinar qué vista mostrar
  const viewType = button.querySelector("i").classList.contains("fa-table")
    ? "table"
    : "grid";
  currentView = viewType;

  // Ocultar/mostrar la vista apropiada
  const tableContainer = document.querySelector(".table-container");

  if (viewType === "table") {
    tableContainer.style.display = "block";
    // Aquí deberías ocultar la vista grid si existiera
  } else {
    tableContainer.style.display = "none";
    // Aquí deberías mostrar la vista grid si existiera
    // convertToGridView();
  }
}

// Alternar favorito
function toggleFavorite(button) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    alert('Por favor inicia sesión para guardar favoritos');
    return;
  }

  const propertyRow = button.closest("tr");
  const propertyId = propertyRow.getAttribute('data-id');
  
  // Encontrar la propiedad correspondiente
  const property = propertiesData.find(p => p.id == propertyId);
  
  if (property) {
    // Cambiar estado visual inmediatamente
    button.classList.toggle("active");
    property.favorite = button.classList.contains("active");
    
    // Enviar al backend
    fetch(`${API_BASE}/favorites`, {
      method: property.favorite ? 'POST' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ property_id: propertyId })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al actualizar favorito');
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error:', error);
      // Revertir cambios visuales en caso de error
      button.classList.toggle("active");
      property.favorite = !property.favorite;
    });
  }
}

// Contactar con agente
function contactAgent(button) {
  const token = localStorage.getItem('authToken');
  const propertyRow = button.closest("tr");
  const propertyId = propertyRow.getAttribute('data-id');
  const property = propertiesData.find(p => p.id == propertyId);
  
  if (!property) return;
  
  if (!token) {
    alert('Por favor inicia sesión para contactar a un agente');
    return;
  }
  
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
  fetch(`${API_BASE}/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      property_id: propertyId,
      message: `Me interesa la propiedad: ${property.title}`
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error al enviar mensaje');
    }
    return response.json();
  })
  .then(data => {
    alert(
      `¡Gracias por tu interés en ${property.title}! Un agente se pondrá en contacto contigo pronto.`
    );
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error al enviar el mensaje. Por favor, intenta nuevamente.');
  });
}

// Filtrar propiedades
function filterProperties() {
  const searchText = document
    .querySelector(".search-box input")
    .value.toLowerCase();
  const categoryValue = document.querySelector(".search-select").value;

  // Si estamos usando la API, hacer una petición filtrada
  if (propertiesData.length > 0 && typeof propertiesData[0] === 'object' && propertiesData[0].id) {
    // Usar filtrado en el frontend como fallback
    filteredProperties = propertiesData.filter((property) => {
      // Filtrar por texto de búsqueda
      const matchesSearch =
        property.title.toLowerCase().includes(searchText) ||
        property.address.toLowerCase().includes(searchText);

      // Filtrar por categoría
      let matchesCategory = true;
      if (categoryValue !== "all") {
        if (categoryValue === "houses") {
          matchesCategory = property.property_type === "Casa";
        } else if (categoryValue === "apartments") {
          matchesCategory = property.property_type === "Departamento";
        } else if (categoryValue === "commercial") {
          matchesCategory = property.property_type === "Comercial";
        }
      }

      return matchesSearch && matchesCategory;
    });
  } else {
    // Filtrado para datos estáticos
    filteredProperties = propertiesData.filter((property) => {
      // Filtrar por texto de búsqueda
      const matchesSearch =
        property.title.toLowerCase().includes(searchText) ||
        property.location.toLowerCase().includes(searchText);

      // Filtrar por categoría
      let matchesCategory = true;
      if (categoryValue !== "all") {
        if (categoryValue === "houses") {
          matchesCategory = property.type === "Casa";
        } else if (categoryValue === "apartments") {
          matchesCategory = property.type === "Departamento";
        } else if (categoryValue === "commercial") {
          matchesCategory = property.type === "Comercial";
        }
      }

      return matchesSearch && matchesCategory;
    });
  }

  // Actualizar la visualización
  updatePropertiesDisplay();
  updatePagination();
}

// Actualizar visualización de propiedades
function updatePropertiesDisplay() {
  const tbody = document.querySelector(".properties-table tbody");
  tbody.innerHTML = "";

  // Calcular propiedades a mostrar en la página actual
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = Math.min(
    startIndex + propertiesPerPage,
    filteredProperties.length
  );
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  // Añadir propiedades filtradas
  currentProperties.forEach((property) => {
    if (property.element) {
      // Para datos estáticos
      tbody.appendChild(property.element);
    } else {
      // Para datos de API - crear fila dinámicamente
      const row = createPropertyRow(property);
      tbody.appendChild(row);
    }
  });

  // Actualizar resumen
  updateSummary();
}

// Crear fila de propiedad para datos de API
function createPropertyRow(property) {
  const row = document.createElement('tr');
  row.setAttribute('data-id', property.id);
  
  // Formatear precio
  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(property.price);
  
  row.innerHTML = `
    <td>
      <div class="property-info">
        <img src="${property.images ? JSON.parse(property.images)[0] : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}" 
             alt="${property.title}" class="property-image">
        <span class="property-title">${property.title}</span>
      </div>
    </td>
    <td>
      <div class="property-price">${formattedPrice}</div>
    </td>
    <td>
      <div class="property-address">
        <i class="fas fa-map-marker-alt"></i> ${property.address}
      </div>
    </td>
    <td>
      <div class="property-features">
        <span class="feature"><i class="fas fa-bed"></i> ${property.bedrooms || 3}</span>
        <span class="feature"><i class="fas fa-bath"></i> ${property.bathrooms || 2}</span>
        <span class="feature"><i class="fas fa-ruler-combined"></i> ${property.area || 120} m²</span>
      </div>
    </td>
    <td>${property.property_type || 'Casa'}</td>
    <td>
      <span class="status-badge ${property.status === 'venta' ? 'status-sale' : 'status-rent'}">
        <i class="fas ${property.status === 'venta' ? 'fa-tag' : 'fa-calendar-alt'}"></i> 
        ${property.status === 'venta' ? 'Venta' : 'Renta'}
      </span>
    </td>
    <td>
      <div class="actions">
        <button class="action-btn favorite-btn ${property.favorite ? 'active' : ''}">
          <i class="fas fa-heart"></i>
        </button>
        <button class="action-btn contact-btn">
          <i class="fas fa-envelope"></i>
        </button>
      </div>
    </td>
  `;
  
  return row;
}

// Alternar panel de filtros
function toggleFilters() {
  alert(
    "Panel de filtros avanzados se abriría aquí. Esta funcionalidad puede extenderse según necesidades específicas."
  );
}

// Manejar paginación
function handlePagination(button) {
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const isPrevious = button.querySelector(".fa-chevron-left");
  const isNext = button.querySelector(".fa-chevron-right");

  if (isPrevious) {
    if (currentPage > 1) {
      currentPage--;
    }
  } else if (isNext) {
    if (currentPage < totalPages) {
      currentPage++;
    }
  } else {
    currentPage = parseInt(button.textContent);
  }

  // Actualizar botones de paginación
  updatePagination();

  // Actualizar visualización de propiedades
  updatePropertiesDisplay();
}

// Actualizar botones de paginación
function updatePagination() {
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const pageButtons = document.querySelectorAll(
    ".page-btn:not(:first-child):not(:last-child)"
  );

  // Limpiar botones existentes (excepto anterior y siguiente)
  pageButtons.forEach((btn) => btn.remove());

  // Añadir botones de página
  const paginationContainer = document.querySelector(".pagination");
  const previousBtn = paginationContainer.querySelector(
    ".page-btn:first-child"
  );
  const nextBtn = paginationContainer.querySelector(".page-btn:last-child");

  // Determinar qué páginas mostrar
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  // Crear botones de página
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.className = "page-btn";
    if (i === currentPage) {
      pageBtn.classList.add("active");
    }
    pageBtn.textContent = i;
    pageBtn.addEventListener("click", function () {
      handlePagination(this);
    });

    paginationContainer.insertBefore(pageBtn, nextBtn);
  }

  // Actualizar estado de botones anterior/siguiente
  previousBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

// Actualizar resumen de propiedades
function updateSummary() {
  const summaryTexts = document.querySelectorAll(".summary-text");
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  if (summaryTexts.length >= 2) {
    summaryTexts[0].textContent = `Mostrando ${Math.min(
      propertiesPerPage,
      filteredProperties.length
    )} de ${filteredProperties.length} propiedades`;
    summaryTexts[1].textContent = `Página ${currentPage} de ${totalPages}`;
  }
}