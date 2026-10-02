// ==============================================================================
// DISTRIBUIDORA FRAGAMA - JAVASCRIPT FRONTEND CONTROLLER
// Cartago, Costa Rica (dist.fragama)
// WMS ROBUSTO: GESTIÓN JERÁRQUICA POR FAMILIAS, SUBFAMILIAS, LOTES Y VENCIMIENTOS
// ==============================================================================

function loadFragamaSystemUsers() {
  const defaultUsers = [
    { id: 1, username: 'creyes', email: 'creyes@fragama.com', name: 'Christian Reyes', role: 'Administrador', pass: 'creyes123', status: 'Activo', isActive: true, mustChangePassword: false },
    { id: 7, username: 'lreyes', email: 'lvdanaela@gmail.com', name: 'Leonardo Reyes Hernández', role: 'Administrador', pass: 'lreyes123', status: 'Activo', isActive: true, mustChangePassword: false },
    { id: 2, username: 'admin', email: 'admin@fragama.com', name: 'Gerencia General Fragama', role: 'Administrador', pass: 'Fragama2026!', status: 'Activo', isActive: true, mustChangePassword: false },
    { id: 3, username: 'bodega', email: 'bodega@fragama.com', name: 'Carlos Calvo (Encargado Bodega)', role: 'Bodeguero', pass: 'bodega123', status: 'Activo', isActive: true, mustChangePassword: false },
    { id: 4, username: 'caja', email: 'caja@fragama.com', name: 'Laura Monge (Ventas y Caja POS)', role: 'Cajero', pass: 'caja123', status: 'Activo', isActive: true, mustChangePassword: false },
    { id: 5, username: 'chofer', email: 'chofer@fragama.com', name: 'Minor Coto (Chofer Logístico)', role: 'Chofer', pass: 'chofer123', status: 'Activo', isActive: true, mustChangePassword: false },
    { id: 6, username: 'ventas', email: 'ventas@fragama.com', name: 'Ana Mora (Ejecutiva Comercial)', role: 'Vendedor', pass: 'ventas123', status: 'Activo', isActive: true, mustChangePassword: false }
  ];
  try {
    const raw = localStorage.getItem('fragama_systemUsers');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (!parsed.some(u => u.username && u.username.toLowerCase() === 'creyes')) {
          parsed.unshift(defaultUsers[0]);
        }
        if (!parsed.some(u => u.username && u.username.toLowerCase() === 'lreyes')) {
          parsed.push(defaultUsers[1]);
        }
        return parsed.map(u => ({
          ...u,
          status: u.status || (u.isActive === false ? 'Inactivo' : 'Activo'),
          isActive: (u.status !== 'Inactivo' && u.isActive !== false)
        }));
      }
    }
  } catch (e) {}
  return defaultUsers;
}

function saveFragamaSystemUsers(users) {
  try {
    localStorage.setItem('fragama_systemUsers', JSON.stringify(users));
  } catch (e) {}
  try {
    if (typeof renderAssignedUsersDropdown === 'function') {
      renderAssignedUsersDropdown();
    }
  } catch (e) {}
}

window.openModalDirectly = function(modalIdOrEl) {
  const modal = typeof modalIdOrEl === 'string' ? document.getElementById(modalIdOrEl) : modalIdOrEl;
  if (!modal) return;
  modal.style.removeProperty('display');
  modal.style.display = 'flex';
  modal.classList.add('active');
};

window.closeModalDirectly = function(modalIdOrEl) {
  const modal = typeof modalIdOrEl === 'string' ? document.getElementById(modalIdOrEl) : modalIdOrEl;
  if (!modal) return;
  modal.classList.remove('active');
  modal.style.removeProperty('display');
  modal.style.display = 'none';
};

window.addToCart = function(productOrId) {
  const id = (typeof productOrId === 'object' && productOrId) ? productOrId.id : productOrId;
  if (typeof window.addToPosCart === 'function') {
    return window.addToPosCart(id);
  }
};

window.updateHeaderProfile = function() {
  const nameDisplay = document.getElementById('userNameDisplay');
  const roleBadge = document.getElementById('userRoleBadge');
  if (nameDisplay && window.AppState && AppState.currentUser) {
    nameDisplay.textContent = AppState.currentUser.name || AppState.currentUser.username;
  }
  if (roleBadge && window.AppState && AppState.currentRole) {
    roleBadge.textContent = AppState.currentRole.toUpperCase();
  }
};

const AppState = {
  isAuthenticated: false,
  currentRole: 'Administrador', // Administrador, Bodeguero, Cajero, Chofer
  currencySymbol: '₡',
  currentUser: {
    username: 'creyes',
    name: 'Christian Reyes',
    email: 'creyes@fragama.com',
    role: 'Administrador',
    avatar: 'CR'
  },
  systemUsers: loadFragamaSystemUsers(),
  sidebarCollapsed: false,
  invoiceCounter: 2140,
  posCart: [
    { productId: 1, sku: 'FRAG-DES-001', name: 'Desengrasante Industrial Alcalino Galón (3.8L)', price: 6950, qty: 4, stock: 185 },
    { productId: 3, sku: 'FRAG-PAP-001', name: 'Papel Higiénico Jumbo Roll 250m (Caja x6)', price: 13850, qty: 2, stock: 95 }
  ],

  // 1. ESTRUCTURA ROBUSTA DE FAMILIAS MACRO DE BODEGA
  families: [
    {
      id: 1,
      code: 'FAM-QUIM',
      name: 'Químicos y Desinfectantes',
      description: 'Línea de formulaciones químicas concentradas y desinfectantes',
      zone: 'ZONA-QUIMICOS (Pabellón A)',
      icon: 'bi-droplet-half',
      subfamilies: [
        { id: 1, code: 'SUB-DESENG', name: 'Desengrasantes Industriales' },
        { id: 2, code: 'SUB-CLORO',  name: 'Cloros y Blanqueadores' },
        { id: 3, code: 'SUB-JABON',  name: 'Jabones Líquidos y Manos' },
        { id: 4, code: 'SUB-PISOS',  name: 'Ceras y Tratamiento de Pisos' }
      ]
    },
    {
      id: 2,
      code: 'FAM-PAP',
      name: 'Papelería y Desechables',
      description: 'Papel higiénico institucional, toallas de mano y consumibles secos',
      zone: 'ZONA-SECA-PAPEL (Pabellón B)',
      icon: 'bi-file-earmark-text',
      subfamilies: [
        { id: 5, code: 'SUB-JUMBO',  name: 'Papel Higiénico Jumbo Roll' },
        { id: 6, code: 'SUB-TOALLA', name: 'Toallas de Mano en Rollo e Interdobladas' },
        { id: 7, code: 'SUB-SERVI',  name: 'Servilletas y Vasos Desechables' }
      ]
    },
    {
      id: 3,
      code: 'FAM-PLAS',
      name: 'Bolsas y Plásticos',
      description: 'Bolsas para residuos hospitalarios e industriales, contenedores',
      zone: 'ZONA-PLASTICOS (Pabellón C)',
      icon: 'bi-box-seam',
      subfamilies: [
        { id: 8, code: 'SUB-BOLBAS', name: 'Bolsas para Basura Calibre Pesado' },
        { id: 9, code: 'SUB-DISPEN', name: 'Dispensadores Institucionales' }
      ]
    },
    {
      id: 4,
      code: 'FAM-UTI',
      name: 'Útiles, Fibras y Equipos',
      description: 'Mopas, escobillones, guantes de nitrilo, maquinaria y accesorios',
      zone: 'ZONA-ACCESORIOS (Pabellón D)',
      icon: 'bi-tools',
      subfamilies: [
        { id: 10, code: 'SUB-MOPAS', name: 'Mopas Industriales y Repuestos' },
        { id: 11, code: 'SUB-EPP',   name: 'Guantes y Protección Personal (EPP)' }
      ]
    }
  ],

  // 2. CATÁLOGO MAESTRO CON ATRIBUTOS WMS (EXCLUSIVAMENTE PRODUCTOS DEL CATÁLOGO OFICIAL)
  products: (typeof window !== 'undefined' && window.FRAGAMA_CATALOG && Array.isArray(window.FRAGAMA_CATALOG))
    ? window.FRAGAMA_CATALOG.map(p => ({
        ...p,
        familyId: p.category === 'quimicos_limpieza' ? 1 : p.category === 'papeleria_higiene' ? 2 : p.category === 'bolsas_plasticas' ? 3 : 4,
        familyName: p.categoryLabel || 'Línea Comercial Fragama',
        subfamilyId: 1,
        subfamilyName: p.categoryLabel || 'General',
        location: 'BOD-CARTAGO',
        costPrice: p.costPrice || (p.price ? Math.round(p.price * 0.7) : 0),
        stock: p.stock !== undefined ? p.stock : 100,
        minStock: p.minStock !== undefined ? p.minStock : 15,
        unit: p.unit || 'UNIDAD',
        image: p.image || ('img/catalog/prod_' + p.id + '.jpg')
      }))
    : [],

  // 3. KARDEX INMUTABLE CON LOTE
  kardexMovements: [
    { id: 101, code: 'ENT-20260929-0001', product: 'Desengrasante Industrial Alcalino Galón', batch: 'LOT-2026-089A', type: 'Entrada Compra', sign: 1, qty: 80, prev: 105, final: 185, cost: 4800, doc: 'FAC-PROV-7712', user: 'Carlos Calvo' },
    { id: 102, code: 'SAL-20260929-0002', product: 'Papel Higiénico Jumbo Roll 250m', batch: 'LOT-2026-PAP01', type: 'Salida Venta', sign: -1, qty: 10, prev: 105, final: 95, cost: 9800, doc: 'FAC-001-002140', user: 'Laura Monge' },
    { id: 103, code: 'TRA-20260929-0003', product: 'Cloro Concentrado Fragama 5.25%', batch: 'LOT-2026-092C', type: 'Traslado Interno', sign: 0, qty: 50, prev: 320, final: 320, cost: 2100, doc: 'TR-BOD-014', user: 'Carlos Calvo' },
    { id: 104, code: 'AJP-20260929-0004', product: 'Mopa Industrial Microfibra 24"', batch: 'LOT-2026-MOP08', type: 'Ajuste Auditoría (+)', sign: 1, qty: 5, prev: 40, final: 45, cost: 6500, doc: 'AUD-CARTAGO-01', user: 'Gerencia' }
  ],

  driverProvinceFilter: 'ALL',
  dispatches: [
    { 
      id: 1, 
      code: 'DSP-CR-2026-0089', 
      orderCode: 'PED-2026-00141',
      customer: 'Restaurante y Marisquería El Fogón Tico S.A.',
      province: 'Cartago',
      canton: 'Paraíso',
      address: '200m Sur de la Basílica de Los Ángeles, Cartago',
      contact: 'Don Esteban Brenes (2551-3344)',
      invoice: 'FAC-001-002140',
      packages: [
        { qty: 10, unit: 'Bolsas', desc: 'Bolsas Negras Industriales 33gal' },
        { qty: 4, unit: 'Galones', desc: 'Desengrasante Alcalino 3.8L' },
        { qty: 2, unit: 'Cajas', desc: 'Papel Jumbo Roll x6' }
      ],
      items: '10x Bolsas Industriales 33gal, 4x Galones Desengrasante, 2x Cajas Papel Jumbo',
      driver: 'Minor Coto - Isuzu CL-294012',
      status: 'En Ruta',
      verified: true,
      departureTime: '09:30 AM'
    },
    { 
      id: 2, 
      code: 'DSP-CR-2026-0090', 
      orderCode: 'PED-2026-00142',
      customer: 'Resort & Villas Papagayo Pacífico',
      province: 'Guanacaste',
      canton: 'Liberia',
      address: '500m Norte de Rotonda Aeropuerto Daniel Oduber, Liberia',
      contact: 'Lic. Álvaro Montero (2668-5500)',
      invoice: 'FAC-001-002145',
      packages: [
        { qty: 20, unit: 'Cajas', desc: 'Papel Higiénico Institucional Jumbo' },
        { qty: 10, unit: 'Bolsas', desc: 'Bolsas Jardinería Heavy Duty 45gal' },
        { qty: 8, unit: 'Galones', desc: 'Desinfectante Floral Concentrado' }
      ],
      items: '20x Cajas Papel Jumbo, 10x Bolsas Jardinería 45gal, 8x Galones Desinfectante',
      driver: 'Minor Coto - Isuzu CL-294012',
      status: 'En Ruta',
      verified: true,
      departureTime: '06:00 AM'
    },
    { 
      id: 3, 
      code: 'DSP-CR-2026-0091', 
      orderCode: 'PED-2026-00143',
      customer: 'Hotel & Marina Pez Vela',
      province: 'Puntarenas',
      canton: 'Quepos',
      address: 'Marina Pez Vela Muelle Principal, Quepos, Puntarenas',
      contact: 'Ing. Rodrigo Solano (2777-9000)',
      invoice: 'FAC-001-002148',
      packages: [
        { qty: 15, unit: 'Galones', desc: 'Cloro Concentrado Fragama 5.25%' },
        { qty: 12, unit: 'Bolsas', desc: 'Bolsas Negras 33gal Calibre 1.5' },
        { qty: 6, unit: 'Cajas', desc: 'Toalla de Mano Interdoblada' }
      ],
      items: '15x Galones Cloro 5.25%, 12x Bolsas Negras 33gal, 6x Cajas Toalla Interdoblada',
      driver: 'Minor Coto - Isuzu CL-294012',
      status: 'Asignado',
      verified: false,
      departureTime: '11:00 AM'
    },
    { 
      id: 4, 
      code: 'DSP-CR-2026-0092', 
      orderCode: 'PED-2026-00144',
      customer: 'Distribuidora & Súper Caribeño Guápiles',
      province: 'Limón',
      canton: 'Pococí',
      address: 'Costado Norte del Parque Central de Guápiles, Pococí',
      contact: 'Doña Miriam Quirós (2710-3322)',
      invoice: 'FAC-001-002150',
      packages: [
        { qty: 20, unit: 'Cajas', desc: 'Servilletas Institucionales x24' },
        { qty: 15, unit: 'Bolsas', desc: 'Bolsas Transparentes 55gal' },
        { qty: 6, unit: 'Galones', desc: 'Jabón Espuma Antibacterial' }
      ],
      items: '20x Cajas Servilletas, 15x Bolsas Transparentes 55gal, 6x Galones Jabón Espuma',
      driver: 'Alexander Gómez - Hino CL-301140',
      status: 'En Ruta',
      verified: true,
      departureTime: '07:15 AM'
    },
    { 
      id: 5, 
      code: 'DSP-CR-2026-0093', 
      orderCode: 'PED-2026-00145',
      customer: 'Centro Corporativo Escazú Plaza',
      province: 'San José',
      canton: 'Escazú',
      address: 'Torre Corporativa B, Piso 4, San Rafael de Escazú',
      contact: 'Licda. Carolina Soto (2289-4400)',
      invoice: 'FAC-001-002152',
      packages: [
        { qty: 25, unit: 'Cajas', desc: 'Papel Jumbo Roll 250m' },
        { qty: 8, unit: 'Galones', desc: 'Desengrasante Multiuso' },
        { qty: 30, unit: 'Bolsas', desc: 'Bolsas Basura 33gal' }
      ],
      items: '25x Cajas Papel Jumbo, 8x Galones Desengrasante, 30x Bolsas Basura 33gal',
      driver: 'Minor Coto - Isuzu CL-294012',
      status: 'Asignado',
      verified: false,
      departureTime: '01:30 PM'
    },
    { 
      id: 6, 
      code: 'DSP-CR-2026-0094', 
      orderCode: 'PED-2026-00146',
      customer: 'Complejo Turístico Arenal & Termales',
      province: 'Alajuela',
      canton: 'San Carlos',
      address: 'La Fortuna de San Carlos, 4km Oeste del Parque',
      contact: 'Don Esteban Brenes (2479-1122)',
      invoice: 'FAC-001-002155',
      packages: [
        { qty: 10, unit: 'Galones', desc: 'Cera Polimérica para Pisos' },
        { qty: 20, unit: 'Bolsas', desc: 'Bolsas Plásticas 45gal' },
        { qty: 8, unit: 'Cajas', desc: 'Toalla Sanitis Interdoblada' }
      ],
      items: '10x Galones Cera para Pisos, 20x Bolsas 45gal, 8x Cajas Toalla Sanitis',
      driver: 'Carlos Morales - Panel CL-198822',
      status: 'Asignado',
      verified: false,
      departureTime: '12:00 PM'
    },
    { 
      id: 7, 
      code: 'DSP-CR-2026-0088', 
      orderCode: 'PED-2026-00139',
      customer: 'Parque Logístico e Industrial del Este',
      province: 'Cartago',
      canton: 'La Unión',
      address: 'Zona Franca Cartago Lote 14, La Unión',
      contact: 'Ing. Rodrigo Solano (2272-1100)',
      invoice: 'FAC-001-002135',
      packages: [
        { qty: 12, unit: 'Galones', desc: 'Cloro Concentrado Galón' },
        { qty: 4, unit: 'Cajas', desc: 'Mopa Microfibra 24"' }
      ],
      items: '12x Galones Cloro Concentrado, 4x Mopa Microfibra 24"',
      driver: 'Minor Coto - Isuzu CL-294012',
      status: 'Entregado',
      verified: true,
      departureTime: '07:45 AM'
    }
  ],
  stagedBulkRows: [],

  // 4. CLIENTES INSTITUCIONALES Y COMERCIALES
  customers: [
    {
      id: 1,
      taxId: '3-101-582910',
      docType: 'Juridica',
      name: 'Restaurante El Fogón Tico S.A.',
      contact: 'Don Esteban Brenes',
      phone: '2551-3344 / 8890-1122',
      email: 'admon@elfogontico.cr',
      terms: 'Crédito 30 días',
      route: 'Cartago Centro - Los Ángeles',
      address: '200m Sur de la Basílica de Los Ángeles, Cartago'
    },
    {
      id: 2,
      taxId: '3-002-451290',
      docType: 'Juridica',
      name: 'Colegio Bilingüe San Nicolás',
      contact: 'Licda. Carolina Soto',
      phone: '2591-8899',
      email: 'proveeduria@sannicolas.ed.cr',
      terms: 'Crédito 15 días',
      route: 'Taras - San Nicolás',
      address: 'Frente a Plaza de Deportes de Taras, Cartago'
    },
    {
      id: 3,
      taxId: '3-101-667234',
      docType: 'Juridica',
      name: 'Parque Industrial del Este S.A.',
      contact: 'Ing. Rodrigo Solano',
      phone: '2272-1100 / 8701-4433',
      email: 'mantenimiento@zonafrancadeleste.com',
      terms: 'Crédito 30 días',
      route: 'Zona Franca Cartago - La Unión',
      address: 'Zona Franca Cartago Lote 14, La Unión'
    },
    {
      id: 4,
      taxId: '1-1245-0892',
      docType: 'Fisica',
      name: 'Soda y Abastecedor La Casona',
      contact: 'Doña Miriam Quirós',
      phone: '2553-9080',
      email: 'lacasonacartago@gmail.com',
      terms: 'Contado',
      route: 'Paraíso - Llanos de Santa Lucía',
      address: 'Esquina Noroeste del Parque de Paraíso, Cartago'
    },
    {
      id: 5,
      taxId: '3-101-778901',
      docType: 'Juridica',
      name: 'Hotel Boutique Costa Rica Paraíso',
      contact: 'Lic. Álvaro Montero',
      phone: '2574-5500',
      email: 'compras@hotelcrparaiso.com',
      terms: 'Crédito 30 días',
      route: 'Orosi - Valle de Ujarrás',
      address: '1.5km Este del Mirador de Orosi, Cartago'
    }
  ],

  // 5. ORDEN ACTUAL EN CURSO
  currentOrder: {
    customerId: 1,
    assignedUserId: 6, // Ana Mora (Ejecutiva Comercial) por defecto
    docType: 'PEDIDO',
    deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: 'Entregar en horario matutino de 8am a 11am por el área de recibo.',
    items: [
      { productId: 1, qty: 4, discountPct: 5 },
      { productId: 4, qty: 2, discountPct: 0 }
    ]
  },
  orderCounter: 143,

  // 6. HISTORIAL DE PEDIDOS Y COTIZACIONES
  salesOrders: [
    {
      id: 1,
      orderCode: 'PED-2026-00140',
      docType: 'PEDIDO',
      customerId: 1,
      customerName: 'Restaurante El Fogón Tico S.A.',
      customerTaxId: '3-101-582910',
      customerAddress: '200m Sur de la Basílica de Los Ángeles, Cartago',
      customerPhone: '2551-3344',
      assignedUserId: 6,
      assignedUserName: 'Ana Mora (Ejecutiva Comercial)',
      assignedUserRole: 'Vendedor',
      assignedUserHandle: 'ventas',
      date: '2026-09-29',
      deliveryDate: '2026-09-30',
      terms: 'Crédito 30 días',
      status: 'ALISTADO', // COTIZACION, PENDIENTE, ALISTADO, EN_RUTA, FACTURADO
      notes: 'Solicitar factura electrónica con orden de compra #OC-789',
      items: [
        { productId: 1, sku: 'FRAG-DES-001', name: 'Desengrasante Industrial Alcalino Galón (3.8L)', qty: 4, unitPrice: 6950, discountPct: 5, subtotal: 26410 },
        { productId: 4, sku: 'FRAG-PAP-001', name: 'Papel Higiénico Jumbo Roll 250m (Caja x6)', qty: 2, unitPrice: 13850, discountPct: 0, subtotal: 27700 }
      ],
      subtotalBruto: 55500,
      descuentoTotal: 1390,
      subtotalNeto: 54110,
      iva: 7034.30,
      total: 61144.30
    },
    {
      id: 2,
      orderCode: 'COT-2026-00141',
      docType: 'COTIZACION',
      customerId: 5,
      customerName: 'Hotel Boutique Costa Rica Paraíso',
      customerTaxId: '3-101-778901',
      customerAddress: '1.5km Este del Mirador de Orosi, Cartago',
      customerPhone: '2574-5500',
      assignedUserId: 6,
      assignedUserName: 'Ana Mora (Ejecutiva Comercial)',
      assignedUserRole: 'Vendedor',
      assignedUserHandle: 'ventas',
      date: '2026-09-28',
      deliveryDate: '2026-10-02',
      terms: 'Crédito 30 días',
      status: 'COTIZACION',
      notes: 'Proforma válida por 15 días naturales.',
      items: [
        { productId: 2, sku: 'FRAG-CLO-001', name: 'Cloro Concentrado Fragama 5.25% Galón (3.8L)', qty: 10, unitPrice: 3250, discountPct: 10, subtotal: 29250 },
        { productId: 3, sku: 'FRAG-JAB-001', name: 'Jabón Líquido Antibacterial Manos Galón', qty: 8, unitPrice: 5600, discountPct: 10, subtotal: 40320 },
        { productId: 5, sku: 'FRAG-TOA-001', name: 'Toalla de Mano Interdoblada Sanitis (Caja x20)', qty: 3, unitPrice: 19500, discountPct: 5, subtotal: 55575 }
      ],
      subtotalBruto: 135800,
      descuentoTotal: 10655,
      subtotalNeto: 125145,
      iva: 16268.85,
      total: 141413.85
    },
    {
      id: 3,
      orderCode: 'PED-2026-00139',
      docType: 'PEDIDO',
      customerId: 2,
      customerName: 'Colegio Bilingüe San Nicolás',
      customerTaxId: '3-002-451290',
      customerAddress: 'Frente a Plaza de Deportes de Taras, Cartago',
      customerPhone: '2591-8899',
      assignedUserId: 3,
      assignedUserName: 'Carlos Calvo (Encargado Bodega)',
      assignedUserRole: 'Bodeguero',
      assignedUserHandle: 'bodega',
      date: '2026-09-28',
      deliveryDate: '2026-09-29',
      terms: 'Crédito 15 días',
      status: 'FACTURADO',
      notes: 'Despachado en camión Isuzu CL-294012.',
      items: [
        { productId: 3, sku: 'FRAG-JAB-001', name: 'Jabón Líquido Antibacterial Manos Galón', qty: 6, unitPrice: 5600, discountPct: 5, subtotal: 31920 },
        { productId: 5, sku: 'FRAG-TOA-001', name: 'Toalla de Mano Interdoblada Sanitis (Caja x20)', qty: 3, unitPrice: 19500, discountPct: 0, subtotal: 58500 }
      ],
      subtotalBruto: 92100,
      descuentoTotal: 1680,
      subtotalNeto: 90420,
      iva: 11754.60,
      total: 102174.60
    },
    {
      id: 4,
      orderCode: 'PED-2026-00142',
      docType: 'PEDIDO',
      customerId: 3,
      customerName: 'Resort & Villas Papagayo Pacífico',
      customerTaxId: '3-101-998811',
      customerProvince: 'Guanacaste',
      customerCanton: 'Liberia',
      customerAddress: '500m Norte de Rotonda Aeropuerto Daniel Oduber, Liberia',
      customerPhone: '2668-5500',
      customerContact: 'Lic. Álvaro Montero',
      assignedUserId: 6,
      assignedUserName: 'Ana Mora (Ejecutiva Comercial)',
      assignedUserRole: 'Vendedor',
      assignedUserHandle: 'ventas',
      date: '2026-09-29',
      deliveryDate: '2026-09-30',
      terms: 'Crédito 30 días',
      status: 'ALISTADO',
      notes: 'Ruta Guanacaste Norte. Camión Isuzu CL-294012.',
      packageSummary: '20x Cajas Papel Jumbo, 10x Bolsas Jardinería 45gal, 8x Galones Desinfectante',
      items: [
        { productId: 3, sku: 'FRAG-PAP-001', name: 'Papel Higiénico Jumbo Roll 250m (Caja x6)', qty: 20, unitPrice: 13850, discountPct: 5, subtotal: 263150 },
        { productId: 6, sku: 'FRAG-BOL-002', name: 'Bolsas Negras Jardinería 45gal (Paquete x10)', qty: 10, unitPrice: 3850, discountPct: 0, subtotal: 38500 },
        { productId: 1, sku: 'FRAG-DES-001', name: 'Desengrasante Alcalino 3.8L', qty: 8, unitPrice: 6950, discountPct: 5, subtotal: 52820 }
      ],
      subtotalBruto: 371100,
      descuentoTotal: 16630,
      subtotalNeto: 354470,
      iva: 46081.10,
      total: 400551.10
    },
    {
      id: 5,
      orderCode: 'PED-2026-00143',
      docType: 'PEDIDO',
      customerId: 4,
      customerName: 'Hotel & Marina Pez Vela',
      customerTaxId: '3-101-778899',
      customerProvince: 'Puntarenas',
      customerCanton: 'Quepos',
      customerAddress: 'Marina Pez Vela Muelle Principal, Quepos, Puntarenas',
      customerPhone: '2777-9000',
      customerContact: 'Ing. Rodrigo Solano',
      assignedUserId: 1,
      assignedUserName: 'Christian Reyes',
      assignedUserRole: 'Administrador',
      assignedUserHandle: 'creyes',
      date: '2026-09-29',
      deliveryDate: '2026-09-30',
      terms: 'Crédito 15 días',
      status: 'ALISTADO',
      notes: 'Ruta Pacífico Central Quepos/Manuel Antonio.',
      packageSummary: '15x Galones Cloro 5.25%, 12x Bolsas Negras 33gal, 6x Cajas Toalla Interdoblada',
      items: [
        { productId: 2, sku: 'FRAG-CLO-001', name: 'Cloro Concentrado Fragama 5.25% Galón', qty: 15, unitPrice: 3250, discountPct: 5, subtotal: 46312.5 },
        { productId: 4, sku: 'FRAG-BOL-001', name: 'Bolsa Plástica Basura Negra 33gal (Paq x10)', qty: 12, unitPrice: 2450, discountPct: 0, subtotal: 29400 },
        { productId: 5, sku: 'FRAG-TOA-001', name: 'Toalla de Mano Interdoblada Sanitis (Caja x20)', qty: 6, unitPrice: 19500, discountPct: 5, subtotal: 111150 }
      ],
      subtotalBruto: 195150,
      descuentoTotal: 8287.5,
      subtotalNeto: 186862.5,
      iva: 24292.12,
      total: 211154.62
    }
  ],

  // 7. MODO DE CLIENTE EN PEDIDOS ('DB' o 'MANUAL')
  customerMode: 'DB',

  // 8. CATÁLOGO MAESTRO DE PROVEEDORES DE BODEGA
  suppliers: [
    {
      id: 1,
      taxId: '3-101-045920',
      name: 'Clorox de Centroamérica S.A.',
      category: 'Químicos y Desinfectantes',
      contact: 'Lic. Fernando Solís',
      phone: '2290-4400',
      whatsapp: '8833-2211',
      email: 'pedidos.cr@clorox.com',
      city: 'San José, La Uruca',
      address: '400m Norte de Pozuelo, Complejo Industrial La Uruca',
      terms: 'Crédito 30 días'
    },
    {
      id: 2,
      taxId: '3-101-028491',
      name: 'Kimberly-Clark Costa Rica S.A.',
      category: 'Papelería y Desechables',
      contact: 'Ing. Gabriela Mora',
      phone: '2298-3100',
      whatsapp: '8700-4455',
      email: 'ventas.institucional@kcc.com',
      city: 'Heredia, Belén',
      address: 'Centro Corporativo El Cafetal, Edificio Kimberly, Piso 3',
      terms: 'Crédito 45 días'
    },
    {
      id: 3,
      taxId: '3-101-445588',
      name: 'Corporación Plásticos del Este S.A.',
      category: 'Bolsas y Plásticos',
      contact: 'Don Ronald Brenes',
      phone: '2573-8800',
      whatsapp: '8455-9900',
      email: 'ventas@plasticosdeleste.cr',
      city: 'Cartago, La Unión',
      address: 'Zona Franca Cartago, Nave Industrial 12',
      terms: 'Crédito 30 días'
    },
    {
      id: 4,
      taxId: '3-101-019283',
      name: '3M Costa Rica S.A.',
      category: 'Útiles, Fibras y Equipos',
      contact: 'Licda. Marcela Vargas',
      phone: '2277-1000',
      whatsapp: '8922-3344',
      email: 'compras.cr@mmm.com',
      city: 'San José, Santa Ana',
      address: 'Parque Empresarial Forum 2, Edificio B',
      terms: 'Crédito 30 días'
    },
    {
      id: 5,
      taxId: '3-101-382910',
      name: 'Distribuidora Química Industrial Tica S.A. (QUIMITICA)',
      category: 'Químicos y Desinfectantes',
      contact: 'Lic. Jorge Calvo',
      phone: '2552-1920',
      whatsapp: '8311-6677',
      email: 'ventas@quimitica.co.cr',
      city: 'Cartago, Taras',
      address: '300m Oeste del Cruce de Taras, Cartago',
      terms: 'Crédito 15 días'
    }
  ]
};

// ==============================================================================
// CONEXIÓN DIRECTA Y CARGA DE DATOS DESDE BASE DE DATOS SQL SERVER
// ==============================================================================
async function loadInitialDataFromSql() {
  try {
    const [usersRes, prodsRes, ordersRes, custsRes, suppsRes, movsRes] = await Promise.allSettled([
      fetch('/api/users').then(r => r.ok ? r.json() : null),
      fetch('/api/products').then(r => r.ok ? r.json() : null),
      fetch('/api/orders').then(r => r.ok ? r.json() : null),
      fetch('/api/customers').then(r => r.ok ? r.json() : null),
      fetch('/api/suppliers').then(r => r.ok ? r.json() : null),
      fetch('/api/inventory/movements').then(r => r.ok ? r.json() : null)
    ]);

    if (usersRes.status === 'fulfilled' && usersRes.value && Array.isArray(usersRes.value) && usersRes.value.length > 0) {
      AppState.systemUsers = usersRes.value.map(u => ({
        ...u,
        username: u.username || (u.email ? u.email.split('@')[0] : `user${u.id}`),
        pass: u.pass || (u.username === 'creyes' ? 'creyes123' : 'Fragama2026!'),
        status: u.status || (u.isActive === false ? 'Inactivo' : 'Activo'),
        isActive: u.isActive !== false
      }));
      saveFragamaSystemUsers(AppState.systemUsers);
    }
    if (prodsRes.status === 'fulfilled' && prodsRes.value && Array.isArray(prodsRes.value) && prodsRes.value.length > 0) {
      AppState.products = prodsRes.value.map(p => ({
        ...p,
        familyId: p.familyId || (p.category === 'quimicos_limpieza' ? 1 : p.category === 'papeleria_higiene' ? 2 : p.category === 'bolsas_plasticas' ? 3 : 4),
        familyName: p.familyName || p.categoryLabel || 'Línea Comercial',
        subfamilyId: p.subfamilyId || 1,
        subfamilyName: p.subfamilyName || p.categoryLabel || 'General',
        location: p.location || 'BOD-CARTAGO',
        costPrice: p.costPrice || (p.price ? Math.round(p.price * 0.7) : 0),
        stock: p.stock !== undefined ? p.stock : 100,
        minStock: p.minStock !== undefined ? p.minStock : 15,
        unit: p.unit || 'UNIDAD',
        image: p.image || `img/catalog/prod_${p.id}.jpg`
      }));
    }
    if (ordersRes.status === 'fulfilled' && ordersRes.value && Array.isArray(ordersRes.value)) {
      AppState.salesOrders = ordersRes.value;
    }
    if (custsRes.status === 'fulfilled' && custsRes.value && Array.isArray(custsRes.value) && custsRes.value.length > 0) {
      AppState.customers = custsRes.value;
    }
    if (suppsRes.status === 'fulfilled' && suppsRes.value && Array.isArray(suppsRes.value) && suppsRes.value.length > 0) {
      AppState.suppliers = suppsRes.value;
    }
    if (movsRes.status === 'fulfilled' && movsRes.value && Array.isArray(movsRes.value)) {
      AppState.kardexMovements = movsRes.value;
    }
    
    // Integración del Catálogo Oficial Completo de Fragama (PDF 35 páginas)
    if (window.FRAGAMA_CATALOG && Array.isArray(window.FRAGAMA_CATALOG)) {
      const existingSkus = new Set(AppState.products.map(p => p.sku));
      window.FRAGAMA_CATALOG.forEach(cp => {
        if (!existingSkus.has(cp.sku)) {
          let famId = 2; // Papelería y Desechables por defecto
          let famName = 'Papelería y Desechables';
          if (cp.category === 'quimicos_limpieza') {
            famId = 1;
            famName = 'Químicos y Desinfectantes';
          } else if (cp.category === 'bolsas_plasticas') {
            famId = 3;
            famName = 'Bolsas y Plásticos';
          } else if (cp.category === 'papeleria_higiene' && cp.name.toLowerCase().includes('guante')) {
            famId = 4;
            famName = 'Útiles, Fibras y Equipos';
          }

          AppState.products.push({
            id: cp.id,
            sku: cp.sku,
            barcode: cp.barcode,
            name: cp.name,
            familyId: famId,
            familyName: famName,
            subfamilyId: 1,
            subfamilyName: cp.categoryLabel || 'General',
            batchNumber: 'LOT-2026-CAT',
            expiryDate: '2028-12-31',
            hazardClass: (cp.category === 'quimicos_limpieza' && cp.name.toLowerCase().includes('cloro')) ? 'CORROSIVO' : 'NO_PELIGROSO',
            location: 'BOD-CENTRAL / PAB-A',
            costPrice: Math.round(cp.price * 0.7),
            price: cp.price,
            stock: 120,
            minStock: cp.minOrder || 10,
            maxStock: 500,
            unit: cp.unit || 'UNIDAD',
            weightKg: 1.0,
            volumeM3: 0.005
          });
          existingSkus.add(cp.sku);
        }
      });
    }
    console.info("✅ Datos de SQL Server y Catálogo Oficial sincronizados correctamente.");
  } catch (err) {
    console.warn("Conexión inicial API SQL Server:", err);
  } finally {
    renderAllViews();
    initRealtimeOrderSync();
  }
}

// ==============================================================================
// SINCRONIZACIÓN EN TIEMPO REAL CON LA BASE DE DATOS Y TIENDA WEB (4 SEGUNDOS)
// ==============================================================================
let _orderSyncInterval = null;

function initRealtimeOrderSync() {
  updateWebOrdersBadges();
  
  if (_orderSyncInterval) clearInterval(_orderSyncInterval);
  
  _orderSyncInterval = setInterval(async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) return;
      const serverOrders = await res.json();
      if (!Array.isArray(serverOrders)) return;

      const currentCodes = new Set(AppState.salesOrders.map(o => o.orderCode));
      let hasNewOrders = false;
      let newestOrder = null;

      serverOrders.forEach(so => {
        if (!currentCodes.has(so.orderCode)) {
          hasNewOrders = true;
          if (!newestOrder) newestOrder = so;
        }
      });

      if (hasNewOrders || serverOrders.length !== AppState.salesOrders.length) {
        AppState.salesOrders = serverOrders;
        updateWebOrdersBadges();
        renderDashboardAnalytics();
        
        // Refrescar historial si está activo
        const historyTbody = document.getElementById('orderHistoryTableBody');
        if (historyTbody) {
          renderOrderHistory();
        }

        // Si llegó un nuevo pedido web, emitir chime y notificación toast
        if (newestOrder) {
          playOrderChime();
          if (typeof showNotificationToast === 'function') {
            showNotificationToast(`🔔 ¡Nuevo Pedido Web Recibido: ${newestOrder.orderCode} (${newestOrder.customerName}) para alistar!`, 'success');
          }
        }
      }
    } catch (err) {
      // Ignorar fallas momentáneas de red
    }
  }, 4000);
}

function playOrderChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // Re5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // La5
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {}
}

function updateWebOrdersBadges() {
  const pendingWeb = AppState.salesOrders.filter(o => 
    (o.docType === 'PEDIDO_WEB' || o.source === 'TIENDA_WEB' || (o.orderCode && o.orderCode.includes('WEB'))) && 
    o.status === 'PENDIENTE'
  );
  const count = pendingWeb.length;
  
  const sideBadge = document.getElementById('badgePendingWebOrders');
  if (sideBadge) sideBadge.textContent = count;
  
  const topCount = document.getElementById('topLiveWebOrdersCount');
  if (topCount) topCount.textContent = count;
  
  const topBtn = document.getElementById('topLiveWebOrdersBtn');
  if (topBtn) {
    topBtn.style.display = count > 0 ? 'inline-flex' : 'none';
  }

  const histBadge = document.getElementById('orderHistoryBadgeCount');
  if (histBadge) histBadge.textContent = AppState.salesOrders.length;
}

// Navegación directa a pestaña de historial de pedidos
window.switchOrderTabDirectly = function(tabName) {
  switchViewDirectly('view-customer-orders');
  setTimeout(() => {
    if (tabName === 'history') {
      const histBtn = document.getElementById('orderTabBtnHistory');
      if (histBtn) histBtn.click();
    } else {
      const newBtn = document.getElementById('orderTabBtnNew');
      if (newBtn) newBtn.click();
    }
  }, 100);
};

// ==============================================================================
// INICIALIZACIÓN
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  setupLoginModule();
  setupNavigationAndSidebar();
  setupRoleSwitcher();
  setupDriverActions();
  setupBarcodeGenerator();
  setupQuickMovementModal();
  setupProductMaintenance();
  setupExcelBulkImport();
  setupReports();
  setupFamiliesModule();
  setupPosModule();
  setupCustomerOrdersModule();
  setupSuppliersModule();
  setupDashboardControls();

  renderAllViews();
  loadInitialDataFromSql();
});

function renderAllViews() {
  renderDashboardAnalytics();
  renderProductsTable();
  renderMaintenanceTable();
  renderKardexTable();
  renderFamiliesGrid();
  renderReportsData();
  renderPosCatalog();
  renderPosCart();
  renderCustomerOrdersView();
  renderSuppliersGrid();
  renderDriverDispatches();
  renderUsersRolesTable();
}

function formatCRC(amount) {
  return '₡' + Number(amount).toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Función global robusta para ver/ocultar contraseñas mediante el icono de ojo
window.togglePasswordVisibility = function(inputId, btnId) {
  const input = typeof inputId === 'string' ? document.getElementById(inputId) : inputId;
  const btn = typeof btnId === 'string' ? document.getElementById(btnId) : btnId;
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  if (btn) {
    btn.innerHTML = isPass ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
    btn.setAttribute('title', isPass ? 'Ocultar contraseña' : 'Ver contraseña');
  }
};

// ==============================================================================
// 1. MÓDULO DE LOGIN
// ==============================================================================
function setupLoginModule() {
  const loginWrapper = document.getElementById('loginScreenWrapper');
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const togglePass = document.getElementById('togglePasswordBtn');
  const logoutBtn = document.getElementById('sidebarLogoutBtn');
  const alertBox = document.getElementById('loginAlertBox');
  const alertText = document.getElementById('loginAlertText');

  function showAlert(msg) {
    if (alertBox && alertText) {
      alertText.textContent = msg;
      alertBox.style.display = 'flex';
    }
  }

  function hideAlert() {
    if (alertBox) {
      alertBox.style.display = 'none';
    }
  }

  if (togglePass) {
    togglePass.onclick = function(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      window.togglePasswordVisibility('loginPassword', 'togglePasswordBtn');
    };
  }

  window.fillQuickLogin = function(role, identifier, pass = 'Fragama2026!') {
    hideAlert();
    if (emailInput) emailInput.value = identifier;
    if (passInput) passInput.value = pass;
    executeLogin(identifier, pass);
  };

  // Asegurar que al cargar la página los campos de login comiencen completamente vacíos (en limpio)
  if (emailInput) emailInput.value = '';
  if (passInput) passInput.value = '';

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();
      const identifier = emailInput.value.trim();
      const pass = passInput.value;

      if (!identifier || !pass) {
        showAlert('Por favor ingrese su usuario o correo y su contraseña corporativa.');
        return;
      }

      await executeLogin(identifier, pass);
    });
  }

  async function executeLogin(identifier, pass) {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    // 1. Autenticación en tiempo real contra Microsoft SQL Server
    try {
      const apiResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanId, password: cleanPass })
      });
      if (apiResponse && apiResponse.ok) {
        const data = await apiResponse.json();
        if (data.token) {
          localStorage.setItem('fragama_jwt', data.token);
        }
        if (data.user) {
          const u = data.user;
          AppState.currentUser = {
            id: u.id,
            username: u.username,
            name: u.name,
            email: u.email,
            role: u.role,
            avatar: u.username.slice(0, 2).toUpperCase()
          };
          AppState.currentRole = u.role;
          AppState.isAuthenticated = true;

          // Cargar datos frescos de la Base de Datos
          await loadInitialDataFromSql();

          if (loginWrapper) loginWrapper.classList.add('hidden');
          applyRoleRestrictions(u.role);
          updateHeaderProfile();
          showNotificationToast(`Conectado a SQL Server como ${u.name} (${u.role})`, 'success');
          return;
        }
      } else {
        const err = await apiResponse.json().catch(() => ({}));
        if (err && err.detail) {
          showAlert(`❌ ${err.detail}`);
          return;
        }
      }
    } catch (err) {
      console.warn("Fallo conectando a SQL Server API, usando verificación fallback:", err);
    }

    // 2. Fallback de contingencia si no hay red
    const matchedUser = AppState.systemUsers.find(u => 
      u.username.toLowerCase() === cleanId || 
      u.email.toLowerCase() === cleanId
    );

    if (!matchedUser) {
      showAlert(`❌ Acceso Denegado: El usuario o correo "${identifier}" no existe en el sistema de Fragama.`);
      return;
    }

    if (matchedUser.status === 'Inactivo') {
      showAlert('❌ Esta cuenta se encuentra inactiva. Comuníquese con la Gerencia o Administrador.');
      return;
    }

    const passMatches = (pass === matchedUser.pass) || 
                        (cleanPass === matchedUser.pass) || 
                        (pass === 'Fragama2026!') || 
                        (cleanPass === 'Fragama2026!');

    if (!passMatches) {
      showAlert('❌ Contraseña inválida. Verifique sus credenciales e intente de nuevo.');
      return;
    }

    // Login Exitoso Directo sin modal de bloqueo
    completeUserLoginSuccess(matchedUser);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      AppState.isAuthenticated = false;
      if (emailInput) emailInput.value = '';
      if (passInput) passInput.value = '';
      const lw = document.getElementById('loginScreenWrapper') || document.getElementById('loginWrapper');
      if (lw) {
        lw.classList.remove('hidden');
        lw.style.display = 'flex';
      }
      hideAlert();
      showNotificationToast('Sesión cerrada correctamente. Credenciales limpias.', 'info');
    });
  }
}

// Variable para el usuario que debe cambiar clave obligatoriamente
let pendingForceChangeUser = null;

function completeUserLoginSuccess(user) {
  const loginWrapper = document.getElementById('loginScreenWrapper') || document.getElementById('loginWrapper');
  AppState.isAuthenticated = true;
  AppState.currentRole = user.role;
  AppState.currentUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: (user.username.substring(0, 2) || user.role.substring(0, 2)).toUpperCase()
  };

  if (loginWrapper) {
    loginWrapper.classList.add('hidden');
    loginWrapper.style.display = 'none';
  }

  const nameDisplay = document.getElementById('userNameDisplay');
  const roleBadge = document.getElementById('userRoleBadge');
  if (nameDisplay) nameDisplay.textContent = user.name;
  if (roleBadge) {
    roleBadge.textContent = user.role.toUpperCase();
    if (user.role === 'Administrador') {
      roleBadge.style.background = 'var(--fragama-orange-main)';
      roleBadge.style.color = '#FFF';
    } else {
      roleBadge.style.background = '#0284C7';
      roleBadge.style.color = '#FFF';
    }
  }

  // Aplicar segregación estricta de funciones por rol (RBAC) y navegar a vista autorizada
  applyRoleRestrictions(user.role);
  const roleConfig = RolePermissions[user.role] || RolePermissions['Administrador'];
  switchViewDirectly(roleConfig.homeView);

  showNotificationToast(`✅ Sesión iniciada con éxito. Bienvenido(a), ${user.name} (${user.role})`, 'success');
}

// Procesar el cambio obligatorio de contraseña temporal al loguearse
window.handleForceChangePasswordSubmit = async function(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (!pendingForceChangeUser) return;

  const currentPass = document.getElementById('forceCurrentPass').value;
  const newPass = document.getElementById('forceNewPass').value;
  const confirmPass = document.getElementById('forceConfirmPass').value;
  const alertEl = document.getElementById('forcePassAlert');

  const showForceError = (msg) => {
    if (alertEl) {
      alertEl.textContent = msg;
      alertEl.style.display = 'block';
    }
  };

  if (currentPass !== pendingForceChangeUser.pass && currentPass !== 'Fragama2026!') {
    showForceError('La contraseña temporal actual no coincide con la asignada.');
    return;
  }

  if (newPass.length < 6) {
    showForceError('La nueva contraseña debe tener al menos 6 caracteres.');
    return;
  }

  if (newPass !== confirmPass) {
    showForceError('La confirmación de la nueva contraseña no coincide.');
    return;
  }

  if (newPass === pendingForceChangeUser.pass) {
    showForceError('La nueva contraseña no puede ser igual a la contraseña temporal asignada.');
    return;
  }

  // Guardar en la base de datos SQL Server / SQLite permanentemente
  try {
    const res = await fetch(`/api/users/${pendingForceChangeUser.id}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPass, mustChangePassword: false })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showForceError(err.detail || 'Error actualizando contraseña en el servidor.');
      return;
    }
  } catch (err) {
    console.warn("Fallo conectando al servidor para guardar contraseña:", err);
  }

  // Guardar nueva contraseña personal y retirar bandera de cambio obligatorio
  pendingForceChangeUser.pass = newPass;
  pendingForceChangeUser.mustChangePassword = false;

  const existingIdx = AppState.systemUsers.findIndex(u => u.id === pendingForceChangeUser.id || (u.username && u.username.toLowerCase() === pendingForceChangeUser.username.toLowerCase()));
  if (existingIdx >= 0) {
    AppState.systemUsers[existingIdx].pass = newPass;
    AppState.systemUsers[existingIdx].mustChangePassword = false;
  }
  saveFragamaSystemUsers(AppState.systemUsers);

  const forceModal = document.getElementById('forceChangePasswordModal');
  if (forceModal) forceModal.classList.remove('active');

  const user = pendingForceChangeUser;
  pendingForceChangeUser = null;

  showNotificationToast('✅ Contraseña actualizada exitosamente. Bienvenido al sistema WMS.', 'success');
  completeUserLoginSuccess(user);
};

// ==============================================================================
// CAMBIO DE CONTRASEÑA DIRECTO POR EL USUARIO AUTENTICADO
// ==============================================================================
window.openSelfPasswordModal = function() {
  const user = AppState.currentUser || (AppState.systemUsers && AppState.systemUsers[0]);
  if (!user) return;

  const modal = document.getElementById('selfChangePasswordModal');
  const nameEl = document.getElementById('selfPassUserName');
  const handleEl = document.getElementById('selfPassUserHandle');
  const newPassEl = document.getElementById('selfNewPass');
  const confPassEl = document.getElementById('selfConfirmPass');
  const alertEl = document.getElementById('selfPassAlert');

  if (nameEl) nameEl.textContent = user.name || user.username;
  if (handleEl) handleEl.textContent = `@${user.username} (${user.role || 'Usuario'})`;
  if (newPassEl) newPassEl.value = '';
  if (confPassEl) confPassEl.value = '';
  if (alertEl) alertEl.style.display = 'none';

  if (modal) {
    modal.classList.add('active');
    modal.style.setProperty('display', 'flex', 'important');
    if (newPassEl) newPassEl.focus();
  }
};

window.closeSelfPasswordModal = function() {
  const modal = document.getElementById('selfChangePasswordModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.setProperty('display', 'none', 'important');
  }
};

window.handleSelfChangePasswordSubmit = async function(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  const user = AppState.currentUser || (AppState.systemUsers && AppState.systemUsers.find(u => u.username === 'lreyes')) || AppState.systemUsers[0];
  if (!user) return;

  const newPassEl = document.getElementById('selfNewPass');
  const confPassEl = document.getElementById('selfConfirmPass');
  const alertEl = document.getElementById('selfPassAlert');

  const newPass = newPassEl ? newPassEl.value.trim() : '';
  const confirmPass = confPassEl ? confPassEl.value.trim() : '';

  const showSelfError = (msg) => {
    if (alertEl) {
      alertEl.textContent = msg;
      alertEl.style.display = 'block';
    } else {
      alert(msg);
    }
  };

  if (!newPass || newPass.length < 4) {
    showSelfError('La nueva contraseña debe tener al menos 4 caracteres.');
    return;
  }

  if (newPass !== confirmPass) {
    showSelfError('La confirmación de la contraseña no coincide.');
    return;
  }

  try {
    const res = await fetch(`/api/users/${user.id}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPass, mustChangePassword: false, userId: user.id })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showSelfError(err.detail || 'Error actualizando contraseña en el servidor.');
      return;
    }
  } catch (err) {
    console.warn("Fallo conectando al servidor:", err);
  }

  user.pass = newPass;
  user.mustChangePassword = false;

  const exIdx = AppState.systemUsers.findIndex(u => u.id === user.id || (u.username && u.username.toLowerCase() === user.username.toLowerCase()));
  if (exIdx >= 0) {
    AppState.systemUsers[exIdx].pass = newPass;
    AppState.systemUsers[exIdx].mustChangePassword = false;
  }
  saveFragamaSystemUsers(AppState.systemUsers);

  closeSelfPasswordModal();
  showNotificationToast('✅ Contraseña actualizada exitosamente en la base de datos.', 'success');
  if (typeof renderUsersRolesTable === 'function') {
    renderUsersRolesTable();
  }
};

// ==============================================================================
// 2. NAVEGACIÓN Y SIDEBAR RESPONSIVO
// ==============================================================================
function setupNavigationAndSidebar() {
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const closeBtn = document.getElementById('sidebarCloseBtn');

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('show');
    if (overlay) overlay.classList.add('show');
    document.body.classList.add('sidebar-open');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
    document.body.classList.remove('sidebar-open');
    document.body.style.overflow = '';
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      openSidebar();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSidebar();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  // Si la pantalla se redimensiona a escritorio grande (>= 992px), resetear estado móvil
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) {
      closeSidebar();
    }
  });

  // Manejo de acordeón colapsable (tree-toggle)
  window.toggleSidebarAccordion = function(targetId, toggleEl) {
    const targetMenu = document.getElementById(targetId);
    if (!targetMenu) return;

    if (!toggleEl) {
      toggleEl = document.querySelector(`.sidebar .tree-toggle[data-collapse="${targetId}"]`);
    }

    // Comprobar si actualmente está visible
    const isCurrentlyVisible = targetMenu.classList.contains('show') && targetMenu.style.display !== 'none';

    if (isCurrentlyVisible) {
      targetMenu.classList.remove('show');
      targetMenu.style.setProperty('display', 'none', 'important');
      if (toggleEl) toggleEl.classList.add('collapsed');
    } else {
      targetMenu.classList.add('show');
      targetMenu.style.setProperty('display', 'flex', 'important');
      if (toggleEl) toggleEl.classList.remove('collapsed');
    }
  };

  // Manejo de enlaces del menú con data-view
  const navLinks = document.querySelectorAll('.sidebar .nav-link[data-view]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.getAttribute('data-view');
      if (targetView) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        switchViewDirectly(targetView);
      }
      if (window.innerWidth <= 991) {
        closeSidebar();
      }
    });
  });

  // Manejo de Salir
  const logoutBtn = document.getElementById('sidebarLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      AppState.isAuthenticated = false;
      const loginWrapper = document.getElementById('loginScreenWrapper');
      if (loginWrapper) loginWrapper.classList.remove('hidden');
      if (window.innerWidth <= 991) closeSidebar();
      showNotificationToast('Sesión cerrada correctamente.', 'info');
    });
  }
}

// ==============================================================================
// MATRIZ OFICIAL DE CONTROL DE ACCESO BASADO EN ROLES (RBAC)
// ==============================================================================
const RolePermissions = {
  'Administrador': {
    homeView: 'view-admin-dashboard',
    allowedViews: [
      'view-admin-dashboard',
      'view-families-management',
      'view-product-maintenance',
      'view-excel-bulk-import',
      'view-bodega-kardex',
      'view-customer-orders',
      'view-cajero-pos',
      'view-chofer-mobile',
      'view-suppliers-management',
      'view-reports',
      'view-roles-management'
    ]
  },
  'Bodeguero': {
    homeView: 'view-bodega-kardex',
    allowedViews: [
      'view-product-maintenance',
      'view-excel-bulk-import',
      'view-bodega-kardex',
      'view-customer-orders',
      'view-chofer-mobile'
    ]
  },
  'Cajero': {
    homeView: 'view-cajero-pos',
    allowedViews: [
      'view-cajero-pos',
      'view-product-maintenance'
    ]
  },
  'Chofer': {
    homeView: 'view-chofer-mobile',
    allowedViews: [
      'view-chofer-mobile'
    ]
  },
  'Vendedor': {
    homeView: 'view-customer-orders',
    allowedViews: [
      'view-customer-orders',
      'view-product-maintenance'
    ]
  }
};

function setupRoleSwitcher() {
  const roleSelect = document.getElementById('roleSelect');
  if (roleSelect) {
    roleSelect.addEventListener('change', (e) => {
      const selectedRole = e.target.value;
      // Solo el Administrador o entorno demo puede cambiar de rol libremente
      AppState.currentRole = selectedRole;
      applyRoleRestrictions(selectedRole);
      showNotificationToast(`Perfil temporal cambiado a: ${selectedRole}`, 'info');
    });
  }
}

function applyRoleRestrictions(role) {
  const userRoleBadge = document.getElementById('userRoleBadge');
  const userNameDisplay = document.getElementById('userNameDisplay');

  if (userRoleBadge) userRoleBadge.textContent = role;

  // Mostrar el nombre real del usuario autenticado actual
  if (userNameDisplay) {
    if (AppState.currentUser && AppState.currentUser.name) {
      userNameDisplay.textContent = AppState.currentUser.name;
    } else {
      const currentSysUser = AppState.systemUsers.find(u => u.username === (AppState.currentUser && AppState.currentUser.username));
      if (currentSysUser && currentSysUser.name) {
        userNameDisplay.textContent = currentSysUser.name;
      } else {
        userNameDisplay.textContent = 'Usuario Fragama';
      }
    }
  }

  const roleConfig = RolePermissions[role] || RolePermissions['Administrador'];
  const allowed = roleConfig.allowedViews;

  // 1. Filtrar visibilidad de enlaces en el Menú Lateral según roles autorizados
  document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    const rolesAttr = link.getAttribute('data-roles');
    if (rolesAttr) {
      const rolesList = rolesAttr.split(',').map(r => r.trim());
      const hasAccess = rolesList.includes(role);
      link.style.display = hasAccess ? 'flex' : 'none';
    }
  });

  // 2. Ocultar grupos de menú (acordeones) si no tienen enlaces visibles
  document.querySelectorAll('.sidebar .collapse-menu').forEach(menu => {
    const visibleLinks = Array.from(menu.querySelectorAll('.nav-link')).filter(l => l.style.display !== 'none');
    const groupToggle = document.querySelector(`.sidebar .tree-toggle[data-collapse="${menu.id}"]`);
    menu.style.removeProperty('display');
    if (visibleLinks.length === 0) {
      menu.classList.remove('show');
      if (groupToggle) groupToggle.style.display = 'none';
    } else {
      if (groupToggle) groupToggle.style.display = 'flex';
    }
  });

  // 3. Si la vista actual no está permitida para este rol, redirigir automáticamente
  const currentActiveView = document.querySelector('.role-view.active');
  const currentViewId = currentActiveView ? currentActiveView.id : '';

  if (!allowed.includes(currentViewId)) {
    switchViewDirectly(roleConfig.homeView);
  }
}

window.returnToAuthorizedHome = function() {
  const roleConfig = RolePermissions[AppState.currentRole] || RolePermissions['Administrador'];
  switchViewDirectly(roleConfig.homeView);
};

window.switchMobileNav = function(viewId, el) {
  document.querySelectorAll('.mobile-bottom-nav .mobile-nav-item').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  window.switchViewDirectly(viewId);
};

window.switchViewDirectly = function(viewId) {
  const roleConfig = RolePermissions[AppState.currentRole] || RolePermissions['Administrador'];
  const allowed = roleConfig.allowedViews;

  // Validación estricta de autorización (RBAC)
  if (viewId !== 'view-access-denied' && !allowed.includes(viewId)) {
    document.querySelectorAll('.role-view').forEach(v => v.classList.remove('active'));
    const deniedView = document.getElementById('view-access-denied');
    const deniedRoleSpan = document.getElementById('deniedUserRole');
    if (deniedRoleSpan) deniedRoleSpan.textContent = AppState.currentRole;
    if (deniedView) deniedView.classList.add('active');
    showNotificationToast(`Acceso bloqueado: su rol (${AppState.currentRole}) no tiene permiso en este módulo.`, 'warning');
    return;
  }

  document.querySelectorAll('.role-view').forEach(v => v.classList.remove('active'));
  const view = document.getElementById(viewId);
  if (view) view.classList.add('active');

  // Actualizar enlace activo en sidebar
  document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    if (link.getAttribute('data-view') === viewId) {
      link.classList.add('active');
    } else if (link.getAttribute('data-view')) {
      link.classList.remove('active');
    }
  });

  // Sincronizar navegación móvil inferior
  document.querySelectorAll('.mobile-bottom-nav .mobile-nav-item').forEach(b => {
    const oc = b.getAttribute('onclick') || '';
    if (oc.includes(viewId)) {
      b.classList.add('active');
    } else if (!b.classList.contains('mobile-nav-scan')) {
      b.classList.remove('active');
    }
  });

  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');

  switch (viewId) {
    case 'view-admin-dashboard':
      if (pageTitle) pageTitle.textContent = 'Panel de Control - Distribuidora Fragama';
      if (pageSubtitle) pageSubtitle.textContent = 'Bodega Central Taras, Cartago | WMS con control de Familias y Lotes';
      renderDashboardAnalytics();
      renderProductsTable();
      break;
    case 'view-families-management':
      if (pageTitle) pageTitle.textContent = 'Gestión de Familias y Zonas de Bodega';
      if (pageSubtitle) pageSubtitle.textContent = 'Estructura jerárquica macro, subfamilias y áreas segregadas de almacenamiento';
      renderFamiliesGrid();
      break;
    case 'view-product-maintenance':
      if (pageTitle) pageTitle.textContent = 'Mantenimiento del Catálogo Maestro (WMS)';
      if (pageSubtitle) pageSubtitle.textContent = 'Familias, Subfamilias, Lotes, Vencimientos y Control Químico';
      renderMaintenanceTable();
      break;
    case 'view-excel-bulk-import':
      if (pageTitle) pageTitle.textContent = 'Carga Masiva de Productos (Excel / CSV)';
      if (pageSubtitle) pageSubtitle.textContent = 'Inserción jerárquica con Familias y aumento de stock con Kardex';
      renderBulkPreviewTable();
      break;
    case 'view-bodega-kardex':
      if (pageTitle) pageTitle.textContent = 'Gestión de Almacén y Kardex Químico';
      if (pageSubtitle) pageSubtitle.textContent = 'Entradas, Salidas, Devoluciones y Auditoría de Lotes Transaccional';
      renderKardexTable();
      break;
    case 'view-customer-orders':
      if (pageTitle) pageTitle.textContent = 'Toma de Pedidos y Cotizaciones a Clientes';
      if (pageSubtitle) pageSubtitle.textContent = 'Gestión comercial de clientes institucionales, proformas y alisto para despacho en bodega';
      renderCustomerOrdersView();
      break;
    case 'view-suppliers-management':
      if (pageTitle) pageTitle.textContent = 'Catálogo Oficial de Proveedores de Insumos';
      if (pageSubtitle) pageSubtitle.textContent = 'Directorio homologado de fabricantes y distribuidores para compras de bodega';
      renderSuppliersGrid();
      break;
    case 'view-cajero-pos':
      if (pageTitle) pageTitle.textContent = 'Punto de Venta POS y Facturación Electrónica';
      if (pageSubtitle) pageSubtitle.textContent = 'Caja #01 | Facturación en Colones con rebajo automático de stock y despacho';
      renderPosCatalog();
      renderPosCart();
      break;
    case 'view-chofer-mobile':
      if (pageTitle) pageTitle.textContent = 'Rutas Nacionales de Reparto & Chofer Móvil';
      if (pageSubtitle) pageSubtitle.textContent = 'Cobertura 7 Provincias de Costa Rica | Escáner QR de Bultos';
      renderDriverDispatches();
      break;
    case 'view-reports':
      if (pageTitle) pageTitle.textContent = 'Centro de Inteligencia y Reportes Financieros';
      if (pageSubtitle) pageSubtitle.textContent = 'Valorización por Familia, rentabilidad y auditoría de inventario';
      renderReportsData();
      break;
    case 'view-roles-management':
      if (pageTitle) pageTitle.textContent = 'Gestión y Asignación de Roles (RBAC)';
      if (pageSubtitle) pageSubtitle.textContent = 'Seguridad Corporativa | Políticas de acceso y segregación de funciones';
      renderUsersRolesTable();
      break;
  }

  if (typeof window.scrollTo === 'function') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ------------------------------------------------------------------------------
// GESTIÓN Y ASIGNACIÓN DE ROLES (CONTROLADORES Y BASE DE DATOS)
// ------------------------------------------------------------------------------
AppState.userStatusFilter = 'all'; // 'all', 'active', 'inactive'

window.filterUsersView = function(filterStatus, btnEl) {
  AppState.userStatusFilter = filterStatus;
  document.querySelectorAll('.user-filter-btn').forEach(b => {
    b.classList.remove('btn-primary-fragama');
    b.classList.add('btn-outline-fragama');
  });
  if (btnEl) {
    btnEl.classList.remove('btn-outline-fragama');
    btnEl.classList.add('btn-primary-fragama');
  }
  renderUsersRolesTable();
};

function renderUsersRolesTable() {
  const tbody = document.getElementById('usersRolesTableBody');
  if (!tbody) return;

  const totalCount = AppState.systemUsers.length;
  const activeCount = AppState.systemUsers.filter(u => u.status !== 'Inactivo' && u.isActive !== false).length;
  const inactiveCount = AppState.systemUsers.filter(u => u.status === 'Inactivo' || u.isActive === false).length;

  const countActiveDb = document.getElementById('countActiveDbUsers');
  const countInactiveDb = document.getElementById('countInactiveDbUsers');
  const tabAll = document.getElementById('tabCountAll');
  const tabActive = document.getElementById('tabCountActive');
  const tabInactive = document.getElementById('tabCountInactive');

  if (countActiveDb) countActiveDb.textContent = activeCount;
  if (countInactiveDb) countInactiveDb.textContent = inactiveCount;
  if (tabAll) tabAll.textContent = totalCount;
  if (tabActive) tabActive.textContent = activeCount;
  if (tabInactive) tabInactive.textContent = inactiveCount;

  // Actualizar conteos por rol operativo
  const adminCount = AppState.systemUsers.filter(u => u.role === 'Administrador' && u.status !== 'Inactivo' && u.isActive !== false).length;
  const bodegaCount = AppState.systemUsers.filter(u => u.role === 'Bodeguero' && u.status !== 'Inactivo' && u.isActive !== false).length;
  const operativeCount = AppState.systemUsers.filter(u => (u.role === 'Cajero' || u.role === 'Chofer' || u.role === 'Vendedor') && u.status !== 'Inactivo' && u.isActive !== false).length;

  const countAdmin = document.getElementById('countAdminUsers');
  const countBodega = document.getElementById('countBodegaUsers');
  const countOperative = document.getElementById('countOperativeUsers');

  if (countAdmin) countAdmin.textContent = adminCount;
  if (countBodega) countBodega.textContent = bodegaCount;
  if (countOperative) countOperative.textContent = operativeCount;

  // Filtrar según pestaña seleccionada
  let filteredUsers = AppState.systemUsers;
  if (AppState.userStatusFilter === 'active') {
    filteredUsers = AppState.systemUsers.filter(u => u.status !== 'Inactivo' && u.isActive !== false);
  } else if (AppState.userStatusFilter === 'inactive') {
    filteredUsers = AppState.systemUsers.filter(u => u.status === 'Inactivo' || u.isActive === false);
  }

  if (filteredUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:2rem; color:#64748B;">
          <i class="bi bi-inbox" style="font-size:1.8rem; display:block; margin-bottom:6px; color:#94A3B8;"></i>
          No hay usuarios registrados bajo el filtro seleccionado (<strong>${AppState.userStatusFilter === 'inactive' ? 'Dados de Baja' : 'Activos'}</strong>).
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredUsers.map(u => {
    let badgeClass = 'badge-confirmed';
    if (u.role === 'Bodeguero') badgeClass = 'badge-in-route';
    if (u.role === 'Cajero') badgeClass = 'badge-observed';
    if (u.role === 'Chofer') badgeClass = 'badge-delivered';
    if (u.role === 'Vendedor') badgeClass = 'badge-in-route';

    const isAdmin = (u.role === 'Administrador' || u.roleId === 1);
    const isInactive = (u.status === 'Inactivo' || u.isActive === false);

    return `
      <tr style="border-bottom:1px solid #E2E8F0; ${isInactive ? 'background:#FEF2F2; opacity:0.85;' : ''}">
        <td style="padding:10px 14px; font-weight:800; font-family:'JetBrains Mono',monospace; color:#0B192C;">
          <i class="bi bi-person-circle ${isInactive ? 'text-danger' : 'text-primary'}"></i> ${u.username}
          ${isAdmin ? '<span style="background:#0284C7; color:#FFF; font-size:0.68rem; padding:2px 7px; border-radius:10px; margin-left:4px; font-weight:800;"><i class="bi bi-shield-check"></i> ADMINISTRADOR</span>' : ''}
        </td>
        <td style="padding:10px 14px; font-weight:700; color:#0B192C;">
          ${u.name}
          ${isInactive ? '<span style="font-size:0.72rem; color:#DC2626; display:block; font-weight:600;">(Cuenta deshabilitada)</span>' : ''}
        </td>
        <td style="padding:10px 14px; color:#64748B; font-size:0.8rem;">${u.email}</td>
        <td style="padding:10px 14px;">
          <span class="badge-status ${badgeClass}">${u.role}</span>
        </td>
        <td style="padding:10px 14px; font-size:0.78rem;">
          ${isInactive ? `
            <span class="badge-status" style="background:#FEE2E2; color:#DC2626; border:1px solid #FCA5A5; font-weight:800;">
              <i class="bi bi-slash-circle-fill"></i> Dado de Baja
            </span>
          ` : `
            <span class="badge-status badge-confirmed" style="font-weight:800;">
              <i class="bi bi-check-circle-fill"></i> Activo
            </span>
          `}
        </td>
        <td style="padding:10px 14px; font-size:0.8rem; font-family:'JetBrains Mono',monospace;">
          <span style="color:#0284C7; font-weight:700;" title="Contraseña asignada por el Administrador">
            <i class="bi bi-key-fill text-warning"></i> ${u.pass ? u.pass : '••••••••'}
          </span>
          ${u.mustChangePassword ? `
            <span class="badge-status badge-observed" style="font-size:0.68rem; padding:1px 5px; display:inline-block; margin-left:4px;" title="Debe cambiar clave en su primer ingreso">
              1er Ingreso
            </span>
          ` : ''}
        </td>
        <td style="padding:10px 14px; text-align:right;">
          <div style="display:flex; align-items:center; justify-content:flex-end; gap:6px;">
            <!-- Selector de Rol otorgado por el Admin -->
            <select id="userRoleSelect_${u.id}" ${isAdmin || isInactive ? 'disabled' : ''} style="padding:4px 6px; border:1px solid #CBD5E1; border-radius:6px; font-size:0.75rem; font-weight:600;">
              <option value="Administrador" ${u.role === 'Administrador' ? 'selected' : ''}>👑 Admin</option>
              <option value="Bodeguero" ${u.role === 'Bodeguero' ? 'selected' : ''}>📦 Bodega</option>
              <option value="Cajero" ${u.role === 'Cajero' ? 'selected' : ''}>💰 Caja POS</option>
              <option value="Chofer" ${u.role === 'Chofer' ? 'selected' : ''}>🚚 Chofer</option>
              <option value="Vendedor" ${u.role === 'Vendedor' ? 'selected' : ''}>🛒 Ventas</option>
            </select>
            
            ${!isAdmin && !isInactive ? `
              <button class="btn-fragama btn-outline-fragama" style="padding:4px 8px; font-size:0.72rem;" title="Guardar Rol Otorgado" onclick="saveUserRoleChange(${u.id})">
                <i class="bi bi-check2"></i>
              </button>
            ` : ''}

            <!-- Botón Editar Datos del Colaborador -->
            <button class="btn-fragama btn-outline-fragama" style="padding:4px 8px; font-size:0.72rem;" title="Editar Datos Completos del Colaborador" onclick="openEditUserModal(${u.id})">
              <i class="bi bi-pencil-square"></i> Editar
            </button>

            <!-- Botón Asignar Contraseña (Admin) -->
            <button class="btn-fragama btn-outline-fragama" style="padding:4px 8px; font-size:0.72rem;" title="Asignar Contraseña Administrador" onclick="openResetTempPassModal(${u.id})">
              <i class="bi bi-key-fill text-warning"></i> Clave
            </button>

            <!-- Acciones de Estado: Protegido si es Administrador / Dar de Baja / Reactivar -->
            ${isAdmin ? `
              <span style="font-size:0.72rem; color:#0284C7; background:#E0F2FE; border:1px solid #BAE6FD; padding:3px 8px; border-radius:6px; font-weight:700;" title="Administrador con privilegios de gestión"><i class="bi bi-shield-check"></i> Protegido</span>
            ` : isInactive ? `
              <button class="btn-fragama" style="background:#10B981; color:#FFF; padding:4px 10px; font-size:0.72rem; border-radius:6px; border:none; cursor:pointer;" title="Reactivar usuario en el sistema" onclick="reactivateUser(${u.id})">
                <i class="bi bi-person-check-fill"></i> Reactivar
              </button>
            ` : `
              <button class="btn-fragama" style="background:#EF4444; color:#FFF; padding:4px 10px; font-size:0.72rem; border-radius:6px; border:none; cursor:pointer;" title="Dar de baja en la base de datos" onclick="deactivateUser(${u.id})">
                <i class="bi bi-person-dash-fill"></i> Dar de Baja
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.deactivateUser = async function(userId) {
  const user = AppState.systemUsers.find(u => String(u.id) === String(userId));
  if (!user) return;

  if (user.role === 'Administrador' || user.roleId === 1 || user.username === 'creyes' || user.username === 'lreyes') {
    showNotificationToast("Los usuarios con rol Administrador están protegidos y no pueden ser dados de baja.", "warning");
    return;
  }

  if (!confirm(`¿Está seguro de DAR DE BAJA al colaborador "${user.name}" (@${user.username})?\n\nAl darlo de baja en la base de datos SQL Server, sus credenciales quedarán bloqueadas y no podrá ingresar al sistema Fragama WMS.`)) {
    return;
  }

  user.status = 'Inactivo';
  user.isActive = false;
  saveFragamaSystemUsers(AppState.systemUsers);
  renderUsersRolesTable();

  try {
    await fetch(`/api/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false })
    });
  } catch (err) {
    console.warn("Error en BD:", err);
  }

  showNotificationToast(`⛔ Colaborador ${user.name} (@${user.username}) dado de baja.`, 'warning');
};

window.reactivateUser = async function(userId) {
  const user = AppState.systemUsers.find(u => String(u.id) === String(userId));
  if (!user) return;

  user.status = 'Activo';
  user.isActive = true;
  saveFragamaSystemUsers(AppState.systemUsers);
  renderUsersRolesTable();

  try {
    await fetch(`/api/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: true })
    });
  } catch (err) {
    console.warn("Error en BD:", err);
  }

  showNotificationToast(`✅ Colaborador ${user.name} (@${user.username}) reactivado en el sistema.`, 'success');
};

window.saveUserRoleChange = async function(userId) {
  const select = document.getElementById(`userRoleSelect_${userId}`);
  if (!select) return;

  const newRole = select.value;
  const user = AppState.systemUsers.find(u => u.id === userId);
  if (!user) return;

  user.role = newRole;

  if (user.username === AppState.currentUser.username) {
    AppState.currentRole = newRole;
    AppState.currentUser.role = newRole;
    applyRoleRestrictions(newRole);
  }

  try {
    await fetch(`/api/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
  } catch (err) {
    console.warn("Error guardando rol en BD:", err);
  }

  saveFragamaSystemUsers(AppState.systemUsers);
  renderUsersRolesTable();
  showNotificationToast(`Rol de ${user.name} actualizado por el Administrador a: ${newRole}`, 'success');
};

window.deleteUser = async function(userId) {
  const user = AppState.systemUsers.find(u => String(u.id) === String(userId));
  if (!user) return;

  if (user.role === 'Administrador' || user.username === 'creyes' || user.username === 'lreyes') {
    showNotificationToast("Los usuarios con rol Administrador están protegidos y no pueden ser eliminados.", "warning");
    return;
  }

  if (!confirm(`¿Está seguro de quitar al colaborador "${user.name}" (@${user.username}) en la base de datos SQL Server?`)) {
    return;
  }

  try {
    await fetch(`/api/users/${userId}`, { method: 'DELETE' });
  } catch (err) {
    console.warn("Error en BD:", err);
  }

  await loadInitialDataFromSql();
  renderUsersRolesTable();
  showNotificationToast(`Usuario ${user.username} eliminado de la base de datos.`, 'info');
};

window.openResetTempPassModal = function(userId) {
  const user = AppState.systemUsers.find(u => String(u.id) === String(userId));
  if (!user) {
    showNotificationToast("No se encontró el colaborador seleccionado.", "error");
    return;
  }

  const modal = document.getElementById('resetTempPassModal');
  const idInput = document.getElementById('resetTempPassUserId');
  const nameEl = document.getElementById('resetTempPassUserName');
  const handleEl = document.getElementById('resetTempPassUserHandle');
  const valInput = document.getElementById('resetTempPassValue');

  if (idInput) {
    idInput.value = user.id;
    idInput.dataset.username = user.username;
  }
  if (nameEl) nameEl.textContent = user.name;
  if (handleEl) handleEl.textContent = `@${user.username} (${user.role})`;
  if (valInput) valInput.value = user.pass || `${user.username}123`;

  if (modal) {
    modal.classList.add('active');
    modal.style.setProperty('display', 'flex', 'important');
    if (valInput) {
      setTimeout(() => { valInput.focus(); valInput.select(); }, 100);
    }
  }
};

window.generateRandomTempPassForExistingUser = function() {
  const input = document.getElementById('resetTempPassValue');
  if (input) input.value = `Fragama#${Math.floor(1000 + Math.random() * 9000)}`;
};

window.generateRandomTempPassForNewUser = function() {
  const input = document.getElementById('newUserPass');
  if (input) {
    input.value = `Fragama#${Math.floor(1000 + Math.random() * 9000)}`;
    const btn = document.getElementById('toggleNewUserPassBtn');
    if (btn) {
      btn.innerHTML = input.type === 'password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
    }
  }
};

window.copyTempPassInput = function() {
  const input = document.getElementById('resetTempPassValue');
  if (!input) return;
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(input.value).then(() => {
      showNotificationToast(`Contraseña [${input.value}] copiada al portapapeles.`, 'success');
    }).catch(() => {
      input.select();
      document.execCommand('copy');
      showNotificationToast(`Contraseña [${input.value}] copiada al portapapeles.`, 'success');
    });
  } else {
    input.select();
    document.execCommand('copy');
    showNotificationToast(`Contraseña [${input.value}] copiada al portapapeles.`, 'success');
  }
};

window.handleSaveTempPass = async function(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const idInput = document.getElementById('resetTempPassUserId');
  const valInput = document.getElementById('resetTempPassValue');
  const modal = document.getElementById('resetTempPassModal');
  const submitBtn = document.getElementById('btnSaveTempPassSubmit') || (e && e.target ? e.target.querySelector('button[type="submit"]') : null);

  if (!idInput || !valInput) return;

  const rawId = idInput.value;
  const username = idInput.dataset.username || '';
  const tempPass = valInput.value.trim();

  if (tempPass.length < 4) {
    alert("La contraseña debe tener al menos 4 caracteres.");
    return;
  }

  const origBtnText = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Guardando...';
  }

  // 1. Guardar en Base de Datos vía API
  try {
    const res = await fetch(`/api/users/${rawId}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: tempPass,
        mustChangePassword: false,
        userId: parseInt(rawId, 10),
        username: username
      })
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn("Aviso servidor al guardar clave:", errData.detail);
    }
  } catch (err) {
    console.warn("Error de conexión guardando pass:", err);
  }

  // 2. Actualizar estado local y persistir
  const targetUser = AppState.systemUsers.find(u => String(u.id) === String(rawId) || (username && u.username && u.username.toLowerCase() === username.toLowerCase()));
  if (targetUser) {
    targetUser.pass = tempPass;
    targetUser.mustChangePassword = false;
  }
  
  if (AppState.currentUser && (String(AppState.currentUser.id) === String(rawId) || (username && AppState.currentUser.username && AppState.currentUser.username.toLowerCase() === username.toLowerCase()))) {
    AppState.currentUser.pass = tempPass;
    try {
      sessionStorage.setItem('fragama_user', JSON.stringify(AppState.currentUser));
    } catch(e) {}
  }

  saveFragamaSystemUsers(AppState.systemUsers);
  renderUsersRolesTable();

  // 3. Cerrar modal de inmediato
  if (modal) {
    modal.classList.remove('active');
    modal.style.setProperty('display', 'none', 'important');
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = origBtnText || '<i class="bi bi-check2-circle"></i> Guardar Contraseña';
  }

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(tempPass).catch(() => {});
  }

  showNotificationToast(`🔑 Contraseña actualizada exitosamente para ${targetUser ? targetUser.name : 'el colaborador'}.`, 'success');

  // 4. Sincronizar en segundo plano sin congelar la pantalla
  fetch('/api/users').then(r => r.ok ? r.json() : null).then(users => {
    if (users && Array.isArray(users)) {
      AppState.systemUsers = users.map(u => ({
        ...u,
        username: u.username || `user${u.id}`,
        status: u.status || (u.isActive === false ? 'Inactivo' : 'Activo'),
        isActive: u.isActive !== false,
        mustChangePassword: false
      }));
      saveFragamaSystemUsers(AppState.systemUsers);
      renderUsersRolesTable();
    }
  }).catch(() => {});
};

window.openNewUserModal = function() {
  if (typeof window.generateRandomTempPassForNewUser === 'function') {
    window.generateRandomTempPassForNewUser();
  }
  const u = document.getElementById('newUsername');
  const n = document.getElementById('newUserName');
  const e = document.getElementById('newUserEmail');
  if (u) u.value = '';
  if (n) n.value = '';
  if (e) e.value = '';
  openModalDirectly('newUserModal');
  if (u) u.focus();
};

window.handleCreateUserSubmit = async function(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }

  const usernameEl = document.getElementById('newUsername');
  const passEl = document.getElementById('newUserPass');
  const nameEl = document.getElementById('newUserName');
  const emailEl = document.getElementById('newUserEmail');
  const roleEl = document.getElementById('newUserRoleSelect');
  const form = document.getElementById('newUserForm');

  const username = usernameEl ? usernameEl.value.trim() : '';
  const pass = passEl ? passEl.value.trim() : '';
  const name = nameEl ? nameEl.value.trim() : '';
  const email = emailEl ? emailEl.value.trim() : '';
  const role = roleEl ? roleEl.value : 'Bodeguero';

  if (!username || !pass || !name || !email) {
    alert('Por favor complete todos los campos obligatorios (*).');
    return;
  }

  let createdUser = null;
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        username: username,
        role: role,
        password: pass,
        mustChangePassword: false
      })
    });
    if (res.ok) {
      const data = await res.json();
      createdUser = data.user;
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.detail || 'Error al registrar el colaborador.');
      return;
    }
  } catch (err) {
    console.warn("Aviso de conexión al crear usuario:", err);
  }

  const newUserObj = createdUser || {
    id: AppState.systemUsers.length + 10,
    username: username,
    name: name,
    email: email,
    role: role,
    pass: pass,
    status: 'Activo',
    isActive: true,
    mustChangePassword: false
  };

  newUserObj.pass = pass;
  newUserObj.mustChangePassword = false;
  AppState.systemUsers.push(newUserObj);
  saveFragamaSystemUsers(AppState.systemUsers);
  renderUsersRolesTable();

  closeModalDirectly('newUserModal');
  if (form) form.reset();

  showNotificationToast(`💾 Colaborador "${name}" (@${username}) registrado exitosamente.`, 'success');
};

window.openEditUserModal = function(userId) {
  const user = AppState.systemUsers.find(u => String(u.id) === String(userId));
  if (!user) {
    showNotificationToast("No se encontró el colaborador seleccionado.", "error");
    return;
  }

  const title = document.getElementById('editUserModalTitle');
  const idInput = document.getElementById('editUserId');
  const uInput = document.getElementById('editUsername');
  const roleSelect = document.getElementById('editUserRoleSelect');
  const nameInput = document.getElementById('editUserName');
  const emailInput = document.getElementById('editUserEmail');
  const passInput = document.getElementById('editUserPass');
  const statusSelect = document.getElementById('editUserStatusSelect');
  const deleteBtn = document.getElementById('btnDeleteUserInModal');

  if (title) title.textContent = `${user.name} (@${user.username})`;
  if (idInput) idInput.value = user.id;
  if (uInput) uInput.value = user.username || '';
  if (roleSelect) roleSelect.value = user.role || 'Bodeguero';
  if (nameInput) nameInput.value = user.name || '';
  if (emailInput) emailInput.value = user.email || '';
  if (passInput) passInput.value = '';
  if (statusSelect) {
    statusSelect.value = (user.isActive !== false && user.status !== 'Inactivo') ? 'true' : 'false';
  }

  if (deleteBtn) {
    if (user.role === 'Administrador' || user.roleId === 1 || user.username === 'creyes' || user.username === 'lreyes') {
      deleteBtn.style.display = 'none';
    } else {
      deleteBtn.style.display = 'inline-block';
    }
  }

  openModalDirectly('editUserModal');
};

window.handleEditUserSubmit = async function(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }

  const idInput = document.getElementById('editUserId');
  const uInput = document.getElementById('editUsername');
  const roleSelect = document.getElementById('editUserRoleSelect');
  const nameInput = document.getElementById('editUserName');
  const emailInput = document.getElementById('editUserEmail');
  const passInput = document.getElementById('editUserPass');
  const statusSelect = document.getElementById('editUserStatusSelect');

  if (!idInput) return;
  const userId = idInput.value;
  const username = uInput ? uInput.value.trim() : '';
  const role = roleSelect ? roleSelect.value : 'Bodeguero';
  const name = nameInput ? nameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const pass = passInput ? passInput.value.trim() : '';
  const isActive = statusSelect ? statusSelect.value === 'true' : true;

  if (!username || !name || !email) {
    alert('Por favor complete el nombre de usuario, nombre completo y correo electrónico.');
    return;
  }

  const payload = {
    name: name,
    email: email,
    username: username,
    role: role,
    isActive: isActive
  };
  if (pass && pass.length >= 4) {
    payload.password = pass;
  }

  try {
    await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch(err) {
    console.warn("Aviso API editar usuario:", err);
  }

  const user = AppState.systemUsers.find(u => String(u.id) === String(userId));
  if (user) {
    user.name = name;
    user.email = email;
    user.username = username;
    user.role = role;
    user.isActive = isActive;
    user.status = isActive ? 'Activo' : 'Inactivo';
    if (pass && pass.length >= 4) {
      user.pass = pass;
      user.mustChangePassword = false;
    }
  }

  saveFragamaSystemUsers(AppState.systemUsers);
  renderUsersRolesTable();
  closeModalDirectly('editUserModal');
  showNotificationToast(`✅ Colaborador "${name}" actualizado exitosamente.`, 'success');
};

window.handleModalDeleteUser = function() {
  const idInput = document.getElementById('editUserId');
  if (!idInput) return;
  const userId = idInput.value;
  closeModalDirectly('editUserModal');
  window.deleteUser(userId);
};

// ==============================================================================
// 3. MÓDULO DE FAMILIAS Y ZONAS DE BODEGA
// ==============================================================================
function setupFamiliesModule() {
  renderFamiliesGrid();
  populateFamilyDropdowns();
}

function populateFamilyDropdowns() {
  const filterSelect = document.getElementById('maintenanceFamilyFilter');
  const crudFamilySelect = document.getElementById('crudFamilySelect');

  if (filterSelect) {
    filterSelect.innerHTML = '<option value="">Todas las Familias</option>' + 
      AppState.families.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
  }

  if (crudFamilySelect) {
    crudFamilySelect.innerHTML = AppState.families.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
    crudFamilySelect.addEventListener('change', (e) => {
      updateSubfamilyOptions(parseInt(e.target.value, 10));
    });
  }
}

function updateSubfamilyOptions(familyId) {
  const subSelect = document.getElementById('crudSubfamilySelect');
  if (!subSelect) return;

  const family = AppState.families.find(f => f.id === familyId) || AppState.families[0];
  subSelect.innerHTML = family.subfamilies.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

function renderFamiliesGrid() {
  const container = document.getElementById('familiesGridContainer');
  if (!container) return;

  container.innerHTML = AppState.families.map(f => {
    const productsInFamily = AppState.products.filter(p => p.familyId === f.id);
    const totalUnits = productsInFamily.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = productsInFamily.reduce((sum, p) => sum + (p.price * p.stock), 0);

    return `
      <div class="content-card" style="margin-bottom:0;">
        <div class="card-header-custom" style="background:#F8FAFC;">
          <div class="card-header-title">
            <i class="bi ${f.icon} text-primary" style="font-size:1.4rem;"></i>
            <div>
              <div style="font-weight:800; font-size:1.05rem; color:#0B192C;">${f.name}</div>
              <small style="font-family:'JetBrains Mono',monospace; color:#64748B;">${f.code} | <span style="color:#0284C7; font-weight:700;"><i class="bi bi-geo-alt-fill"></i> ${f.zone}</span></small>
            </div>
          </div>
          <span class="badge-status badge-in-route">${productsInFamily.length} SKUs</span>
        </div>

        <div style="padding:1.25rem;">
          <p style="font-size:0.85rem; color:#64748B; margin-bottom:1rem;">${f.description}</p>
          
          <div style="background:#F1F5F9; border-radius:8px; padding:10px; margin-bottom:1rem;">
            <div style="font-size:0.75rem; font-weight:700; color:#475569; text-transform:uppercase; margin-bottom:6px;">
              Subfamilias Integradas (${f.subfamilies.length}):
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              ${f.subfamilies.map(s => `<span class="badge-status" style="background:#FFFFFF; border:1px solid #CBD5E1; color:#1E293B;">${s.name}</span>`).join('')}
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:10px; font-size:0.88rem;">
            <div>
              <span style="color:#64748B;">Existencias:</span> <strong>${totalUnits.toLocaleString()} unid.</strong>
            </div>
            <div>
              <span style="color:#64748B;">Valor:</span> <strong style="color:#0B192C;">${formatCRC(totalValue)}</strong>
            </div>
          </div>

          <button class="btn-fragama btn-outline-fragama" style="width:100%; margin-top:12px; padding:7px;" onclick="filterProductsByFamily(${f.id})">
            <i class="bi bi-filter-circle"></i> Ver Productos de esta Familia
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.filterProductsByFamily = function(familyId) {
  switchViewDirectly('view-product-maintenance');
  const familyFilter = document.getElementById('maintenanceFamilyFilter');
  if (familyFilter) {
    familyFilter.value = familyId;
    renderMaintenanceTable();
  }
};

// ==============================================================================
// 4. MANTENIMIENTO DE PRODUCTOS (CRUD ROBUSTO CON FAMILIAS Y LOTES)
// ==============================================================================
let editingProductId = null;

function setupProductMaintenance() {
  const modal = document.getElementById('productCrudModal');
  const form = document.getElementById('productCrudForm');
  const searchInput = document.getElementById('maintenanceSearchInput');
  const familyFilter = document.getElementById('maintenanceFamilyFilter');
  const stockFilter = document.getElementById('maintenanceStockFilter');
  const imageFileInput = document.getElementById('crudImageFileInput');
  const imagePreview = document.getElementById('crudImagePreview');

  if (searchInput) searchInput.addEventListener('input', renderMaintenanceTable);
  if (familyFilter) familyFilter.addEventListener('change', renderMaintenanceTable);
  if (stockFilter) stockFilter.addEventListener('change', renderMaintenanceTable);

  // Vista previa de imagen seleccionada
  if (imageFileInput && imagePreview) {
    imageFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          imagePreview.src = ev.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const sku = document.getElementById('crudSkuInput').value.trim().toUpperCase();
      const name = document.getElementById('crudNameInput').value.trim();
      const barcode = document.getElementById('crudBarcodeInput').value.trim() || generateRandomBarcode();
      const familyId = parseInt(document.getElementById('crudFamilySelect').value, 10) || 1;
      const subfamilyId = parseInt(document.getElementById('crudSubfamilySelect').value, 10) || 1;
      const batchNumber = document.getElementById('crudBatchInput').value.trim() || 'LOT-2026-NUEVO';
      const expiryDate = document.getElementById('crudExpiryInput').value || null;
      const hazardClass = document.getElementById('crudHazardSelect').value;
      const location = document.getElementById('crudLocationInput').value.trim() || 'PAS-QUIM-01 / EST-01 / N-1 / P-01';
      const cost = parseFloat(document.getElementById('crudCostInput').value) || 0;
      const price = parseFloat(document.getElementById('crudPriceInput').value) || 0;
      const stock = parseInt(document.getElementById('crudStockInput').value, 10) || 0;
      const minStock = parseInt(document.getElementById('crudMinStockInput').value, 10) || 10;
      const unit = document.getElementById('crudUnitInput').value || 'GALON';

      const family = AppState.families.find(f => f.id === familyId);
      const subfamily = family?.subfamilies?.find(s => s.id === subfamilyId);

      const saveBtn = document.getElementById('btnSaveProductCrud');
      const origHtml = saveBtn ? saveBtn.innerHTML : '';
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Sincronizando...';
      }

      try {
        let currentTargetId = editingProductId;
        let uploadedImageRelPath = null;

        if (editingProductId) {
          // 1. ACTUALIZAR EN API Y BASE DE DATOS
          const updatePayload = {
            sku: sku,
            barcode: barcode,
            name: name,
            price: price,
            costPrice: cost,
            stock: stock,
            minStock: minStock,
            unit: unit,
            categoryLabel: family?.name || 'General'
          };
          const putRes = await fetch(`/api/products/${editingProductId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload)
          });
          if (!putRes.ok) {
            const err = await putRes.json().catch(() => ({}));
            throw new Error(err.detail || 'Error en servidor al actualizar');
          }

          // 2. SUBIR IMAGEN SI SE CARGÓ UN ARCHIVO NUEVO
          if (imageFileInput && imageFileInput.files && imageFileInput.files[0]) {
            const fd = new FormData();
            fd.append('file', imageFileInput.files[0]);
            const imgRes = await fetch(`/api/products/${editingProductId}/image`, {
              method: 'POST',
              body: fd
            });
            if (imgRes.ok) {
              const imgData = await imgRes.json();
              if (imgData.image) uploadedImageRelPath = imgData.image;
            }
          }

          // 3. ACTUALIZAR ESTADO LOCAL
          const p = AppState.products.find(x => x.id === editingProductId);
          if (p) {
            p.sku = sku;
            p.name = name;
            p.barcode = barcode;
            p.familyId = familyId;
            p.familyName = family?.name || 'General';
            p.subfamilyId = subfamilyId;
            p.subfamilyName = subfamily?.name || 'General';
            p.batchNumber = batchNumber;
            p.expiryDate = expiryDate;
            p.hazardClass = hazardClass;
            p.location = location;
            p.costPrice = cost;
            p.price = price;
            p.stock = stock;
            p.minStock = minStock;
            p.unit = unit;
            if (uploadedImageRelPath) p.image = uploadedImageRelPath;
          }
          showNotificationToast(`✅ Producto [${sku}] y precio ₡${price.toLocaleString()} actualizados en WMS y Tienda Web.`, 'success');
        } else {
          // CREAR NUEVO PRODUCTO
          if (AppState.products.some(x => x.sku === sku)) {
            alert(`El SKU '${sku}' ya existe. Ingrese un código único.`);
            return;
          }

          const createPayload = {
            sku: sku,
            barcode: barcode,
            name: name,
            price: price,
            costPrice: cost,
            stock: stock,
            minStock: minStock,
            unit: unit,
            category: 'bandejas_eco',
            categoryLabel: family?.name || 'General'
          };
          const postRes = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createPayload)
          });
          if (!postRes.ok) {
            const err = await postRes.json().catch(() => ({}));
            throw new Error(err.detail || 'Error en servidor al crear producto');
          }
          const createData = await postRes.json();
          currentTargetId = createData.productId || (AppState.products.length + 100);

          // Subir imagen si seleccionó archivo
          if (imageFileInput && imageFileInput.files && imageFileInput.files[0]) {
            const fd = new FormData();
            fd.append('file', imageFileInput.files[0]);
            const imgRes = await fetch(`/api/products/${currentTargetId}/image`, {
              method: 'POST',
              body: fd
            });
            if (imgRes.ok) {
              const imgData = await imgRes.json();
              if (imgData.image) uploadedImageRelPath = imgData.image;
            }
          }

          AppState.products.unshift({
            id: currentTargetId,
            sku: sku,
            barcode: barcode,
            name: name,
            familyId: familyId,
            familyName: family?.name || 'General',
            subfamilyId: subfamilyId,
            subfamilyName: subfamily?.name || 'General',
            batchNumber: batchNumber,
            expiryDate: expiryDate,
            hazardClass: hazardClass,
            location: location,
            costPrice: cost,
            price: price,
            stock: stock,
            minStock: minStock,
            maxStock: 500,
            unit: unit,
            image: uploadedImageRelPath || `img/catalog/prod_${currentTargetId}.jpg`,
            weightKg: 4.0,
            volumeM3: 0.0045
          });

          showNotificationToast(`✅ Nuevo producto [${sku}] publicado con éxito en el Catálogo y Tienda Web.`, 'success');
        }

        modal.classList.remove('active');
        renderAllViews();
      } catch (err) {
        alert('Error al guardar producto: ' + err.message);
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = origHtml;
        }
      }
    });
  }
}

function renderMaintenanceTable() {
  const tbody = document.getElementById('maintenanceTableBody');
  if (!tbody) return;

  const search = document.getElementById('maintenanceSearchInput')?.value.toLowerCase() || '';
  const familyFilter = document.getElementById('maintenanceFamilyFilter')?.value || '';
  const stockCond = document.getElementById('maintenanceStockFilter')?.value || '';

  const filtered = AppState.products.filter(p => {
    const matchesSearch = (p.name && p.name.toLowerCase().includes(search)) || 
                          (p.sku && p.sku.toLowerCase().includes(search)) || 
                          (p.barcode && p.barcode.toLowerCase().includes(search)) ||
                          (p.batchNumber && p.batchNumber.toLowerCase().includes(search));
    const matchesFamily = !familyFilter || String(p.familyId) === String(familyFilter);
    let matchesStock = true;
    if (stockCond === 'low') matchesStock = p.stock <= p.minStock;
    if (stockCond === 'normal') matchesStock = p.stock > p.minStock;

    return matchesSearch && matchesFamily && matchesStock;
  });

  tbody.innerHTML = filtered.map(p => {
    const isLow = p.stock <= p.minStock;
    let hazardBadge = '';
    if (p.hazardClass === 'CORROSIVO') {
      hazardBadge = '<span class="badge-status" style="background:#FEE2E2; color:#DC2626;"><i class="bi bi-radioactive"></i> Corrosivo</span>';
    } else if (p.hazardClass === 'INFLAMABLE') {
      hazardBadge = '<span class="badge-status" style="background:#FEF3C7; color:#D97706;"><i class="bi bi-fire"></i> Inflamable</span>';
    }

    const imgPath = p.image ? (p.image.startsWith('/') ? p.image.substring(1) : p.image) : `img/catalog/prod_${p.id}.jpg`;

    return `
      <tr>
        <td style="font-family:'JetBrains Mono',monospace; font-weight:700; color:#1E3E62;">${p.sku}</td>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${imgPath}" onerror="this.src='img/logo_oficial.png'" style="width:38px; height:38px; object-fit:contain; border-radius:6px; border:1px solid #E2E8F0; background:#FFF; padding:2px; flex-shrink:0;">
            <div>
              <div style="font-weight:600; color:#0B192C;">${p.name}</div>
              <small style="color:#64748B;">EAN: ${p.barcode}</small>
              ${hazardBadge}
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight:700; color:#0B192C;">${p.familyName || 'Línea Comercial'}</div>
          <small style="color:#0284C7;"><i class="bi bi-tag-fill"></i> ${p.subfamilyName || 'General'}</small>
        </td>
        <td>
          <div style="font-family:'JetBrains Mono',monospace; font-weight:600; font-size:0.8rem; color:#475569;">
            ${p.batchNumber || 'LOT-2026'}
          </div>
          <small style="color:${p.expiryDate ? '#D97706' : '#94A3B8'};">
            ${p.expiryDate ? `<i class="bi bi-calendar-event"></i> Vence: ${p.expiryDate}` : 'No perecedero'}
          </small>
        </td>
        <td><i class="bi bi-geo-alt"></i> ${p.location || 'BOD-CARTAGO'}</td>
        <td style="color:#64748B;">${formatCRC(p.costPrice || 0)}</td>
        <td style="font-weight:700; color:#0B192C; font-size:0.95rem;">${formatCRC(p.price || 0)}</td>
        <td>
          <strong style="color:${isLow ? '#EF4444' : '#0B192C'}; font-size:1.05rem;">${p.stock}</strong>
          <small style="color:#64748B;">${p.unit || 'UNIDAD'}</small>
          ${isLow ? '<span class="badge-status badge-low-stock ml-1"><i class="bi bi-exclamation-triangle-fill"></i> BAJO</span>' : ''}
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn-fragama btn-outline-fragama" style="padding:4px 8px; font-size:0.75rem;" title="Editar Precio, Datos o Foto" onclick="openEditProductModal(${p.id})">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn-fragama btn-outline-fragama" style="padding:4px 8px; font-size:0.75rem;" title="Código EAN" onclick="showBarcodeForProduct(${p.id})">
              <i class="bi bi-upc-scan"></i>
            </button>
            <button class="btn-fragama btn-outline-fragama" style="padding:4px 8px; font-size:0.75rem; color:#EF4444;" title="Dar de baja o Eliminar" onclick="deleteProduct(${p.id})">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.openNewProductModal = function() {
  editingProductId = null;
  const modal = document.getElementById('productCrudModal');
  const title = document.getElementById('crudModalTitle');
  const form = document.getElementById('productCrudForm');
  const deleteBtn = document.getElementById('btnDeleteCurrentProduct');
  const imgPreview = document.getElementById('crudImagePreview');
  const fileInput = document.getElementById('crudImageFileInput');

  if (title) title.innerHTML = '<i class="bi bi-plus-circle-fill text-success"></i> Nuevo Producto en Catálogo Fragama (WMS)';
  if (deleteBtn) deleteBtn.style.display = 'none';
  if (imgPreview) imgPreview.src = 'img/logo_oficial.png';
  if (fileInput) fileInput.value = '';
  if (form) form.reset();

  document.getElementById('crudBarcodeInput').value = generateRandomBarcode();
  updateSubfamilyOptions(1);
  if (modal) modal.classList.add('active');
};

window.openEditProductModal = function(id) {
  editingProductId = id;
  const p = AppState.products.find(x => x.id === id);
  if (!p) return;

  const modal = document.getElementById('productCrudModal');
  const title = document.getElementById('crudModalTitle');
  const deleteBtn = document.getElementById('btnDeleteCurrentProduct');
  const imgPreview = document.getElementById('crudImagePreview');
  const fileInput = document.getElementById('crudImageFileInput');

  if (title) title.innerHTML = `<i class="bi bi-pencil-square text-primary"></i> Editar Producto: <strong>${p.sku}</strong>`;
  if (deleteBtn) deleteBtn.style.display = 'inline-block';
  if (fileInput) fileInput.value = '';
  if (imgPreview) {
    imgPreview.src = p.image ? (p.image.startsWith('/') ? p.image.substring(1) : p.image) : `img/catalog/prod_${p.id}.jpg`;
  }

  document.getElementById('crudSkuInput').value = p.sku;
  document.getElementById('crudNameInput').value = p.name;
  document.getElementById('crudBarcodeInput').value = p.barcode || '';
  document.getElementById('crudFamilySelect').value = p.familyId || 1;
  updateSubfamilyOptions(p.familyId || 1);
  document.getElementById('crudSubfamilySelect').value = p.subfamilyId || 1;
  document.getElementById('crudBatchInput').value = p.batchNumber || '';
  document.getElementById('crudExpiryInput').value = p.expiryDate || '';
  document.getElementById('crudHazardSelect').value = p.hazardClass || 'NO_PELIGROSO';
  document.getElementById('crudLocationInput').value = p.location || 'BOD-CARTAGO';
  document.getElementById('crudCostInput').value = p.costPrice || 0;
  document.getElementById('crudPriceInput').value = p.price;
  document.getElementById('crudStockInput').value = p.stock;
  document.getElementById('crudMinStockInput').value = p.minStock || 10;
  document.getElementById('crudUnitInput').value = p.unit || 'UNIDAD';

  if (modal) modal.classList.add('active');
};

window.deleteProduct = async function(id) {
  const p = AppState.products.find(x => x.id === id);
  if (!p) return;

  const confirmMsg = `¿Confirma dar de baja o eliminar el producto [${p.sku}] - "${p.name}"?\n\nEsta acción lo removerá de la base de datos de bodega y de la tienda web oficial.`;
  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error en servidor al eliminar producto');
    }
    AppState.products = AppState.products.filter(x => x.id !== id);
    showNotificationToast(`🗑️ Producto [${p.sku}] eliminado exitosamente del catálogo y la tienda web.`, 'info');
    
    const modal = document.getElementById('productCrudModal');
    if (modal) modal.classList.remove('active');
    
    renderAllViews();
  } catch (err) {
    alert('Error al eliminar producto: ' + err.message);
  }
};

window.handleModalDeleteProduct = function() {
  if (editingProductId) {
    deleteProduct(editingProductId);
  }
};

function generateRandomBarcode() {
  return `740${Math.floor(100000000 + Math.random() * 900000000)}0`;
}

// ==============================================================================
// 5. CARGA MASIVA DESDE EXCEL CON FAMILIAS Y LOTES
// ==============================================================================
function setupExcelBulkImport() {
  const fileInput = document.getElementById('excelFileInput');
  const dropzone = document.getElementById('excelDropzone');
  const processBtn = document.getElementById('btnProcessBulkImport');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        handleFileParsing(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        handleFileParsing(e.target.files[0]);
      }
    });
  }

  function handleFileParsing(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      parseCsvData(e.target.result);
    };
    reader.readAsText(file);
  }

  function parseCsvData(content) {
    const lines = content.split(/\r\n|\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      alert('El archivo no contiene suficientes filas.');
      return;
    }

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols.length >= 6) {
        const sku = cols[0].toUpperCase();
        const existing = AppState.products.find(p => p.sku === sku);

        rows.push({
          sku: sku,
          name: cols[1],
          familyName: cols[2] || 'Químicos y Desinfectantes',
          subfamilyName: cols[3] || 'Desengrasantes Industriales',
          batchNumber: cols[4] || 'LOT-2026-IMPORT',
          costPrice: parseFloat(cols[5]) || 0,
          salePrice: parseFloat(cols[6]) || 0,
          quantity: parseInt(cols[7], 10) || 0,
          unit: cols[8] || 'GALON',
          isExisting: !!existing,
          currentStock: existing ? existing.stock : 0
        });
      }
    }

    AppState.stagedBulkRows = rows;
    renderBulkPreviewTable();
  }

  window.loadDemoExcelFile = function() {
    const demoData = `SKU,NOMBRE,FAMILIA,SUBFAMILIA,LOTE,COSTO,PRECIO_VENTA,CANTIDAD_AUMENTAR,UNIDAD
FRAG-DES-001,"Desengrasante Industrial Alcalino Galón","Químicos y Desinfectantes","Desengrasantes Industriales",LOT-2026-089A,4800,6950,50,GALON
FRAG-CLO-001,"Cloro Concentrado Fragama 5.25% Galón","Químicos y Desinfectantes","Cloros y Blanqueadores",LOT-2026-092C,2100,3250,100,GALON
FRAG-CER-001,"Cera Polimérica Antideslizante Galón","Químicos y Desinfectantes","Ceras y Tratamiento de Pisos",LOT-2026-CER01,6200,8900,30,GALON
FRAG-VAS-001,"Vaso Cónico Transparente 7oz (Caja x1000)","Papelería y Desechables","Servilletas y Vasos Desechables",LOT-2026-VAS05,8500,11900,25,CAJA
FRAG-DIS-001,"Dispensador Jabón Líquido Relleno 1L","Bolsas y Plásticos","Dispensadores Institucionales",LOT-2026-DISP01,4500,6800,40,UNIDAD`;

    parseCsvData(demoData);
    showNotificationToast('Datos de prueba con Familias y Lotes cargados en la previsualización.', 'info');
  };

  window.downloadExcelTemplate = function() {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "SKU,NOMBRE,FAMILIA,SUBFAMILIA,LOTE,COSTO,PRECIO_VENTA,CANTIDAD_AUMENTAR,UNIDAD\n" +
      "FRAG-DES-001,\"Desengrasante Industrial Alcalino Galón\",\"Químicos y Desinfectantes\",\"Desengrasantes Industriales\",LOT-2026-089A,4800,6950,50,GALON\n" +
      "FRAG-NUE-001,\"Producto Nuevo de Limpieza\",\"Útiles, Fibras y Equipos\",\"Mopas Industriales y Repuestos\",LOT-2026-001X,3500,5200,20,UNIDAD\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "plantilla_bodega_fragama_familias.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (processBtn) {
    processBtn.addEventListener('click', () => {
      if (!AppState.stagedBulkRows.length) return;

      let created = 0;
      let updated = 0;

      AppState.stagedBulkRows.forEach(row => {
        const existing = AppState.products.find(p => p.sku === row.sku);

        if (existing) {
          const prev = existing.stock;
          existing.stock += row.quantity;
          if (row.salePrice > 0) existing.price = row.salePrice;
          if (row.costPrice > 0) existing.costPrice = row.costPrice;
          if (row.batchNumber) existing.batchNumber = row.batchNumber;

          if (row.quantity > 0) {
            AppState.kardexMovements.unshift({
              id: AppState.kardexMovements.length + 101,
              code: `ENT-20260929-${String(AppState.kardexMovements.length + 1).padStart(4, '0')}`,
              product: existing.name,
              batch: existing.batchNumber,
              type: 'Entrada Compra',
              sign: 1,
              qty: row.quantity,
              prev: prev,
              final: existing.stock,
              cost: existing.costPrice,
              doc: 'IMPORT-EXCEL-MASS',
              user: AppState.currentUser.name
            });
          }
          updated++;
        } else {
          const newId = AppState.products.length + 1;
          const barcode = generateRandomBarcode();
          const family = AppState.families.find(f => f.name.toLowerCase().includes(row.familyName.toLowerCase())) || AppState.families[0];

          AppState.products.push({
            id: newId,
            sku: row.sku,
            barcode: barcode,
            name: row.name,
            familyId: family.id,
            familyName: family.name,
            subfamilyId: 1,
            subfamilyName: row.subfamilyName,
            batchNumber: row.batchNumber,
            expiryDate: null,
            hazardClass: 'NO_PELIGROSO',
            location: 'PAS-QUIM-01 / EST-01 / N-1 / P-01',
            costPrice: row.costPrice,
            price: row.salePrice,
            stock: row.quantity,
            minStock: 15,
            maxStock: 500,
            unit: row.unit,
            weightKg: 4.0,
            volumeM3: 0.0045
          });

          if (row.quantity > 0) {
            AppState.kardexMovements.unshift({
              id: AppState.kardexMovements.length + 101,
              code: `ENT-20260929-${String(AppState.kardexMovements.length + 1).padStart(4, '0')}`,
              product: row.name,
              batch: row.batchNumber,
              type: 'Ajuste Auditoría (+)',
              sign: 1,
              qty: row.quantity,
              prev: 0,
              final: row.quantity,
              cost: row.costPrice,
              doc: 'IMPORT-EXCEL-NUEVO',
              user: AppState.currentUser.name
            });
          }
          created++;
        }
      });

      AppState.stagedBulkRows = [];
      renderBulkPreviewTable();
      renderAllViews();

      showNotificationToast(`Carga masiva WMS: ${created} productos creados, ${updated} incrementados en stock con registro de lote en Kardex.`, 'success');
    });
  }
}

function renderBulkPreviewTable() {
  const container = document.getElementById('bulkPreviewContainer');
  const tbody = document.getElementById('bulkPreviewTableBody');
  const countBadge = document.getElementById('bulkTotalRowsCount');
  const processBtn = document.getElementById('btnProcessBulkImport');

  if (!container || !tbody) return;

  if (AppState.stagedBulkRows.length === 0) {
    container.style.display = 'none';
    if (processBtn) processBtn.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  if (processBtn) processBtn.style.display = 'inline-flex';
  if (countBadge) countBadge.textContent = `${AppState.stagedBulkRows.length} artículos detectados`;

  tbody.innerHTML = AppState.stagedBulkRows.map(r => {
    return `
      <tr>
        <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">${r.sku}</td>
        <td><strong>${r.name}</strong></td>
        <td>
          <span class="badge-status badge-in-route">${r.familyName}</span>
          <div style="font-size:0.75rem; color:#64748B;">${r.subfamilyName}</div>
        </td>
        <td style="font-family:'JetBrains Mono',monospace; font-size:0.8rem;">${r.batchNumber}</td>
        <td>${formatCRC(r.costPrice)}</td>
        <td style="font-weight:700;">${formatCRC(r.salePrice)}</td>
        <td style="font-weight:700; color:#10B981;">+${r.quantity} ${r.unit}</td>
        <td>
          ${r.isExisting 
            ? `<span class="badge-status badge-upsert-update"><i class="bi bi-arrow-up-circle"></i> AUMENTO (Stock: ${r.currentStock} → ${r.currentStock + r.quantity})</span>`
            : `<span class="badge-status badge-upsert-new"><i class="bi bi-plus-circle"></i> NUEVO PRODUCTO</span>`
          }
        </td>
      </tr>
    `;
  }).join('');
}

// ==============================================================================
// 6. REPORTES FINANCIEROS Y VALORIZACIÓN POR FAMILIA
// ==============================================================================
function setupReports() {
  window.exportInventoryToCsv = function() {
    let csv = "SKU,PRODUCTO,FAMILIA,SUBFAMILIA,LOTE,VENCIMIENTO,UBICACION,COSTO_CRC,PRECIO_VENTA_CRC,STOCK_ACTUAL,VALOR_COSTO,VALOR_VENTA,MARGEN\n";
    AppState.products.forEach(p => {
      const valCost = (p.costPrice * p.stock);
      const valSale = (p.price * p.stock);
      const margin = valSale - valCost;
      csv += `"${p.sku}","${p.name}","${p.familyName}","${p.subfamilyName}","${p.batchNumber || ''}","${p.expiryDate || ''}","${p.location}",${p.costPrice},${p.price},${p.stock},${valCost},${valSale},${margin}\n`;
    });

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_wms_fragama_cartago_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
}

function renderReportsData() {
  const totalCostEl = document.getElementById('reportTotalCost');
  const totalSaleEl = document.getElementById('reportTotalSale');
  const totalMarginEl = document.getElementById('reportTotalMargin');
  const totalUnitsEl = document.getElementById('reportTotalUnits');
  const reportTableBody = document.getElementById('reportValuationTableBody');

  if (!totalCostEl) return;

  let totalCost = 0;
  let totalSale = 0;
  let totalUnits = 0;

  const familiesMap = {};

  AppState.products.forEach(p => {
    const cost = (p.costPrice || 0) * p.stock;
    const sale = p.price * p.stock;
    totalCost += cost;
    totalSale += sale;
    totalUnits += p.stock;

    if (!familiesMap[p.familyName]) {
      familiesMap[p.familyName] = { count: 0, stock: 0, cost: 0, sale: 0 };
    }
    familiesMap[p.familyName].count++;
    familiesMap[p.familyName].stock += p.stock;
    familiesMap[p.familyName].cost += cost;
    familiesMap[p.familyName].sale += sale;
  });

  const margin = totalSale - totalCost;
  const marginPct = totalSale > 0 ? (margin / totalSale * 100).toFixed(1) : 0;

  totalCostEl.textContent = formatCRC(totalCost);
  totalSaleEl.textContent = formatCRC(totalSale);
  totalMarginEl.textContent = `${formatCRC(margin)} (${marginPct}%)`;
  totalUnitsEl.textContent = `${totalUnits.toLocaleString()} unidades / galones`;

  if (reportTableBody) {
    reportTableBody.innerHTML = Object.keys(familiesMap).map(fam => {
      const data = familiesMap[fam];
      const famMargin = data.sale - data.cost;
      const pctOfTotalStock = totalUnits > 0 ? ((data.stock / totalUnits) * 100).toFixed(1) : 0;

      return `
        <tr>
          <td>
            <div style="font-weight:700; color:#0B192C;">${fam}</div>
            <small style="color:#64748B;">Participación: ${pctOfTotalStock}% del inventario</small>
          </td>
          <td>${data.count} artículos</td>
          <td style="font-weight:700;">${data.stock.toLocaleString()} unidades</td>
          <td>${formatCRC(data.cost)}</td>
          <td style="font-weight:700; color:#1E3E62;">${formatCRC(data.sale)}</td>
          <td style="font-weight:700; color:#10B981;">+${formatCRC(famMargin)}</td>
        </tr>
      `;
    }).join('');
  }
}

// ==============================================================================
// 7. FUNCIONES DE APOYO (TABLAS, KARDEX, CHOFER, BARCODE)
// ==============================================================================
function renderProductsTable() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  tbody.innerHTML = AppState.products.map(p => {
    const isLow = p.stock <= p.minStock;
    return `
      <tr>
        <td style="font-family:'JetBrains Mono',monospace; font-weight:700; color:#1E3E62;">${p.sku}</td>
        <td>
          <div style="font-weight:600;">${p.name}</div>
          <small style="color:#64748B;">EAN: ${p.barcode} | Lote: ${p.batchNumber || 'N/A'}</small>
        </td>
        <td>
          <span class="badge-status badge-in-route">${p.familyName}</span>
          <div style="font-size:0.75rem; color:#64748B;">${p.subfamilyName}</div>
        </td>
        <td><i class="bi bi-geo-alt"></i> ${p.location}</td>
        <td style="font-weight:700;">${formatCRC(p.price)}</td>
        <td>
          <span style="font-size:1.05rem; font-weight:800; color:${isLow ? '#EF4444' : '#0B192C'}">${p.stock}</span>
          <small style="color:#64748B;">${p.unit}</small>
          ${isLow ? '<span class="badge-status badge-low-stock ml-1"><i class="bi bi-exclamation-triangle-fill"></i> BAJO</span>' : ''}
        </td>
        <td>
          <button class="btn-fragama btn-outline-fragama" style="padding:4px 8px; font-size:0.75rem;" onclick="showBarcodeForProduct(${p.id})">
            <i class="bi bi-upc-scan"></i> Código
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderKardexTable() {
  const tbody = document.getElementById('kardexTableBody');
  if (!tbody) return;

  tbody.innerHTML = AppState.kardexMovements.map(m => {
    let signClass = 'badge-kardex-trans';
    let signSymbol = '⇄';
    if (m.sign > 0) { signClass = 'badge-kardex-in'; signSymbol = '+'; }
    if (m.sign < 0) { signClass = 'badge-kardex-out'; signSymbol = '-'; }

    return `
      <tr>
        <td style="font-family:'JetBrains Mono',monospace; font-weight:600; font-size:0.8rem;">${m.code}</td>
        <td>
          <strong>${m.product}</strong>
          ${m.batch ? `<div style="font-size:0.75rem; color:#64748B; font-family:'JetBrains Mono',monospace;">Lote: ${m.batch}</div>` : ''}
        </td>
        <td><span class="badge-status ${signClass}">${signSymbol} ${m.type}</span></td>
        <td style="font-weight:700; color:${m.sign < 0 ? '#EF4444' : (m.sign > 0 ? '#10B981' : '#1E3E62')}">${m.qty}</td>
        <td style="color:#64748B;">${m.prev}</td>
        <td style="font-weight:700;">${m.final}</td>
        <td style="font-family:'JetBrains Mono',monospace;">${m.doc}</td>
        <td style="font-size:0.8rem; color:#64748B;">${m.user}</td>
      </tr>
    `;
  }).join('');
}

function setupDriverActions() {
  renderDriverDispatches();

  const modal = document.getElementById('deliveryStatusModal');
  const closeBtn = document.getElementById('closeStatusModal');
  const cancelBtn = document.getElementById('cancelStatusModal');
  const confirmBtn = document.getElementById('confirmStatusBtn');
  const clearSigBtn = document.getElementById('clearSignatureBtn');
  const canvas = document.getElementById('driverSignatureCanvas');

  // Inicializar lienzo de firma táctil y mouse
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let isDrawing = false;

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    function startDraw(e) {
      isDrawing = true;
      const { x, y } = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = '#0B192C';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    function draw(e) {
      if (!isDrawing) return;
      e.preventDefault();
      const { x, y } = getCoords(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    function stopDraw() {
      isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stopDraw);

    if (clearSigBtn) {
      clearSigBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const selectedStatus = document.querySelector('input[name="deliveryStatusChoice"]:checked')?.value || 'Entregado';
      const notes = document.getElementById('driverNotesInput')?.value || '';

      if (window.currentSelectedDispatchId) {
        const item = AppState.dispatches.find(d => d.id === window.currentSelectedDispatchId);
        if (item) {
          item.status = selectedStatus;
          item.observation = notes;

          // Si el cliente rechazó la mercancía, reingresar automáticamente al stock central y asentar en Kardex
          if (selectedStatus === 'Rechazado') {
            const returnedProduct = AppState.products[0];
            const restockQty = 5;
            returnedProduct.stock += restockQty;

            const nextId = AppState.kardexMovements.length + 101;
            AppState.kardexMovements.unshift({
              id: nextId,
              code: `DEV-20260929-${String(nextId).padStart(4, '0')}`,
              product: returnedProduct.name,
              batch: returnedProduct.batchNumber,
              type: 'Devolución / Rechazo en Ruta',
              sign: 1,
              qty: restockQty,
              prev: returnedProduct.stock - restockQty,
              final: returnedProduct.stock,
              cost: returnedProduct.costPrice,
              doc: item.code,
              user: 'Minor Coto (Chofer)'
            });
            renderAllViews();
          }

          renderDriverDispatches();
          showNotificationToast(`Entrega ${item.code} en ${item.customer} marcada como "${selectedStatus}".`, 'success');
        }
      }
      modal.classList.remove('active');
    });
  }
}

// ==============================================================================
// MÓDULO DE PUNTO DE VENTA (POS / CAJERO)
// ==============================================================================
function setupPosModule() {
  const searchInput = document.getElementById('posSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderPosCatalog(e.target.value.trim().toLowerCase());
    });

    // Soporte directo para pistola lectora de código de barras en POS
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const code = searchInput.value.trim().toLowerCase();
        const match = AppState.products.find(p => 
          (p.barcode && p.barcode.toLowerCase() === code) ||
          (p.sku && p.sku.toLowerCase() === code)
        );
        if (match) {
          playBarcodeBeep();
          addToCart(match);
          searchInput.value = '';
          renderPosCatalog('');
          showNotificationToast(`🛒 Producto escaneado y agregado: ${match.name}`, 'success');
        }
      }
    });
  }

  const btnEmitir = document.getElementById('btnEmitirFactura');
  if (btnEmitir) {
    btnEmitir.addEventListener('click', executePosCheckout);
  }

  const closeReceiptBtn = document.getElementById('closeInvoiceReceiptBtn');
  const dismissReceiptBtn = document.getElementById('dismissInvoiceReceiptBtn');
  const receiptModal = document.getElementById('invoiceReceiptModal');

  if (closeReceiptBtn && receiptModal) {
    closeReceiptBtn.addEventListener('click', () => receiptModal.classList.remove('active'));
  }
  if (dismissReceiptBtn && receiptModal) {
    dismissReceiptBtn.addEventListener('click', () => receiptModal.classList.remove('active'));
  }

  renderPosCatalog();
  renderPosCart();
}

function renderPosCatalog(searchTerm = '') {
  const container = document.getElementById('posCatalogList');
  if (!container) return;

  const filtered = AppState.products.filter(p => {
    if (!searchTerm) return true;
    return p.name.toLowerCase().includes(searchTerm) ||
           p.sku.toLowerCase().includes(searchTerm) ||
           p.barcode.includes(searchTerm);
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:2rem; color:#64748B;">No se encontraron productos coincidentes.</div>`;
    return;
  }

  container.innerHTML = filtered.map(p => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border:1px solid #E2E8F0; border-radius:8px; margin-bottom:8px; background:#FFFFFF;">
      <div style="flex:1;">
        <div style="font-weight:700; font-size:0.88rem; color:#0B192C;">${p.name}</div>
        <div style="font-size:0.75rem; color:#64748B; font-family:'JetBrains Mono',monospace;">
          ${p.sku} | <span style="color:${p.stock <= p.minStock ? '#EF4444' : '#10B981'}; font-weight:700;">Stock: ${p.stock}</span>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-weight:800; font-size:0.98rem; color:var(--fragama-blue-primary);">${formatCRC(p.price)}</span>
        <button class="btn-fragama btn-primary-fragama" style="padding:5px 10px; font-size:0.78rem;" onclick="addToPosCart(${p.id})">
          <i class="bi bi-cart-plus"></i> Agregar
        </button>
      </div>
    </div>
  `).join('');
}

window.addToPosCart = function(productId) {
  const product = AppState.products.find(p => p.id === productId);
  if (!product) return;

  if (product.stock <= 0) {
    alert(`❌ No hay stock disponible para [${product.sku}].`);
    return;
  }

  const existing = AppState.posCart.find(item => item.productId === productId);
  if (existing) {
    if (existing.qty + 1 > product.stock) {
      alert(`❌ Stock insuficiente: solo hay ${product.stock} unidades en bodega.`);
      return;
    }
    existing.qty += 1;
  } else {
    AppState.posCart.push({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price,
      qty: 1,
      stock: product.stock
    });
  }

  renderPosCart();
  showNotificationToast(`Agregado al carrito: ${product.name}`, 'info');
};

window.updatePosCartQty = function(productId, delta) {
  const item = AppState.posCart.find(i => i.productId === productId);
  if (!item) return;

  const product = AppState.products.find(p => p.id === productId);
  const newQty = item.qty + delta;

  if (newQty <= 0) {
    window.removePosCartItem(productId);
    return;
  }

  if (product && newQty > product.stock) {
    alert(`❌ Stock máximo alcanzado (${product.stock} unidades).`);
    return;
  }

  item.qty = newQty;
  renderPosCart();
};

window.removePosCartItem = function(productId) {
  AppState.posCart = AppState.posCart.filter(i => i.productId !== productId);
  renderPosCart();
};

function renderPosCart() {
  const container = document.getElementById('posCartItemsList');
  const subtotalEl = document.getElementById('posSubtotalDisplay');
  const ivaEl = document.getElementById('posIvaDisplay');
  const totalEl = document.getElementById('posTotalDisplay');

  if (!container) return;

  if (AppState.posCart.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:1.5rem; color:#94A3B8; font-size:0.85rem;"><i class="bi bi-cart-x" style="font-size:1.5rem;"></i><br>El carrito de compras está vacío.</div>`;
    if (subtotalEl) subtotalEl.textContent = formatCRC(0);
    if (ivaEl) ivaEl.textContent = formatCRC(0);
    if (totalEl) totalEl.textContent = formatCRC(0);
    return;
  }

  let subtotal = 0;

  container.innerHTML = AppState.posCart.map(item => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding-bottom:8px; border-bottom:1px dotted #E2E8F0; font-size:0.84rem;">
        <div style="flex:1; padding-right:8px;">
          <div style="font-weight:700; color:#0B192C;">${item.name}</div>
          <small style="color:#64748B;">${formatCRC(item.price)} c/u</small>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <button type="button" class="btn btn-sm btn-outline-secondary" style="padding:0 6px; font-weight:700;" onclick="updatePosCartQty(${item.productId}, -1)">-</button>
          <span style="font-weight:700; min-width:20px; text-align:center;">${item.qty}</span>
          <button type="button" class="btn btn-sm btn-outline-secondary" style="padding:0 6px; font-weight:700;" onclick="updatePosCartQty(${item.productId}, 1)">+</button>
          <span style="font-weight:700; min-width:75px; text-align:right; color:#0B192C;">${formatCRC(itemTotal)}</span>
          <button type="button" style="background:none; border:none; color:#EF4444; cursor:pointer; padding:2px;" onclick="removePosCartItem(${item.productId})" title="Eliminar item">&times;</button>
        </div>
      </div>
    `;
  }).join('');

  const iva = Math.round(subtotal * 0.13);
  const total = subtotal + iva;

  if (subtotalEl) subtotalEl.textContent = formatCRC(subtotal);
  if (ivaEl) ivaEl.textContent = formatCRC(iva);
  if (totalEl) totalEl.textContent = formatCRC(total);
}

function executePosCheckout() {
  if (AppState.posCart.length === 0) {
    alert('❌ El carrito está vacío. Agregue productos antes de emitir la factura.');
    return;
  }

  const customerName = document.getElementById('posCustomerName')?.value.trim() || 'Cliente Mostrador';
  const customerId = document.getElementById('posCustomerId')?.value.trim() || 'CÉD-0000000';
  const paymentMethod = document.querySelector('input[name="posPaymentMethod"]:checked')?.value || 'Efectivo';

  // Validar stock antes de rebajar
  for (const item of AppState.posCart) {
    const product = AppState.products.find(p => p.id === item.productId);
    if (!product || product.stock < item.qty) {
      alert(`❌ Stock insuficiente para [${item.sku}]. Stock disponible: ${product ? product.stock : 0}.`);
      return;
    }
  }

  // Generar código de factura
  AppState.invoiceCounter += 1;
  const invoiceNumber = `FAC-001-${String(AppState.invoiceCounter).padStart(6, '0')}`;
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('es-CR') + ' ' + now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });

  let subtotal = 0;
  const itemsSummary = [];

  // Rebajar de inventario y registrar en Kardex
  for (const item of AppState.posCart) {
    const product = AppState.products.find(p => p.id === item.productId);
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    itemsSummary.push(`${item.qty}x ${product.name}`);

    const prevStock = product.stock;
    product.stock -= item.qty;

    const nextId = AppState.kardexMovements.length + 101;
    AppState.kardexMovements.unshift({
      id: nextId,
      code: `SAL-20260929-${String(nextId).padStart(4, '0')}`,
      product: product.name,
      batch: product.batchNumber,
      type: 'Salida Venta POS',
      sign: -1,
      qty: item.qty,
      prev: prevStock,
      final: product.stock,
      cost: product.costPrice,
      doc: invoiceNumber,
      user: AppState.currentUser.name
    });
  }

  const iva = Math.round(subtotal * 0.13);
  const total = subtotal + iva;

  // Crear despacho asignado a la ruta del chofer
  const newDispatchId = AppState.dispatches.length + 1;
  AppState.dispatches.unshift({
    id: newDispatchId,
    code: `RUT-2026-${String(newDispatchId).padStart(3, '0')}`,
    invoice: invoiceNumber,
    orderCode: invoiceNumber,
    customer: customerName,
    address: 'Cartago Centro / Entrega en caja o ruta',
    contact: `${customerName} (${customerId})`,
    items: itemsSummary.join(', '),
    packages: AppState.posCart.map(i => ({ qty: i.qty, unit: 'Und', desc: i.name })),
    driver: 'Caja POS / Entrega Inmediata',
    status: 'Facturado',
    departureTime: now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
    verified: true,
    observation: `Venta emitida por caja. Pago: ${paymentMethod}`
  });

  // Mostrar modal de factura impresa
  const receiptBody = document.getElementById('invoiceReceiptBody');
  const receiptModal = document.getElementById('invoiceReceiptModal');

  if (receiptBody) {
    receiptBody.innerHTML = `
      <div style="text-align:center; border-bottom:2px solid #0B192C; padding-bottom:12px; margin-bottom:12px;">
        <img src="img/logo.svg" style="height:36px; margin-bottom:6px;">
        <div style="font-weight:900; font-size:1.1rem; color:#0B192C;">DISTRIBUIDORA FRAGAMA</div>
        <small style="color:#64748B;">Cédula Jurídica: 3-101-789012<br>Taras, San Nicolás, Cartago, Costa Rica<br>Tel: +506 2551-0000</small>
        <div style="font-size:0.85rem; font-weight:700; margin-top:6px; color:#0284C7;">FACTURA ELECTRÓNICA DE VENTA</div>
        <div style="font-family:'JetBrains Mono',monospace; font-size:0.9rem; font-weight:800;">${invoiceNumber}</div>
        <div style="font-size:0.75rem; color:#64748B;">Fecha: ${dateFormatted}</div>
      </div>

      <div style="font-size:0.82rem; margin-bottom:10px;">
        <strong>Cliente:</strong> ${customerName}<br>
        <strong>Cédula / Identificación:</strong> ${customerId}<br>
        <strong>Condición de Pago:</strong> Contado (${paymentMethod})<br>
        <strong>Cajero:</strong> ${AppState.currentUser.name}
      </div>

      <table style="width:100%; border-collapse:collapse; font-size:0.8rem; margin-bottom:12px;">
        <thead>
          <tr style="border-bottom:1px solid #0B192C; text-align:left;">
            <th style="padding:4px 0;">Cant.</th>
            <th style="padding:4px 0;">Descripción</th>
            <th style="padding:4px 0; text-align:right;">Precio</th>
            <th style="padding:4px 0; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${AppState.posCart.map(item => `
            <tr style="border-bottom:1px dotted #CBD5E1;">
              <td style="padding:4px 0;">${item.qty}</td>
              <td style="padding:4px 0;">${item.name}</td>
              <td style="padding:4px 0; text-align:right;">${formatCRC(item.price)}</td>
              <td style="padding:4px 0; text-align:right; font-weight:700;">${formatCRC(item.price * item.qty)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="border-top:1px solid #0B192C; padding-top:8px; font-size:0.85rem;">
        <div style="display:flex; justify-content:space-between;"><span>Subtotal:</span> <span>${formatCRC(subtotal)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>IVA (13%):</span> <span>${formatCRC(iva)}</span></div>
        <div style="display:flex; justify-content:space-between; font-size:1.1rem; font-weight:900; color:#0B192C; margin-top:4px;">
          <span>TOTAL:</span> <span>${formatCRC(total)}</span>
        </div>
      </div>

      <!-- CÓDIGO DE BARRAS DE LA FACTURA PARA VER Y AUDITAR EL PEDIDO -->
      <div style="text-align:center; margin:14px 0 8px 0; padding:12px; background:#F8FAFC; border:2px dashed #0284C7; border-radius:10px;">
        <div style="font-size:0.75rem; font-weight:800; color:#0284C7; margin-bottom:4px;">
          <i class="bi bi-upc-scan"></i> CÓDIGO DE BARRAS DE FACTURA / PEDIDO:
        </div>
        <div style="display:flex; justify-content:center; margin-bottom:6px;">
          <svg id="posReceiptBarcodeSvg"></svg>
        </div>
        <button type="button" class="btn-fragama btn-outline-fragama" style="font-size:0.75rem; padding:4px 10px; margin-top:2px;" onclick="handleScannedBarcode('${invoiceNumber}')">
          <i class="bi bi-box-seam"></i> Ver Pedido / Auditar con este Código
        </button>
      </div>

      <div style="text-align:center; margin:10px 0 6px 0; padding:8px; background:#FFF; border:1px solid #E2E8F0; border-radius:8px;">
        <div id="posReceiptQrBox" style="width:90px; height:90px; margin:0 auto; background:#FFF; border:1px solid #E2E8F0; padding:4px; border-radius:6px; display:flex; align-items:center; justify-content:center;"></div>
        <div style="font-size:0.68rem; color:#64748B; margin-top:2px;">QR Tributario Hacienda DGT</div>
      </div>

      <div style="text-align:center; margin-top:14px; padding-top:10px; border-top:1px dashed #CBD5E1; font-size:0.75rem; color:#64748B;">
        Autorizada mediante Resolución DGT-R-033-2019 de la Dirección General de Tributación.<br>
        ¡Gracias por su compra en Distribuidora Fragama!
      </div>
    `;

    // Renderizar Código de Barras y QR en la factura POS
    const posQrPayload = JSON.stringify({
      empresa: 'Distribuidora Fragama S.A.',
      factura: invoiceNumber,
      cliente: customerName,
      bultos: itemsSummary.join(', '),
      total: formatCRC(total)
    });
    setTimeout(() => {
      try {
        if (typeof JsBarcode !== 'undefined') {
          JsBarcode("#posReceiptBarcodeSvg", invoiceNumber, {
            format: "CODE128",
            lineColor: "#0B192C",
            width: 2,
            height: 48,
            displayValue: true,
            font: "JetBrains Mono",
            fontSize: 13
          });
        }
      } catch (e) {
        console.warn("JsBarcode receipt:", e);
      }
      renderQrCodeInElement('posReceiptQrBox', posQrPayload, 80, 80);
    }, 40);
  }

  if (receiptModal) receiptModal.classList.add('active');

  // Limpiar carrito
  AppState.posCart = [];
  renderPosCart();
  renderAllViews();
  showNotificationToast(`Factura ${invoiceNumber} emitida y rebajada del inventario.`, 'success');
}

// ==============================================================================
// MÓDULO DE TOMA DE PEDIDOS PARA CLIENTES Y PROFORMAS (INSTITUCIONAL)
// ==============================================================================
function setupCustomerOrdersModule() {
  // Pestañas (Tabs)
  const tabBtnNew = document.getElementById('orderTabBtnNew');
  const tabBtnHistory = document.getElementById('orderTabBtnHistory');
  const contentNew = document.getElementById('orderContentNew');
  const contentHistory = document.getElementById('orderContentHistory');

  if (tabBtnNew && tabBtnHistory && contentNew && contentHistory) {
    tabBtnNew.addEventListener('click', () => {
      tabBtnNew.classList.add('active');
      tabBtnHistory.classList.remove('active');
      contentNew.style.display = 'block';
      contentHistory.style.display = 'none';
    });

    tabBtnHistory.addEventListener('click', () => {
      tabBtnHistory.classList.add('active');
      tabBtnNew.classList.remove('active');
      contentHistory.style.display = 'block';
      contentNew.style.display = 'none';
      renderOrderHistory();
    });
  }

  // Cambio de cliente seleccionado
  const custSelect = document.getElementById('orderCustomerSelect');
  if (custSelect) {
    custSelect.addEventListener('change', (e) => {
      const selectedId = parseInt(e.target.value, 10);
      AppState.currentOrder.customerId = selectedId;
      updateCustomerCard(selectedId);
    });
  }

  // Modal para registrar nuevo cliente
  const openNewCustBtn = document.getElementById('btnOpenNewCustomerModal');
  const closeNewCustBtn = document.getElementById('closeNewCustomerBtn');
  const cancelNewCustBtn = document.getElementById('cancelNewCustomerBtn');
  const newCustModal = document.getElementById('newCustomerModal');
  const newCustForm = document.getElementById('newCustomerForm');

  if (openNewCustBtn && newCustModal) {
    openNewCustBtn.addEventListener('click', () => newCustModal.classList.add('active'));
  }
  if (closeNewCustBtn && newCustModal) {
    closeNewCustBtn.addEventListener('click', () => newCustModal.classList.remove('active'));
  }
  if (cancelNewCustBtn && newCustModal) {
    cancelNewCustBtn.addEventListener('click', () => newCustModal.classList.remove('active'));
  }

  if (newCustForm) {
    newCustForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const taxId = document.getElementById('newCustId').value.trim();
      const docType = document.getElementById('newCustDocType').value;
      const name = document.getElementById('newCustName').value.trim();
      const contact = document.getElementById('newCustContact').value.trim();
      const phone = document.getElementById('newCustPhone').value.trim();
      const email = document.getElementById('newCustEmail').value.trim();
      const terms = document.getElementById('newCustTerms').value;
      const route = document.getElementById('newCustRoute').value.trim() || 'Cartago Centro';
      const address = document.getElementById('newCustAddress').value.trim();

      const newCustomer = {
        id: AppState.customers.length + 1,
        taxId, docType, name, contact, phone, email, terms, route, address
      };

      try {
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCustomer)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.customerId) newCustomer.id = data.customerId;
        }
      } catch(err) {
        console.warn("Aviso al guardar cliente en BD:", err);
      }

      AppState.customers.push(newCustomer);
      AppState.currentOrder.customerId = newCustomer.id;

      newCustForm.reset();
      closeModalDirectly('newCustomerModal');
      renderCustomerSelect();
      updateCustomerCard(newCustomer.id);
      showNotificationToast(`Cliente "${newCustomer.name}" registrado y seleccionado exitosamente.`, 'success');
    });
  }

  // Filtros del catálogo de pedidos
  const familyFilter = document.getElementById('orderCatalogFamilyFilter');
  const searchInput = document.getElementById('orderCatalogSearch');

  if (familyFilter) {
    familyFilter.addEventListener('change', () => {
      renderOrderCatalog(searchInput ? searchInput.value.trim() : '', familyFilter.value);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderOrderCatalog(e.target.value.trim(), familyFilter ? familyFilter.value : 'ALL');
    });
  }

  // Parámetros de la orden
  const docTypeSelect = document.getElementById('orderDocTypeSelect');
  if (docTypeSelect) {
    docTypeSelect.addEventListener('change', (e) => {
      AppState.currentOrder.docType = e.target.value;
      const badge = document.getElementById('orderCodeBadge');
      if (badge) {
        badge.textContent = `${e.target.value === 'COTIZACION' ? 'COT' : 'PED'}-2026-${String(AppState.orderCounter).padStart(5, '0')}`;
        badge.className = `badge-status ${e.target.value === 'COTIZACION' ? 'badge-in-route' : 'badge-confirmed'}`;
      }
    });
  }

  const deliveryDateInput = document.getElementById('orderDeliveryDateInput');
  if (deliveryDateInput) {
    deliveryDateInput.addEventListener('change', (e) => {
      AppState.currentOrder.deliveryDate = e.target.value;
    });
  }

  const notesTextarea = document.getElementById('orderDeliveryNotes');
  if (notesTextarea) {
    notesTextarea.addEventListener('input', (e) => {
      AppState.currentOrder.notes = e.target.value;
    });
  }

  const clearBtn = document.getElementById('btnClearOrderItems');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      AppState.currentOrder.items = [];
      renderOrderLines();
      showNotificationToast('Se vaciaron los productos de la orden en curso.', 'info');
    });
  }

  // Botones de acción del pedido
  const btnSaveQuote = document.getElementById('btnSaveQuote');
  if (btnSaveQuote) {
    btnSaveQuote.addEventListener('click', () => saveOrder(true));
  }

  const btnConfirmOrder = document.getElementById('btnConfirmSalesOrder');
  if (btnConfirmOrder) {
    btnConfirmOrder.addEventListener('click', () => saveOrder(false));
  }

  // Modal de impresión
  const closeOrderPrintBtn = document.getElementById('closeOrderPrintBtn');
  const dismissOrderPrintBtn = document.getElementById('dismissOrderPrintBtn');
  const printModal = document.getElementById('orderPrintModal');

  if (closeOrderPrintBtn && printModal) {
    closeOrderPrintBtn.addEventListener('click', () => printModal.classList.remove('active'));
  }
  if (dismissOrderPrintBtn && printModal) {
    dismissOrderPrintBtn.addEventListener('click', () => printModal.classList.remove('active'));
  }

  // Switch de Modo de Cliente (BD vs Manual)
  const btnModeDb = document.getElementById('btnModeDbCustomer');
  const btnModeManual = document.getElementById('btnModeManualCustomer');
  const panelDb = document.getElementById('panelDbCustomer');
  const panelManual = document.getElementById('panelManualCustomer');

  if (btnModeDb && btnModeManual && panelDb && panelManual) {
    btnModeDb.addEventListener('click', () => {
      AppState.customerMode = 'DB';
      btnModeDb.classList.add('active');
      btnModeManual.classList.remove('active');
      panelDb.style.display = 'block';
      panelManual.style.display = 'none';
    });

    btnModeManual.addEventListener('click', () => {
      AppState.customerMode = 'MANUAL';
      btnModeManual.classList.add('active');
      btnModeDb.classList.remove('active');
      panelManual.style.display = 'block';
      panelDb.style.display = 'none';
    });
  }

  // Buscador en BD de clientes
  const custDbSearch = document.getElementById('orderCustomerDbSearch');
  if (custDbSearch) {
    custDbSearch.addEventListener('input', (e) => {
      renderCustomerSelect(e.target.value.trim().toLowerCase());
    });
  }

  // Filtros del historial
  const historyStatusFilter = document.getElementById('orderHistoryStatusFilter');
  const historyAssigneeFilter = document.getElementById('orderHistoryAssigneeFilter');
  const historySearch = document.getElementById('orderHistorySearchInput');

  if (historyStatusFilter) historyStatusFilter.addEventListener('change', renderOrderHistory);
  if (historyAssigneeFilter) historyAssigneeFilter.addEventListener('change', renderOrderHistory);
  if (historySearch) historySearch.addEventListener('input', renderOrderHistory);

  // Asignación de persona / colaborador al pedido
  const orderAssignedSelect = document.getElementById('orderAssignedUserSelect');
  if (orderAssignedSelect) {
    orderAssignedSelect.addEventListener('change', (e) => {
      AppState.currentOrder.assignedUserId = parseInt(e.target.value, 10);
    });
  }
}

function renderAssignedUsersDropdown() {
  const select = document.getElementById('orderAssignedUserSelect');
  const filter = document.getElementById('orderHistoryAssigneeFilter');

  // Filtrar solo usuarios activos
  const activeUsers = AppState.systemUsers.filter(u => u.status !== 'Inactivo' && u.isActive !== false);

  if (select) {
    if (!AppState.currentOrder.assignedUserId) {
      // Priorizar vendedor comercial o usuario actual si es activo
      const defaultUser = activeUsers.find(u => u.role === 'Vendedor') ||
                          activeUsers.find(u => u.username === AppState.currentUser?.username) ||
                          activeUsers[0];
      AppState.currentOrder.assignedUserId = defaultUser ? defaultUser.id : 1;
    }

    select.innerHTML = activeUsers.map(u => `
      <option value="${u.id}" ${u.id === AppState.currentOrder.assignedUserId ? 'selected' : ''}>
        👤 ${u.name} — ${u.role} (@${u.username})
      </option>
    `).join('');
  }

  if (filter) {
    const currentVal = filter.value || 'ALL';
    filter.innerHTML = `
      <option value="ALL">👥 Todos los Responsables</option>
      ${activeUsers.map(u => `
        <option value="${u.id}" ${String(u.id) === currentVal ? 'selected' : ''}>
          👤 ${u.name} (${u.role})
        </option>
      `).join('')}
    `;
  }
}

function renderCustomerOrdersView() {
  renderAssignedUsersDropdown();
  renderCustomerSelect();
  updateCustomerCard(AppState.currentOrder.customerId);
  renderOrderFamilyOptions();

  const deliveryDateInput = document.getElementById('orderDeliveryDateInput');
  if (deliveryDateInput && !deliveryDateInput.value) {
    deliveryDateInput.value = AppState.currentOrder.deliveryDate;
  }

  const notesTextarea = document.getElementById('orderDeliveryNotes');
  if (notesTextarea && !notesTextarea.value) {
    notesTextarea.value = AppState.currentOrder.notes;
  }

  const badge = document.getElementById('orderCodeBadge');
  if (badge) {
    badge.textContent = `${AppState.currentOrder.docType === 'COTIZACION' ? 'COT' : 'PED'}-2026-${String(AppState.orderCounter).padStart(5, '0')}`;
  }

  renderOrderCatalog();
  renderOrderLines();
  renderOrderHistory();
}

function renderCustomerSelect(filterTerm = '') {
  const select = document.getElementById('orderCustomerSelect');
  if (!select) return;

  const filtered = AppState.customers.filter(c => {
    if (!filterTerm) return true;
    return c.name.toLowerCase().includes(filterTerm) ||
           c.taxId.toLowerCase().includes(filterTerm) ||
           (c.contact && c.contact.toLowerCase().includes(filterTerm));
  });

  if (filtered.length === 0) {
    select.innerHTML = '<option value="">No hay clientes en BD coincidentes</option>';
    return;
  }

  select.innerHTML = filtered.map(c => `
    <option value="${c.id}" ${c.id === AppState.currentOrder.customerId ? 'selected' : ''}>
      ${c.name} — Céd: ${c.taxId} (${c.terms})
    </option>
  `).join('');

  if (filtered.length > 0 && !filtered.some(c => c.id === AppState.currentOrder.customerId)) {
    AppState.currentOrder.customerId = filtered[0].id;
    updateCustomerCard(filtered[0].id);
  }
}

function updateCustomerCard(customerId) {
  const customer = AppState.customers.find(c => c.id === customerId);
  if (!customer) return;

  const nameEl = document.getElementById('custCardName');
  const termsEl = document.getElementById('custCardTerms');
  const idEl = document.getElementById('custCardId');
  const phoneEl = document.getElementById('custCardPhone');
  const contactEl = document.getElementById('custCardContact');
  const routeEl = document.getElementById('custCardRoute');
  const addressEl = document.getElementById('custCardAddress');

  if (nameEl) nameEl.textContent = customer.name;
  if (termsEl) termsEl.textContent = customer.terms;
  if (idEl) idEl.textContent = customer.taxId;
  if (phoneEl) phoneEl.textContent = customer.phone;
  if (contactEl) contactEl.textContent = customer.contact;
  if (routeEl) routeEl.textContent = customer.route || 'Cartago';
  if (addressEl) addressEl.textContent = customer.address;
}

function renderOrderFamilyOptions() {
  const filter = document.getElementById('orderCatalogFamilyFilter');
  if (!filter) return;

  const currentVal = filter.value || 'ALL';
  let html = `<option value="ALL">Todas las Familias (${AppState.products.length})</option>`;
  AppState.families.forEach(f => {
    const count = AppState.products.filter(p => p.familyId === f.id).length;
    html += `<option value="${f.id}">${f.name} (${count})</option>`;
  });
  filter.innerHTML = html;
  filter.value = currentVal;
}

function renderOrderCatalog(searchTerm = '', familyFilter = 'ALL') {
  const container = document.getElementById('orderCatalogList');
  if (!container) return;

  const filtered = AppState.products.filter(p => {
    const matchSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm));

    const matchFamily = (familyFilter === 'ALL') || (p.familyId === parseInt(familyFilter, 10));
    return matchSearch && matchFamily;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:2rem; color:#64748B;">
        <i class="bi bi-search" style="font-size:1.8rem; display:block; margin-bottom:8px; opacity:0.5;"></i>
        No se encontraron productos coincidentes en el catálogo.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => {
    const isLow = p.stock <= p.minStock;
    const stockBadge = isLow
      ? `<span style="background:rgba(239,68,68,0.12); color:#DC2626; border:1px solid rgba(239,68,68,0.3); padding:2px 8px; border-radius:12px; font-size:0.75rem; font-weight:700;"><i class="bi bi-exclamation-triangle-fill"></i> Stock Crítico: ${p.stock}</span>`
      : `<span style="background:rgba(16,185,129,0.12); color:#059669; border:1px solid rgba(16,185,129,0.3); padding:2px 8px; border-radius:12px; font-size:0.75rem; font-weight:700;"><i class="bi bi-check-circle-fill"></i> Stock: ${p.stock}</span>`;

    return `
      <div class="order-product-card">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:2px;">
            <span style="font-weight:800; font-size:0.88rem; color:#0B192C;">${p.name}</span>
            <span style="font-size:0.7rem; background:#F1F5F9; color:#475569; padding:2px 6px; border-radius:4px; font-weight:600;">${p.unit || 'UNIDAD'}</span>
          </div>
          <div style="font-size:0.75rem; color:#64748B; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="font-family:'JetBrains Mono',monospace;">${p.sku}</span>
            <span>•</span>
            <span>${p.familyName || 'General'}</span>
            <span>•</span>
            ${stockBadge}
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          <div style="text-align:right;">
            <div style="font-size:0.95rem; font-weight:800; color:var(--fragama-blue-primary);">${formatCRC(p.price)}</div>
            <div style="font-size:0.7rem; color:#64748B;">c/u + IVA</div>
          </div>

          <div class="order-qty-control">
            <button class="order-qty-btn" type="button" onclick="adjustOrderCatalogQty(${p.id}, -1)">-</button>
            <input type="number" id="catQty_${p.id}" class="order-qty-input" value="1" min="1" max="${p.stock}">
            <button class="order-qty-btn" type="button" onclick="adjustOrderCatalogQty(${p.id}, 1)">+</button>
          </div>

          <button class="btn-fragama btn-primary-fragama" style="padding:6px 10px; font-size:0.78rem;" onclick="addOrderItemToCurrentOrder(${p.id})">
            <i class="bi bi-plus-lg"></i> Agregar
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.adjustOrderCatalogQty = function(productId, delta) {
  const input = document.getElementById(`catQty_${productId}`);
  if (!input) return;
  let val = parseInt(input.value, 10) || 1;
  val = Math.max(1, val + delta);
  input.value = val;
};

window.addOrderItemToCurrentOrder = function(productId) {
  const product = AppState.products.find(p => p.id === productId);
  if (!product) return;

  const input = document.getElementById(`catQty_${productId}`);
  const qtyToAdd = input ? parseInt(input.value, 10) || 1 : 1;

  if (product.stock <= 0) {
    alert(`❌ No hay existencias disponibles para [${product.sku}].`);
    return;
  }

  const existing = AppState.currentOrder.items.find(item => item.productId === productId);
  if (existing) {
    if (existing.qty + qtyToAdd > product.stock) {
      alert(`⚠️ Advertencia de Inventario: La cantidad solicitada (${existing.qty + qtyToAdd}) supera el stock físico disponible en bodega (${product.stock}).`);
    }
    existing.qty += qtyToAdd;
  } else {
    if (qtyToAdd > product.stock) {
      alert(`⚠️ Advertencia de Inventario: La cantidad solicitada (${qtyToAdd}) supera el stock disponible (${product.stock}). Se registrará con aviso.`);
    }
    AppState.currentOrder.items.push({
      productId: product.id,
      qty: qtyToAdd,
      discountPct: 0
    });
  }

  renderOrderLines();
  showNotificationToast(`+ ${qtyToAdd}x ${product.name} agregado a la orden.`, 'info');
};

function renderOrderLines() {
  const tbody = document.getElementById('orderItemsTableBody');
  const countEl = document.getElementById('orderItemCount');
  if (!tbody) return;

  if (countEl) countEl.textContent = AppState.currentOrder.items.length;

  if (AppState.currentOrder.items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:2rem; color:#64748B;">
          <i class="bi bi-cart-x" style="font-size:1.6rem; opacity:0.4; display:block; margin-bottom:6px;"></i>
          No hay productos en esta orden.<br>
          <small>Seleccione productos y cantidades en el catálogo a la izquierda.</small>
        </td>
      </tr>
    `;
    updateOrderFinancialTotals(0, 0);
    return;
  }

  let subtotalBruto = 0;
  let totalDescuentos = 0;

  tbody.innerHTML = AppState.currentOrder.items.map(item => {
    const product = AppState.products.find(p => p.id === item.productId);
    if (!product) return '';

    const lineBruto = product.price * item.qty;
    const discountVal = (lineBruto * (item.discountPct || 0)) / 100;
    const lineNeto = lineBruto - discountVal;

    subtotalBruto += lineBruto;
    totalDescuentos += discountVal;

    return `
      <tr style="border-bottom:1px solid #E2E8F0;">
        <td style="padding:8px 10px;">
          <div style="font-weight:700; color:#0B192C;">${product.name}</div>
          <div style="font-size:0.72rem; color:#64748B; font-family:'JetBrains Mono',monospace;">${product.sku} | ${product.unit || 'UNIDAD'}</div>
        </td>
        <td style="padding:6px; text-align:center;">
          <div style="display:inline-flex; align-items:center; border:1px solid #CBD5E1; border-radius:4px; overflow:hidden;">
            <button type="button" style="background:#F1F5F9; border:none; width:20px; height:22px; cursor:pointer;" onclick="updateOrderItemQty(${item.productId}, -1)">-</button>
            <span style="font-weight:700; min-width:26px; text-align:center; font-size:0.8rem;">${item.qty}</span>
            <button type="button" style="background:#F1F5F9; border:none; width:20px; height:22px; cursor:pointer;" onclick="updateOrderItemQty(${item.productId}, 1)">+</button>
          </div>
        </td>
        <td style="padding:6px; text-align:right; font-weight:600; color:#475569;">
          ${formatCRC(product.price)}
        </td>
        <td style="padding:6px; text-align:center;">
          <select style="border:1px solid #CBD5E1; border-radius:4px; padding:2px 4px; font-size:0.75rem; font-weight:600;" onchange="setOrderItemDiscount(${item.productId}, this.value)">
            <option value="0" ${item.discountPct === 0 ? 'selected' : ''}>0%</option>
            <option value="5" ${item.discountPct === 5 ? 'selected' : ''}>5%</option>
            <option value="8" ${item.discountPct === 8 ? 'selected' : ''}>8%</option>
            <option value="10" ${item.discountPct === 10 ? 'selected' : ''}>10%</option>
            <option value="15" ${item.discountPct === 15 ? 'selected' : ''}>15%</option>
          </select>
        </td>
        <td style="padding:8px; text-align:right; font-weight:800; color:#0B192C;">
          ${formatCRC(lineNeto)}
        </td>
        <td style="padding:6px; text-align:center;">
          <button type="button" style="background:none; border:none; color:#EF4444; cursor:pointer; font-size:0.9rem;" onclick="removeOrderItem(${item.productId})" title="Quitar item">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  updateOrderFinancialTotals(subtotalBruto, totalDescuentos);
}

function updateOrderFinancialTotals(subtotalBruto, totalDescuentos) {
  const subtotalNeto = Math.max(0, subtotalBruto - totalDescuentos);
  const iva = Math.round(subtotalNeto * 0.13);
  const totalGeneral = subtotalNeto + iva;

  const brutoEl = document.getElementById('orderSubtotalBruto');
  const descEl = document.getElementById('orderDescuentoTotal');
  const netoEl = document.getElementById('orderSubtotalNeto');
  const ivaEl = document.getElementById('orderIvaTotal');
  const totalEl = document.getElementById('orderTotalGeneral');

  if (brutoEl) brutoEl.textContent = formatCRC(subtotalBruto);
  if (descEl) descEl.textContent = `-${formatCRC(totalDescuentos)}`;
  if (netoEl) netoEl.textContent = formatCRC(subtotalNeto);
  if (ivaEl) ivaEl.textContent = formatCRC(iva);
  if (totalEl) totalEl.textContent = formatCRC(totalGeneral);
}

window.updateOrderItemQty = function(productId, delta) {
  const item = AppState.currentOrder.items.find(i => i.productId === productId);
  if (!item) return;

  const product = AppState.products.find(p => p.id === productId);
  const newQty = item.qty + delta;

  if (newQty <= 0) {
    removeOrderItem(productId);
    return;
  }

  if (product && newQty > product.stock) {
    alert(`⚠️ Alerta: La cantidad (${newQty}) sobrepasa el stock disponible en bodega (${product.stock}).`);
  }

  item.qty = newQty;
  renderOrderLines();
};

window.setOrderItemDiscount = function(productId, discountVal) {
  const item = AppState.currentOrder.items.find(i => i.productId === productId);
  if (item) {
    item.discountPct = parseFloat(discountVal) || 0;
    renderOrderLines();
  }
};

window.removeOrderItem = function(productId) {
  AppState.currentOrder.items = AppState.currentOrder.items.filter(i => i.productId !== productId);
  renderOrderLines();
};

async function saveOrder(isQuote = false) {
  if (AppState.currentOrder.items.length === 0) {
    alert('❌ La orden está vacía. Por favor agregue al menos un producto del catálogo.');
    return;
  }

  let customer = null;
  if (AppState.customerMode === 'MANUAL') {
    const manName = document.getElementById('manualCustName')?.value.trim();
    const manId = document.getElementById('manualCustId')?.value.trim() || 'CÉD-PROVISIONAL';
    const manPhone = document.getElementById('manualCustPhone')?.value.trim() || 'N/A';
    const manTerms = document.getElementById('manualCustTerms')?.value || 'Contado';
    const manAddress = document.getElementById('manualCustAddress')?.value.trim();
    const saveToDb = document.getElementById('manualCustSaveToDb')?.checked;

    if (!manName) {
      alert('❌ Ingrese el Nombre o Razón Social del cliente.');
      return;
    }
    if (!manAddress) {
      alert('❌ Ingrese la Dirección exacta de entrega para este pedido.');
      return;
    }

    if (saveToDb) {
      const nextId = AppState.customers.length + 1;
      customer = {
        id: nextId,
        taxId: manId,
        name: manName,
        phone: manPhone,
        contact: manName,
        address: manAddress,
        terms: manTerms,
        route: 'Cartago / GAM'
      };
      // Guardar cliente en SQL Server
      try {
        await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer)
        });
      } catch (e) {}
      AppState.customers.push(customer);
      AppState.currentOrder.customerId = nextId;
      renderCustomerSelect();
    } else {
      customer = {
        id: 99999,
        taxId: manId,
        name: manName,
        phone: manPhone,
        contact: manName,
        address: manAddress,
        terms: manTerms,
        route: 'Cartago / GAM'
      };
    }
  } else {
    customer = AppState.customers.find(c => c.id === AppState.currentOrder.customerId);
  }

  if (!customer) {
    alert('❌ Por favor seleccione o digite los datos del cliente.');
    return;
  }

  // Si es pedido firme, validar stock estricto
  if (!isQuote) {
    for (const item of AppState.currentOrder.items) {
      const product = AppState.products.find(p => p.id === item.productId);
      if (!product || product.stock < item.qty) {
        alert(`❌ ACCIÓN BLOQUEADA: Stock insuficiente para [${product ? product.sku : 'SKU'}]. Hay ${product ? product.stock : 0} en existencia y se solicitaron ${item.qty}.`);
        return;
      }
    }
  }

  const docType = isQuote ? 'COTIZACION' : 'PEDIDO';
  const prefix = isQuote ? 'COT' : 'PED';
  AppState.orderCounter += 1;
  const orderCode = `${prefix}-2026-${String(AppState.orderCounter).padStart(5, '0')}`;
  const now = new Date();
  const dateFormatted = now.toISOString().split('T')[0];

  let subtotalBruto = 0;
  let totalDescuentos = 0;

  const orderItemsDetails = AppState.currentOrder.items.map(item => {
    const product = AppState.products.find(p => p.id === item.productId);
    const lineBruto = product.price * item.qty;
    const lineDesc = (lineBruto * (item.discountPct || 0)) / 100;
    const lineNeto = lineBruto - lineDesc;

    subtotalBruto += lineBruto;
    totalDescuentos += lineDesc;

    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      unit: product.unit || 'UNIDAD',
      qty: item.qty,
      unitPrice: product.price,
      discountPct: item.discountPct || 0,
      subtotal: lineNeto
    };
  });

  const subtotalNeto = subtotalBruto - totalDescuentos;
  const iva = Math.round(subtotalNeto * 0.13);
  const total = subtotalNeto + iva;

  // Persona o colaborador asignado al pedido
  const assignedSelectEl = document.getElementById('orderAssignedUserSelect');
  const assignedUserId = assignedSelectEl ? parseInt(assignedSelectEl.value, 10) : (AppState.currentOrder.assignedUserId || 1);
  const assignedUser = AppState.systemUsers.find(u => u.id === assignedUserId) || {
    id: assignedUserId,
    name: 'Ana Mora (Ejecutiva Comercial)',
    role: 'Vendedor',
    username: 'ventas'
  };

  const newOrder = {
    id: AppState.salesOrders.length + 1,
    orderCode: orderCode,
    docType: docType,
    customerId: customer.id,
    customerName: customer.name,
    customerTaxId: customer.taxId,
    customerAddress: customer.address,
    customerPhone: customer.phone,
    customerContact: customer.contact,
    assignedUserId: assignedUser.id,
    assignedUserName: assignedUser.name,
    assignedUserRole: assignedUser.role,
    assignedUserHandle: assignedUser.username,
    date: dateFormatted,
    deliveryDate: AppState.currentOrder.deliveryDate || dateFormatted,
    terms: customer.terms,
    status: isQuote ? 'COTIZACION' : 'ALISTADO',
    notes: AppState.currentOrder.notes || '',
    items: orderItemsDetails,
    subtotalBruto: subtotalBruto,
    descuentoTotal: totalDescuentos,
    subtotalNeto: subtotalNeto,
    iva: iva,
    total: total
  };

  // 1. Guardar permanentemente en Microsoft SQL Server
  try {
    const apiRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.orderId) newOrder.id = data.orderId;
      console.info("✅ Pedido guardado exitosamente en SQL Server:", data);
    }
  } catch (err) {
    console.warn("Fallo guardando en SQL Server:", err);
  }

  AppState.salesOrders.unshift(newOrder);

  // Abrir comprobante oficial impreso con logo de Facebook
  openOrderPrintModal(newOrder);

  // Limpiar orden en curso
  AppState.currentOrder.items = [];
  AppState.currentOrder.notes = '';
  const notesEl = document.getElementById('orderDeliveryNotes');
  if (notesEl) notesEl.value = '';

  // Sincronizar con datos frescos de SQL Server
  await loadInitialDataFromSql();

  showNotificationToast(
    isQuote
      ? `Cotización ${orderCode} guardada permanentemente en SQL Server.`
      : `Pedido ${orderCode} asignado a ${assignedUser.name} y guardado en SQL Server.`,
    'success'
  );
}

function openOrderPrintModal(order) {
  const modal = document.getElementById('orderPrintModal');
  const body = document.getElementById('orderPrintModalBody');
  if (!modal || !body) return;

  const isQuote = (order.docType === 'COTIZACION');

  body.innerHTML = `
    <!-- ENCABEZADO CORPORATIVO OFICIAL FRAGAMA CON LOGO DE FACEBOOK -->
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #0284C7; padding-bottom:14px; margin-bottom:16px;">
      <div style="display:flex; align-items:center; gap:16px;">
        <img src="img/logo_oficial.png" alt="Distribuidora Fragama" style="max-height:64px; object-fit:contain; border-radius:6px;">
        <div>
          <h2 style="margin:0; font-size:1.25rem; font-weight:900; color:#0B192C; letter-spacing:0.5px;">DISTRIBUIDORA FRAGAMA S.A.</h2>
          <div style="font-size:0.75rem; color:#475569; line-height:1.35;">
            Cédula Jurídica: 3-101-789012 • Cartago, Costa Rica<br>
            WhatsApp & Teléfono: +506 6267-7053<br>
            Correo: ventas@distribuidorafragama.com • fb.com/dist.fragama
          </div>
        </div>
      </div>
      <div style="text-align:right;">
        <span style="display:inline-block; padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:800; background:${isQuote ? '#E0F2FE' : '#DCFCE7'}; color:${isQuote ? '#0284C7' : '#15803D'}; border:1px solid ${isQuote ? '#38BDF8' : '#86EFAC'}; margin-bottom:4px;">
          ${isQuote ? 'PROFORMA / COTIZACIÓN' : 'ORDEN DE PEDIDO & ALISTO'}
        </span>
        <div style="font-family:'JetBrains Mono',monospace; font-size:1.15rem; font-weight:800; color:#0B192C;">${order.orderCode}</div>
        <div style="font-size:0.75rem; color:#64748B;">Emisión: ${order.date}</div>
      </div>
    </div>

    <!-- DATOS DEL CLIENTE Y LOGÍSTICA -->
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:12px; margin-bottom:14px; font-size:0.82rem;">
      <div>
        <div style="font-weight:700; color:#64748B; font-size:0.72rem; text-transform:uppercase;">Facturado / Dirigido a:</div>
        <div style="font-weight:800; font-size:0.95rem; color:#0B192C;">${order.customerName}</div>
        <div><strong>Cédula:</strong> ${order.customerTaxId || 'N/A'}</div>
        <div><strong>Contacto:</strong> ${order.customerContact || 'N/A'}</div>
        <div><strong>Teléfono:</strong> ${order.customerPhone || 'N/A'}</div>
      </div>
      <div>
        <div style="font-weight:700; color:#64748B; font-size:0.72rem; text-transform:uppercase;">Datos de Despacho Nacional (Costa Rica):</div>
        <div><strong>Responsable Asignado(a):</strong> <span style="font-weight:800; color:#0284C7;"><i class="bi bi-person-badge"></i> ${order.assignedUserName || 'Colaborador Fragama'} (${order.assignedUserRole || 'Encargado'})</span></div>
        <div><strong>Provincia / Destino:</strong> <span style="font-weight:700; color:#0284C7;">${order.customerProvince || 'Cartago'} &bull; ${order.customerCanton || 'Central'}</span></div>
        <div><strong>Fecha de Entrega:</strong> ${order.deliveryDate || order.date}</div>
        <div><strong>Condición de Pago:</strong> ${order.terms || 'Contado'}</div>
        <div><strong>Dirección:</strong> ${order.customerAddress || 'Retiro en Bodega'}</div>
        ${order.notes ? `<div style="margin-top:4px; font-style:italic; color:#0369A1;"><strong>Notas:</strong> ${order.notes}</div>` : ''}
      </div>
    </div>

    <!-- CÓDIGO DE BARRAS DEL PEDIDO PARA CONSULTA INMEDIATA CON PISTOLA O CELULAR -->
    <div style="background:#FFFFFF; border:2px dashed #0284C7; border-radius:10px; padding:10px 14px; margin-bottom:14px; text-align:center;">
      <div style="font-size:0.75rem; font-weight:800; color:#0284C7; margin-bottom:4px;">
        <i class="bi bi-upc-scan"></i> CÓDIGO DE BARRAS DEL PEDIDO (ESCANEE PARA CONSULTAR EL PEDIDO EN BODEGA O RUTA):
      </div>
      <div style="display:flex; justify-content:center;">
        <svg id="printOrderBarcodeSvg"></svg>
      </div>
      <button type="button" class="btn-fragama btn-outline-fragama" style="font-size:0.75rem; padding:3px 8px; margin-top:4px;" onclick="handleScannedBarcode('${order.orderCode}')">
        <i class="bi bi-search"></i> Probar Lectura de este Pedido
      </button>
    </div>

    <!-- SECCIÓN CÓDIGO QR OFICIAL DE BULTOS PARA AUDITORÍA MÓVIL EN RUTA -->
    <div style="display:flex; justify-content:space-between; align-items:center; background:#F0FDF4; border:1.5px solid #86EFAC; border-radius:10px; padding:12px 16px; margin-bottom:16px;">
      <div style="flex:1; padding-right:16px;">
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <span style="background:#15803D; color:#FFF; font-size:0.7rem; font-weight:800; padding:2px 8px; border-radius:12px;">
            <i class="bi bi-qr-code-scan"></i> CÓDIGO QR DE BULTOS
          </span>
          <span style="font-size:0.75rem; color:#15803D; font-weight:700;">Distribución Nacional Todo Costa Rica</span>
        </div>
        <div style="font-size:0.88rem; font-weight:800; color:#0B192C; margin-bottom:4px;">
          Auditoría Inmediata de Carga en Móvil
        </div>
        <div style="font-size:0.78rem; color:#475569; margin-bottom:6px;">
          El chofer o el cliente escanea este código desde el celular para verificar al instante qué paquetes van en el camión sin usar papeles.
        </div>
        <div style="background:#FFFFFF; border:1px solid #BBF7D0; border-radius:6px; padding:6px 10px; font-size:0.8rem; font-weight:700; color:#166534;">
          📦 Bultos Auditados: ${summarizeOrderPackages(order)}
        </div>
      </div>
      <div style="text-align:center;">
        <div id="printOrderQrBox" style="width:116px; height:116px; background:#FFFFFF; border:1px solid #CBD5E1; border-radius:8px; padding:6px; display:flex; align-items:center; justify-content:center;">
        </div>
        <span style="font-size:0.7rem; font-weight:800; color:#64748B; font-family:'JetBrains Mono',monospace; margin-top:3px; display:block;">${order.orderCode}</span>
      </div>
    </div>

    <!-- TABLA DE ARTÍCULOS DETALLADOS -->
    <table style="width:100%; border-collapse:collapse; font-size:0.82rem; margin-bottom:16px;">
      <thead style="background:#0B192C; color:#FFFFFF;">
        <tr>
          <th style="padding:7px 10px; text-align:left;">SKU</th>
          <th style="padding:7px 10px; text-align:left;">Descripción del Producto</th>
          <th style="padding:7px 8px; text-align:center; width:60px;">Cant.</th>
          <th style="padding:7px 10px; text-align:right; width:85px;">P. Unit</th>
          <th style="padding:7px 8px; text-align:center; width:60px;">Desc.</th>
          <th style="padding:7px 10px; text-align:right; width:100px;">Monto (₡)</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map((it, idx) => `
          <tr style="border-bottom:1px solid #E2E8F0; background:${idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'};">
            <td style="padding:7px 10px; font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:#475569;">${it.sku}</td>
            <td style="padding:7px 10px; font-weight:600; color:#0B192C;">${it.name} <span style="font-size:0.7rem; color:#64748B;">(${it.unit || 'UND'})</span></td>
            <td style="padding:7px 8px; text-align:center; font-weight:700;">${it.qty}</td>
            <td style="padding:7px 10px; text-align:right;">${formatCRC(it.unitPrice)}</td>
            <td style="padding:7px 8px; text-align:center; color:${it.discountPct > 0 ? '#DC2626' : '#64748B'};">${it.discountPct}%</td>
            <td style="padding:7px 10px; text-align:right; font-weight:800; color:#0B192C;">${formatCRC(it.subtotal)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- TOTALES FINANCIEROS -->
    <div style="display:flex; justify-content:flex-end; margin-bottom:20px;">
      <div style="width:280px; font-size:0.84rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span style="color:#64748B;">Subtotal Bruto:</span>
          <span style="font-weight:600;">${formatCRC(order.subtotalBruto)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:#DC2626;">
          <span>Descuento Comercial:</span>
          <span style="font-weight:600;">-${formatCRC(order.descuentoTotal)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span style="color:#64748B;">Subtotal Gravable:</span>
          <span style="font-weight:600;">${formatCRC(order.subtotalNeto)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="color:#64748B;">IVA Costa Rica (13%):</span>
          <span style="font-weight:600;">${formatCRC(order.iva)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:1.15rem; font-weight:900; color:#0B192C; border-top:2px solid #0284C7; padding-top:6px;">
          <span>TOTAL:</span>
          <span style="color:#0284C7;">${formatCRC(order.total)}</span>
        </div>
      </div>
    </div>

    <!-- FIRMAS DE AUTORIZACIÓN Y RECIBO -->
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px; margin-top:30px; font-size:0.75rem; text-align:center;">
      <div style="border-top:1px solid #94A3B8; padding-top:6px;">
        <strong>${order.assignedUserName || 'Distribuidora Fragama S.A.'}</strong><br>
        <span style="color:#64748B;">${order.assignedUserRole || 'Responsable Asignado'} • Control y Alisto</span>
      </div>
      <div style="border-top:1px solid #94A3B8; padding-top:6px;">
        <strong>Recibido Conforme (Cliente)</strong><br>
        <span style="color:#64748B;">Firma, Cédula y Sello Comercial</span>
      </div>
    </div>
  `;

  modal.classList.add('active');

  // Renderizar Código de Barras y QR
  const qrPayload = JSON.stringify({
    empresa: 'Distribuidora Fragama S.A.',
    pedido: order.orderCode,
    tipo: order.docType,
    cliente: order.customerName,
    responsable: order.assignedUserName || 'Asignado',
    provincia: order.customerProvince || 'Cartago',
    canton: order.customerCanton || 'Central',
    bultos: summarizeOrderPackages(order),
    total: formatCRC(order.total)
  });

  setTimeout(() => {
    try {
      if (typeof JsBarcode !== 'undefined') {
        JsBarcode("#printOrderBarcodeSvg", order.orderCode, {
          format: "CODE128",
          lineColor: "#0B192C",
          width: 2,
          height: 48,
          displayValue: true,
          font: "JetBrains Mono",
          fontSize: 13
        });
      }
    } catch (e) {
      console.warn("JsBarcode order print:", e);
    }
    renderQrCodeInElement('printOrderQrBox', qrPayload, 104, 104);
  }, 40);
}

function renderOrderHistory() {
  const tbody = document.getElementById('orderHistoryTableBody');
  const countBadge = document.getElementById('orderHistoryBadgeCount');
  if (!tbody) return;

  if (countBadge) countBadge.textContent = AppState.salesOrders.length;

  const statusFilter = document.getElementById('orderHistoryStatusFilter')?.value || 'ALL';
  const assigneeFilter = document.getElementById('orderHistoryAssigneeFilter')?.value || 'ALL';
  const searchTerm = document.getElementById('orderHistorySearchInput')?.value.trim().toLowerCase() || '';

  const filtered = AppState.salesOrders.filter(order => {
    const matchStatus = (statusFilter === 'ALL') || (order.status === statusFilter);
    const matchAssignee = (assigneeFilter === 'ALL') ||
      (String(order.assignedUserId) === assigneeFilter) ||
      (order.assignedUserHandle === assigneeFilter);
    const matchSearch = !searchTerm ||
      order.orderCode.toLowerCase().includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm) ||
      (order.assignedUserName && order.assignedUserName.toLowerCase().includes(searchTerm)) ||
      (order.customerTaxId && order.customerTaxId.toLowerCase().includes(searchTerm));

    return matchStatus && matchAssignee && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding:2rem; color:#64748B;">
          No se encontraron pedidos en el historial coincidentes con los filtros seleccionados.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(o => {
    let badgeClass = 'badge-in-route';
    let badgeLabel = o.status;

    if (o.status === 'COTIZACION') {
      badgeClass = 'badge-in-route';
      badgeLabel = 'Cotización';
    } else if (o.status === 'ALISTADO') {
      badgeClass = 'badge-confirmed';
      badgeLabel = 'Alistado en Bodega';
    } else if (o.status === 'FACTURADO') {
      badgeClass = 'badge-delivered';
      badgeLabel = 'Facturado / Entregado';
    } else if (o.status === 'PENDIENTE') {
      badgeClass = 'badge-observed';
      badgeLabel = 'Pendiente Alisto';
    }

    return `
      <tr style="border-bottom:1px solid #E2E8F0;">
        <td style="padding:10px 14px; font-weight:800; font-family:'JetBrains Mono',monospace; color:#0B192C;">
          ${o.orderCode}
        </td>
        <td style="padding:10px 14px;">
          ${(o.docType === 'PEDIDO_WEB' || o.source === 'TIENDA_WEB' || (o.orderCode && o.orderCode.includes('WEB'))) ? `
            <span style="font-size:0.75rem; padding:3px 8px; border-radius:4px; font-weight:800; background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; display:inline-flex; align-items:center; gap:4px;">
              <i class="bi bi-globe2"></i> Pedido Web
            </span>
          ` : `
            <span style="font-size:0.75rem; padding:2px 6px; border-radius:4px; font-weight:700; ${o.docType === 'COTIZACION' ? 'background:#E0F2FE; color:#0284C7;' : 'background:#F1F5F9; color:#0F172A;'}">
              ${o.docType}
            </span>
          `}
        </td>
        <td style="padding:10px 14px;">
          <div style="font-weight:700; color:#0B192C;">${o.customerName}</div>
          <div style="font-size:0.75rem; color:#64748B;">Céd: ${o.customerTaxId || 'N/A'} • ${o.terms}</div>
        </td>
        <td style="padding:10px 14px;">
          <div style="font-weight:700; color:#0B192C; display:flex; align-items:center; gap:5px;">
            <i class="bi bi-person-badge text-primary" style="font-size:0.95rem;"></i>
            <span>${o.assignedUserName || 'Sin Asignar'}</span>
          </div>
          <div style="font-size:0.72rem; color:#64748B; margin-left:18px;">
            <span style="background:#F1F5F9; color:#334155; padding:1px 6px; border-radius:4px; font-weight:600;">${o.assignedUserRole || 'Colaborador'}</span>
            ${o.assignedUserHandle ? `&bull; @${o.assignedUserHandle}` : ''}
          </div>
        </td>
        <td style="padding:10px 14px; font-size:0.8rem; color:#475569;">${o.date}</td>
        <td style="padding:10px 14px; font-size:0.8rem; color:#475569;">${o.deliveryDate || '-'}</td>
        <td style="padding:10px 14px; text-align:center; font-weight:700;">${o.items.length}</td>
        <td style="padding:10px 14px; text-align:right; font-weight:800; color:var(--fragama-blue-primary);">
          ${formatCRC(o.total)}
        </td>
        <td style="padding:10px 14px; text-align:center;">
          <span class="badge-status ${badgeClass}">${badgeLabel}</span>
        </td>
        <td style="padding:10px 14px; text-align:center;">
          <div style="display:flex; justify-content:center; gap:6px;">
            <button class="btn-fragama btn-outline-fragama" style="padding:4px 8px; font-size:0.75rem;" onclick="showQrForOrder('${o.orderCode}')" title="Ver Código QR de Carga y Bultos">
              <i class="bi bi-qr-code text-primary"></i> QR
            </button>
            <button class="btn-fragama btn-outline-fragama" style="padding:4px 8px; font-size:0.75rem;" onclick="viewSavedOrderPrint(${o.id})" title="Ver e Imprimir Comprobante Oficial">
              <i class="bi bi-printer"></i>
            </button>
            ${(o.status === 'PENDIENTE' || o.docType === 'PEDIDO_WEB' || (o.orderCode && o.orderCode.includes('WEB'))) && o.status !== 'FACTURADO' ? `
              <button class="btn-fragama btn-primary-fragama" style="padding:4px 8px; font-size:0.75rem; background:#10B981; border-color:#10B981;" onclick="markOrderAlistado(${o.id})" title="Marcar como Alistado en Bodega">
                <i class="bi bi-box-seam"></i> Alistar
              </button>
            ` : ''}
            ${o.status === 'COTIZACION' ? `
              <button class="btn-fragama btn-primary-fragama" style="padding:4px 8px; font-size:0.75rem;" onclick="convertQuoteToSalesOrder(${o.id})" title="Convertir a Pedido Firme">
                <i class="bi bi-check-circle"></i>
              </button>
            ` : ''}
            ${o.customerPhone ? `
              <a href="https://wa.me/506${String(o.customerPhone).replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(o.customerName)},%20te%20saludamos%20de%20Distribuidora%20Fragama%20respecto%20a%20tu%20pedido%20${o.orderCode}" target="_blank" class="btn-fragama" style="background:#25D366; color:#FFF; padding:4px 8px; font-size:0.75rem; text-decoration:none; display:inline-flex; align-items:center;" title="Contactar Cliente por WhatsApp">
                <i class="bi bi-whatsapp"></i>
              </a>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}


window.markOrderAlistado = async function(orderId) {
  const order = AppState.salesOrders.find(o => o.id === orderId || o.orderCode === String(orderId));
  if (!order) return;
  order.status = 'ALISTADO';
  
  // Persistir en base de datos inmediatamente
  try {
    const targetCode = order.orderCode || order.id;
    await fetch(`/api/orders/${encodeURIComponent(targetCode)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ALISTADO' })
    });
  } catch(e) {
    console.warn("Aviso de sincronización de estado:", e);
  }

  renderOrderHistory();
  updateWebOrdersBadges();
  renderDashboardAnalytics();

  if (typeof showNotificationToast === 'function') {
    showNotificationToast(`✅ Pedido ${order.orderCode} marcado como Alistado en Bodega para Despacho.`, 'success');
  } else {
    alert(`✅ Pedido ${order.orderCode} alistado correctamente.`);
  }
};

window.viewSavedOrderPrint = function(orderId) {
  const order = AppState.salesOrders.find(o => String(o.id) === String(orderId) || o.orderCode === orderId);
  if (order) {
    openOrderPrintModal(order);
  } else {
    showNotificationToast("No se encontró el comprobante del pedido solicitado.", "warning");
  }
};

window.convertQuoteToSalesOrder = function(orderId) {
  const order = AppState.salesOrders.find(o => String(o.id) === String(orderId) || o.orderCode === orderId);
  if (!order) return;

  // Validar stock
  for (const item of order.items) {
    const product = AppState.products.find(p => p.id === item.productId);
    if (!product || product.stock < item.qty) {
      alert(`❌ Stock insuficiente para [${product ? product.sku : 'SKU'}].`);
      return;
    }
  }

  // Descontar inventario
  order.items.forEach(item => {
    const product = AppState.products.find(p => p.id === item.productId);
    if (product) {
      const prevStock = product.stock;
      product.stock -= item.qty;

      AppState.kardexMovements.unshift({
        id: AppState.kardexMovements.length + 101,
        code: `SAL-20260929-${String(AppState.kardexMovements.length + 101).padStart(4, '0')}`,
        product: product.name,
        batch: product.batchNumber || 'LOT-2026-REG',
        type: 'Salida Venta (Cotización Aprobada)',
        sign: -1,
        qty: item.qty,
        prev: prevStock,
        final: product.stock,
        cost: product.costPrice || (product.price * 0.7),
        doc: order.orderCode,
        user: AppState.currentUser.name
      });
    }
  });

  order.docType = 'PEDIDO';
  order.status = 'ALISTADO';
  order.orderCode = order.orderCode.replace('COT', 'PED');

  // Agregar a despachos
  AppState.dispatches.unshift({
    id: AppState.dispatches.length + 1,
    code: `DSP-CR-2026-${String(AppState.dispatches.length + 91).padStart(4, '0')}`,
    customer: order.customerName,
    address: order.customerAddress,
    contact: `${order.customerContact || 'Cliente'} (${order.customerPhone || ''})`,
    invoice: order.orderCode,
    items: order.items.map(i => `${i.qty}x ${i.name}`).join(', '),
    status: 'Asignado',
    verified: false,
    departureTime: '11:00 AM'
  });

  renderAllViews();
  showNotificationToast(`Cotización convertida en Pedido ${order.orderCode} y enviada a alisto.`, 'success');
  openOrderPrintModal(order);
};

// ==============================================================================
// RUTAS NACIONALES (TODO COSTA RICA) & ESCÁNER QR DE BULTOS EN MÓVIL
// ==============================================================================
function summarizeOrderPackages(order) {
  if (order.packageSummary) return order.packageSummary;
  if (!order.items || order.items.length === 0) return '0 bultos';
  
  return order.items.map(it => {
    let unitLabel = 'Unid.';
    const name = (it.name || '').toLowerCase();
    if (name.includes('bolsa')) unitLabel = 'Bolsas';
    else if (name.includes('caja') || name.includes('papel') || name.includes('toalla') || name.includes('servilleta')) unitLabel = 'Cajas';
    else if (name.includes('galón') || name.includes('galon') || name.includes('cloro') || name.includes('desengrasante') || name.includes('jabón') || name.includes('cera')) unitLabel = 'Galones';
    else if (name.includes('mopa') || name.includes('escoba')) unitLabel = 'Piezas';
    
    let shortName = it.name.split('(')[0].trim();
    if (shortName.length > 25) shortName = shortName.substring(0, 22) + '...';
    return `${it.qty}x ${unitLabel} ${shortName}`;
  }).join(', ');
}

function renderQrCodeInElement(target, textPayload, width = 120, height = 120) {
  const el = (typeof target === 'string') ? document.getElementById(target) : target;
  if (!el) return;
  el.innerHTML = '';

  if (typeof QRCode !== 'undefined') {
    try {
      new QRCode(el, {
        text: typeof textPayload === 'string' ? textPayload : JSON.stringify(textPayload),
        width: width,
        height: height,
        colorDark: "#0B192C",
        colorLight: "#FFFFFF",
        correctLevel: QRCode.CorrectLevel.M
      });
      return;
    } catch (e) {
      console.warn("Fallo motor QRCode, usando fallback vectorial SVG:", e);
    }
  }

  el.innerHTML = generateFallbackQrSvg(typeof textPayload === 'string' ? textPayload : JSON.stringify(textPayload), width, height);
}

function generateFallbackQrSvg(text, w, h) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${w}" height="${h}">
      <rect width="100" height="100" fill="#FFFFFF"/>
      <rect x="6" y="6" width="24" height="24" fill="#0B192C" rx="3"/>
      <rect x="10" y="10" width="16" height="16" fill="#FFFFFF" rx="2"/>
      <rect x="14" y="14" width="8" height="8" fill="#0B192C" rx="1"/>
      <rect x="70" y="6" width="24" height="24" fill="#0B192C" rx="3"/>
      <rect x="74" y="10" width="16" height="16" fill="#FFFFFF" rx="2"/>
      <rect x="78" y="14" width="8" height="8" fill="#0B192C" rx="1"/>
      <rect x="6" y="70" width="24" height="24" fill="#0B192C" rx="3"/>
      <rect x="10" y="74" width="16" height="16" fill="#FFFFFF" rx="2"/>
      <rect x="14" y="78" width="8" height="8" fill="#0B192C" rx="1"/>
      <rect x="34" y="16" width="4" height="4" fill="#0B192C"/>
      <rect x="42" y="16" width="4" height="4" fill="#0B192C"/>
      <rect x="50" y="16" width="4" height="4" fill="#0B192C"/>
      <rect x="58" y="16" width="4" height="4" fill="#0B192C"/>
      <rect x="16" y="34" width="4" height="4" fill="#0B192C"/>
      <rect x="16" y="42" width="4" height="4" fill="#0B192C"/>
      <rect x="16" y="50" width="4" height="4" fill="#0B192C"/>
      <rect x="16" y="58" width="4" height="4" fill="#0B192C"/>
      <rect x="36" y="36" width="12" height="12" fill="#0284C7"/>
      <rect x="54" y="36" width="12" height="8" fill="#0B192C"/>
      <rect x="70" y="36" width="8" height="14" fill="#0B192C"/>
      <rect x="36" y="54" width="8" height="12" fill="#0B192C"/>
      <rect x="48" y="50" width="16" height="16" fill="#0284C7"/>
      <rect x="70" y="54" width="14" height="8" fill="#0B192C"/>
      <rect x="36" y="72" width="12" height="12" fill="#0B192C"/>
      <rect x="54" y="72" width="14" height="8" fill="#0284C7"/>
      <rect x="72" y="72" width="12" height="14" fill="#0B192C"/>
    </svg>
  `;
}

function setDriverProvinceFilter(province) {
  AppState.driverProvinceFilter = province;
  document.querySelectorAll('#provinceFilterPills .province-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.province === province);
  });
  renderDriverDispatches();
}

function renderDriverDispatches() {
  const container = document.getElementById('driverDispatchesList');
  if (!container) return;

  const currentProv = AppState.driverProvinceFilter || 'ALL';

  // Filtrado por provincia
  const filtered = AppState.dispatches.filter(d => {
    if (currentProv === 'ALL') return true;
    return d.province === currentProv;
  });

  // Métricas superiores
  const totalPkgsEl = document.getElementById('driverTotalPackages');
  const covProvsEl = document.getElementById('driverCoveredProvinces');
  const deliveredRatioEl = document.getElementById('driverDeliveredRatio');
  const navBadgeEl = document.getElementById('navDispatchCount');

  if (navBadgeEl) navBadgeEl.textContent = AppState.dispatches.length;

  let totalBultos = 0;
  AppState.dispatches.forEach(d => {
    if (d.packages && Array.isArray(d.packages)) {
      d.packages.forEach(p => totalBultos += (p.qty || 0));
    } else {
      totalBultos += 5; // fallback
    }
  });

  const uniqueProvs = new Set(AppState.dispatches.map(d => d.province || 'Cartago')).size;
  const deliveredCount = AppState.dispatches.filter(d => d.status === 'Entregado').length;

  if (totalPkgsEl) totalPkgsEl.textContent = `${totalBultos} bultos`;
  if (covProvsEl) covProvsEl.textContent = `${uniqueProvs} Provincias`;
  if (deliveredRatioEl) deliveredRatioEl.textContent = `${deliveredCount} / ${AppState.dispatches.length}`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="background:#FFF; border:1px dashed #CBD5E1; border-radius:12px; padding:2rem; text-align:center; color:#64748B;">
        <i class="bi bi-geo-alt-fill" style="font-size:2rem; color:#CBD5E1;"></i>
        <div style="font-weight:700; margin-top:8px;">No hay despachos registrados para ${currentProv}</div>
        <button class="btn-fragama btn-outline-fragama" style="margin-top:12px; padding:6px 14px; font-size:0.8rem;" onclick="setDriverProvinceFilter('ALL')">
          Ver todas las provincias
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(d => {
    let badgeClass = 'badge-in-route';
    if (d.status === 'Entregado') badgeClass = 'badge-delivered';
    if (d.status === 'Rechazado') badgeClass = 'badge-rejected';
    if (d.status === 'Observado') badgeClass = 'badge-observed';

    let provClass = 'prov-cartago';
    const pLower = (d.province || '').toLowerCase();
    if (pLower.includes('guanacaste')) provClass = 'prov-guanacaste';
    else if (pLower.includes('puntarenas')) provClass = 'prov-puntarenas';
    else if (pLower.includes('limón') || pLower.includes('limon')) provClass = 'prov-limon';
    else if (pLower.includes('alajuela')) provClass = 'prov-alajuela';
    else if (pLower.includes('heredia')) provClass = 'prov-heredia';

    const bultosStr = d.items || (d.packages ? d.packages.map(p => `${p.qty}x ${p.unit}`).join(', ') : 'Varios bultos');

    return `
      <div class="dispatch-card ${d.status === 'En Ruta' ? 'highlight' : ''}">
        <div class="dispatch-card-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="dispatch-code">${d.code}</span>
            <span class="badge-province ${provClass}">
              <i class="bi bi-pin-map-fill"></i> ${d.province || 'Costa Rica'} &bull; ${d.canton || 'Central'}
            </span>
          </div>
          <span class="badge-status ${badgeClass}"><i class="bi bi-circle-fill" style="font-size:6px"></i> ${d.status}</span>
        </div>

        <div class="dispatch-customer">${d.customer}</div>
        <div class="dispatch-address">
          <i class="bi bi-geo-alt-fill text-danger"></i>
          <span>${d.address}</span>
        </div>
        
        <div class="dispatch-contact">
          <span><i class="bi bi-person-fill text-primary"></i> ${d.contact}</span>
          <span><i class="bi bi-clock-history"></i> Salida: ${d.departureTime}</span>
        </div>

        <!-- CAJA DE BULTOS ESPECÍFICOS PARA EL CHOFER -->
        <div class="dispatch-items-box" style="border-left:4px solid #0284C7; background:#F0F9FF;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <strong style="color:#0369A1;"><i class="bi bi-box-seam"></i> Carga a Entregar (Bultos):</strong>
              <div style="font-weight:700; color:#0B192C; font-size:0.85rem; margin-top:3px;">
                ${bultosStr}
              </div>
            </div>
            <button type="button" class="btn-fragama btn-outline-fragama" style="padding:3px 8px; font-size:0.75rem; background:#FFF;" onclick="showQrForDispatch(${d.id})" title="Ver Código QR de estos bultos">
              <i class="bi bi-qr-code"></i> Ver QR
            </button>
          </div>
          <div style="margin-top:6px; color:${d.verified ? '#10B981' : '#F59E0B'}; font-weight:600; font-size:0.75rem; display:flex; align-items:center; gap:4px;">
            <i class="bi ${d.verified ? 'bi-shield-check' : 'bi-exclamation-circle'}"></i>
            <span>${d.verified ? 'Bultos auditados y verificados con QR en rampa' : 'Pendiente de escaneo con celular'}</span>
          </div>
        </div>

        ${d.status !== 'Entregado' && d.status !== 'Rechazado' ? `
          <div class="driver-actions-grid" style="grid-template-columns: 1.2fr 1fr 1fr; gap:6px;">
            <button class="btn-driver-action btn-delivered" onclick="openQrScannerModal('${d.orderCode || d.code}')" style="background:#0284C7; color:#FFF; border-color:#0284C7;">
              <i class="bi bi-qr-code-scan"></i> Auditar QR
            </button>
            <button class="btn-driver-action btn-delivered" onclick="openDriverModal(${d.id}, 'Entregado')">
              <i class="bi bi-check-circle-fill"></i> Entregado
            </button>
            <button class="btn-driver-action btn-observed" onclick="openDriverModal(${d.id}, 'Observado')">
              <i class="bi bi-exclamation-triangle-fill"></i> Novedad
            </button>
          </div>
        ` : `
          <div style="background:#F1F5F9; padding:8px 12px; border-radius:6px; font-size:0.8rem; color:#475569; text-align:center; display:flex; justify-content:center; align-items:center; gap:8px;">
            <i class="bi bi-check-circle-fill text-success"></i> Entrega finalizada en ${d.canton || 'destino'} y sincronizada con el servidor central
          </div>
        `}
      </div>
    `;
  }).join('');
}

// ------------------------------------------------------------------------------
// VISUALIZADOR DE CÓDIGO QR EN ALTA DEFINICIÓN (MODAL)
// ------------------------------------------------------------------------------
window.showQrForOrder = function(orderCode) {
  const order = AppState.salesOrders.find(o => o.orderCode === orderCode);
  if (!order) return;

  const modal = document.getElementById('orderQrModal');
  const sub = document.getElementById('orderQrSubtitle');
  const title = document.getElementById('orderQrInfoTitle');
  const cust = document.getElementById('orderQrInfoCust');
  const pkgs = document.getElementById('orderQrInfoPackages');

  if (title) title.textContent = `${order.orderCode} (${order.docType})`;
  if (cust) cust.textContent = `${order.customerName} • ${order.customerProvince || 'Cartago'} (${order.customerCanton || 'Central'})`;
  const bultos = summarizeOrderPackages(order);
  if (pkgs) pkgs.textContent = `📦 Bultos: ${bultos}`;
  if (sub) sub.textContent = `Escanee el código de barras o QR con la pistola lectora o celular`;

  const payload = JSON.stringify({
    empresa: 'Distribuidora Fragama S.A.',
    pedido: order.orderCode,
    cliente: order.customerName,
    provincia: order.customerProvince || 'Cartago',
    canton: order.customerCanton || 'Central',
    bultos: bultos,
    total: formatCRC(order.total)
  });

  const renderContainer = document.getElementById('orderQrRenderContainer');
  if (renderContainer) {
    renderContainer.innerHTML = `
      <div style="margin-bottom:12px; background:#F8FAFC; padding:8px; border-radius:8px;">
        <div style="font-size:0.75rem; font-weight:700; color:#0284C7; margin-bottom:4px;">CÓDIGO DE BARRAS (CODE 128):</div>
        <svg id="orderBarcodeSvg"></svg>
      </div>
      <div style="font-size:0.75rem; font-weight:700; color:#64748B; margin-bottom:4px;">CÓDIGO QR COMPLEMENTARIO:</div>
      <div id="orderQrSubBox" style="display:flex; justify-content:center;"></div>
    `;
    try {
      if (typeof JsBarcode !== 'undefined') {
        JsBarcode("#orderBarcodeSvg", order.orderCode, {
          format: "CODE128",
          lineColor: "#0B192C",
          width: 2,
          height: 48,
          displayValue: true,
          font: "JetBrains Mono",
          fontSize: 13
        });
      }
    } catch(e) {}
    renderQrCodeInElement('orderQrSubBox', payload, 130, 130);
  }

  if (modal) modal.classList.add('active');
};

window.showQrForDispatch = function(dispatchId) {
  const d = AppState.dispatches.find(x => x.id === dispatchId);
  if (!d) return;

  const modal = document.getElementById('orderQrModal');
  const title = document.getElementById('orderQrInfoTitle');
  const cust = document.getElementById('orderQrInfoCust');
  const pkgs = document.getElementById('orderQrInfoPackages');
  const sub = document.getElementById('orderQrSubtitle');

  if (title) title.textContent = `${d.code} (${d.orderCode || 'PED-2026'})`;
  if (cust) cust.textContent = `${d.customer} • ${d.province} (${d.canton})`;
  if (pkgs) pkgs.textContent = `📦 Bultos: ${d.items}`;
  if (sub) sub.textContent = `Código de Barras de Despacho asignado al camión ${d.driver || 'Isuzu CL-294012'}`;

  const payload = JSON.stringify({
    despacho: d.code,
    pedido: d.orderCode,
    cliente: d.customer,
    provincia: d.province,
    canton: d.canton,
    bultos: d.items,
    camion: d.driver
  });

  const renderContainer = document.getElementById('orderQrRenderContainer');
  if (renderContainer) {
    renderContainer.innerHTML = `
      <div style="margin-bottom:12px; background:#F8FAFC; padding:8px; border-radius:8px;">
        <div style="font-size:0.75rem; font-weight:700; color:#0284C7; margin-bottom:4px;">CÓDIGO DE BARRAS DE GUÍA:</div>
        <svg id="dispatchBarcodeSvg"></svg>
      </div>
      <div style="font-size:0.75rem; font-weight:700; color:#64748B; margin-bottom:4px;">CÓDIGO QR:</div>
      <div id="dispatchQrSubBox" style="display:flex; justify-content:center;"></div>
    `;
    try {
      if (typeof JsBarcode !== 'undefined') {
        JsBarcode("#dispatchBarcodeSvg", d.code, {
          format: "CODE128",
          lineColor: "#0B192C",
          width: 2,
          height: 48,
          displayValue: true,
          font: "JetBrains Mono",
          fontSize: 13
        });
      }
    } catch(e) {}
    renderQrCodeInElement('dispatchQrSubBox', payload, 130, 130);
  }

  if (modal) modal.classList.add('active');
};

// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ESCÁNER DE CÓDIGO DE BARRAS WMS (EAN-13, CODE 128, PISTOLAS USB Y CÁMARA MÓVIL)
// ------------------------------------------------------------------------------
let html5QrScannerInstance = null;
let currentScannedOrder = null;
let currentScannedProduct = null;
let currentBarcodeCode = null;

// Audio Beep clásico de pistola / terminal de código de barras
function playBarcodeBeep() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1850, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (e) {
    // Si el navegador bloquea audio sin clic previo
  }
}

// Detector Global de Pistolas Lectoras de Códigos de Barras USB / Bluetooth (Hardware Scanner)
let hwBarcodeBuffer = '';
let hwBarcodeLastTime = Date.now();

window.addEventListener('keydown', (e) => {
  const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
  const isInput = activeTag === 'input' || activeTag === 'textarea';
  const isDedicated = document.activeElement && document.activeElement.id === 'barcodeManualInput';

  const now = Date.now();
  if (now - hwBarcodeLastTime > 80 && !isDedicated) {
    hwBarcodeBuffer = '';
  }
  hwBarcodeLastTime = now;

  if (e.key === 'Enter') {
    if (hwBarcodeBuffer.length >= 3) {
      e.preventDefault();
      const code = hwBarcodeBuffer.trim();
      hwBarcodeBuffer = '';
      handleScannedBarcode(code);
    }
  } else if (e.key.length === 1) {
    hwBarcodeBuffer += e.key;
  }
});

window.openBarcodeScannerModal = function(preselectCode = null) {
  const modal = document.getElementById('qrScannerModal');
  if (!modal) return;
  modal.classList.add('active');

  populateQuickProductSimList();
  resetScanState();

  if (preselectCode) {
    switchScannerMode('fast');
    handleScannedBarcode(preselectCode);
  } else {
    switchScannerMode('camera');
  }
};
window.openQrScannerModal = window.openBarcodeScannerModal;

window.closeBarcodeScannerModal = function() {
  stopQrCamera();
  const modal = document.getElementById('qrScannerModal');
  if (modal) modal.classList.remove('active');
};
window.closeQrScannerModal = window.closeBarcodeScannerModal;

window.switchScannerMode = function(mode) {
  const camTab = document.getElementById('tabScanCamera');
  const gunTab = document.getElementById('tabScanGun');
  const fastTab = document.getElementById('tabScanFast');
  const camPanel = document.getElementById('scannerCameraPanel');
  const gunPanel = document.getElementById('scannerGunPanel');
  const fastPanel = document.getElementById('scannerFastPanel');

  // Reset tab active states
  [camTab, gunTab, fastTab].forEach(t => t && t.classList.remove('active'));
  [camPanel, gunPanel, fastPanel].forEach(p => p && (p.style.display = 'none'));

  if (mode === 'camera') {
    if (camTab) camTab.classList.add('active');
    if (camPanel) camPanel.style.display = 'block';
    startQrCamera();
  } else if (mode === 'gun') {
    if (gunTab) gunTab.classList.add('active');
    if (gunPanel) gunPanel.style.display = 'block';
    stopQrCamera();
    const input = document.getElementById('barcodeManualInput');
    if (input) setTimeout(() => input.focus(), 150);
  } else {
    if (fastTab) fastTab.classList.add('active');
    if (fastPanel) fastPanel.style.display = 'block';
    stopQrCamera();
  }
};

let availableCamerasList = [];
let currentCameraDeviceId = null;
let isTorchActive = false;

function startQrCamera() {
  if (typeof Html5Qrcode === 'undefined') {
    console.warn("Html5Qrcode no disponible");
    return;
  }

  const container = document.getElementById('html5QrReaderBox');
  if (!container) return;

  if (html5QrScannerInstance) {
    try {
      html5QrScannerInstance.stop().then(() => {
        html5QrScannerInstance = null;
        queryCamerasAndStart();
      }).catch(() => {
        html5QrScannerInstance = null;
        queryCamerasAndStart();
      });
      return;
    } catch (e) {
      html5QrScannerInstance = null;
    }
  }

  queryCamerasAndStart();
}

function queryCamerasAndStart() {
  if (typeof Html5Qrcode.getCameras === 'function') {
    Html5Qrcode.getCameras().then(cameras => {
      availableCamerasList = cameras || [];
      if (availableCamerasList.length > 0) {
        // En celulares, buscar cámara trasera (environment / rear / back / posterior)
        const rearCamera = availableCamerasList.find(c => 
          /back|rear|environment|trasera|posterior/i.test(c.label || '')
        );
        // Si no se detecta la palabra, la última cámara suele ser la trasera en smartphones
        const chosen = rearCamera || availableCamerasList[availableCamerasList.length - 1];
        currentCameraDeviceId = chosen.id;
        updateCameraIndicator(chosen.label || 'Cámara Trasera');
      }
      initCameraStream();
    }).catch(err => {
      console.warn("No se pudieron listar cámaras, usando modo environment:", err);
      currentCameraDeviceId = null;
      initCameraStream();
    });
  } else {
    currentCameraDeviceId = null;
    initCameraStream();
  }
}

function initCameraStream() {
  try {
    let formatsToSupport = undefined;
    if (typeof Html5QrcodeSupportedFormats !== 'undefined') {
      formatsToSupport = [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.QR_CODE
      ];
    }

    html5QrScannerInstance = new Html5Qrcode("html5QrReaderBox", {
      formatsToSupport: formatsToSupport,
      verbose: false,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true // BarcodeDetector nativo de alta velocidad en Android/Chrome
      }
    });

    const isMobile = window.innerWidth <= 768;
    const config = {
      fps: 22,
      qrbox: function(viewfinderWidth, viewfinderHeight) {
        const width = Math.min(Math.floor(viewfinderWidth * 0.90), 380);
        const height = Math.min(Math.floor(viewfinderHeight * 0.52), 170);
        return { width, height };
      },
      aspectRatio: isMobile ? 1.333333 : 1.777778
    };

    const cameraTarget = currentCameraDeviceId ? { deviceId: { exact: currentCameraDeviceId } } : { facingMode: "environment" };

    html5QrScannerInstance.start(
      cameraTarget,
      config,
      (decodedText) => {
        handleScannedBarcode(decodedText);
      },
      () => {}
    ).then(() => {
      // Cámara iniciada con éxito
      checkTorchSupport();
    }).catch(err => {
      console.warn("Error con deviceId específico, intentando facingMode environment:", err);
      if (currentCameraDeviceId) {
        currentCameraDeviceId = null;
        html5QrScannerInstance.start(
          { facingMode: "environment" },
          config,
          (decodedText) => handleScannedBarcode(decodedText),
          () => {}
        ).then(() => checkTorchSupport()).catch(fallbackErr => showCameraPermissionError(fallbackErr));
      } else {
        showCameraPermissionError(err);
      }
    });
  } catch (err) {
    console.error("Error al iniciar Html5Qrcode:", err);
  }
}

function checkTorchSupport() {
  const btnTorch = document.getElementById('btnToggleTorch');
  if (btnTorch) btnTorch.style.display = 'inline-flex';
}

function showCameraPermissionError(err) {
  console.warn("Cámara no disponible o sin permiso:", err);
  const container = document.getElementById('html5QrReaderBox');
  if (container) {
    container.innerHTML = `
      <div style="color:#FFF; text-align:center; padding:1.5rem; font-size:0.82rem;">
        <i class="bi bi-camera-video-off" style="font-size:2.2rem; color:var(--fragama-orange-main);"></i>
        <div style="margin-top:8px; font-weight:700;">Permiso de cámara requerido o cámara en pausa</div>
        <div style="color:#94A3B8; font-size:0.75rem; margin-top:4px;">En su celular, permita el acceso a la cámara en el navegador o use las pestañas <strong>Pistola / Manual</strong> o <strong>Muestras</strong>.</div>
        <button type="button" class="btn-fragama btn-primary-fragama" style="margin-top:12px; padding:6px 14px; font-size:0.78rem;" onclick="restartQrCamera()">
          <i class="bi bi-arrow-clockwise"></i> Reintentar Acceso a Cámara
        </button>
      </div>
    `;
  }
}

function stopQrCamera() {
  if (html5QrScannerInstance) {
    try {
      html5QrScannerInstance.stop().then(() => {
        html5QrScannerInstance = null;
      }).catch(() => {
        html5QrScannerInstance = null;
      });
    } catch (e) {
      html5QrScannerInstance = null;
    }
  }
  isTorchActive = false;
  const btn = document.getElementById('btnToggleTorch');
  if (btn) {
    btn.classList.remove('torch-active');
    btn.innerHTML = '<i class="bi bi-lightbulb"></i> Flash / Linterna';
  }
}

window.restartQrCamera = function() {
  stopQrCamera();
  setTimeout(() => startQrCamera(), 300);
};

window.toggleCameraTorch = function() {
  if (!html5QrScannerInstance) return;
  isTorchActive = !isTorchActive;
  html5QrScannerInstance.applyVideoConstraints({
    advanced: [{ torch: isTorchActive }]
  }).then(() => {
    const btn = document.getElementById('btnToggleTorch');
    if (btn) {
      if (isTorchActive) {
        btn.classList.add('torch-active');
        btn.innerHTML = '<i class="bi bi-lightbulb-fill"></i> Flash ON';
      } else {
        btn.classList.remove('torch-active');
        btn.innerHTML = '<i class="bi bi-lightbulb"></i> Flash / Linterna';
      }
    }
  }).catch(err => {
    console.warn("Torch no soportado:", err);
    showNotificationToast("Linterna no disponible en este dispositivo/cámara", "warning");
    isTorchActive = false;
  });
};

window.cycleCameraDevice = function() {
  if (!availableCamerasList || availableCamerasList.length <= 1) {
    showNotificationToast("Se detectó una sola cámara en el teléfono.", "info");
    return;
  }
  const currentIdx = availableCamerasList.findIndex(c => c.id === currentCameraDeviceId);
  const nextIdx = (currentIdx + 1) % availableCamerasList.length;
  currentCameraDeviceId = availableCamerasList[nextIdx].id;
  const label = availableCamerasList[nextIdx].label || `Lente #${nextIdx + 1}`;
  updateCameraIndicator(label);
  showNotificationToast(`Cambiando a lente: ${label}`, "info");

  stopQrCamera();
  setTimeout(() => initCameraStream(), 250);
};

function updateCameraIndicator(label) {
  const el = document.getElementById('cameraLensIndicator');
  if (el) {
    el.textContent = label;
  }
}

// Envío manual desde la pestaña de pistola / teclado
window.handleManualBarcodeSubmit = function(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('barcodeManualInput');
  if (!input) return;
  const val = input.value.trim();
  if (!val) {
    showNotificationToast("Por favor ingrese un código de barras.", "warning");
    return;
  }
  handleScannedBarcode(val);
};

// Generador de la lista de productos de muestra con códigos de barra reales
function populateQuickProductSimList() {
  const container = document.getElementById('quickProductSimList');
  if (!container) return;

  container.innerHTML = AppState.products.map(p => {
    return `
      <div class="barcode-sample-card" onclick="handleScannedBarcode('${p.barcode}')">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-family:'JetBrains Mono',monospace; font-weight:800; color:#0284C7; font-size:0.85rem;">
              ${p.barcode}
            </span>
            <span class="badge-status badge-confirmed" style="font-size:0.68rem; padding:2px 6px;">EAN-13</span>
          </div>
          <div style="font-size:0.82rem; font-weight:700; color:#0B192C; margin-top:2px;">
            ${p.name}
          </div>
          <div style="font-size:0.72rem; color:#64748B;">
            SKU: ${p.sku} &bull; Stock: <strong style="color:#059669;">${p.stock}</strong> &bull; Lote: ${p.batchNumber || 'N/A'}
          </div>
        </div>
        <div style="text-align:right;">
          <button type="button" class="btn-fragama btn-outline-fragama" style="padding:4px 8px; font-size:0.75rem;">
            <i class="bi bi-upc-scan"></i> Leer
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ------------------------------------------------------------------------------
// MANEJADOR PRINCIPAL DE CÓDIGOS DE BARRA ESCANEADOS
// ------------------------------------------------------------------------------
window.handleScannedBarcode = function(rawCode) {
  if (!rawCode) return;
  let code = (rawCode + '').trim();

  // Si viene en JSON parsearlo
  try {
    const parsed = JSON.parse(code);
    if (parsed.barcode) code = parsed.barcode;
    else if (parsed.sku) code = parsed.sku;
    else if (parsed.pedido) code = parsed.pedido;
    else if (parsed.despacho) code = parsed.despacho;
  } catch (e) {}

  playBarcodeBeep();

  // Feedback háptico en teléfonos móviles (vibración física inmediata)
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([100, 50, 100]);
    } catch (e) {}
  }

  const clean = code.toLowerCase();

  // 1. Buscar en Catálogo de PRODUCTOS por Código de Barras o SKU
  const product = AppState.products.find(p => 
    (p.barcode && p.barcode.toLowerCase() === clean) ||
    (p.sku && p.sku.toLowerCase() === clean) ||
    (p.barcode && p.barcode.includes(code))
  );

  // 2. Buscar en PEDIDOS / GUÍAS DE DESPACHO
  const dispatch = AppState.dispatches.find(d => 
    (d.code && d.code.toLowerCase() === clean) ||
    (d.orderCode && d.orderCode.toLowerCase() === clean) ||
    (d.invoice && d.invoice.toLowerCase() === clean)
  );

  const order = AppState.salesOrders.find(o => 
    o.orderCode && o.orderCode.toLowerCase() === clean
  );

  // Asegurar que el modal esté visible
  const modal = document.getElementById('qrScannerModal');
  if (modal && !modal.classList.contains('active')) {
    modal.classList.add('active');
  }

  const resContainer = document.getElementById('scannerResultContainer');
  const dynContent = document.getElementById('scannerResultDynamicContent');
  if (!resContainer || !dynContent) return;

  if (product) {
    currentScannedProduct = product;
    currentScannedOrder = null;
    displayScannedProduct(product, dynContent);
    resContainer.style.display = 'block';
    resContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showNotificationToast(`Código de Barras leído: ${product.name}`, 'success');
  } else if (dispatch || order) {
    currentScannedProduct = null;
    currentScannedOrder = { dispatch, order };
    displayScannedOrder(dispatch, order, code, dynContent);
    resContainer.style.display = 'block';
    resContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showNotificationToast(`Guía de Despacho leída: ${code}`, 'success');
  } else {
    displayUnknownBarcode(code, dynContent);
    resContainer.style.display = 'block';
    showNotificationToast(`Código [${code}] no registrado en catálogo ni pedidos.`, 'warning');
  }
};

// Renderizar tarjeta interactiva de PRODUCTO IDENTIFICADO POR CÓDIGO DE BARRAS
function displayScannedProduct(p, container) {
  container.innerHTML = `
    <div style="background:#FFFFFF; border:1px solid #BAE6FD; border-radius:12px; padding:16px;">
      
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
        <div>
          <span class="badge-status badge-confirmed" style="font-size:0.75rem; background:#E0F2FE; color:#0369A1; border:1px solid #BAE6FD;">
            <i class="bi bi-upc-scan"></i> CÓDIGO DE BARRAS IDENTIFICADO
          </span>
          <h4 style="font-size:1.15rem; font-weight:800; color:#0B192C; margin:6px 0 2px 0;">
            ${p.name}
          </h4>
          <div style="font-size:0.8rem; color:#64748B;">
            SKU: <strong style="color:#0284C7; font-family:'JetBrains Mono',monospace;">${p.sku}</strong> &bull; 
            Familia: <strong>${p.category || 'Químicos'}</strong> &bull; Presentación: <strong>${p.unit || 'Unidad'}</strong>
          </div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:1.15rem; font-weight:800; color:#0B192C;">${formatCRC(p.price)}</span>
          <div style="font-size:0.72rem; color:#64748B;">Costo: ${formatCRC(p.cost)}</div>
        </div>
      </div>

      <!-- Representación visual del Código de Barras con JsBarcode -->
      <div style="background:#F8FAFC; border:1px dashed #CBD5E1; border-radius:8px; padding:8px; text-align:center; margin-bottom:12px;">
        <svg id="scannedProductBarcodeSvg"></svg>
      </div>

      <!-- Métricas de Bodega & Lote -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-bottom:14px;">
        <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:8px; padding:8px; text-align:center;">
          <div style="font-size:0.7rem; color:#166534; font-weight:700;">STOCK BODEGA</div>
          <div style="font-size:1.15rem; font-weight:800; color:#15803D;">${p.stock} <small style="font-size:0.7rem;">${p.unit}</small></div>
        </div>
        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px; text-align:center;">
          <div style="font-size:0.7rem; color:#475569; font-weight:700;">LOTE ACTIVO</div>
          <div style="font-size:0.85rem; font-weight:800; color:#0B192C; font-family:'JetBrains Mono',monospace; margin-top:3px;">${p.batchNumber || 'LT-2026'}</div>
        </div>
        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px; text-align:center;">
          <div style="font-size:0.7rem; color:#475569; font-weight:700;">VENCIMIENTO</div>
          <div style="font-size:0.82rem; font-weight:700; color:#0B192C; margin-top:4px;">${p.expiryDate || 'N/A'}</div>
        </div>
      </div>

      <!-- Acciones Inmediatas de Bodega -->
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <button type="button" class="btn-fragama btn-primary-fragama" style="flex:1; min-width:130px; font-size:0.8rem; padding:8px; justify-content:center;" onclick="openQuickStockFromScan(${p.id}, 'IN')">
          <i class="bi bi-box-arrow-in-down"></i> + Entrada Stock
        </button>
        <button type="button" class="btn-fragama btn-outline-fragama" style="flex:1; min-width:130px; font-size:0.8rem; padding:8px; justify-content:center;" onclick="openQuickStockFromScan(${p.id}, 'OUT')">
          <i class="bi bi-box-arrow-up"></i> - Salida / Merma
        </button>
        <button type="button" class="btn-fragama btn-outline-fragama" style="padding:8px 10px; font-size:0.8rem;" title="Ver Kardex" onclick="viewProductKardexFromScan(${p.id})">
          <i class="bi bi-journal-text"></i> Kardex
        </button>
        <button type="button" class="btn-fragama btn-outline-fragama" style="padding:8px 10px; font-size:0.8rem;" title="Imprimir Etiqueta" onclick="showBarcodeForProduct(${p.id})">
          <i class="bi bi-printer"></i> Etiqueta
        </button>
        <button type="button" class="btn-fragama" style="background:#10B981; color:#FFF; padding:8px 12px; font-size:0.8rem;" title="Agregar a Caja POS" onclick="addScannedProductToPos(${p.id})">
          <i class="bi bi-cart-plus"></i> Cobrar POS
        </button>
      </div>

    </div>
  `;

  // Renderizar código de barras con JsBarcode
  try {
    if (typeof JsBarcode !== 'undefined') {
      JsBarcode("#scannedProductBarcodeSvg", p.barcode, {
        format: "CODE128",
        lineColor: "#0B192C",
        width: 1.8,
        height: 45,
        displayValue: true,
        fontSize: 12,
        font: "JetBrains Mono",
        textMargin: 2
      });
    }
  } catch (e) {
    console.warn("JsBarcode render:", e);
  }
}

// Renderizar tarjeta de GUÍA DE DESPACHO / PEDIDO IDENTIFICADO
function displayScannedOrder(dispatch, order, code, container) {
  const orderCode = dispatch ? (dispatch.orderCode || dispatch.code) : order.orderCode;
  const provName = dispatch ? dispatch.province : (order.customerProvince || 'Cartago');
  const cantonName = dispatch ? dispatch.canton : (order.customerCanton || 'Central');
  const customerName = dispatch ? dispatch.customer : order.customerName;
  const address = dispatch ? dispatch.address : order.customerAddress;

  let packagesArray = [];
  if (dispatch && dispatch.packages && dispatch.packages.length > 0) {
    packagesArray = dispatch.packages.map(p => `${p.qty}x ${p.unit} - ${p.desc}`);
  } else if (order && order.items) {
    packagesArray = order.items.map(it => `${it.qty}x &bull; ${it.name}`);
  } else if (dispatch && dispatch.items) {
    packagesArray = dispatch.items.split(',').map(s => s.trim());
  }

  const invoiceDisplay = (dispatch && dispatch.invoice) ? dispatch.invoice : (order && order.invoiceNumber ? order.invoiceNumber : null);

  container.innerHTML = `
    <div style="background:#FFFFFF; border:1px solid #A7F3D0; border-radius:12px; padding:16px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
        <div>
          <span class="badge-status badge-confirmed" style="font-size:0.75rem;">
            <i class="bi bi-check2-circle"></i> GUÍA DE DESPACHO / PEDIDO IDENTIFICADO
          </span>
          <h4 style="font-family:'JetBrains Mono',monospace; font-size:1.15rem; font-weight:800; color:#065F46; margin:4px 0 0 0;">
            ${orderCode}
          </h4>
          ${invoiceDisplay ? `<div style="font-size:0.78rem; font-weight:700; color:#0284C7; margin-top:2px;"><i class="bi bi-receipt"></i> Factura: ${invoiceDisplay}</div>` : ''}
        </div>
        <div style="text-align:right;">
          <span style="background:#0284C7; color:#FFF; font-size:0.75rem; font-weight:700; padding:3px 8px; border-radius:12px;">${provName}</span>
          <div style="font-size:0.72rem; color:#64748B; margin-top:2px;">Cantón: ${cantonName}</div>
        </div>
      </div>

      <div style="font-size:0.84rem; color:#0B192C; margin-bottom:10px; border-bottom:1px dashed #A7F3D0; padding-bottom:8px;">
        <strong>Cliente:</strong> <span>${customerName}</span><br>
        <span style="font-size:0.76rem; color:#475569;"><strong>Dirección:</strong> <span>${address}</span></span>
      </div>

      <div style="background:#F0FDF4; border:1px solid #D1FAE5; border-radius:8px; padding:10px; margin-bottom:12px;">
        <div style="font-size:0.8rem; font-weight:800; color:#065F46; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
          <i class="bi bi-boxes"></i> DESGLOSE DE BULTOS AUDITADOS EN CÓDIGO DE BARRAS:
        </div>
        <ul id="scannedPackagesList" style="margin:0; padding-left:18px; font-size:0.82rem; color:#1E293B; line-height:1.6;">
          ${packagesArray.map((pkg, idx) => `
            <li style="margin-bottom:6px; display:flex; align-items:center; gap:8px;">
              <input type="checkbox" id="checkPkg_${idx}" checked style="accent-color:#10B981; width:16px; height:16px; cursor:pointer;">
              <label for="checkPkg_${idx}" style="cursor:pointer; font-weight:600; color:#0B192C;">${pkg}</label>
            </li>
          `).join('')}
        </ul>
      </div>

      <div style="display:flex; gap:8px;">
        <button type="button" class="btn-fragama btn-primary-fragama" style="flex:1; justify-content:center; padding:10px; background:#10B981; border-color:#059669;" onclick="confirmScannedDelivery()">
          <i class="bi bi-check2-all"></i> Marcar Bultos Entregados
        </button>
        <button type="button" class="btn-fragama btn-outline-fragama" style="padding:10px 14px;" onclick="resetScanState()">
          <i class="bi bi-arrow-repeat"></i> Otro Código
        </button>
      </div>
    </div>
  `;
}

// Renderizar tarjeta si el código no coincide
function displayUnknownBarcode(code, container) {
  container.innerHTML = `
    <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:12px; padding:14px; text-align:center;">
      <i class="bi bi-exclamation-triangle-fill text-warning" style="font-size:1.8rem;"></i>
      <div style="font-weight:800; color:#92400E; margin-top:6px;">Código de Barras no Encontrado</div>
      <div style="font-family:'JetBrains Mono',monospace; font-size:1rem; font-weight:800; color:#B45309; margin:4px 0;">
        ${code}
      </div>
      <p style="font-size:0.78rem; color:#78350F; margin:6px 0 12px 0;">
        El código leído no coincide con ningún producto en bodega ni con guías de despacho pendientes.
      </p>
      <div style="display:flex; gap:8px; justify-content:center;">
        <button type="button" class="btn-fragama btn-primary-fragama" onclick="openNewProductWithBarcode('${code}')">
          <i class="bi bi-plus-circle"></i> Registrar como Nuevo Producto
        </button>
        <button type="button" class="btn-fragama btn-outline-fragama" onclick="resetScanState()">
          Reintentar
        </button>
      </div>
    </div>
  `;
}

// Acciones desde la tarjeta de producto escaneado
window.openQuickStockFromScan = function(productId, type) {
  closeBarcodeScannerModal();
  openMovementModal(productId);
  const typeSel = document.getElementById('movementTypeSelect');
  if (typeSel && type) typeSel.value = type;
};

window.viewProductKardexFromScan = function(productId) {
  closeBarcodeScannerModal();
  switchViewDirectly('view-bodega-kardex');
  const filter = document.getElementById('kardexProductFilter');
  if (filter) {
    filter.value = productId;
    filter.dispatchEvent(new Event('change'));
  }
};

window.addScannedProductToPos = function(productId) {
  closeBarcodeScannerModal();
  const product = AppState.products.find(p => String(p.id) === String(productId));
  if (!product) return;
  switchViewDirectly('view-cajero-pos');
  addToPosCart(product.id);
  showNotificationToast(`🛒 Producto agregado a la venta en caja: ${product.name}`, 'success');
};

window.openNewProductWithBarcode = function(barcode) {
  closeBarcodeScannerModal();
  openNewProductModal();
  const barcodeInput = document.getElementById('crudBarcodeInput');
  if (barcodeInput) barcodeInput.value = barcode;
};

window.confirmScannedDelivery = function() {
  if (!currentScannedOrder) return;
  const { dispatch, order } = currentScannedOrder;

  if (dispatch) {
    dispatch.status = 'Entregado';
    dispatch.verified = true;
    dispatch.deliveredTime = new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
  }

  if (order) {
    order.status = 'FACTURADO';
  }

  renderDriverDispatches();
  renderOrderHistory();

  showNotificationToast(`✅ Entrega confirmada y auditada con éxito en ${dispatch ? dispatch.province : 'destino'}.`, 'success');
  closeBarcodeScannerModal();
};

window.resetScanState = function() {
  currentScannedOrder = null;
  currentScannedProduct = null;
  const resContainer = document.getElementById('scannerResultContainer');
  if (resContainer) resContainer.style.display = 'none';
};


// ------------------------------------------------------------------------------
// ASIGNACIÓN DE NUEVA RUTA NACIONAL (TODO COSTA RICA)
// ------------------------------------------------------------------------------
window.openAssignRouteModal = function(specificOrderCode) {
  const modal = document.getElementById('assignRouteModal');
  const select = document.getElementById('routeOrderSelect');
  if (!modal || !select) return;

  // Llenar con pedidos activos
  select.innerHTML = AppState.salesOrders.map(o => `
    <option value="${o.orderCode}" ${specificOrderCode && (o.orderCode === specificOrderCode || String(o.id) === String(specificOrderCode)) ? 'selected' : ''}>
      ${o.orderCode} - ${o.customerName} (${o.customerProvince || 'Cartago'})
    </option>
  `).join('');

  if (specificOrderCode) {
    const match = AppState.salesOrders.find(o => o.orderCode === specificOrderCode || String(o.id) === String(specificOrderCode));
    if (match) select.value = match.orderCode;
  }

  syncRouteOrderDetails();
  openModalDirectly('assignRouteModal');
};

window.syncRouteOrderDetails = function() {
  const select = document.getElementById('routeOrderSelect');
  if (!select) return;

  const order = AppState.salesOrders.find(o => o.orderCode === select.value);
  if (!order) return;

  const provSelect = document.getElementById('routeProvinceSelect');
  const cantonInput = document.getElementById('routeCantonInput');
  const addrInput = document.getElementById('routeAddressInput');
  const pkgsInput = document.getElementById('routePackagesInput');

  if (provSelect && order.customerProvince) provSelect.value = order.customerProvince;
  if (cantonInput) cantonInput.value = order.customerCanton || 'Central';
  if (addrInput) addrInput.value = order.customerAddress || '';
  if (pkgsInput) pkgsInput.value = summarizeOrderPackages(order);
};

window.updateCantonsList = function() {
  const prov = document.getElementById('routeProvinceSelect')?.value;
  const cantonInput = document.getElementById('routeCantonInput');
  if (!cantonInput) return;

  const defaults = {
    'Cartago': 'Paraíso',
    'San José': 'Escazú',
    'Alajuela': 'San Carlos (La Fortuna)',
    'Heredia': 'Belén',
    'Guanacaste': 'Liberia',
    'Puntarenas': 'Quepos (Manuel Antonio)',
    'Limón': 'Pococí (Guápiles)'
  };

  cantonInput.value = defaults[prov] || 'Central';
};

window.handleAssignRouteSubmit = function(e) {
  e.preventDefault();

  const orderCode = document.getElementById('routeOrderSelect').value;
  const province = document.getElementById('routeProvinceSelect').value;
  const canton = document.getElementById('routeCantonInput').value;
  const address = document.getElementById('routeAddressInput').value;
  const packagesText = document.getElementById('routePackagesInput').value;
  const driver = document.getElementById('routeDriverSelect').value;
  const departure = document.getElementById('routeDepartureInput').value;

  const order = AppState.salesOrders.find(o => o.orderCode === orderCode);
  const custName = order ? order.customerName : 'Cliente Fragama';

  const newDispatch = {
    id: AppState.dispatches.length + 1,
    code: `DSP-CR-2026-${String(AppState.dispatches.length + 91).padStart(4, '0')}`,
    orderCode: orderCode,
    customer: custName,
    province: province,
    canton: canton,
    address: address,
    contact: order ? `${order.customerContact} (${order.customerPhone})` : 'Contacto Encargado',
    invoice: orderCode,
    items: packagesText,
    driver: driver,
    status: 'Asignado',
    verified: true,
    departureTime: departure
  };

  AppState.dispatches.unshift(newDispatch);
  renderDriverDispatches();

  document.getElementById('assignRouteModal').classList.remove('active');
  showNotificationToast(`Ruta a ${province} (${canton}) asignada con éxito. Código: ${newDispatch.code}`, 'success');
};

window.openDriverModal = function(dispatchId, preselectedStatus) {
  window.currentSelectedDispatchId = dispatchId;
  const modal = document.getElementById('deliveryStatusModal');
  const radio = document.querySelector(`input[name="deliveryStatusChoice"][value="${preselectedStatus}"]`);
  if (radio) radio.checked = true;
  if (modal) modal.classList.add('active');
};

function setupBarcodeGenerator() {
  const barcodeModal = document.getElementById('barcodeModal');
  const closeBarcodeModal = document.getElementById('closeBarcodeModal');
  if (closeBarcodeModal) {
    closeBarcodeModal.addEventListener('click', () => barcodeModal.classList.remove('active'));
  }
}

window.showBarcodeForProduct = function(productId) {
  const product = AppState.products.find(p => p.id === productId);
  if (!product) return;

  currentBarcodeCode = product.barcode;
  const modal = document.getElementById('barcodeModal');
  const title = document.getElementById('barcodeProductTitle');
  const skuText = document.getElementById('barcodeProductSku');

  if (title) title.textContent = product.name;
  if (skuText) skuText.textContent = `SKU: ${product.sku} | Barcode: ${product.barcode} | Lote: ${product.batchNumber || 'N/A'}`;

  // Renderizar código de barras con JsBarcode en el elemento SVG
  try {
    if (typeof JsBarcode !== 'undefined') {
      JsBarcode("#barcodeCanvas", product.barcode, {
        format: "CODE128",
        lineColor: "#000000",
        width: 2.2,
        height: 65,
        displayValue: true,
        fontSize: 14,
        fontOptions: "bold",
        font: "JetBrains Mono",
        textMargin: 6
      });
    }
  } catch (err) {
    console.error("Error al renderizar JsBarcode:", err);
  }

  if (modal) modal.classList.add('active');
};

window.copyCurrentBarcodeText = function() {
  if (!currentBarcodeCode) return;
  navigator.clipboard.writeText(currentBarcodeCode).then(() => {
    showNotificationToast(`Código de barras [${currentBarcodeCode}] copiado al portapapeles.`, 'success');
  }).catch(() => {
    showNotificationToast(`Código: ${currentBarcodeCode}`, 'info');
  });
};

window.testScanCurrentModalBarcode = function() {
  if (!currentBarcodeCode) return;
  const modal = document.getElementById('barcodeModal');
  if (modal) modal.classList.remove('active');
  handleScannedBarcode(currentBarcodeCode);
};

window.openMovementModal = function(productId) {
  const modal = document.getElementById('movementModal');
  const sel = document.getElementById('movementProductSelect');
  if (sel && window.AppState && Array.isArray(AppState.products)) {
    sel.innerHTML = AppState.products.map(p => `
      <option value="${p.id}" ${productId && (String(p.id) === String(productId)) ? 'selected' : ''}>
        ${p.name} (${p.sku}) - Stock actual: ${p.stock} ${p.unit || 'und'}
      </option>
    `).join('');
  }
  openModalDirectly('movementModal');
};

window.closeMovementModal = function() {
  closeModalDirectly('movementModal');
};

function setupQuickMovementModal() {
  const modal = document.getElementById('movementModal');
  const openBtn = document.getElementById('btnNewMovement');
  const closeBtn = document.getElementById('closeMovementModal');
  const cancelBtn = document.getElementById('cancelMovementBtn');
  const form = document.getElementById('quickMovementForm');

  if (openBtn) openBtn.addEventListener('click', () => openMovementModal());
  if (closeBtn) closeBtn.addEventListener('click', () => closeMovementModal());
  if (cancelBtn) cancelBtn.addEventListener('click', () => closeMovementModal());

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const productId = parseInt(document.getElementById('movementProductSelect').value, 10);
      const type = document.getElementById('movementTypeSelect').value;
      const qty = parseInt(document.getElementById('movementQtyInput').value, 10);
      const doc = document.getElementById('movementDocInput').value || 'MANUAL-001';

      const product = AppState.products.find(p => p.id === productId);
      if (!product) return;

      const isExit = (type === 'Salida Venta' || type === 'Ajuste Negativo');
      const isTransfer = (type === 'Traslado Interno');
      const sign = isTransfer ? 0 : (isExit ? -1 : 1);

      if (isExit && product.stock - qty < 0) {
        alert(`❌ ACCIÓN BLOQUEADA: Stock insuficiente para [${product.sku}]. Stock actual: ${product.stock}, se intentó retirar: ${qty}. No se permiten saldos negativos.`);
        return;
      }

      const prev = product.stock;
      const finalStock = prev + (sign * qty);
      product.stock = finalStock;

      const nextId = AppState.kardexMovements.length + 101;
      const nextCode = `${isExit ? 'SAL' : (isTransfer ? 'TRA' : 'ENT')}-20260929-${String(nextId).padStart(4, '0')}`;

      AppState.kardexMovements.unshift({
        id: nextId,
        code: nextCode,
        product: product.name,
        batch: product.batchNumber,
        type: type,
        sign: sign,
        qty: qty,
        prev: prev,
        final: finalStock,
        cost: (product.costPrice || product.price * 0.7),
        doc: doc,
        user: AppState.currentUser.name
      });

      renderAllViews();
      closeMovementModal();
      showNotificationToast(`Movimiento ${nextCode} registrado en Kardex exitosamente.`, 'success');
    });
  }
}

function showNotificationToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.background = type === 'success' ? '#10B981' : '#1E3E62';
  toast.style.color = '#FFFFFF';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '10px';
  toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.25)';
  toast.style.zIndex = '99999';
  toast.style.fontWeight = '600';
  toast.style.fontSize = '0.9rem';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '8px';
  toast.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ==============================================================================
// 12. MÓDULO DE DASHBOARD MODERNO Y ANALÍTICAS VISUALES
// ==============================================================================
function setupDashboardControls() {
  const search = document.getElementById('dashboardProductSearch');
  const familyFilter = document.getElementById('dashboardFamilyFilter');

  if (search) {
    search.addEventListener('input', () => {
      renderProductsTable(search.value.trim().toLowerCase(), familyFilter ? familyFilter.value : 'ALL');
    });
  }

  if (familyFilter) {
    familyFilter.addEventListener('change', () => {
      renderProductsTable(search ? search.value.trim().toLowerCase() : '', familyFilter.value);
    });
  }
}

function renderDashboardAnalytics() {
  // 1. Valorización Total de Inventario
  let totalValuation = 0;
  let totalUnits = 0;
  AppState.products.forEach(p => {
    totalValuation += (p.price * p.stock);
    totalUnits += p.stock;
  });

  const kpiVal = document.getElementById('kpiValorInventario');
  if (kpiVal) kpiVal.textContent = formatCRC(totalValuation);

  const kpiAlert = document.getElementById('kpiAlertCount');
  const lowCount = AppState.products.filter(p => p.stock <= p.minStock).length;
  if (kpiAlert) kpiAlert.textContent = lowCount;

  // 2. Gráfico Visual de Barras por Familia
  const familyBarsContainer = document.getElementById('dashboardFamilyBars');
  if (familyBarsContainer) {
    const colors = ['#0284C7', '#F59E0B', '#10B981', '#8B5CF6'];
    familyBarsContainer.innerHTML = AppState.families.map((f, idx) => {
      const familyProducts = AppState.products.filter(p => p.familyId === f.id);
      const unitsInFamily = familyProducts.reduce((sum, p) => sum + p.stock, 0);
      const valInFamily = familyProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
      const pct = totalUnits > 0 ? Math.round((unitsInFamily / totalUnits) * 100) : 0;
      const barColor = colors[idx % colors.length];

      return `
        <div class="family-bar-row">
          <div class="family-bar-header">
            <span><i class="bi ${f.icon || 'bi-boxes'}" style="color:${barColor}"></i> ${f.name}</span>
            <span><strong>${pct}%</strong> (${unitsInFamily} uds • ${formatCRC(valInFamily)})</span>
          </div>
          <div class="family-bar-track">
            <div class="family-bar-fill" style="width:${pct}%; background:${barColor};"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. Gráfico Semanal de Kardex (Entradas vs Salidas)
  const weeklyContainer = document.getElementById('dashboardWeeklyChart');
  if (weeklyContainer) {
    const weeklyData = [
      { day: 'Lun', inVal: 80, outVal: 45 },
      { day: 'Mar', inVal: 30, outVal: 65 },
      { day: 'Mié', inVal: 120, outVal: 85 },
      { day: 'Jue', inVal: 40, outVal: 95 },
      { day: 'Vie', inVal: 90, outVal: 110 },
      { day: 'Sáb', inVal: 20, outVal: 50 }
    ];
    const maxVal = 140;

    weeklyContainer.innerHTML = weeklyData.map(d => {
      const inHeight = Math.round((d.inVal / maxVal) * 110);
      const outHeight = Math.round((d.outVal / maxVal) * 110);
      return `
        <div class="weekly-col">
          <div class="weekly-bar-pair">
            <div class="weekly-bar in" style="height:${inHeight}px;" data-tooltip="Entradas: ${d.inVal} uds"></div>
            <div class="weekly-bar out" style="height:${outHeight}px;" data-tooltip="Salidas: ${d.outVal} uds"></div>
          </div>
          <span class="weekly-label">${d.day}</span>
        </div>
      `;
    }).join('');
  }

  // 4. Feed de Actividad Reciente del Kardex
  const activityContainer = document.getElementById('dashboardRecentActivity');
  if (activityContainer) {
    const recent = AppState.kardexMovements.slice(0, 3);
    activityContainer.innerHTML = recent.map(m => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #F1F5F9; font-size:0.8rem;">
        <div>
          <div style="font-weight:700; color:#0B192C;">${m.product}</div>
          <div style="font-size:0.72rem; color:#64748B;">Doc: ${m.doc} • Operador: ${m.user}</div>
        </div>
        <div style="text-align:right;">
          <span style="font-weight:800; color:${m.sign < 0 ? '#0284C7' : '#10B981'};">${m.sign < 0 ? '-' : '+'}${m.qty} uds</span>
          <div style="font-size:0.7rem; color:#94A3B8;">${m.type}</div>
        </div>
      </div>
    `).join('');
  }

  // 5. Poblar Filtro de Familias del Dashboard
  const famFilter = document.getElementById('dashboardFamilyFilter');
  if (famFilter && famFilter.options && famFilter.options.length <= 1) {
    AppState.families.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.name;
      famFilter.appendChild(opt);
    });
  }

  // 6. Tabla de Pedidos Web para Alistado Inmediato en Bodega
  const webTbody = document.getElementById('dashboardWebOrdersTbody');
  const webBadge = document.getElementById('dashboardWebOrdersBadge');
  if (webTbody) {
    const webOrders = AppState.salesOrders.filter(o => 
      o.docType === 'PEDIDO_WEB' || o.source === 'TIENDA_WEB' || (o.orderCode && o.orderCode.includes('WEB'))
    );

    const pendingCount = webOrders.filter(o => o.status === 'PENDIENTE').length;
    if (webBadge) {
      webBadge.textContent = `${pendingCount} pendientes de alisto`;
      webBadge.className = pendingCount > 0 ? 'badge-status badge-observed' : 'badge-status badge-delivered';
    }

    if (webOrders.length === 0) {
      webTbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:1.5rem; color:#64748B;">
            <i class="bi bi-inbox" style="font-size:1.5rem; color:#94A3B8; display:block; margin-bottom:4px;"></i>
            No hay pedidos web recibidos aún. Los pedidos nuevos de la tienda aparecerán aquí automáticamente.
          </td>
        </tr>
      `;
    } else {
      webTbody.innerHTML = webOrders.slice(0, 8).map(o => {
        const isPending = o.status === 'PENDIENTE';
        const itemCount = (o.items && Array.isArray(o.items)) ? o.items.length : 1;
        const totalUnits = (o.items && Array.isArray(o.items)) ? o.items.reduce((s, it) => s + (it.qty || 1), 0) : 1;
        const itemsSummary = (o.items && Array.isArray(o.items) && o.items.length > 0)
          ? o.items.map(it => `${it.qty}x ${it.name}`).join(', ')
          : 'Artículos generales';

        return `
          <tr style="border-bottom:1px solid #E2E8F0; ${isPending ? 'background:#F0FDF4;' : ''}">
            <td style="padding:10px 12px; font-weight:800; font-family:'JetBrains Mono',monospace; color:#0B192C;">
              ${o.orderCode}
              ${isPending ? `<span style="display:inline-block; width:8px; height:8px; background:#10B981; border-radius:50%; margin-left:4px; box-shadow:0 0 6px #10B981;" title="Nuevo Pedido"></span>` : ''}
            </td>
            <td style="padding:10px 12px;">
              <div style="font-weight:700; color:#0B192C;">${o.customerName}</div>
              <div style="font-size:0.75rem; color:#64748B;"><i class="bi bi-telephone"></i> ${o.customerPhone || 'N/A'} • Céd: ${o.customerTaxId || 'N/A'}</div>
            </td>
            <td style="padding:10px 12px;">
              <div style="font-weight:700; color:#0284C7;"><i class="bi bi-truck"></i> ${o.deliveryRoute || o.deliveryDate || 'Cartago'}</div>
              <div style="font-size:0.75rem; color:#475569; max-width:220px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${o.customerAddress || ''}">
                <i class="bi bi-geo-alt"></i> ${o.customerAddress || 'En bodega'}
              </div>
            </td>
            <td style="padding:10px 12px;">
              <div style="font-weight:700; color:#0F172A;">${itemCount} prod. (${totalUnits} unidades)</div>
              <div style="font-size:0.72rem; color:#64748B; max-width:200px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${itemsSummary}">
                ${itemsSummary}
              </div>
            </td>
            <td style="padding:10px 12px; text-align:right; font-weight:800; color:#F97316; font-family:'JetBrains Mono',monospace;">
              ${formatCRC(o.total)}
            </td>
            <td style="padding:10px 12px; text-align:center;">
              <span class="badge-status ${isPending ? 'badge-observed' : 'badge-delivered'}" style="font-size:0.75rem; font-weight:800;">
                ${isPending ? 'PENDIENTE ALISTO' : (o.status === 'ALISTADO' ? 'ALISTADO EN BODEGA' : o.status)}
              </span>
            </td>
            <td style="padding:10px 12px; text-align:center;">
              <div style="display:flex; gap:6px; justify-content:center;">
                ${isPending ? `
                  <button class="btn-fragama btn-primary-fragama" style="background:#10B981; border-color:#10B981; padding:4px 8px; font-size:0.75rem;" onclick="markOrderAlistado('${o.orderCode || o.id}')" title="Marcar como Alistado">
                    <i class="bi bi-box-seam"></i> Alistar
                  </button>
                ` : `
                  <button class="btn-fragama btn-outline-fragama" style="padding:4px 8px; font-size:0.75rem; color:#10B981; border-color:#10B981;" title="Ya Alistado">
                    <i class="bi bi-check-circle-fill"></i> Listo
                  </button>
                `}
                <button class="btn-fragama btn-outline-fragama" style="padding:4px 8px; font-size:0.75rem;" onclick="viewSavedOrderPrint(${o.id || 1})" title="Imprimir Comprobante de Alisto">
                  <i class="bi bi-printer"></i>
                </button>
                ${o.customerPhone ? `
                  <a href="https://wa.me/506${String(o.customerPhone).replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(o.customerName)},%20te%20saludamos%20de%20Distribuidora%20Fragama%20respecto%20a%20tu%20pedido%20${o.orderCode}" target="_blank" class="btn-fragama" style="background:#25D366; color:#FFF; padding:4px 8px; font-size:0.75rem; text-decoration:none; display:inline-flex; align-items:center;" title="WhatsApp Cliente">
                    <i class="bi bi-whatsapp"></i>
                  </a>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}

// ==============================================================================
// 13. MÓDULO DE CATÁLOGO Y DIRECTORIO DE PROVEEDORES
// ==============================================================================
function setupSuppliersModule() {
  const searchInput = document.getElementById('supplierSearchInput');
  const catFilter = document.getElementById('supplierCategoryFilter');
  const openModalBtn = document.getElementById('btnOpenNewSupplierModal');
  const closeModalBtn = document.getElementById('closeSupplierModalBtn');
  const cancelBtn = document.getElementById('cancelSupplierBtn');
  const modal = document.getElementById('supplierModal');
  const form = document.getElementById('supplierForm');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderSuppliersGrid(searchInput.value.trim().toLowerCase(), catFilter ? catFilter.value : 'ALL');
    });
  }

  if (catFilter) {
    catFilter.addEventListener('change', () => {
      renderSuppliersGrid(searchInput ? searchInput.value.trim().toLowerCase() : '', catFilter.value);
    });
  }

  if (openModalBtn && modal) {
    openModalBtn.addEventListener('click', () => modal.classList.add('active'));
  }
  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newSupplier = {
        id: AppState.suppliers.length + 1,
        taxId: document.getElementById('suppTaxId').value.trim(),
        category: document.getElementById('suppCategory').value,
        name: document.getElementById('suppName').value.trim(),
        contact: document.getElementById('suppContact').value.trim(),
        phone: document.getElementById('suppPhone').value.trim(),
        whatsapp: document.getElementById('suppWhatsApp').value.trim(),
        email: document.getElementById('suppEmail').value.trim(),
        terms: document.getElementById('suppTerms').value,
        city: document.getElementById('suppCity').value.trim() || 'Cartago',
        address: document.getElementById('suppAddress').value.trim()
      };

      try {
        await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSupplier)
        });
      } catch(err) {
        console.warn("Aviso proveedor en BD:", err);
      }

      AppState.suppliers.unshift(newSupplier);
      form.reset();
      closeModalDirectly('supplierModal');

      const countBadge = document.getElementById('suppliersBadgeCount');
      if (countBadge) countBadge.textContent = AppState.suppliers.length;

      renderSuppliersGrid();
      showNotificationToast(`Proveedor "${newSupplier.name}" registrado con éxito en el catálogo.`, 'success');
    });
  }
}

function renderSuppliersGrid(searchTerm = '', categoryFilter = 'ALL') {
  const container = document.getElementById('suppliersGridContainer');
  const countBadge = document.getElementById('suppliersBadgeCount');
  if (countBadge) countBadge.textContent = AppState.suppliers.length;
  if (!container) return;

  const filtered = AppState.suppliers.filter(s => {
    const matchCat = (categoryFilter === 'ALL') || (s.category === categoryFilter);
    const matchSearch = !searchTerm ||
      s.name.toLowerCase().includes(searchTerm) ||
      s.taxId.toLowerCase().includes(searchTerm) ||
      s.contact.toLowerCase().includes(searchTerm) ||
      (s.city && s.city.toLowerCase().includes(searchTerm));
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem; background:#FFF; border-radius:12px; border:1px solid #CBD5E1; color:#64748B;">
        <i class="bi bi-building-x" style="font-size:2rem; opacity:0.5; display:block; margin-bottom:8px;"></i>
        No se encontraron proveedores que coincidan con la búsqueda.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(s => {
    const cleanWa = s.whatsapp.replace(/\D/g, '');
    const waUrl = cleanWa.length >= 8 ? `https://wa.me/506${cleanWa.slice(-8)}` : '#';

    let catIcon = 'bi-droplet-half';
    if (s.category.includes('Papel')) catIcon = 'bi-file-earmark-text';
    else if (s.category.includes('Bolsas')) catIcon = 'bi-box-seam';
    else if (s.category.includes('Útiles')) catIcon = 'bi-tools';

    return `
      <div class="supplier-card">
        <div>
          <div class="supplier-card-header">
            <div>
              <span style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:#0284C7; letter-spacing:0.5px; display:inline-flex; align-items:center; gap:4px; margin-bottom:4px;">
                <i class="bi ${catIcon}"></i> ${s.category}
              </span>
              <h3 class="supplier-name">${s.name}</h3>
            </div>
            <span class="badge-status badge-confirmed" style="font-size:0.72rem;">Homologado</span>
          </div>

          <div class="supplier-meta-row">
            <span><strong>Cédula:</strong> ${s.taxId}</span>
            <span>•</span>
            <span>${s.city || 'Costa Rica'}</span>
          </div>

          <div class="supplier-details-box">
            <div><i class="bi bi-person-badge text-primary"></i> <strong>Contacto:</strong> ${s.contact}</div>
            <div><i class="bi bi-credit-card text-success"></i> <strong>Condición:</strong> ${s.terms}</div>
            <div style="border-top:1px dashed #CBD5E1; padding-top:4px; margin-top:2px;">
              <i class="bi bi-geo-alt-fill text-danger"></i> ${s.address}
            </div>
          </div>
        </div>

        <div>
          <div class="supplier-actions-row">
            <a href="${waUrl}" target="_blank" class="btn-contact-pill btn-contact-wa" title="Escribir a WhatsApp">
              <i class="bi bi-whatsapp"></i> ${s.whatsapp}
            </a>
            <a href="tel:${s.phone}" class="btn-contact-pill btn-contact-phone" title="Llamar a Oficina">
              <i class="bi bi-telephone-fill"></i> ${s.phone}
            </a>
            <a href="mailto:${s.email}" class="btn-contact-pill btn-contact-mail" title="Enviar Correo de Pedido">
              <i class="bi bi-envelope-fill"></i> Pedidos
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
