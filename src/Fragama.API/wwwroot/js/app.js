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
  customers: [],
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

    // Integración con pedidos web almacenados en localStorage (contingencia local / offline)
    try {
      const localWebOrders = JSON.parse(localStorage.getItem('fragama_web_orders') || '[]');
      if (Array.isArray(localWebOrders) && localWebOrders.length > 0) {
        const existingCodes = new Set(AppState.salesOrders.map(o => o.orderCode));
        localWebOrders.forEach(lwo => {
          if (!existingCodes.has(lwo.orderCode)) {
            AppState.salesOrders.unshift(lwo);
            existingCodes.add(lwo.orderCode);
            // Sincronizar silenciosamente al servidor si no estaba asentado
            fetch('/api/public/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(lwo)
            }).catch(() => {});
          }
        });
      }
    } catch (e) {}
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
// SINCRONIZACIÓN EN TIEMPO REAL ESTILO PLAZAS VACANTES (COUNTDOWN & AUTO-REFRESH)
// ==============================================================================
let _orderSyncInterval = null;
let _syncCountdown = 4;
let _isSyncInProgress = false;

async function performOrderSync(isManual = false) {
  if (_isSyncInProgress) return;
  _isSyncInProgress = true;

  const icon = document.getElementById('iconManualSync');
  if (icon) icon.classList.add('spin-anim');

  try {
    const res = await fetch('/api/orders', { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 429) console.warn("Rate limit temporal en sync");
      return;
    }
    const serverOrders = await res.json();
    if (!Array.isArray(serverOrders)) return;

    // Sincronización con pedidos web locales (localStorage) creados en contingencia
    try {
      const localWebOrders = JSON.parse(localStorage.getItem('fragama_web_orders') || '[]');
      if (Array.isArray(localWebOrders) && localWebOrders.length > 0) {
        const srvCodes = new Set(serverOrders.map(o => (o.orderCode || '').trim().toUpperCase()));
        for (const lwo of localWebOrders) {
          const cleanLwoCode = (lwo.orderCode || '').trim().toUpperCase();
          if (cleanLwoCode && !srvCodes.has(cleanLwoCode)) {
            serverOrders.unshift(lwo);
            srvCodes.add(cleanLwoCode);
            fetch('/api/public/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(lwo)
            }).catch(() => {});
          }
        }
      }
    } catch (e) {}

    // Actualizar estampa de tiempo visible en la UI
    const nowStr = new Date().toLocaleTimeString('es-CR');
    const tsEl = document.getElementById('liveSyncTimestamp');
    if (tsEl) tsEl.textContent = nowStr;

    // Detectar si hay nuevos pedidos para alerta sonora y toast
    const prevCodes = new Set(AppState.salesOrders.map(o => String(o.orderCode || o.id || '').toUpperCase().trim()));
    const newIncomingOrders = serverOrders.filter(so => {
      const code = String(so.orderCode || so.id || '').toUpperCase().trim();
      return code && !prevCodes.has(code);
    });

    let hasStatusChange = false;
    for (const so of serverOrders) {
      const ex = AppState.salesOrders.find(o => 
        String(o.id) === String(so.id) || 
        String(o.orderCode || '').toUpperCase() === String(so.orderCode || '').toUpperCase()
      );
      if (!ex || ex.status !== so.status || ex.preparedByName !== so.preparedByName || ex.driverName !== so.driverName || ex.undeliveredReason !== so.undeliveredReason || ex.stockDeducted !== so.stockDeducted) {
        hasStatusChange = true;
        break;
      }
    }

    const countChanged = serverOrders.length !== AppState.salesOrders.length;

    AppState.salesOrders = serverOrders;
    updateWebOrdersBadges();

    if (newIncomingOrders.length > 0 || hasStatusChange || countChanged || isManual) {
      refreshAllOrderViews();

      if (newIncomingOrders.length > 0) {
        playOrderChime();
        const newest = newIncomingOrders[0];
        if (typeof showNotificationToast === 'function') {
          showNotificationToast(`🔔 ¡Nuevo Pedido Recibido: ${newest.orderCode} (${newest.customerName}) para alistar!`, 'success');
        }
      }
    }
  } catch (err) {
    console.warn("Falla en sincronización de pedidos:", err);
  } finally {
    _isSyncInProgress = false;
    if (icon) icon.classList.remove('spin-anim');
  }
}

function initRealtimeOrderSync() {
  updateWebOrdersBadges();
  _syncCountdown = 4;
  
  if (_orderSyncInterval) clearInterval(_orderSyncInterval);
  
  _orderSyncInterval = setInterval(() => {
    _syncCountdown--;
    
    const countEl = document.getElementById('syncCountdownSec');
    if (countEl) {
      countEl.textContent = _syncCountdown > 0 ? `${_syncCountdown}s` : '...';
    }
    
    if (_syncCountdown <= 0) {
      _syncCountdown = 4;
      performOrderSync();
    }
  }, 1000);
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

function isWebOrder(o) {
  if (!o) return false;
  const dt = String(o.docType || '').toUpperCase().trim();
  const src = String(o.source || '').toUpperCase().trim();
  const code = String(o.orderCode || '').toUpperCase().trim();
  return dt === 'PEDIDO_WEB' || src === 'TIENDA_WEB' || code.includes('WEB');
}

function isOrderPending(o) {
  if (!o) return false;
  const s = String(o.status || '').toUpperCase().trim();
  return s === 'PENDIENTE' || s === 'SOLICITADO' || s === 'PENDIENTE ALISTO' || s === 'NUEVO';
}

function updateWebOrdersBadges() {
  const allOrders = AppState.salesOrders.filter(o => o && o.docType !== 'COTIZACION' && o.status !== 'CANCELADO');
  const webOrders = allOrders.filter(isWebOrder);
  const bodegaOrders = allOrders.filter(o => !isWebOrder(o));
  
  const pendingOrders = allOrders.filter(isOrderPending);
  const count = pendingOrders.length;
  
  const sideBadge = document.getElementById('badgePendingWebOrders');
  if (sideBadge) {
    sideBadge.textContent = count;
    sideBadge.style.background = count > 0 ? '#F59E0B' : '#10B981';
  }

  const totalBadge = document.getElementById('badgeWebOrdersTotalBadge');
  if (totalBadge) {
    totalBadge.textContent = `${allOrders.length} pedidos (${webOrders.length} web / ${bodegaOrders.length} bodega)`;
  }

  const kpiPending = document.getElementById('kpiWebPending');
  if (kpiPending) kpiPending.textContent = count;

  const kpiPrepared = document.getElementById('kpiWebPrepared');
  if (kpiPrepared) {
    kpiPrepared.textContent = allOrders.filter(o => {
      const s = String(o.status || '').toUpperCase().trim();
      return s === 'ALISTADO' || s === 'EN_ALISTADO';
    }).length;
  }

  const kpiInRoute = document.getElementById('kpiWebInRoute');
  if (kpiInRoute) {
    kpiInRoute.textContent = allOrders.filter(o => String(o.status || '').toUpperCase().trim() === 'EN_RUTA').length;
  }

  const kpiDelivered = document.getElementById('kpiWebDelivered');
  if (kpiDelivered) {
    kpiDelivered.textContent = allOrders.filter(o => {
      const s = String(o.status || '').toUpperCase().trim();
      return s === 'ENTREGADO' || s === 'FACTURADO';
    }).length;
  }

  const kpiUndelivered = document.getElementById('kpiWebUndelivered');
  if (kpiUndelivered) {
    kpiUndelivered.textContent = allOrders.filter(o => {
      const s = String(o.status || '').toUpperCase().trim();
      return s === 'NO_ENTREGADO' || s === 'RECHAZADO';
    }).length;
  }
  
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
// FUNCIONES GENERALES DE RENDERIZADO Y UTILITARIOS
// ==============================================================================

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
  renderWebOrdersView();
  renderSuppliersGrid();
  renderDriverDispatches();
  renderUsersRolesTable();
}

// Actualización omnicanal de pedidos en todas las vistas de la bodega
function refreshAllOrderViews() {
  if (typeof renderOrderHistory === 'function') renderOrderHistory();
  if (typeof renderWebOrdersFullTable === 'function') renderWebOrdersFullTable();
  if (typeof updateWebOrdersBadges === 'function') updateWebOrdersBadges();
  if (typeof renderDashboardAnalytics === 'function') renderDashboardAnalytics();
  if (typeof renderDriverDispatches === 'function') renderDriverDispatches();
}
window.refreshAllOrderViews = refreshAllOrderViews;

function formatCRC(amount) {
  return '₡' + Number(amount).toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Sanitización contra inyección XSS en todos los campos renderizados desde la BD
function escapeHtml(text) {
  if (text === undefined || text === null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Función rápida del dashboard para marcar un pedido como alistado sin abrir el modal completo
window.markOrderAlistado = async function(orderIdentifier) {
  if (!confirm(`¿Desea marcar el pedido ${orderIdentifier} como ALISTADO en bodega?`)) return;

  try {
    const payload = {
      status: 'ALISTADO',
      notes: 'Alistado rápido desde panel de control del dashboard.'
    };

    const res = await fetch(`/api/orders/${encodeURIComponent(orderIdentifier)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (res.ok && result.success) {
      const ord = AppState.salesOrders.find(o => String(o.id) === String(orderIdentifier) || o.orderCode === String(orderIdentifier));
      if (ord) ord.status = 'ALISTADO';
      renderAllViews();
      showNotificationToast(`✅ Pedido ${orderIdentifier} marcado como ALISTADO.`, 'success');
    } else {
      showNotificationToast(`Error: ${result.detail || result.message || 'No se pudo actualizar el estado.'}`, 'error');
    }
  } catch (err) {
    showNotificationToast('Error de conexión al actualizar el pedido.', 'error');
  }
};

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

  const currentPassEl = document.getElementById('forceCurrentPass');
  const newPassEl = document.getElementById('forceNewPass');
  const confirmPassEl = document.getElementById('forceConfirmPass');
  const alertEl = document.getElementById('forcePassAlert');

  if (!currentPassEl || !newPassEl || !confirmPassEl) {
    const user = pendingForceChangeUser;
    pendingForceChangeUser = null;
    completeUserLoginSuccess(user);
    return;
  }

  const currentPass = currentPassEl.value;
  const newPass = newPassEl.value;
  const confirmPass = confirmPassEl.value;

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
// Manejo de acordeón colapsable global (tree-toggle) disponible de inmediato
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

  // Manejo de enlaces del menú con data-view (Click individual + Delegación global robusta)
  document.addEventListener('click', (e) => {
    if (!e || !e.target) return;
    const link = e.target.closest('.sidebar .nav-link[data-view]');
    if (link) {
      e.preventDefault();
      const targetView = link.getAttribute('data-view');
      if (targetView) {
        document.querySelectorAll('.sidebar .nav-link[data-view]').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        if (typeof window.switchViewDirectly === 'function') {
          window.switchViewDirectly(targetView);
        }
      }
      if (window.innerWidth <= 991 && typeof closeSidebar === 'function') {
        closeSidebar();
      }
      return;
    }

    const logoutBtn = e.target.closest('#sidebarLogoutBtn');
    if (logoutBtn) {
      e.preventDefault();
      AppState.isAuthenticated = false;
      const loginWrapper = document.getElementById('loginScreenWrapper');
      if (loginWrapper) {
        loginWrapper.classList.remove('hidden');
        loginWrapper.style.display = 'flex';
      }
      if (window.innerWidth <= 991 && typeof closeSidebar === 'function') {
        closeSidebar();
      }
      showNotificationToast('Sesión cerrada correctamente.', 'info');
      return;
    }
  });
}

// ==============================================================================
// MATRIZ OFICIAL DE CONTROL DE ACCESO BASADO EN ROLES (RBAC)
// ==============================================================================
const RolePermissions = {
  'Administrador': {
    homeView: 'view-admin-dashboard',
    allowedViews: [
      'view-admin-dashboard',
      'view-alistado-web',
      'view-families-management',
      'view-product-maintenance',
      'view-excel-bulk-import',
      'view-bodega-kardex',
      'view-customer-orders',
      'view-cajero-pos',
      'view-chofer-mobile',
      'view-suppliers-management',
      'view-customers-management',
      'view-reports',
      'view-roles-management',
      'view-tax-hacienda'
    ]
  },
  'Bodeguero': {
    homeView: 'view-alistado-web',
    allowedViews: [
      'view-alistado-web',
      'view-product-maintenance',
      'view-excel-bulk-import',
      'view-bodega-kardex',
      'view-customer-orders',
      'view-customers-management',
      'view-suppliers-management',
      'view-cajero-pos',
      'view-chofer-mobile'
    ]
  },
  'Cajero': {
    homeView: 'view-cajero-pos',
    allowedViews: [
      'view-cajero-pos',
      'view-customers-management',
      'view-product-maintenance',
      'view-tax-hacienda'
    ]
  },
  'Chofer': {
    homeView: 'view-chofer-mobile',
    allowedViews: [
      'view-alistado-web',
      'view-chofer-mobile'
    ]
  },
  'Vendedor': {
    homeView: 'view-customer-orders',
    allowedViews: [
      'view-alistado-web',
      'view-customer-orders',
      'view-customers-management',
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
  // En móviles, cerrar sidebar overlay de inmediato al pulsar cualquier opción
  if (window.innerWidth <= 991) {
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
    document.body.classList.remove('sidebar-open');
    document.body.style.overflow = '';
  }

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
      const parentMenu = link.closest('.collapse-menu');
      if (parentMenu) {
        parentMenu.classList.add('show');
        parentMenu.style.setProperty('display', 'flex', 'important');
        const treeToggle = document.querySelector(`.sidebar .tree-toggle[data-collapse="${parentMenu.id}"]`);
        if (treeToggle) treeToggle.classList.remove('collapsed');
      }
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
    case 'view-alistado-web':
      if (pageTitle) pageTitle.textContent = 'Alistado & Despacho de Pedidos Web';
      if (pageSubtitle) pageSubtitle.textContent = 'Bandeja de pedidos entrantes de la Tienda Virtual Fragama | Picking, Asignación y Kardex';
      renderWebOrdersView();
      break;
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
    case 'view-customers-management':
      if (pageTitle) pageTitle.textContent = 'Directorio Oficial de Clientes & Perfil Tributario DGT';
      if (pageSubtitle) pageSubtitle.textContent = 'Base de datos oficial de clientes costarricenses | Cédulas, correos para FE v4.3 y condiciones comerciales';
      renderCustomerDirectoryTable();
      break;
    case 'view-tax-hacienda':
      if (pageTitle) pageTitle.textContent = 'Módulo Tributario Oficial & Liquidación IVA (Hacienda CR)';
      if (pageSubtitle) pageSubtitle.textContent = 'Declaración Mensual D-104, Códigos CABYS de 13 dígitos y Facturación Electrónica v4.3';
      renderTaxHaciendaView();
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
  window.renderUsersRolesTable = renderUsersRolesTable;
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
      const cabysCode = document.getElementById('crudCabysInput')?.value.trim() || '3532200000000';
      const taxRate = parseFloat(document.getElementById('crudTaxRateSelect')?.value) || 13.0;

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
            categoryLabel: family?.name || 'General',
            batchNumber: batchNumber,
            expiryDate: expiryDate,
            hazardClass: hazardClass,
            warehouseLocation: location,
            warehouseZone: family?.zone || 'ZONA-A',
            cabysCode: cabysCode,
            taxRate: taxRate
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
            p.cabysCode = cabysCode;
            p.taxRate = taxRate;
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
            categoryLabel: family?.name || 'General',
            batchNumber: batchNumber,
            expiryDate: expiryDate,
            hazardClass: hazardClass,
            warehouseLocation: location,
            warehouseZone: family?.zone || 'ZONA-A',
            cabysCode: cabysCode,
            taxRate: taxRate
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

        closeModalDirectly('productCrudModal');
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
  window.renderMaintenanceTable = renderMaintenanceTable;
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
          <div style="font-family:'JetBrains Mono',monospace; font-weight:700; color:#0284C7; font-size:0.82rem;">
            ${p.cabysCode || '3532200000000'}
          </div>
          <span class="badge-status" style="background:#E0F2FE; color:#0369A1; font-weight:700; font-size:0.72rem; padding:1px 6px;">
            IVA ${p.taxRate || 13}%
          </span>
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

window.closeProductModal = function() {
  closeModalDirectly('productCrudModal');
};

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
  const cabysIn = document.getElementById('crudCabysInput');
  const taxIn = document.getElementById('crudTaxRateSelect');
  if (cabysIn) cabysIn.value = '3532200000000';
  if (taxIn) taxIn.value = '13.0';
  openModalDirectly('productCrudModal');
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

  const editCabysIn = document.getElementById('crudCabysInput');
  const editTaxIn = document.getElementById('crudTaxRateSelect');
  if (editCabysIn) editCabysIn.value = p.cabysCode || '3532200000000';
  if (editTaxIn) editTaxIn.value = String(p.taxRate || 13.0);

  openModalDirectly('productCrudModal');
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
    
    closeModalDirectly('productCrudModal');
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
  if (typeof renderBulkPreviewTable === 'function') {
    renderBulkPreviewTable();
  }
}
window.parseCsvData = parseCsvData;

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
window.renderBulkPreviewTable = renderBulkPreviewTable;

// ==============================================================================
// 6. CENTRO PROFESIONAL DE REPORTERÍA & AUDITORÍA DE INVENTARIOS
// ==============================================================================
let currentReportTab = 'physical';
const reportPhysicalCounts = {};
const reportFilters = {
  search: '',
  family: 'ALL',
  location: 'ALL',
  stock: 'ALL'
};

window.switchReportTab = function(tabKey) {
  currentReportTab = tabKey || 'physical';
  
  const tabs = ['physical', 'valuation', 'reorder', 'fefo', 'family'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tabBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const card = document.getElementById(`reportCard${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (btn) {
      if (t === currentReportTab) btn.classList.add('active');
      else btn.classList.remove('active');
    }
    if (card) {
      card.style.display = (t === currentReportTab) ? 'block' : 'none';
    }
  });

  renderReportsData();
};

window.onReportFilterChange = function() {
  const searchEl = document.getElementById('reportSearchInput');
  const familyEl = document.getElementById('reportFamilyFilter');
  const locEl = document.getElementById('reportLocationFilter');
  const stockEl = document.getElementById('reportStockFilter');

  reportFilters.search = searchEl ? searchEl.value.trim().toLowerCase() : '';
  reportFilters.family = familyEl ? familyEl.value : 'ALL';
  reportFilters.location = locEl ? locEl.value : 'ALL';
  reportFilters.stock = stockEl ? stockEl.value : 'ALL';

  renderReportsData();
};

window.resetReportFilters = function() {
  reportFilters.search = '';
  reportFilters.family = 'ALL';
  reportFilters.location = 'ALL';
  reportFilters.stock = 'ALL';

  const searchEl = document.getElementById('reportSearchInput');
  const familyEl = document.getElementById('reportFamilyFilter');
  const locEl = document.getElementById('reportLocationFilter');
  const stockEl = document.getElementById('reportStockFilter');

  if (searchEl) searchEl.value = '';
  if (familyEl) familyEl.value = 'ALL';
  if (locEl) locEl.value = 'ALL';
  if (stockEl) stockEl.value = 'ALL';

  renderReportsData();
};

window.updatePhysicalAuditCount = function(productId, rawVal) {
  const val = rawVal.trim() === '' ? undefined : parseFloat(rawVal);
  if (val === undefined || isNaN(val)) {
    delete reportPhysicalCounts[productId];
  } else {
    reportPhysicalCounts[productId] = Math.max(0, val);
  }

  // Actualizar la fila en el DOM inmediatamente
  const row = document.getElementById(`audit-row-${productId}`);
  if (row) {
    const p = AppState.products.find(x => x.id === productId);
    if (!p) return;

    const diffEl = row.querySelector('.audit-diff-cell');
    const statusEl = row.querySelector('.audit-status-cell');
    const counted = reportPhysicalCounts[productId];

    if (diffEl && statusEl) {
      if (counted === undefined) {
        diffEl.innerHTML = `<span class="badge-status" style="background:#F1F5F9; color:#64748B;">Pendiente</span>`;
        statusEl.innerHTML = `<span class="badge-status" style="background:#F8FAFC; color:#64748B;"><i class="bi bi-clock"></i> Sin auditar</span>`;
      } else {
        const diff = counted - p.stock;
        if (diff === 0) {
          diffEl.innerHTML = `<span class="diff-badge diff-zero"><i class="bi bi-check-circle-fill"></i> Conforme (0)</span>`;
          statusEl.innerHTML = `<span class="badge-status badge-confirmed"><i class="bi bi-patch-check-fill"></i> Verificado</span>`;
        } else if (diff < 0) {
          diffEl.innerHTML = `<span class="diff-badge diff-missing"><i class="bi bi-dash-circle-fill"></i> Faltante (${diff})</span>`;
          statusEl.innerHTML = `<span class="badge-status" style="background:#FEE2E2; color:#DC2626;"><i class="bi bi-exclamation-octagon-fill"></i> Descuadre</span>`;
        } else {
          diffEl.innerHTML = `<span class="diff-badge diff-surplus"><i class="bi bi-plus-circle-fill"></i> Sobrante (+${diff})</span>`;
          statusEl.innerHTML = `<span class="badge-status" style="background:#EFF6FF; color:#1D4ED8;"><i class="bi bi-info-circle-fill"></i> Sobrante</span>`;
        }
      }
    }
  }
};

window.setAllPhysicalCountsToSystem = function() {
  AppState.products.forEach(p => {
    reportPhysicalCounts[p.id] = p.stock;
  });
  renderReportsData();
};

window.clearAllPhysicalCounts = function() {
  for (const k in reportPhysicalCounts) {
    delete reportPhysicalCounts[k];
  }
  renderReportsData();
};

window.exportProfessionalInventoryCsv = function() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  let csv = "\uFEFF"; // UTF-8 BOM para apertura perfecta en Excel
  csv += "SKU,CODIGO_BARRAS_EAN13,DESCRIPCION_PRODUCTO,FAMILIA,SUBFAMILIA,UBICACION_BODEGA,LOTE_FEFO,FECHA_VENCIMIENTO,UNIDAD_MEDIDA,STOCK_SISTEMA,CONTEO_FISICO_REAL,DIFERENCIA_MERMA,STOCK_MINIMO_REORDEN,STOCK_MAXIMO,COSTO_UNITARIO_CRC,INVERSION_TOTAL_COSTO_CRC,PRECIO_VENTA_UNIT_CRC,VALOR_VENTA_TOTAL_CRC,MARGEN_BRUTO_CRC,MARGEN_PORCENTUAL,ESTADO_STOCK,RIESGO_SGA\n";

  AppState.products.forEach(p => {
    const cost = p.costPrice || 0;
    const price = p.price || 0;
    const stock = p.stock || 0;
    const counted = reportPhysicalCounts[p.id] !== undefined ? reportPhysicalCounts[p.id] : "";
    const diff = counted !== "" ? (counted - stock) : "";
    const totalCost = cost * stock;
    const totalSale = price * stock;
    const margin = totalSale - totalCost;
    const marginPct = totalSale > 0 ? ((margin / totalSale) * 100).toFixed(1) + "%" : "0%";
    const stockStatus = stock === 0 ? "AGOTADO" : (stock <= (p.minStock || 15) ? "STOCK_BAJO" : "OPTIMO");
    const barcode = p.barcode || ("744" + String(p.id).padStart(10, '0'));

    csv += `"${p.sku}","${barcode}","${(p.name || '').replace(/"/g, '""')}","${p.familyName || ''}","${p.subfamilyName || ''}","${p.location || 'BOD-CARTAGO'}","${p.batchNumber || 'LOT-2026-CAT'}","${p.expiryDate || '2028-12-31'}","${p.unit || 'UNIDAD'}",${stock},${counted},${diff},${p.minStock || 15},${p.maxStock || 500},${cost},${totalCost},${price},${totalSale},${margin},"${marginPct}","${stockStatus}","${p.hazardClass || 'NO_PELIGROSO'}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `Auditoria_Inventario_Fragama_Cartago_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

window.exportInventoryToCsv = window.exportProfessionalInventoryCsv;

window.printProfessionalReport = function(type) {
  const isBlind = (type === 'blind');
  const printEl = document.getElementById('printableOfficialReport');
  if (!printEl) {
    window.print();
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  let totalCost = 0;
  let totalSale = 0;
  let totalUnits = 0;
  AppState.products.forEach(p => {
    totalCost += (p.costPrice || 0) * (p.stock || 0);
    totalSale += (p.price || 0) * (p.stock || 0);
    totalUnits += (p.stock || 0);
  });

  const title = isBlind 
    ? "ACTA DE AUDITORÍA FÍSICA Y HOJA DE CONTEO CIEGO DE BODEGA"
    : (currentReportTab === 'valuation' ? "KARDEX GENERAL VALORIZADO DE INVENTARIO Y ACTIVOS" : "ACTA OFICIAL DE AUDITORÍA Y TOMA DE INVENTARIO FÍSICO");

  let rowsHtml = '';
  AppState.products.forEach((p, idx) => {
    const counted = reportPhysicalCounts[p.id];
    const diff = counted !== undefined ? (counted - p.stock) : null;
    const barcode = p.barcode || ("744" + String(p.id).padStart(10, '0'));

    if (isBlind) {
      rowsHtml += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="font-family:monospace; font-weight:bold;">${p.sku}</td>
          <td style="font-family:monospace; font-size:7pt;">${barcode}</td>
          <td><strong>${p.name}</strong></td>
          <td>${p.familyName}</td>
          <td>${p.location}</td>
          <td>${p.batchNumber || 'LOT-2026'}</td>
          <td>${p.unit || 'UND'}</td>
          <td style="text-align:center; font-weight:bold; letter-spacing:2px;">[ ___ ]</td>
          <td style="border-bottom:1px dashed #666;"></td>
        </tr>
      `;
    } else if (currentReportTab === 'valuation') {
      const pCostTotal = (p.costPrice || 0) * p.stock;
      const pSaleTotal = p.price * p.stock;
      const pMargin = pSaleTotal - pCostTotal;
      rowsHtml += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="font-family:monospace; font-weight:bold;">${p.sku}</td>
          <td><strong>${p.name}</strong></td>
          <td>${p.familyName}</td>
          <td>${p.location}</td>
          <td style="text-align:right; font-weight:bold;">${p.stock}</td>
          <td style="text-align:right;">${formatCRC(p.costPrice || 0)}</td>
          <td style="text-align:right; font-weight:bold;">${formatCRC(pCostTotal)}</td>
          <td style="text-align:right;">${formatCRC(p.price)}</td>
          <td style="text-align:right; font-weight:bold;">${formatCRC(pSaleTotal)}</td>
          <td style="text-align:right; color:#047857; font-weight:bold;">+${formatCRC(pMargin)}</td>
        </tr>
      `;
    } else {
      rowsHtml += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="font-family:monospace; font-weight:bold;">${p.sku}</td>
          <td><strong>${p.name}</strong></td>
          <td>${p.familyName}</td>
          <td>${p.location}</td>
          <td>${p.batchNumber || 'LOT-2026'}</td>
          <td style="text-align:right; font-weight:bold;">${p.stock}</td>
          <td style="text-align:right; font-weight:bold;">${counted !== undefined ? counted : '-'}</td>
          <td style="text-align:center; font-weight:bold;">${diff !== null ? (diff === 0 ? 'CONFORME (0)' : (diff > 0 ? `+${diff}` : `${diff}`)) : 'PENDIENTE'}</td>
          <td>${diff === 0 ? 'Aprobado' : (diff !== null ? 'Discrepancia' : 'En proceso')}</td>
        </tr>
      `;
    }
  });

  const tableHeader = isBlind ? `
    <thead>
      <tr>
        <th style="width:30px;">#</th>
        <th>SKU</th>
        <th>Código EAN-13</th>
        <th>Descripción del Artículo</th>
        <th>Familia</th>
        <th>Ubicación</th>
        <th>Lote</th>
        <th>Unidad</th>
        <th style="width:100px; text-align:center; background:#CBD5E1;">Conteo Físico Real</th>
        <th style="width:120px;">Observaciones / Merma</th>
      </tr>
    </thead>
  ` : (currentReportTab === 'valuation' ? `
    <thead>
      <tr>
        <th style="width:30px;">#</th>
        <th>SKU</th>
        <th>Descripción del Artículo</th>
        <th>Familia</th>
        <th>Ubicación</th>
        <th style="text-align:right;">Stock</th>
        <th style="text-align:right;">Costo Unit.</th>
        <th style="text-align:right;">Total Costo</th>
        <th style="text-align:right;">Precio Vta.</th>
        <th style="text-align:right;">Total Venta</th>
        <th style="text-align:right;">Margen Bruto</th>
      </tr>
    </thead>
  ` : `
    <thead>
      <tr>
        <th style="width:30px;">#</th>
        <th>SKU</th>
        <th>Descripción del Artículo</th>
        <th>Familia</th>
        <th>Ubicación</th>
        <th>Lote</th>
        <th style="text-align:right;">Stock Sist.</th>
        <th style="text-align:right;">Conteo Físico</th>
        <th style="text-align:center;">Diferencia</th>
        <th>Estado</th>
      </tr>
    </thead>
  `);

  printEl.innerHTML = `
    <div style="border-bottom:2px solid #0B192C; padding-bottom:12px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:flex-start;">
      <div>
        <h1 style="font-size:16pt; font-weight:900; color:#0B192C; margin:0; text-transform:uppercase; letter-spacing:0.5px;">
          DISTRIBUIDORA FRAGAMA S.A.
        </h1>
        <p style="font-size:9pt; margin:2px 0; color:#333;">
          <strong>Cédula Jurídica:</strong> 3-101-492817 &bull; <strong>Bodega Central:</strong> Taras, Cartago, Costa Rica
        </p>
        <p style="font-size:8.5pt; margin:0; color:#555;">
          Teléfono: +506 2573-8900 &bull; Email: bodega@fragama.com &bull; WMS Inventory Audit System v4.5
        </p>
      </div>
      <div style="text-align:right; font-size:8.5pt;">
        <div style="background:#0B192C; color:#FFF; padding:4px 10px; font-weight:bold; font-size:9pt; border-radius:4px; display:inline-block; margin-bottom:4px;">
          AUDITORÍA OFICIAL
        </div>
        <div><strong>Fecha de Corte:</strong> ${dateStr}</div>
        <div><strong>Hora:</strong> ${timeStr}</div>
        <div><strong>Auditor:</strong> Christian Reyes (Administrador)</div>
      </div>
    </div>

    <div style="background:#F8FAFC; border:1px solid #CBD5E1; padding:8px 12px; margin-bottom:12px; display:flex; justify-content:space-between; font-size:8.5pt; border-radius:4px;">
      <div><strong>Documento:</strong> ${title}</div>
      <div><strong>Artículos Auditados:</strong> ${AppState.products.length} SKUs</div>
      <div><strong>Existencias Totales:</strong> ${totalUnits.toLocaleString()} unidades</div>
      <div><strong>Inversión Costo:</strong> ${formatCRC(totalCost)}</div>
      <div><strong>Valor Venta:</strong> ${formatCRC(totalSale)}</div>
    </div>

    <table class="print-table">
      ${tableHeader}
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div style="margin-top:25px; page-break-inside:avoid;">
      <p style="font-size:7.5pt; color:#444; text-align:justify; margin-bottom:20px; line-height:1.3;">
        <strong>DECLARACIÓN JURADA DE AUDITORÍA:</strong> Hacemos constar bajo fe de juramento que las cifras, existencias físicas, lotes FEFO y valorizaciones consignadas en la presente acta corresponden fielmente a la inspección y conteo realizado en las instalaciones de Bodega Central de Distribuidora Fragama S.A. en Taras de Cartago, en cumplimiento de los procedimientos internos de control y la normativa tributaria y comercial de la República de Costa Rica.
      </p>

      <div style="display:flex; justify-content:space-between; gap:20px; margin-top:25px;">
        <div style="flex:1; border-top:1.5px solid #000; text-align:center; padding-top:6px; font-size:8pt;">
          <strong>RESPONSABLE DE CONTEO / BODEGUERO</strong><br>
          <span style="color:#666;">Firma y Cédula</span>
        </div>
        <div style="flex:1; border-top:1.5px solid #000; text-align:center; padding-top:6px; font-size:8pt;">
          <strong>AUDITOR DE INVENTARIOS / CONTROL CALIDAD</strong><br>
          <span style="color:#666;">Christian Reyes &bull; Céd: 1-1458-0922</span>
        </div>
        <div style="flex:1; border-top:1.5px solid #000; text-align:center; padding-top:6px; font-size:8pt;">
          <strong>GERENCIA GENERAL / ADMINISTRACIÓN</strong><br>
          <span style="color:#666;">Sello y Firma de Conformidad</span>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    window.print();
  }, 150);
};

function setupReports() {
  const searchEl = document.getElementById('reportSearchInput');
  if (searchEl && !searchEl._bound) {
    searchEl._bound = true;
    searchEl.addEventListener('input', window.onReportFilterChange);
  }
}

function renderReportsData() {
  if (!AppState.products || !Array.isArray(AppState.products)) return;

  const totalCostEl = document.getElementById('reportTotalCost');
  const totalSaleEl = document.getElementById('reportTotalSale');
  const totalMarginEl = document.getElementById('reportTotalMargin');
  const totalUnitsEl = document.getElementById('reportTotalUnits');
  const totalSkusEl = document.getElementById('reportTotalSkus');
  const lowStockCountEl = document.getElementById('reportLowStockCount');

  let totalCost = 0;
  let totalSale = 0;
  let totalUnits = 0;
  let lowStockCount = 0;
  const familiesMap = {};

  AppState.products.forEach(p => {
    const cost = (p.costPrice || 0) * (p.stock || 0);
    const sale = (p.price || 0) * (p.stock || 0);
    totalCost += cost;
    totalSale += sale;
    totalUnits += (p.stock || 0);

    const minS = p.minStock !== undefined ? p.minStock : 15;
    if ((p.stock || 0) <= minS) {
      lowStockCount++;
    }

    const famName = p.familyName || 'Línea General';
    if (!familiesMap[famName]) {
      familiesMap[famName] = { count: 0, stock: 0, cost: 0, sale: 0 };
    }
    familiesMap[famName].count++;
    familiesMap[famName].stock += (p.stock || 0);
    familiesMap[famName].cost += cost;
    familiesMap[famName].sale += sale;
  });

  const margin = totalSale - totalCost;
  const marginPct = totalSale > 0 ? ((margin / totalSale) * 100).toFixed(1) : 0;

  if (totalCostEl) totalCostEl.textContent = formatCRC(totalCost);
  if (totalSaleEl) totalSaleEl.textContent = formatCRC(totalSale);
  if (totalMarginEl) totalMarginEl.innerHTML = `<span style="color:#10B981;">+${formatCRC(margin)}</span> <small style="font-size:0.75rem; color:#64748B;">(${marginPct}%)</small>`;
  if (totalUnitsEl) totalUnitsEl.textContent = `${totalUnits.toLocaleString()} unid.`;
  if (totalSkusEl) totalSkusEl.textContent = `${AppState.products.length} SKUs`;
  if (lowStockCountEl) lowStockCountEl.textContent = `${lowStockCount}`;

  // Actualizar badges en las pestañas
  const bPhys = document.getElementById('badgeCountPhysical');
  const bVal = document.getElementById('badgeCountValuation');
  const bReord = document.getElementById('badgeCountReorder');
  const bFefo = document.getElementById('badgeCountFefo');
  const bFam = document.getElementById('badgeCountFamily');

  if (bPhys) bPhys.textContent = AppState.products.length;
  if (bVal) bVal.textContent = AppState.products.length;
  if (bReord) bReord.textContent = lowStockCount;
  if (bFefo) bFefo.textContent = AppState.products.length;
  if (bFam) bFam.textContent = Object.keys(familiesMap).length;

  // Llenar selectores de filtros si están vacíos
  const famFilterEl = document.getElementById('reportFamilyFilter');
  if (famFilterEl && famFilterEl.options.length <= 1) {
    const fams = Array.from(new Set(AppState.products.map(p => p.familyName || 'Línea General'))).sort();
    fams.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f;
      opt.textContent = f;
      famFilterEl.appendChild(opt);
    });
  }

  const locFilterEl = document.getElementById('reportLocationFilter');
  if (locFilterEl && locFilterEl.options.length <= 1) {
    const locs = Array.from(new Set(AppState.products.map(p => p.location || 'BOD-CENTRAL'))).sort();
    locs.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l;
      opt.textContent = l;
      locFilterEl.appendChild(opt);
    });
  }

  // Filtrado de productos para la tabla activa
  const filtered = AppState.products.filter(p => {
    if (reportFilters.search) {
      const q = reportFilters.search;
      const match = (p.sku && p.sku.toLowerCase().includes(q)) ||
                    (p.name && p.name.toLowerCase().includes(q)) ||
                    (p.barcode && p.barcode.toLowerCase().includes(q)) ||
                    (p.batchNumber && p.batchNumber.toLowerCase().includes(q)) ||
                    (p.familyName && p.familyName.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (reportFilters.family !== 'ALL') {
      if (p.familyName !== reportFilters.family) return false;
    }
    if (reportFilters.location !== 'ALL') {
      if (p.location !== reportFilters.location) return false;
    }
    if (reportFilters.stock === 'active') {
      if ((p.stock || 0) <= 0) return false;
    } else if (reportFilters.stock === 'low') {
      if ((p.stock || 0) > (p.minStock || 15)) return false;
    } else if (reportFilters.stock === 'zero') {
      if ((p.stock || 0) !== 0) return false;
    }
    return true;
  });

  const countBadgeEl = document.getElementById('reportFilterCountBadge');
  if (countBadgeEl) {
    countBadgeEl.textContent = `Mostrando ${filtered.length} de ${AppState.products.length} artículos`;
  }

  // Renderizar la tabla de la pestaña activa
  if (currentReportTab === 'physical') {
    renderPhysicalAuditTable(filtered);
  } else if (currentReportTab === 'valuation') {
    renderValuationTable(filtered);
  } else if (currentReportTab === 'reorder') {
    renderReorderTable(filtered);
  } else if (currentReportTab === 'fefo') {
    renderFefoTable(filtered);
  } else if (currentReportTab === 'family') {
    renderFamilyBreakdownTable(familiesMap, totalUnits);
  }
}
window.renderReportsData = renderReportsData;

function renderPhysicalAuditTable(products) {
  const tbody = document.getElementById('reportPhysicalTableBody');
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="12" style="text-align:center; padding:2rem; color:#64748B;">No se encontraron artículos con los filtros aplicados.</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map((p, idx) => {
    const counted = reportPhysicalCounts[p.id];
    const diff = counted !== undefined ? (counted - p.stock) : null;
    const barcode = p.barcode || ("744" + String(p.id).padStart(10, '0'));

    let diffHtml = `<span class="badge-status" style="background:#F1F5F9; color:#64748B;">Pendiente</span>`;
    let statusHtml = `<span class="badge-status" style="background:#F8FAFC; color:#64748B;"><i class="bi bi-clock"></i> Sin auditar</span>`;

    if (counted !== undefined) {
      if (diff === 0) {
        diffHtml = `<span class="diff-badge diff-zero"><i class="bi bi-check-circle-fill"></i> Conforme (0)</span>`;
        statusHtml = `<span class="badge-status badge-confirmed"><i class="bi bi-patch-check-fill"></i> Verificado</span>`;
      } else if (diff < 0) {
        diffHtml = `<span class="diff-badge diff-missing"><i class="bi bi-dash-circle-fill"></i> Faltante (${diff})</span>`;
        statusHtml = `<span class="badge-status" style="background:#FEE2E2; color:#DC2626;"><i class="bi bi-exclamation-octagon-fill"></i> Descuadre</span>`;
      } else {
        diffHtml = `<span class="diff-badge diff-surplus"><i class="bi bi-plus-circle-fill"></i> Sobrante (+${diff})</span>`;
        statusHtml = `<span class="badge-status" style="background:#EFF6FF; color:#1D4ED8;"><i class="bi bi-info-circle-fill"></i> Sobrante</span>`;
      }
    }

    return `
      <tr id="audit-row-${p.id}">
        <td style="color:#64748B; font-weight:600; font-size:0.75rem;">${idx + 1}</td>
        <td>
          <span style="font-family:monospace; font-weight:700; color:#0B192C;">${p.sku}</span>
        </td>
        <td>
          <span style="font-family:monospace; font-size:0.75rem; color:#475569;"><i class="bi bi-upc"></i> ${barcode}</span>
        </td>
        <td>
          <div style="font-weight:700; color:#0B192C;">${p.name}</div>
          <small style="color:#64748B;">${p.subfamilyName || ''}</small>
        </td>
        <td>
          <span class="badge-status" style="background:#F1F5F9; color:#334155;">${p.familyName}</span>
        </td>
        <td>
          <span style="font-size:0.8rem; font-weight:600; color:#0369A1;"><i class="bi bi-geo-alt"></i> ${p.location || 'BOD-CARTAGO'}</span>
        </td>
        <td>
          <div style="font-size:0.78rem; font-weight:700; color:#334155;">${p.batchNumber || 'LOT-2026-CAT'}</div>
          <small style="color:#64748B;">Vence: ${p.expiryDate || '2028-12-31'}</small>
        </td>
        <td>
          <span style="font-size:0.75rem; font-weight:700; color:#64748B;">${p.unit || 'UNIDAD'}</span>
        </td>
        <td style="text-align:right; font-weight:800; font-size:0.95rem; color:#0B192C;">
          ${p.stock}
        </td>
        <td style="text-align:right;">
          <input type="number" min="0" class="audit-qty-input" 
                 value="${counted !== undefined ? counted : ''}" 
                 placeholder="0"
                 oninput="updatePhysicalAuditCount(${p.id}, this.value)">
        </td>
        <td style="text-align:center;" class="audit-diff-cell">
          ${diffHtml}
        </td>
        <td class="audit-status-cell">
          ${statusHtml}
        </td>
      </tr>
    `;
  }).join('');
}

function renderValuationTable(products) {
  const tbody = document.getElementById('reportDetailedValuationTableBody');
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="14" style="text-align:center; padding:2rem; color:#64748B;">No se encontraron artículos con los filtros aplicados.</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map((p, idx) => {
    const cost = p.costPrice || 0;
    const price = p.price || 0;
    const stock = p.stock || 0;
    const totalCost = cost * stock;
    const totalSale = price * stock;
    const margin = totalSale - totalCost;
    const marginPct = totalSale > 0 ? ((margin / totalSale) * 100).toFixed(1) : 0;
    const barcode = p.barcode || ("744" + String(p.id).padStart(10, '0'));

    let stockBadge = `<span class="badge-status badge-confirmed"><i class="bi bi-check-circle"></i> Óptimo</span>`;
    if (stock === 0) {
      stockBadge = `<span class="badge-status" style="background:#FEE2E2; color:#DC2626;"><i class="bi bi-x-circle"></i> Agotado</span>`;
    } else if (stock <= (p.minStock || 15)) {
      stockBadge = `<span class="badge-status" style="background:#FEF3C7; color:#92400E;"><i class="bi bi-exclamation-triangle"></i> Bajo</span>`;
    }

    return `
      <tr>
        <td style="color:#64748B; font-weight:600; font-size:0.75rem;">${idx + 1}</td>
        <td style="font-family:monospace; font-weight:700; color:#0B192C;">${p.sku}</td>
        <td style="font-family:monospace; font-size:0.75rem; color:#64748B;">${barcode}</td>
        <td>
          <div style="font-weight:700; color:#0B192C;">${p.name}</div>
          <small style="color:#64748B;">${p.unit || 'UNIDAD'}</small>
        </td>
        <td><span class="badge-status" style="background:#F1F5F9; color:#334155;">${p.familyName}</span></td>
        <td style="font-size:0.8rem; color:#0369A1;">${p.location || 'BOD-CENTRAL'}</td>
        <td style="text-align:right; font-weight:800;">${stock}</td>
        <td style="text-align:right;">${formatCRC(cost)}</td>
        <td style="text-align:right; font-weight:700; color:#0B192C;">${formatCRC(totalCost)}</td>
        <td style="text-align:right;">${formatCRC(price)}</td>
        <td style="text-align:right; font-weight:700; color:#1E3E62;">${formatCRC(totalSale)}</td>
        <td style="text-align:right; font-weight:700; color:#10B981;">+${formatCRC(margin)}</td>
        <td style="text-align:right; font-weight:700; color:#10B981;">${marginPct}%</td>
        <td>${stockBadge}</td>
      </tr>
    `;
  }).join('');
}

function renderReorderTable(products) {
  const tbody = document.getElementById('reportReorderTableBody');
  if (!tbody) return;

  const lowProducts = products.filter(p => (p.stock || 0) <= (p.minStock || 15));

  if (lowProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center; padding:3rem; color:#059669;">
          <i class="bi bi-shield-check" style="font-size:2rem; display:block; margin-bottom:8px;"></i>
          <strong>Excelente: No hay artículos con ruptura de stock ni por debajo del mínimo de seguridad.</strong>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = lowProducts.map(p => {
    const minS = p.minStock || 15;
    const deficit = Math.max(0, minS - (p.stock || 0) + 20);
    const isZero = (p.stock || 0) === 0;

    let urgencyBadge = isZero 
      ? `<span class="badge-status" style="background:#FEE2E2; color:#DC2626;"><i class="bi bi-fire"></i> Crítica (Agotado)</span>`
      : `<span class="badge-status" style="background:#FEF3C7; color:#92400E;"><i class="bi bi-exclamation-triangle-fill"></i> Urgente</span>`;

    return `
      <tr>
        <td style="font-family:monospace; font-weight:700; color:#0B192C;">${p.sku}</td>
        <td>
          <div style="font-weight:700; color:#0B192C;">${p.name}</div>
          <small style="color:#64748B;">${p.unit || 'UNIDAD'}</small>
        </td>
        <td><span class="badge-status" style="background:#F1F5F9; color:#334155;">${p.familyName}</span></td>
        <td style="text-align:right; font-weight:800; color:${isZero ? '#DC2626' : '#D97706'}; font-size:1rem;">
          ${p.stock || 0}
        </td>
        <td style="text-align:right; font-weight:700; color:#64748B;">${minS}</td>
        <td style="text-align:right; font-weight:800; color:#DC2626;">+${deficit} unid.</td>
        <td>
          <div style="font-weight:600; color:#0B192C;">${p.supplierName || 'Distribuidora Fragama S.A.'}</div>
          <small style="color:#64748B;">Lead Time: 24-48h</small>
        </td>
        <td>${urgencyBadge}</td>
        <td>
          <button type="button" class="btn-fragama btn-primary-fragama" style="padding:4px 8px; font-size:0.75rem;" onclick="openMovementModal(${p.id})">
            <i class="bi bi-box-arrow-in-down"></i> Registrar Entrada
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderFefoTable(products) {
  const tbody = document.getElementById('reportFefoTableBody');
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:2rem; color:#64748B;">No se encontraron artículos con los filtros aplicados.</td></tr>`;
    return;
  }

  const now = new Date();

  tbody.innerHTML = products.map(p => {
    const expDate = p.expiryDate ? new Date(p.expiryDate) : new Date(now.getFullYear() + 2, 11, 31);
    const diffTime = expDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let fefoBadge = `<span class="badge-status badge-confirmed"><i class="bi bi-shield-check"></i> Óptimo (>90 días)</span>`;
    if (diffDays < 0) {
      fefoBadge = `<span class="badge-status" style="background:#FEE2E2; color:#DC2626;"><i class="bi bi-x-octagon-fill"></i> VENCIDO</span>`;
    } else if (diffDays <= 30) {
      fefoBadge = `<span class="badge-status" style="background:#FEE2E2; color:#B91C1C;"><i class="bi bi-exclamation-triangle-fill"></i> Crítico (<30 días)</span>`;
    } else if (diffDays <= 90) {
      fefoBadge = `<span class="badge-status" style="background:#FEF3C7; color:#92400E;"><i class="bi bi-clock-history"></i> Alerta (<90 días)</span>`;
    }

    let hazardBadge = `<span style="font-size:0.75rem; color:#64748B;"><i class="bi bi-shield"></i> Estándar</span>`;
    if (p.hazardClass === 'CORROSIVO') {
      hazardBadge = `<span class="badge-status" style="background:#FFF1F2; color:#BE123C;"><i class="bi bi-exclamation-diamond-fill"></i> Corrosivo SGA</span>`;
    } else if (p.hazardClass === 'INFLAMABLE') {
      hazardBadge = `<span class="badge-status" style="background:#FFFBEB; color:#B45309;"><i class="bi bi-fire"></i> Inflamable</span>`;
    }

    return `
      <tr>
        <td style="font-family:monospace; font-weight:700; color:#0B192C;">${p.batchNumber || 'LOT-2026-CAT'}</td>
        <td style="font-family:monospace; font-size:0.8rem; color:#475569;">${p.sku}</td>
        <td>
          <div style="font-weight:700; color:#0B192C;">${p.name}</div>
          <small style="color:#64748B;">${p.unit || 'UNIDAD'}</small>
        </td>
        <td><span class="badge-status" style="background:#F1F5F9; color:#334155;">${p.familyName}</span></td>
        <td style="font-size:0.8rem; color:#0369A1;">${p.location || 'BOD-CENTRAL'}</td>
        <td style="font-weight:600; color:#0B192C;">${p.expiryDate || '2028-12-31'}</td>
        <td style="text-align:right; font-weight:800; color:${diffDays <= 30 ? '#DC2626' : (diffDays <= 90 ? '#D97706' : '#059669')};">
          ${diffDays} días
        </td>
        <td>${fefoBadge}</td>
        <td style="text-align:right; font-weight:800; font-size:0.95rem;">${p.stock}</td>
        <td>${hazardBadge}</td>
      </tr>
    `;
  }).join('');
}

function renderFamilyBreakdownTable(familiesMap, totalUnits) {
  const tbody = document.getElementById('reportValuationTableBody');
  if (!tbody) return;

  tbody.innerHTML = Object.keys(familiesMap).map(fam => {
    const data = familiesMap[fam];
    const famMargin = data.sale - data.cost;
    const pctOfTotalStock = totalUnits > 0 ? ((data.stock / totalUnits) * 100).toFixed(1) : 0;
    const marginPct = data.sale > 0 ? ((famMargin / data.sale) * 100).toFixed(1) : 0;

    return `
      <tr>
        <td>
          <div style="font-weight:700; color:#0B192C; font-size:0.95rem;">${fam}</div>
          <small style="color:#64748B;">Participación: <strong>${pctOfTotalStock}%</strong> del volumen físico</small>
        </td>
        <td><span class="badge-status" style="background:#E2E8F0; color:#1E293B;">${data.count} artículos</span></td>
        <td style="text-align:right; font-weight:800; font-size:0.95rem;">${data.stock.toLocaleString()} unidades</td>
        <td style="text-align:right; font-weight:700;">${formatCRC(data.cost)}</td>
        <td style="text-align:right; font-weight:700; color:#1E3E62;">${formatCRC(data.sale)}</td>
        <td style="text-align:right; font-weight:800; color:#10B981;">+${formatCRC(famMargin)}</td>
        <td style="text-align:right; font-weight:800; color:#047857;">${marginPct}%</td>
      </tr>
    `;
  }).join('');
}

// ==============================================================================
// MONITOR EJECUTIVO DE EXISTENCIAS Y SALUD DE INVENTARIO WMS
// ==============================================================================
window._dashboardStockFilter = window._dashboardStockFilter || 'ALL';
window._dashboardStockPage = window._dashboardStockPage || 1;
window._dashboardStockPageSize = window._dashboardStockPageSize || 6;
window._dashboardStockViewMode = window._dashboardStockViewMode || 'table';

function setDashboardStockFilter(filterType, btn) {
  window._dashboardStockFilter = filterType;
  window._dashboardStockPage = 1;
  const tabs = document.querySelectorAll('.dashboard-stock-tab');
  tabs.forEach(t => {
    t.classList.remove('active');
    t.style.background = '#FFF';
    t.style.color = '#475569';
    t.style.borderColor = '#CBD5E1';
  });
  if (btn) {
    btn.classList.add('active');
    if (filterType === 'ALL') {
      btn.style.background = '#0B192C';
      btn.style.color = '#FFF';
      btn.style.borderColor = '#0B192C';
    } else if (filterType === 'LOW') {
      btn.style.background = '#FEF2F2';
      btn.style.color = '#DC2626';
      btn.style.borderColor = '#FECACA';
    } else if (filterType === 'MODERATE') {
      btn.style.background = '#FFF7ED';
      btn.style.color = '#C2410C';
      btn.style.borderColor = '#FED7AA';
    } else if (filterType === 'OPTIMAL') {
      btn.style.background = '#F0FDF4';
      btn.style.color = '#15803D';
      btn.style.borderColor = '#BBF7D0';
    }
  }
  const searchInput = document.getElementById('dashboardProductSearch');
  const familyFilter = document.getElementById('dashboardFamilyFilter');
  renderProductsTable(searchInput ? searchInput.value.trim().toLowerCase() : '', familyFilter ? familyFilter.value : 'ALL');
}
window.setDashboardStockFilter = setDashboardStockFilter;

function setDashboardStockPage(page) {
  window._dashboardStockPage = page;
  const searchInput = document.getElementById('dashboardProductSearch');
  const familyFilter = document.getElementById('dashboardFamilyFilter');
  renderProductsTable(searchInput ? searchInput.value.trim().toLowerCase() : '', familyFilter ? familyFilter.value : 'ALL');
}
window.setDashboardStockPage = setDashboardStockPage;

function setDashboardStockPageSize(size) {
  window._dashboardStockPageSize = parseInt(size, 10) || 6;
  window._dashboardStockPage = 1;
  const searchInput = document.getElementById('dashboardProductSearch');
  const familyFilter = document.getElementById('dashboardFamilyFilter');
  renderProductsTable(searchInput ? searchInput.value.trim().toLowerCase() : '', familyFilter ? familyFilter.value : 'ALL');
}
window.setDashboardStockPageSize = setDashboardStockPageSize;

function setDashboardStockView(mode) {
  window._dashboardStockViewMode = mode;
  const btnTable = document.getElementById('btnStockViewTable');
  const btnGrid = document.getElementById('btnStockViewGrid');
  const tableView = document.getElementById('dashboardStockTableView');
  const gridView = document.getElementById('dashboardStockGridView');

  if (mode === 'grid') {
    if (tableView) tableView.style.display = 'none';
    if (gridView) gridView.style.display = 'grid';
    if (btnGrid) {
      btnGrid.style.background = '#FFF';
      btnGrid.style.color = '#0B192C';
      btnGrid.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
    }
    if (btnTable) {
      btnTable.style.background = 'transparent';
      btnTable.style.color = '#64748B';
      btnTable.style.boxShadow = 'none';
    }
  } else {
    if (tableView) tableView.style.display = 'block';
    if (gridView) gridView.style.display = 'none';
    if (btnTable) {
      btnTable.style.background = '#FFF';
      btnTable.style.color = '#0B192C';
      btnTable.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
    }
    if (btnGrid) {
      btnGrid.style.background = 'transparent';
      btnGrid.style.color = '#64748B';
      btnGrid.style.boxShadow = 'none';
    }
  }
  const searchInput = document.getElementById('dashboardProductSearch');
  const familyFilter = document.getElementById('dashboardFamilyFilter');
  renderProductsTable(searchInput ? searchInput.value.trim().toLowerCase() : '', familyFilter ? familyFilter.value : 'ALL');
}
window.setDashboardStockView = setDashboardStockView;

function renderProductsTable(searchTerm, family) {
  const tbody = document.getElementById('productsTableBody');
  const gridContainer = document.getElementById('dashboardStockGridView');
  if (!tbody && !gridContainer) return;

  const allProds = AppState.products || [];

  // 1. Contadores de Salud de Stock
  const lowProds = allProds.filter(p => Number(p.stock) <= Number(p.minStock));
  const modProds = allProds.filter(p => Number(p.stock) > Number(p.minStock) && Number(p.stock) <= (Number(p.minStock) * 2.5));
  const optProds = allProds.filter(p => Number(p.stock) > (Number(p.minStock) * 2.5));

  const countAllEl = document.getElementById('stockCountAll');
  const countLowEl = document.getElementById('stockCountLow');
  const countModEl = document.getElementById('stockCountMod');
  const countOptEl = document.getElementById('stockCountOpt');
  const totalBadge = document.getElementById('dashboardStockTotalBadge');

  if (countAllEl) countAllEl.textContent = allProds.length;
  if (countLowEl) countLowEl.textContent = lowProds.length;
  if (countModEl) countModEl.textContent = modProds.length;
  if (countOptEl) countOptEl.textContent = optProds.length;
  if (totalBadge) totalBadge.textContent = `${allProds.length} Referencias`;

  // 2. Filtro Activo por Estado de Salud
  let filtered = allProds;
  const currentStockFilter = window._dashboardStockFilter || 'ALL';
  if (currentStockFilter === 'LOW') {
    filtered = lowProds;
  } else if (currentStockFilter === 'MODERATE') {
    filtered = modProds;
  } else if (currentStockFilter === 'OPTIMAL') {
    filtered = optProds;
  }

  // 3. Filtro por Familia
  const famVal = (family !== undefined) ? family : (document.getElementById('dashboardFamilyFilter')?.value || 'ALL');
  if (famVal && famVal !== 'ALL') {
    filtered = filtered.filter(p => String(p.familyId) === String(famVal) || p.familyName === famVal);
  }

  // 4. Búsqueda Rápida por SKU, Nombre o Ubicación
  const term = (searchTerm !== undefined ? searchTerm : (document.getElementById('dashboardProductSearch')?.value || '')).trim().toLowerCase();
  if (term) {
    filtered = filtered.filter(p => 
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.barcode && p.barcode.toLowerCase().includes(term)) ||
      (p.location && p.location.toLowerCase().includes(term))
    );
  }

  // 5. Paginación Compacta
  const totalFiltered = filtered.length;
  const pageSize = window._dashboardStockPageSize || 6;
  const totalPages = Math.ceil(totalFiltered / pageSize) || 1;
  if (window._dashboardStockPage > totalPages) window._dashboardStockPage = totalPages;
  if (window._dashboardStockPage < 1) window._dashboardStockPage = 1;
  const currentPage = window._dashboardStockPage;

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalFiltered);
  const pagedProducts = filtered.slice(startIdx, endIdx);

  // 6. Actualizar Texto de Paginación
  const showingEl = document.getElementById('dashboardStockShowingText');
  if (showingEl) {
    if (totalFiltered === 0) {
      showingEl.textContent = 'No se encontraron productos coincidentes con los filtros.';
    } else {
      showingEl.innerHTML = `Mostrando <strong>${startIdx + 1} &ndash; ${endIdx}</strong> de <strong>${totalFiltered}</strong> productos en bodega`;
    }
  }

  // 7. Botones de Control de Paginación
  const pageControls = document.getElementById('dashboardStockPageControls');
  if (pageControls) {
    if (totalPages <= 1) {
      pageControls.innerHTML = '';
    } else {
      let btnsHtml = `
        <button type="button" class="btn-fragama" style="padding:4px 9px; font-size:0.75rem; background:#FFF; border:1px solid #CBD5E1; color:#0B192C; border-radius:6px; cursor:${currentPage === 1 ? 'not-allowed' : 'pointer'}; opacity:${currentPage === 1 ? '0.4' : '1'};" ${currentPage === 1 ? 'disabled' : `onclick="setDashboardStockPage(${currentPage - 1})"`}>
          <i class="bi bi-chevron-left"></i>
        </button>
      `;

      let pStart = Math.max(1, currentPage - 2);
      let pEnd = Math.min(totalPages, pStart + 4);
      if (pEnd - pStart < 4) {
        pStart = Math.max(1, pEnd - 4);
      }

      for (let pNum = pStart; pNum <= pEnd; pNum++) {
        const isCurrent = pNum === currentPage;
        btnsHtml += `
          <button type="button" class="btn-fragama" style="padding:4px 9px; font-size:0.75rem; border-radius:6px; font-weight:700; cursor:pointer; ${isCurrent ? 'background:#0284C7; color:#FFF; border:1px solid #0284C7; box-shadow:0 2px 4px rgba(2,132,199,0.3);' : 'background:#FFF; color:#475569; border:1px solid #CBD5E1;'}" onclick="setDashboardStockPage(${pNum})">
            ${pNum}
          </button>
        `;
      }

      btnsHtml += `
        <button type="button" class="btn-fragama" style="padding:4px 9px; font-size:0.75rem; background:#FFF; border:1px solid #CBD5E1; color:#0B192C; border-radius:6px; cursor:${currentPage === totalPages ? 'not-allowed' : 'pointer'}; opacity:${currentPage === totalPages ? '0.4' : '1'};" ${currentPage === totalPages ? 'disabled' : `onclick="setDashboardStockPage(${currentPage + 1})"`}>
          <i class="bi bi-chevron-right"></i>
        </button>
      `;
      pageControls.innerHTML = btnsHtml;
    }
  }

  // 8. Render de la Tabla Compacta
  if (tbody) {
    if (pagedProducts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:2rem; color:#64748B;">
            <i class="bi bi-inbox" style="font-size:1.5rem; display:block; margin-bottom:6px; color:#94A3B8;"></i>
            No se encontraron existencias coincidentes con los filtros seleccionados.
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = pagedProducts.map(p => {
        const isLow = Number(p.stock) <= Number(p.minStock);
        const isMod = !isLow && Number(p.stock) <= (Number(p.minStock) * 2.5);
        const ratio = Math.min(100, Math.round((Number(p.stock) / (Number(p.minStock) * 3 || 30)) * 100));
        
        let barColor = '#10B981';
        let statusBadge = '<span style="font-size:0.7rem; font-weight:800; background:#ECFDF5; color:#059669; border:1px solid #A7F3D0; padding:1px 6px; border-radius:4px;"><i class="bi bi-check-circle-fill"></i> Óptimo</span>';
        if (isLow) {
          barColor = '#EF4444';
          statusBadge = `<span style="font-size:0.7rem; font-weight:800; background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; padding:1px 6px; border-radius:4px;"><i class="bi bi-exclamation-triangle-fill"></i> Bajo (Mín: ${p.minStock})</span>`;
        } else if (isMod) {
          barColor = '#F59E0B';
          statusBadge = `<span style="font-size:0.7rem; font-weight:800; background:#FFFBEB; color:#D97706; border:1px solid #FDE68A; padding:1px 6px; border-radius:4px;">Seguridad (Mín: ${p.minStock})</span>`;
        }

        return `
          <tr style="border-bottom:1px solid #F1F5F9; transition:background 0.15s;" onmouseenter="this.style.background='#F8FAFC'" onmouseleave="this.style.background='transparent'">
            <td style="padding:10px 12px;">
              <span style="font-family:'JetBrains Mono',monospace; font-weight:700; color:#0284C7; font-size:0.78rem; background:#F0F9FF; border:1px solid #BAE6FD; padding:3px 7px; border-radius:5px; display:inline-block;">
                ${p.sku}
              </span>
            </td>
            <td style="padding:10px 12px;">
              <div style="font-weight:700; color:#0B192C; font-size:0.86rem; line-height:1.3;">${escapeHtml(p.name)}</div>
              <div style="font-size:0.72rem; color:#64748B; display:flex; gap:6px; align-items:center; margin-top:2px;">
                <span>EAN: ${p.barcode || 'N/A'}</span>
                <span>&bull;</span>
                <span>Lote: ${p.batchNumber || 'LOT-2026-CAT'}</span>
              </div>
            </td>
            <td style="padding:10px 12px;">
              <span class="badge-status badge-in-route" style="font-size:0.72rem; padding:2px 8px; font-weight:700;">${escapeHtml(p.familyName || 'General')}</span>
              <div style="font-size:0.7rem; color:#64748B; margin-top:2px;">${escapeHtml(p.subfamilyName || '')}</div>
            </td>
            <td style="padding:10px 12px; font-size:0.8rem; color:#475569;">
              <div style="display:inline-flex; align-items:center; gap:4px; font-weight:600;">
                <i class="bi bi-geo-alt-fill" style="color:var(--accent-orange); font-size:0.8rem;"></i>
                ${p.location || 'BOD-CARTAGO'}
              </div>
            </td>
            <td style="padding:10px 12px; font-weight:800; color:#0B192C; font-size:0.86rem;">
              ${formatCRC(p.price)}
            </td>
            <td style="padding:10px 12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <span style="font-weight:900; font-size:0.92rem; color:${isLow ? '#DC2626' : '#0B192C'}; font-family:'JetBrains Mono',monospace;">
                  ${p.stock} <small style="font-weight:600; font-size:0.7rem; color:#64748B;">${p.unit || 'und'}</small>
                </span>
                ${statusBadge}
              </div>
              <div style="width:100%; height:5px; background:#E2E8F0; border-radius:999px; overflow:hidden;">
                <div style="width:${Math.max(6, ratio)}%; height:100%; background:${barColor}; border-radius:999px; transition:width 0.3s ease;"></div>
              </div>
            </td>
            <td style="padding:10px 12px; text-align:center;">
              <div style="display:flex; gap:4px; justify-content:center;">
                <button class="btn-fragama btn-primary-fragama" style="padding:4px 8px; font-size:0.72rem; border-radius:6px; font-weight:700;" onclick="openMovementModal(${p.id})" title="Registrar Asiento de Kardex">
                  <i class="bi bi-arrow-left-right"></i> Kardex
                </button>
                <button class="btn-fragama btn-outline-fragama" style="padding:4px 7px; font-size:0.72rem; border-radius:6px;" onclick="showBarcodeForProduct(${p.id})" title="Ver Código de Barras">
                  <i class="bi bi-upc-scan"></i> Código
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // 9. Render de la Cuadrícula Visual (Grid View)
  if (gridContainer && window._dashboardStockViewMode === 'grid') {
    if (pagedProducts.length === 0) {
      gridContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:2rem; color:#64748B;">No se encontraron productos coincidentes.</div>';
    } else {
      gridContainer.innerHTML = pagedProducts.map(p => {
        const isLow = Number(p.stock) <= Number(p.minStock);
        const isMod = !isLow && Number(p.stock) <= (Number(p.minStock) * 2.5);
        const ratio = Math.min(100, Math.round((Number(p.stock) / (Number(p.minStock) * 3 || 30)) * 100));
        let barColor = '#10B981';
        let statusBadge = '<span style="font-size:0.68rem; font-weight:800; background:#ECFDF5; color:#059669; padding:2px 6px; border-radius:4px;">Óptimo</span>';
        if (isLow) {
          barColor = '#EF4444';
          statusBadge = '<span style="font-size:0.68rem; font-weight:800; background:#FEF2F2; color:#DC2626; padding:2px 6px; border-radius:4px;">Bajo Stock</span>';
        } else if (isMod) {
          barColor = '#F59E0B';
          statusBadge = '<span style="font-size:0.68rem; font-weight:800; background:#FFFBEB; color:#D97706; padding:2px 6px; border-radius:4px;">Seguridad</span>';
        }

        return `
          <div style="background:#FFF; border:1px solid ${isLow ? '#FECACA' : '#E2E8F0'}; border-radius:10px; padding:12px; box-shadow:0 2px 8px rgba(0,0,0,0.03); display:flex; flex-direction:column; justify-content:space-between; transition:all 0.2s;" onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 14px rgba(0,0,0,0.06)'" onmouseleave="this.style.transform='none'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.03)'">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-family:'JetBrains Mono',monospace; font-size:0.75rem; font-weight:800; background:#F0F9FF; color:#0284C7; padding:2px 6px; border-radius:4px; border:1px solid #BAE6FD;">${p.sku}</span>
                ${statusBadge}
              </div>
              <div style="font-weight:700; font-size:0.86rem; color:#0B192C; margin-bottom:4px; line-height:1.3; min-height:36px;">${escapeHtml(p.name)}</div>
              <div style="font-size:0.72rem; color:#64748B; margin-bottom:10px;"><i class="bi bi-geo-alt"></i> ${p.location} &bull; ${p.familyName}</div>
              
              <div style="background:#F8FAFC; border-radius:8px; padding:8px; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:4px;">
                  <span style="color:#64748B;">Existencias:</span>
                  <span style="font-weight:800; color:${isLow ? '#DC2626' : '#0B192C'}; font-family:'JetBrains Mono',monospace;">${p.stock} ${p.unit}</span>
                </div>
                <div style="width:100%; height:5px; background:#E2E8F0; border-radius:999px; overflow:hidden;">
                  <div style="width:${Math.max(6, ratio)}%; height:100%; background:${barColor}; border-radius:999px;"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#94A3B8; margin-top:3px;">
                  <span>Mín: ${p.minStock}</span>
                  <span style="font-weight:700; color:#0B192C;">${formatCRC(p.price)}</span>
                </div>
              </div>
            </div>

            <div style="display:flex; gap:6px; margin-top:6px;">
              <button class="btn-fragama btn-primary-fragama" style="flex:1; padding:4px 8px; font-size:0.72rem; border-radius:6px; font-weight:700;" onclick="openMovementModal(${p.id})">
                <i class="bi bi-arrow-left-right"></i> Kardex
              </button>
              <button class="btn-fragama btn-outline-fragama" style="padding:4px 8px; font-size:0.72rem; border-radius:6px;" onclick="showBarcodeForProduct(${p.id})">
                <i class="bi bi-upc-scan"></i> Código
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}
window.renderProductsTable = renderProductsTable;

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
        let item = AppState.dispatches.find(d => String(d.id) === String(window.currentSelectedDispatchId));
        if (item) {
          item.status = selectedStatus;
          item.observation = notes;
        }

        // Si el cliente rechazó la mercancía, reingresar automáticamente al stock central y asentar en Kardex
        if (selectedStatus === 'Rechazado') {
          const returnedProduct = AppState.products[0];
          const restockQty = 5;
          if (returnedProduct) returnedProduct.stock += restockQty;

          const nextId = AppState.kardexMovements.length + 101;
          AppState.kardexMovements.unshift({
            id: nextId,
            code: `DEV-20260929-${String(nextId).padStart(4, '0')}`,
            product: returnedProduct ? returnedProduct.name : 'Mercadería de Pedido',
            batch: returnedProduct ? returnedProduct.batchNumber : 'LOT-DEV-01',
            type: 'Devolución / Rechazo en Ruta',
            sign: 1,
            qty: restockQty,
            prev: (returnedProduct ? returnedProduct.stock : 0) - restockQty,
            final: returnedProduct ? returnedProduct.stock : restockQty,
            cost: returnedProduct ? returnedProduct.costPrice : 1500,
            doc: item ? item.code : 'DSP-DEV',
            user: AppState.currentUser?.name || 'Chofer'
          });
          renderAllViews();
        }

        // Trazabilidad Total: Sincronizar con el pedido central en AppState.salesOrders y la Base de Datos
        let orderCode = item ? item.orderCode : null;
        if (!orderCode && String(window.currentSelectedDispatchId).startsWith('ord_')) {
          const ordId = String(window.currentSelectedDispatchId).replace('ord_', '');
          const so = AppState.salesOrders.find(o => String(o.id) === ordId);
          if (so) orderCode = so.orderCode || so.id;
        }

        if (orderCode) {
          const targetStatus = (selectedStatus === 'Entregado') ? 'ENTREGADO' : (selectedStatus === 'Rechazado' ? 'NO_ENTREGADO' : 'EN_RUTA');
          const ord = AppState.salesOrders.find(o => o.orderCode === orderCode || String(o.id) === String(orderCode));
          if (ord) {
            ord.status = targetStatus;
            ord.deliveredAt = new Date().toISOString();
            if (targetStatus === 'ENTREGADO') ord.stockDeducted = 1;
          }

          // Enviar confirmación al servidor backend para persistencia en SQL Server
          fetch(`/api/orders/${encodeURIComponent(orderCode)}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: targetStatus,
              responsibleUserName: AppState.currentUser?.name || 'Chofer Logístico',
              responsibleUserId: AppState.currentUser?.id || 5,
              notes: notes ? `Entrega en ruta móvil: ${notes}` : `Completado y firmado por el cliente en ruta de entrega.`
            })
          }).then(res => res.json()).then(resData => {
            if (typeof fetchProducts === 'function' && targetStatus === 'ENTREGADO') {
              fetchProducts();
            }
          }).catch(err => console.warn("Sync status err:", err));
        }

        renderDriverDispatches();
        if (typeof renderWebOrdersView === 'function') renderWebOrdersView();
        showNotificationToast(`Entrega ${item ? item.code : ''} marcada como "${selectedStatus}". Trazabilidad actualizada.`, 'success');
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
        <small style="color:#64748B;">Cédula Jurídica: 3-101-778899 • Actividad: 466901<br>Taras, San Nicolás, Cartago, Costa Rica<br>WhatsApp & Tel: +506 6267-7053 / 2551-0000</small>
        <div style="font-size:0.85rem; font-weight:700; margin-top:6px; color:#0284C7;">FACTURA ELECTRÓNICA DE VENTA (v4.3 DGT)</div>
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
    openNewCustBtn.addEventListener('click', () => {
      newCustModal.classList.add('active');
      newCustModal.style.setProperty('display', 'flex', 'important');
    });
  }
  if (closeNewCustBtn && newCustModal) {
    closeNewCustBtn.addEventListener('click', () => {
      newCustModal.classList.remove('active');
      newCustModal.style.display = 'none';
    });
  }
  if (cancelNewCustBtn && newCustModal) {
    cancelNewCustBtn.addEventListener('click', () => {
      newCustModal.classList.remove('active');
      newCustModal.style.display = 'none';
    });
  }

  if (newCustForm) {
    newCustForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const taxId = document.getElementById('newCustId')?.value.trim() || '';
      const docType = document.getElementById('newCustDocType')?.value || '02';
      const name = document.getElementById('newCustName')?.value.trim() || '';
      const contact = document.getElementById('newCustContact')?.value.trim() || '';
      const phone = document.getElementById('newCustPhone')?.value.trim() || '';
      const email = document.getElementById('newCustEmail')?.value.trim() || '';
      const terms = document.getElementById('newCustTerms')?.value || 'Contado';
      const province = document.getElementById('newCustProvince')?.value || 'Cartago';
      const canton = document.getElementById('newCustCanton')?.value.trim() || 'Central';
      const route = (document.getElementById('newCustRoute')?.value.trim()) || canton || province || 'Cartago Centro';
      const address = document.getElementById('newCustAddress')?.value.trim() || '';

      const newCustomer = {
        id: AppState.customers.length + 1,
        taxId, docType, name, contact, phone, email, terms, route, address,
        province, canton, district: 'Central', economicActivity: '466901', paymentMethodDefault: '04'
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
      newCustModal.classList.remove('active');
      newCustModal.style.display = 'none';
      if (typeof closeModalDirectly === 'function') {
        closeModalDirectly('newCustomerModal');
      }
      renderCustomerSelect();
      updateCustomerCard(newCustomer.id);
      if (typeof renderCustomerDirectoryTable === 'function') {
        renderCustomerDirectoryTable();
      }
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

function generateHaciendaClave50(order) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const country = '506';
  const cedulaEmisor = '0003101778899'; // 12 dígitos oficiales Hacienda
  const numRaw = String(order.orderCode || order.id || '101').replace(/\D/g, '');
  const consecutivo = '0010000101' + (numRaw ? numRaw.slice(-10).padStart(10, '0') : '0000000101');
  const situacion = '1'; // 1 = Normal
  let hash = 0;
  const str = String(order.orderCode || 'FRAGAMA');
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const secCode = String(Math.abs(hash % 90000000) + 10000000);
  return `${country}${day}${month}${year}${cedulaEmisor}${consecutivo}${situacion}${secCode}`;
}

window.copyClave50Digits = function(clave) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(clave).then(() => {
      showNotificationToast('📋 Clave numérica de 50 dígitos copiada al portapapeles.', 'success');
    }).catch(() => {
      prompt('Copie la clave numérica de 50 dígitos:', clave);
    });
  } else {
    prompt('Copie la clave numérica de 50 dígitos:', clave);
  }
};

window.shareCurrentOrderWhatsApp = function() {
  const order = window._currentPrintingOrder;
  if (!order) {
    showNotificationToast('No hay documento activo para compartir.', 'warning');
    return;
  }
  const cleanPhone = String(order.customerPhone || '').replace(/\D/g, '');
  const isQuote = (order.docType === 'COTIZACION');
  const docTitle = isQuote ? 'PROFORMA / COTIZACIÓN' : 'FACTURA ELECTRÓNICA DE VENTA';
  const bultos = (typeof summarizeOrderPackages === 'function') ? summarizeOrderPackages(order) : 'Varios bultos';
  
  let msg = `*DISTRIBUIDORA FRAGAMA S.A.*\n` +
            `*Comprobante Oficial de ${docTitle}*\n\n` +
            `📄 *N° Documento:* ${order.orderCode}\n` +
            `👤 *Cliente:* ${order.customerName || 'Cliente'}\n` +
            `📍 *Destino:* ${order.customerProvince || 'Cartago'}, ${order.customerCanton || 'Central'}\n` +
            `📦 *Bultos:* ${bultos}\n` +
            `💰 *Monto Total:* ${formatCRC(order.total)}\n` +
            `🚚 *Estado:* ${order.status || 'Alistado'}\n` +
            `🏢 *Cédula Jurídica:* 3-101-778899\n` +
            `⚙️ *Actividad:* 466901 Venta químicos y limpieza\n\n` +
            `_Consulte o valide sus pedidos en línea con Distribuidora Fragama S.A._\n` +
            `WhatsApp Bodega & Ventas: +506 6267-7053`;

  const encodedMsg = encodeURIComponent(msg);
  const waUrl = cleanPhone.length >= 8 
    ? `https://api.whatsapp.com/send?phone=506${cleanPhone.slice(-8)}&text=${encodedMsg}`
    : `https://api.whatsapp.com/send?text=${encodedMsg}`;

  window.open(waUrl, '_blank');
};

function openOrderPrintModal(order) {
  const modal = document.getElementById('orderPrintModal');
  const body = document.getElementById('orderPrintModalBody');
  if (!modal || !body || !order) return;

  window._currentPrintingOrder = order;

  const isQuote = (order.docType === 'COTIZACION');
  const printItems = Array.isArray(order.items) ? order.items : [];
  const tot = Number(order.total) || 0;
  const subBruto = (order.subtotalBruto !== undefined && order.subtotalBruto !== null) ? Number(order.subtotalBruto) : Math.round(tot / 1.13);
  const descTot = (order.descuentoTotal !== undefined && order.descuentoTotal !== null) ? Number(order.descuentoTotal) : 0;
  const subNeto = (order.subtotalNeto !== undefined && order.subtotalNeto !== null) ? Number(order.subtotalNeto) : (subBruto - descTot);
  const ivaAmount = (order.iva !== undefined && order.iva !== null) ? Number(order.iva) : (tot - subNeto);
  const clave50 = generateHaciendaClave50(order);
  const formattedClave = `${clave50.slice(0,3)} ${clave50.slice(3,9)} ${clave50.slice(9,21)} ${clave50.slice(21,41)} ${clave50.slice(41,42)} ${clave50.slice(42)}`;

  body.innerHTML = `
    <!-- ENCABEZADO CORPORATIVO OFICIAL FRAGAMA CON LOGO DE FACEBOOK -->
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #0284C7; padding-bottom:14px; margin-bottom:14px;">
      <div style="display:flex; align-items:center; gap:16px;">
        <img src="img/logo_oficial.png" alt="Distribuidora Fragama" style="max-height:64px; object-fit:contain; border-radius:6px;">
        <div>
          <h2 style="margin:0; font-size:1.25rem; font-weight:900; color:#0B192C; letter-spacing:0.5px;">DISTRIBUIDORA FRAGAMA S.A.</h2>
          <div style="font-size:0.76rem; color:#475569; line-height:1.35;">
            <strong>Cédula Jurídica:</strong> 3-101-778899 &bull; <strong>Actividad DGT:</strong> 466901<br>
            Bodega Central Taras, 300m Oeste Iglesia, Cartago, Costa Rica<br>
            <strong>WhatsApp &amp; Tel:</strong> +506 6267-7053 / 2551-0000 &bull; <strong>Correo:</strong> facturacion@fragama.cr
          </div>
        </div>
      </div>
      <div style="text-align:right;">
        <span style="display:inline-block; padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:800; background:${isQuote ? '#E0F2FE' : '#DCFCE7'}; color:${isQuote ? '#0284C7' : '#15803D'}; border:1px solid ${isQuote ? '#38BDF8' : '#86EFAC'}; margin-bottom:4px;">
          ${isQuote ? 'PROFORMA / COTIZACIÓN' : 'FACTURA ELECTRÓNICA DE VENTA (v4.3)'}
        </span>
        <div style="font-family:'JetBrains Mono',monospace; font-size:1.15rem; font-weight:800; color:#0B192C;">${escapeHtml(order.orderCode)}</div>
        <div style="font-size:0.75rem; color:#64748B;">Emisión: ${escapeHtml(order.date || 'Hoy')}</div>
      </div>
    </div>

    <!-- CLAVE NUMÉRICA DE 50 DÍGITOS HACIENDA CR (DGT) -->
    <div style="background:#F1F5F9; border:1px solid #CBD5E1; border-radius:8px; padding:8px 12px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
      <div>
        <div style="font-size:0.7rem; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">
          <i class="bi bi-shield-lock-fill text-primary"></i> Clave Numérica de 50 Dígitos (Hacienda Costa Rica DGT-R-48):
        </div>
        <div style="font-family:'JetBrains Mono',monospace; font-size:0.78rem; font-weight:700; color:#0B192C; word-break:break-all;">
          ${formattedClave}
        </div>
      </div>
      <button type="button" class="btn-fragama btn-outline-fragama no-print" onclick="copyClave50Digits('${clave50}')" style="padding:3px 9px; font-size:0.72rem; background:#FFF; border-color:#0284C7; color:#0284C7; font-weight:700;">
        <i class="bi bi-clipboard-check"></i> Copiar Clave
      </button>
    </div>

    <!-- DATOS DEL CLIENTE Y LOGÍSTICA -->
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:12px; margin-bottom:14px; font-size:0.82rem;">
      <div>
        <div style="font-weight:700; color:#64748B; font-size:0.72rem; text-transform:uppercase;">Facturado / Dirigido a:</div>
        <div style="font-weight:800; font-size:0.95rem; color:#0B192C;">${escapeHtml(order.customerName || 'Cliente')}</div>
        <div><strong>Cédula / Identificación:</strong> ${escapeHtml(order.customerTaxId || 'N/A')}</div>
        <div><strong>Contacto:</strong> ${escapeHtml(order.customerContact || 'N/A')}</div>
        <div><strong>Teléfono:</strong> ${escapeHtml(order.customerPhone || 'N/A')}</div>
        <div><strong>Correo Electrónico:</strong> ${escapeHtml(order.customerEmail || 'facturacion@cliente.cr')}</div>
      </div>
      <div>
        <div style="font-weight:700; color:#64748B; font-size:0.72rem; text-transform:uppercase;">Datos de Despacho &amp; Entrega Nacional:</div>
        <div><strong>Chofer / Repartidor Asignado:</strong> <span style="font-weight:800; color:#0284C7;"><i class="bi bi-truck"></i> ${escapeHtml(order.driverName || 'Minor Coto (Chofer Logístico)')}</span></div>
        <div><strong>Responsable de Alisto:</strong> <span style="font-weight:700; color:#059669;">${escapeHtml(order.preparedByName || order.assignedUserName || 'Colaborador Fragama')}</span></div>
        <div><strong>Provincia / Cantón:</strong> <span style="font-weight:700; color:#0284C7;">${escapeHtml(order.customerProvince || order.deliveryRoute || 'Cartago')} &bull; ${escapeHtml(order.customerCanton || 'Central')}</span></div>
        <div><strong>Condición de Pago:</strong> ${escapeHtml(order.terms || 'Contado (SINPE Móvil / Transferencia)')}</div>
        <div><strong>Dirección Exacta:</strong> ${escapeHtml(order.customerAddress || 'Retiro en Bodega')}</div>
        ${order.notes ? `<div style="margin-top:4px; font-style:italic; color:#0369A1;"><strong>Notas:</strong> ${escapeHtml(order.notes)}</div>` : ''}
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
      <button type="button" class="btn-fragama btn-outline-fragama no-print" style="font-size:0.75rem; padding:3px 8px; margin-top:4px;" onclick="handleScannedBarcode('${escapeHtml(order.orderCode)}')">
        <i class="bi bi-search"></i> Probar Lectura de este Pedido
      </button>
    </div>

    <!-- SECCIÓN CÓDIGO QR OFICIAL DE BULTOS PARA AUDITORÍA MÓVIL EN RUTA -->
    <div style="display:flex; justify-content:space-between; align-items:center; background:#F0FDF4; border:1.5px solid #86EFAC; border-radius:10px; padding:12px 16px; margin-bottom:16px;">
      <div style="flex:1; padding-right:16px;">
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <span style="background:#15803D; color:#FFF; font-size:0.7rem; font-weight:800; padding:2px 8px; border-radius:12px;">
            <i class="bi bi-qr-code-scan"></i> CÓDIGO QR DE BULTOS &amp; RUTA
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
        <span style="font-size:0.7rem; font-weight:800; color:#64748B; font-family:'JetBrains Mono',monospace; margin-top:3px; display:block;">${escapeHtml(order.orderCode)}</span>
      </div>
    </div>

    <!-- TABLA DE ARTÍCULOS DETALLADOS CON CABYS Y IVA -->
    <table style="width:100%; border-collapse:collapse; font-size:0.82rem; margin-bottom:16px;">
      <thead style="background:#0B192C; color:#FFFFFF;">
        <tr>
          <th style="padding:7px 8px; text-align:left;">SKU</th>
          <th style="padding:7px 8px; text-align:left;">Código CABYS</th>
          <th style="padding:7px 10px; text-align:left;">Descripción del Producto</th>
          <th style="padding:7px 8px; text-align:center; width:55px;">Cant.</th>
          <th style="padding:7px 8px; text-align:right; width:85px;">P. Unit</th>
          <th style="padding:7px 8px; text-align:center; width:50px;">Desc.</th>
          <th style="padding:7px 8px; text-align:center; width:55px;">IVA</th>
          <th style="padding:7px 10px; text-align:right; width:100px;">Total (₡)</th>
        </tr>
      </thead>
      <tbody>
        ${printItems.length === 0 ? `
          <tr><td colspan="8" style="padding:16px; text-align:center; color:#64748B;">No hay líneas de artículos detalladas en este pedido.</td></tr>
        ` : printItems.map((it, idx) => {
          const qty = Number(it.qty || it.quantity || 1);
          const uPrice = Number(it.unitPrice || 0);
          const disc = Number(it.discountPct || 0);
          const sub = Number(it.subtotal || (qty * uPrice));
          const cabys = it.cabys || it.cabysCode || '4669010000000';
          return `
          <tr style="border-bottom:1px solid #E2E8F0; background:${idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'};">
            <td style="padding:7px 8px; font-family:'JetBrains Mono',monospace; font-size:0.72rem; color:#475569;">${escapeHtml(it.sku || 'N/A')}</td>
            <td style="padding:7px 8px; font-family:'JetBrains Mono',monospace; font-size:0.72rem; color:#0284C7; font-weight:700;">${escapeHtml(cabys)}</td>
            <td style="padding:7px 10px; font-weight:600; color:#0B192C;">${escapeHtml(it.name || it.productName || 'Artículo')} <span style="font-size:0.7rem; color:#64748B;">(${escapeHtml(it.unit || 'UND')})</span></td>
            <td style="padding:7px 8px; text-align:center; font-weight:700;">${qty}</td>
            <td style="padding:7px 8px; text-align:right;">${formatCRC(uPrice)}</td>
            <td style="padding:7px 8px; text-align:center; color:${disc > 0 ? '#DC2626' : '#64748B'};">${disc}%</td>
            <td style="padding:7px 8px; text-align:center; font-weight:700; color:#0369A1;">13%</td>
            <td style="padding:7px 10px; text-align:right; font-weight:800; color:#0B192C;">${formatCRC(sub)}</td>
          </tr>
        `;
        }).join('')}
      </tbody>
    </table>

    <!-- TOTALES FINANCIEROS Y TRIBUTARIOS -->
    <div style="display:flex; justify-content:flex-end; margin-bottom:20px;">
      <div style="width:310px; font-size:0.84rem; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:12px 14px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span style="color:#64748B;">Subtotal Mercancías Gravadas:</span>
          <span style="font-weight:600;">${formatCRC(subBruto)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:#DC2626;">
          <span>Descuento Comercial Concedido:</span>
          <span style="font-weight:600;">-${formatCRC(descTot)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span style="color:#64748B;">Subtotal Gravable (Base Imponible):</span>
          <span style="font-weight:600;">${formatCRC(subNeto)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="color:#64748B;">IVA Costa Rica (13% D-104):</span>
          <span style="font-weight:600; color:#0284C7;">${formatCRC(ivaAmount)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:1.15rem; font-weight:900; color:#0B192C; border-top:2px solid #0284C7; padding-top:6px;">
          <span>TOTAL A PAGAR:</span>
          <span style="color:#0284C7;">${formatCRC(tot)}</span>
        </div>
      </div>
    </div>

    <!-- FIRMAS DE AUTORIZACIÓN Y RECIBO -->
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px; margin-top:24px; font-size:0.75rem; text-align:center;">
      <div style="border-top:1px solid #94A3B8; padding-top:6px;">
        <strong>${escapeHtml(order.preparedByName || order.assignedUserName || 'Distribuidora Fragama S.A.')}</strong><br>
        <span style="color:#64748B;">Control y Alisto &bull; Bodega Fragama</span>
      </div>
      <div style="border-top:1px solid #94A3B8; padding-top:6px;">
        <strong>Recibido Conforme (Cliente)</strong><br>
        <span style="color:#64748B;">Firma, Cédula y Sello Comercial</span>
      </div>
    </div>

    <!-- LEYENDA TRIBUTARIA OFICIAL -->
    <div style="margin-top:20px; padding-top:8px; border-top:1px dashed #CBD5E1; text-align:center; font-size:0.7rem; color:#64748B;">
      Autorizada mediante Resolución DGT-R-48-2016 y DGT-R-033-2019 de la Dirección General de Tributación.<br>
      Este documento es una representación gráfica de la Factura Electrónica generada para los efectos tributarios de ley.
    </div>
  `;

  modal.classList.add('active');

  // Renderizar Código de Barras y QR
  const qrPayload = JSON.stringify({
    empresa: 'Distribuidora Fragama S.A.',
    cedula: '3-101-778899',
    clave: clave50,
    pedido: order.orderCode,
    tipo: order.docType,
    cliente: order.customerName,
    responsable: order.assignedUserName || 'Asignado',
    chofer: order.driverName || 'Minor Coto',
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
    const st = (order.status || '').toUpperCase().trim();
    let matchStatus = (statusFilter === 'ALL');
    if (statusFilter === 'PENDIENTE') {
      matchStatus = (st === 'PENDIENTE' || st === 'SOLICITADO' || st === 'PENDIENTE ALISTO' || st === 'NUEVO');
    } else if (statusFilter === 'ALISTADO') {
      matchStatus = (st === 'ALISTADO' || st === 'EN_ALISTADO');
    } else if (statusFilter === 'EN_RUTA') {
      matchStatus = (st === 'EN_RUTA');
    } else if (statusFilter === 'FACTURADO' || statusFilter === 'ENTREGADO') {
      matchStatus = (st === 'ENTREGADO' || st === 'FACTURADO');
    } else if (statusFilter === 'NO_ENTREGADO') {
      matchStatus = (st === 'NO_ENTREGADO' || st === 'RECHAZADO');
    } else if (statusFilter === 'COTIZACION') {
      matchStatus = (st === 'COTIZACION');
    } else if (statusFilter !== 'ALL') {
      matchStatus = (order.status === statusFilter);
    }

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
    let badgeHtml = '';
    const st = (o.status || 'PENDIENTE').toUpperCase();

    if (st === 'COTIZACION') {
      badgeHtml = `<span class="badge-status badge-in-route"><i class="bi bi-file-earmark-text"></i> Cotización</span>`;
    } else if (st === 'ALISTADO' || st === 'EN_ALISTADO') {
      badgeHtml = `<span class="badge-status badge-confirmed" style="background:#E0F2FE; color:#0369A1; border:1px solid #BAE6FD; font-weight:800;"><i class="bi bi-box-seam"></i> Alistado en Bodega</span>`;
    } else if (st === 'EN_RUTA') {
      badgeHtml = `<span class="badge-status" style="background:#F3E8FF; color:#6B21A8; border:1px solid #DDD6FE; font-weight:800;"><i class="bi bi-truck"></i> En Ruta de Entrega</span>`;
    } else if (st === 'ENTREGADO' || st === 'FACTURADO') {
      badgeHtml = `<span class="badge-status badge-delivered" style="background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; font-weight:800;"><i class="bi bi-check-circle-fill"></i> Entregado (Kardex Rebajado)</span>`;
    } else if (st === 'NO_ENTREGADO' || st === 'RECHAZADO') {
      badgeHtml = `<span class="badge-status" style="background:#FEF2F2; color:#991B1B; border:1px solid #FCA5A5; font-weight:800;" title="${escapeHtml(o.undeliveredReason || 'Rechazado')}"><i class="bi bi-x-circle-fill"></i> No Entregado</span>`;
    } else if (st === 'CANCELADO') {
      badgeHtml = `<span class="badge-status" style="background:#F1F5F9; color:#475569; border:1px solid #CBD5E1; font-weight:700;"><i class="bi bi-slash-circle"></i> Cancelado</span>`;
    } else {
      badgeHtml = `<span class="badge-status badge-observed" style="background:#FEF3C7; color:#92400E; border:1px solid #FCD34D; font-weight:800;"><i class="bi bi-clock"></i> Pendiente Alisto</span>`;
    }

    const itemsCount = Array.isArray(o.items) ? o.items.length : 0;
    const targetCode = o.orderCode || o.id;

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
          <div style="font-weight:700; color:#0B192C;">${escapeHtml(o.customerName || '')}</div>
          <div style="font-size:0.75rem; color:#64748B;">Céd: ${escapeHtml(o.customerTaxId || 'N/A')} &bull; ${escapeHtml(o.terms || 'Contado')}</div>
          ${o.customerAddress ? `<div style="font-size:0.72rem; color:#475569; margin-top:2px;"><i class="bi bi-geo-alt"></i> ${escapeHtml(o.customerAddress)}</div>` : ''}
        </td>
        <td style="padding:10px 14px;">
          <!-- Responsables del Ciclo de Vida -->
          <div style="font-size:0.8rem; font-weight:700; color:#0B192C;">
            <i class="bi bi-person-badge text-primary"></i> ${escapeHtml(o.assignedUserName || 'Ventas General')}
          </div>
          ${o.preparedByName ? `
            <div style="font-size:0.74rem; color:#0369A1; font-weight:700; margin-top:2px;">
              <i class="bi bi-box-seam-fill"></i> Alistó: ${escapeHtml(o.preparedByName)}
            </div>
          ` : ''}
          ${o.driverName ? `
            <div style="font-size:0.74rem; color:#6B21A8; font-weight:700; margin-top:1px;">
              <i class="bi bi-truck"></i> Chofer: ${escapeHtml(o.driverName)}
            </div>
          ` : ''}
          ${o.undeliveredReason ? `
            <div style="font-size:0.72rem; color:#DC2626; font-weight:700; margin-top:2px; background:#FEF2F2; padding:2px 6px; border-radius:4px; border:1px solid #FECACA;">
              <i class="bi bi-exclamation-circle-fill"></i> Motivo: ${escapeHtml(o.undeliveredReason)}
            </div>
          ` : ''}
        </td>
        <td style="padding:10px 14px; font-size:0.8rem; color:#475569;">${o.date}</td>
        <td style="padding:10px 14px; font-size:0.8rem; color:#475569;">
          <div>${escapeHtml(o.deliveryRoute || o.deliveryDate || 'Cartago')}</div>
        </td>
        <td style="padding:10px 14px; text-align:center; font-weight:700;">${itemsCount}</td>
        <td style="padding:10px 14px; text-align:right; font-weight:800; color:var(--fragama-blue-primary); font-family:'JetBrains Mono',monospace;">
          ${formatCRC(o.total)}
        </td>
        <td style="padding:10px 14px; text-align:center;">
          ${badgeHtml}
        </td>
        <td style="padding:10px 14px; text-align:center;">
          <div style="display:flex; justify-content:center; gap:5px; flex-wrap:wrap;">
            
            <!-- 1. Trazabilidad / Bitácora Cronológica -->
            <button class="btn-fragama btn-outline-fragama" style="padding:4px 7px; font-size:0.75rem; border-color:#0284C7; color:#0284C7;" onclick="openOrderAuditTimeline('${targetCode}')" title="Ver Bitácora de Trazabilidad y Tiempos">
              <i class="bi bi-clock-history"></i>
            </button>

            <!-- 2. QR de Bultos & Imprimir -->
            <button class="btn-fragama btn-outline-fragama" style="padding:4px 7px; font-size:0.75rem;" onclick="showQrForOrder('${o.orderCode}')" title="Código QR de Carga y Bultos">
              <i class="bi bi-qr-code text-primary"></i>
            </button>
            <button class="btn-fragama btn-outline-fragama" style="padding:4px 7px; font-size:0.75rem;" onclick="viewSavedOrderPrint('${targetCode}')" title="Ver e Imprimir Comprobante Oficial">
              <i class="bi bi-printer"></i>
            </button>

            <!-- 3. FLUJO POR ESTADO: ALISTAR (PENDIENTE -> ALISTADO) -->
            ${(st === 'PENDIENTE' || st === 'SOLICITADO') ? `
              <button class="btn-fragama btn-primary-fragama" style="padding:4px 9px; font-size:0.75rem; background:#10B981; border-color:#10B981; font-weight:700;" onclick="openOrderPickingModal('${targetCode}')" title="Alistar Pedido y Asignar Responsables">
                <i class="bi bi-box-seam"></i> Alistar
              </button>
            ` : ''}

            <!-- 4. FLUJO POR ESTADO: DESPACHAR / ENTREGAR / NO ENTREGADO (ALISTADO O EN_RUTA) -->
            ${(st === 'ALISTADO' || st === 'EN_ALISTADO') ? `
              <button class="btn-fragama btn-primary-fragama" style="padding:4px 7px; font-size:0.75rem; background:#8B5CF6; border-color:#8B5CF6;" onclick="dispatchOrderToRoute('${targetCode}')" title="Poner en Ruta de Entrega">
                <i class="bi bi-truck"></i> En Ruta
              </button>
              <button class="btn-fragama btn-primary-fragama" style="padding:4px 7px; font-size:0.75rem; background:#059669; border-color:#059669;" onclick="confirmOrderDelivered('${targetCode}')" title="Confirmar Entrega y Descontar Kardex">
                <i class="bi bi-check-circle-fill"></i> Entregar
              </button>
              <button class="btn-fragama" style="padding:4px 7px; font-size:0.75rem; background:#EF4444; color:#FFF; border:none; border-radius:6px;" onclick="openOrderUndeliveredModal('${targetCode}')" title="Registrar Rechazo / No Entrega (Justificación Obligatoria)">
                <i class="bi bi-x-circle-fill"></i>
              </button>
            ` : ''}

            ${st === 'EN_RUTA' ? `
              <button class="btn-fragama btn-primary-fragama" style="padding:4px 8px; font-size:0.75rem; background:#059669; border-color:#059669; font-weight:700;" onclick="confirmOrderDelivered('${targetCode}')" title="Confirmar Entrega y Descontar Kardex">
                <i class="bi bi-check-circle-fill"></i> Entregar
              </button>
              <button class="btn-fragama" style="padding:4px 7px; font-size:0.75rem; background:#EF4444; color:#FFF; border:none; border-radius:6px;" onclick="openOrderUndeliveredModal('${targetCode}')" title="Registrar Rechazo / No Entrega (Justificación Obligatoria)">
                <i class="bi bi-x-circle-fill"></i> No Entregado
              </button>
            ` : ''}

            ${(st === 'NO_ENTREGADO' || st === 'RECHAZADO') ? `
              <button class="btn-fragama btn-primary-fragama" style="padding:4px 8px; font-size:0.75rem; background:#F59E0B; border-color:#F59E0B;" onclick="openOrderPickingModal('${targetCode}')" title="Reintentar Alistado y Reprogramar">
                <i class="bi bi-arrow-repeat"></i> Reprogramar
              </button>
            ` : ''}

            ${st === 'COTIZACION' ? `
              <button class="btn-fragama btn-primary-fragama" style="padding:4px 8px; font-size:0.75rem;" onclick="convertQuoteToSalesOrder(${o.id})" title="Convertir a Pedido Firme">
                <i class="bi bi-check-circle"></i>
              </button>
            ` : ''}

            <!-- 5. WhatsApp directo con cliente -->
            ${o.customerPhone ? `
              <a href="https://wa.me/506${String(o.customerPhone).replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(o.customerName || '')},%20te%20saludamos%20de%20Distribuidora%20Fragama%20respecto%20a%20tu%20pedido%20${o.orderCode}" target="_blank" class="btn-fragama" style="background:#25D366; color:#FFF; padding:4px 7px; font-size:0.75rem; text-decoration:none; display:inline-flex; align-items:center;" title="Contactar Cliente por WhatsApp">
                <i class="bi bi-whatsapp"></i>
              </a>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}


// ==============================================================================
// 1. MODAL DE ALISTADO & PICKING CON ASIGNACIÓN DE RESPONSABLES
// ==============================================================================
window.openOrderPickingModal = async function(orderIdentifier) {
  const cleanId = String(orderIdentifier || '').trim().toUpperCase();
  const order = AppState.salesOrders.find(o => 
    String(o.id || '').trim().toUpperCase() === cleanId || 
    String(o.orderCode || '').trim().toUpperCase() === cleanId
  );
  if (!order) {
    alert("No se encontró el pedido seleccionado.");
    return;
  }

  document.getElementById('pickingOrderId').value = order.id || order.orderCode;
  document.getElementById('pickingOrderCode').value = order.orderCode || order.id;
  document.getElementById('pickingModalSubtitle').textContent = `Pedido #${order.orderCode} • Emisión: ${order.date || 'Hoy'}`;
  document.getElementById('pickingCustomerName').textContent = order.customerName || 'Cliente';
  document.getElementById('pickingCustomerPhone').textContent = order.customerPhone ? `Tel: ${order.customerPhone}` : 'Sin teléfono';
  document.getElementById('pickingDeliveryRoute').textContent = order.deliveryRoute || 'Cartago';
  document.getElementById('pickingDeliveryAddress').textContent = order.customerAddress || 'Entrega en punto comercial';
  document.getElementById('pickingOrderTotal').textContent = formatCRC(order.total || 0);
  document.getElementById('pickingPackingNotes').value = order.notes || '';

  // Renderizar artículos para picking
  const tbody = document.getElementById('pickingItemsTableBody');
  const items = Array.isArray(order.items) ? order.items : [];
  
  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="padding:14px; text-align:center; color:#64748B;">No hay líneas de detalle registradas en este pedido.</td></tr>`;
  } else {
    tbody.innerHTML = items.map((it, idx) => {
      // Buscar información adicional del producto en catálogo (ubicación, categoría)
      const prod = AppState.products.find(p => p.id === it.productId || p.sku === it.sku) || {};
      const loc = prod.location || prod.zone || (prod.categoryLabel ? `ZONA-${prod.categoryLabel.substring(0, 8).toUpperCase()}` : 'BOD-CARTAGO / PAB-A');
      
      return `
        <tr style="border-bottom:1px solid #E2E8F0;">
          <td style="padding:8px 10px; text-align:center;">
            <input type="checkbox" class="picking-item-checkbox" id="pickItem_${idx}" checked style="width:16px; height:16px; accent-color:#10B981; cursor:pointer;">
          </td>
          <td style="padding:8px 10px;">
            <div style="font-weight:700; color:#0B192C;">${escapeHtml(it.name || it.productName || 'Producto')}</div>
            <div style="font-size:0.74rem; color:#64748B; font-family:'JetBrains Mono',monospace;">SKU: ${escapeHtml(it.sku || 'N/A')}</div>
          </td>
          <td style="padding:8px 10px;">
            <span style="background:#F1F5F9; color:#0369A1; padding:2px 6px; border-radius:4px; font-weight:700; font-size:0.75rem;">
              <i class="bi bi-geo-alt-fill text-primary"></i> ${escapeHtml(loc)}
            </span>
          </td>
          <td style="padding:8px 10px; text-align:center; font-weight:800; font-size:0.9rem; color:#0B192C;">
            ${it.qty || it.quantity || 1}
          </td>
        </tr>
      `;
    }).join('');
  }

  // Cargar lista de colaboradores (Bodegueros y Choferes)
  await loadStaffSelectors();

  // Pre-seleccionar usuario actual en bodeguero si aplica, y en chofer si el rol es Chofer
  const curUser = AppState.currentUser || {};
  const respSelect = document.getElementById('pickingResponsibleSelect');
  const driverSelect = document.getElementById('pickingDriverSelect');

  if (curUser && respSelect) {
    for (let i = 0; i < respSelect.options.length; i++) {
      if (Number(respSelect.options[i].value) === Number(curUser.id) || (curUser.name && respSelect.options[i].text.includes(curUser.name.split(' ')[0]))) {
        respSelect.selectedIndex = i;
        break;
      }
    }
  }

  if (curUser && driverSelect && curUser.role === 'Chofer') {
    for (let i = 0; i < driverSelect.options.length; i++) {
      if (Number(driverSelect.options[i].value) === Number(curUser.id) || (curUser.name && driverSelect.options[i].text.includes(curUser.name.split(' ')[0])) || (curUser.username === 'chofer' && driverSelect.options[i].text.includes('Minor'))) {
        driverSelect.selectedIndex = i;
        break;
      }
    }
  }

  const modal = document.getElementById('orderPickingModal');
  if (modal) {
    modal.style.removeProperty('display');
    modal.style.display = 'flex';
    modal.classList.add('active');
  }
};

window.checkAllPickingItems = function() {
  document.querySelectorAll('.picking-item-checkbox').forEach(cb => cb.checked = true);
};

async function loadStaffSelectors() {
  const respSelect = document.getElementById('pickingResponsibleSelect');
  const driverSelect = document.getElementById('pickingDriverSelect');
  const reporterSelect = document.getElementById('undeliveredReporterSelect');

  let staffData = null;
  try {
    const res = await fetch('/api/staff');
    if (res.ok) {
      staffData = await res.json();
    }
  } catch(e) {}

  const allStaff = staffData ? staffData.all : (AppState.systemUsers || [
    { id: 7, name: "Leonardo Reyes Hernández", role: "Administrador" },
    { id: 9, name: "Carlos Calvo (Bodega Central)", role: "Bodeguero" },
    { id: 2, name: "Esteban Quirós (Bodeguero)", role: "Bodeguero" },
    { id: 11, name: "Minor Coto (Chofer Rutas)", role: "Chofer" },
    { id: 4, name: "Mauricio Brenes (Chofer)", role: "Chofer" },
    { id: 6, name: "Carlos Piedra (Ventas / Despacho)", role: "Vendedor" }
  ]);

  if (respSelect) {
    respSelect.innerHTML = allStaff.map(u => `
      <option value="${u.id}">${escapeHtml(u.name)} (${escapeHtml(u.role)})</option>
    `).join('');
  }

  if (driverSelect) {
    driverSelect.innerHTML = allStaff.map(u => `
      <option value="${u.id}" ${u.role === 'Chofer' ? 'selected' : ''}>${escapeHtml(u.name)} (${escapeHtml(u.role)})</option>
    `).join('');
  }

  if (reporterSelect) {
    reporterSelect.innerHTML = allStaff.map(u => `
      <option value="${u.id}">${escapeHtml(u.name)} (${escapeHtml(u.role)})</option>
    `).join('');
  }
}

window.handleConfirmOrderPicking = async function(event) {
  event.preventDefault();
  const orderCode = document.getElementById('pickingOrderCode').value;
  const orderId = document.getElementById('pickingOrderId').value;
  
  const respSelect = document.getElementById('pickingResponsibleSelect');
  const driverSelect = document.getElementById('pickingDriverSelect');
  const packingNotes = document.getElementById('pickingPackingNotes').value.trim();

  const respId = (respSelect && respSelect.value) ? Number(respSelect.value) : 1;
  const respName = (respSelect && respSelect.selectedIndex >= 0 && respSelect.options[respSelect.selectedIndex]) 
    ? respSelect.options[respSelect.selectedIndex].text.split(' (')[0] 
    : 'Colaborador Fragama';
  
  const driverId = (driverSelect && driverSelect.value) ? Number(driverSelect.value) : 1;
  const driverName = (driverSelect && driverSelect.selectedIndex >= 0 && driverSelect.options[driverSelect.selectedIndex]) 
    ? driverSelect.options[driverSelect.selectedIndex].text.split(' (')[0] 
    : 'Chofer de Ruta';

  const submitBtn = document.getElementById('btnConfirmPickingSubmit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Guardando Trazabilidad...`;
  }

  try {
    const payload = {
      status: 'ALISTADO',
      responsibleUserId: respId,
      responsibleUserName: respName,
      driverUserId: driverId,
      driverName: driverName,
      notes: packingNotes ? `Alistado verificado. ${packingNotes}` : 'Alistado completado en bodega y preparado para ruta.'
    };

    const res = await fetch(`/api/orders/${encodeURIComponent(orderCode || orderId)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (res.ok && result.success) {
      // Actualizar pedido local en AppState
      const ord = AppState.salesOrders.find(o => String(o.id) === String(orderId) || o.orderCode === String(orderCode));
      if (ord) {
        ord.status = 'ALISTADO';
        ord.preparedByName = respName;
        ord.driverName = driverName;
      }
      closeModalDirectly('orderPickingModal');
      refreshAllOrderViews();
      showNotificationToast(`✅ Pedido ${orderCode} Alistado con éxito por ${respName}. Asignado a ${driverName}.`, 'success');
    } else {
      alert(result.detail || "Error al registrar el alistado del pedido.");
    }
  } catch(e) {
    console.error("Error guardando alistado:", e);
    alert("Error conectando con el servidor al registrar alistado.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="bi bi-check2-circle"></i> Confirmar Alistado y Dejar Listo`;
  }
};


// ==============================================================================
// 2. DESPACHO A RUTA (ALISTADO -> EN_RUTA)
// ==============================================================================
window.dispatchOrderToRoute = async function(orderIdentifier) {
  const cleanId = String(orderIdentifier || '').trim().toUpperCase();
  const order = AppState.salesOrders.find(o => 
    String(o.id || '').trim().toUpperCase() === cleanId || 
    String(o.orderCode || '').trim().toUpperCase() === cleanId
  );
  if (!order) {
    alert("No se encontró el pedido a despachar.");
    return;
  }

  const driver = order.driverName || 'Chofer de Ruta';
  if (!confirm(`¿Confirmar que el pedido #${order.orderCode} ha salido de bodega en ruta con ${driver}?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(order.orderCode || order.id)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'EN_RUTA',
        responsibleUserName: driver,
        notes: `Cargado en vehículo de reparto y despachado hacia dirección del cliente.`
      })
    });

    if (res.ok) {
      order.status = 'EN_RUTA';
      refreshAllOrderViews();
      showNotificationToast(`🚚 Pedido ${order.orderCode} en ruta de entrega con ${driver}.`, 'info');
    }
  } catch(e) {
    alert("Error actualizando a En Ruta.");
  }
};


// ==============================================================================
// 3. CONFIRMAR ENTREGA Y DESCUENTO AUTOMÁTICO EN KARDEX (ALISTADO/EN_RUTA -> ENTREGADO)
// ==============================================================================
window.confirmOrderDelivered = async function(orderIdentifier) {
  const cleanId = String(orderIdentifier || '').trim().toUpperCase();
  const order = AppState.salesOrders.find(o => 
    String(o.id || '').trim().toUpperCase() === cleanId || 
    String(o.orderCode || '').trim().toUpperCase() === cleanId
  );
  if (!order) {
    alert("No se encontró el pedido seleccionado para entrega.");
    return;
  }

  const confirmMsg = `¿CONFIRMAR ENTREGA DEL PEDIDO #${order.orderCode} AL CLIENTE?\n\n` +
                     `📦 Cliente: ${order.customerName}\n` +
                     `💰 Total: ${formatCRC(order.total)}\n\n` +
                     `⚠️ IMPORTANTE: Al confirmar la entrega, el sistema descontará automáticamente las cantidades del inventario y registrará la salida oficial en el Kardex para que no existan diferencias físicas.`;

  if (!confirm(confirmMsg)) return;

  const curUser = AppState.currentUser || {};
  const reporterName = curUser.name || order.driverName || 'Colaborador Fragama';
  const reporterId = curUser.id || 1;

  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(order.orderCode || order.id)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'ENTREGADO',
        responsibleUserId: reporterId,
        responsibleUserName: reporterName,
        notes: 'Mercadería entregada a entera satisfacción del cliente. Stock rebajado en Kardex.'
      })
    });

    const result = await res.json().catch(() => ({}));
    if (res.ok && result.success) {
      order.status = 'ENTREGADO';
      order.stockDeducted = 1;
      order.deliveredAt = new Date().toISOString();
      
      // Recargar catálogo de productos para actualizar stocks en pantalla
      if (typeof fetchProducts === 'function') {
        fetchProducts();
      }
      
      refreshAllOrderViews();
      showNotificationToast(`🎉 Pedido ${order.orderCode} entregado. ¡Inventario Kardex descontado automáticamente sin descuadre!`, 'success');
    } else {
      alert(result.detail || "Error al confirmar entrega en el servidor central.");
    }
  } catch(e) {
    console.error("Error confirmando entrega:", e);
    alert("Error de conexión al confirmar entrega.");
  }
};


// ==============================================================================
// 4. REGISTRAR NO ENTREGA / RECHAZO (JUSTIFICACIÓN OBLIGATORIA)
// ==============================================================================
window.openOrderUndeliveredModal = async function(orderIdentifier) {
  const cleanId = String(orderIdentifier || '').trim().toUpperCase();
  const order = AppState.salesOrders.find(o => 
    String(o.id || '').trim().toUpperCase() === cleanId || 
    String(o.orderCode || '').trim().toUpperCase() === cleanId
  );
  if (!order) return;

  document.getElementById('undeliveredOrderId').value = order.id || order.orderCode;
  document.getElementById('undeliveredOrderCode').value = order.orderCode || order.id;
  document.getElementById('undeliveredModalSubtitle').textContent = `Pedido #${order.orderCode} • Cliente: ${order.customerName}`;
  document.getElementById('undeliveredPredefinedReason').value = '';
  document.getElementById('undeliveredJustificationText').value = '';
  document.getElementById('undeliveredErrorAlert').style.display = 'none';

  await loadStaffSelectors();
  const modal = document.getElementById('orderUndeliveredModal');
  if (modal) {
    modal.style.removeProperty('display');
    modal.style.display = 'flex';
    modal.classList.add('active');
  }
};

window.handlePredefinedReasonChange = function() {
  const select = document.getElementById('undeliveredPredefinedReason');
  const txt = document.getElementById('undeliveredJustificationText');
  if (select.value && select.value !== 'OTRO') {
    txt.value = select.value;
  }
};

window.handleConfirmUndeliveredOrder = async function(event) {
  event.preventDefault();
  const orderCode = document.getElementById('undeliveredOrderCode').value;
  const orderId = document.getElementById('undeliveredOrderId').value;
  const justification = document.getElementById('undeliveredJustificationText').value.trim();
  const errDiv = document.getElementById('undeliveredErrorAlert');
  
  if (!justification || justification.length < 5) {
    errDiv.textContent = "❌ Es obligatorio ingresar una justificación detallada (mínimo 5 caracteres).";
    errDiv.style.display = 'block';
    return;
  }
  errDiv.style.display = 'none';

  const repSelect = document.getElementById('undeliveredReporterSelect');
  const repId = (repSelect && repSelect.value) ? Number(repSelect.value) : 1;
  const repName = (repSelect && repSelect.selectedIndex >= 0 && repSelect.options[repSelect.selectedIndex]) 
    ? repSelect.options[repSelect.selectedIndex].text.split(' (')[0] 
    : 'Chofer de Ruta';

  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderCode || orderId)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'NO_ENTREGADO',
        justification: justification,
        responsibleUserId: repId,
        responsibleUserName: repName,
        notes: `No entregado. Motivo: ${justification}`
      })
    });

    const result = await res.json();
    if (res.ok && result.success) {
      const ord = AppState.salesOrders.find(o => String(o.id) === String(orderId) || o.orderCode === String(orderCode));
      if (ord) {
        ord.status = 'NO_ENTREGADO';
        ord.undeliveredReason = justification;
        ord.stockDeducted = 0;
      }
      closeModalDirectly('orderUndeliveredModal');
      
      // Si hubo reversión de inventario, recargar catálogo
      if (typeof fetchProducts === 'function') {
        fetchProducts();
      }

      refreshAllOrderViews();
      showNotificationToast(`⚠️ Incidencia registrada para pedido ${orderCode}. Stock reingresado a bodega.`, 'warning');
    } else {
      alert(result.detail || "Error registrando no entrega.");
    }
  } catch(e) {
    alert("Error de conexión al registrar justificación.");
  }
};


// ==============================================================================
// 5. BITÁCORA Y TRAZABILIDAD CRONOLÓGICA (TIMELINE AUDIT TRAIL)
// ==============================================================================
window.openOrderAuditTimeline = async function(orderIdentifier) {
  const order = AppState.salesOrders.find(o => String(o.id) === String(orderIdentifier) || o.orderCode === String(orderIdentifier));
  const targetCode = order ? order.orderCode : orderIdentifier;

  document.getElementById('auditModalSubtitle').textContent = `Pedido #${targetCode} • Trazabilidad Operativa`;
  
  if (order) {
    document.getElementById('auditCurrentStatusBadge').textContent = order.status || 'PENDIENTE';
    document.getElementById('auditStockDeductedBadge').textContent = order.stockDeducted ? '✅ Sí (Stock rebajado)' : '❌ No (Sin descontar aún)';
    document.getElementById('auditStockDeductedBadge').style.color = order.stockDeducted ? '#10B981' : '#64748B';
    document.getElementById('auditPreparedBySpan').textContent = order.preparedByName || 'Pendiente de alistar';
    document.getElementById('auditDriverSpan').textContent = order.driverName || 'Sin chofer asignado';
  }

  const container = document.getElementById('auditTimelineContainer');
  container.innerHTML = `<div style="text-align:center; padding:20px; color:#64748B;"><span class="spinner-border spinner-border-sm"></span> Cargando bitácora de trazabilidad...</div>`;

  document.getElementById('orderAuditTimelineModal').classList.add('active');

  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(targetCode)}/audit-log`);
    if (res.ok) {
      const logs = await res.json();
      renderTimelineItems(logs);
    } else {
      container.innerHTML = `<div style="padding:15px; color:#DC2626;">Error cargando la bitácora del pedido.</div>`;
    }
  } catch(e) {
    container.innerHTML = `<div style="padding:15px; color:#DC2626;">Fallo de conexión al consultar bitácora.</div>`;
  }
};

function renderTimelineItems(logs) {
  const container = document.getElementById('auditTimelineContainer');
  if (!logs || logs.length === 0) {
    container.innerHTML = `<div style="padding:15px; color:#64748B;">No se registran eventos previos para este pedido.</div>`;
    return;
  }

  container.innerHTML = logs.map(item => {
    let itemClass = '';
    let dotIcon = 'bi-circle';
    const st = (item.newStatus || '').toUpperCase();

    if (st === 'ALISTADO' || st === 'EN_ALISTADO') {
      itemClass = 'warning';
      dotIcon = 'bi-box-seam';
    } else if (st === 'EN_RUTA') {
      itemClass = 'purple';
      dotIcon = 'bi-truck';
    } else if (st === 'ENTREGADO' || st === 'FACTURADO') {
      itemClass = 'success';
      dotIcon = 'bi-check2-circle';
    } else if (st === 'NO_ENTREGADO' || st === 'RECHAZADO') {
      itemClass = 'danger';
      dotIcon = 'bi-x-circle';
    } else if (st === 'SOLICITADO' || st === 'PENDIENTE') {
      itemClass = '';
      dotIcon = 'bi-cart-check';
    }

    return `
      <div class="timeline-item ${itemClass}">
        <div class="timeline-dot">
          <i class="bi ${dotIcon}"></i>
        </div>
        <div class="timeline-content">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <div class="timeline-title">${escapeHtml(item.newStatus)}</div>
            <div class="timeline-time">${escapeHtml(item.timestamp)}</div>
          </div>
          <div class="timeline-body">
            <strong>Responsable:</strong> ${escapeHtml(item.userName || 'Sistema')} (${escapeHtml(item.userRole || 'Colaborador')})
          </div>
          ${item.notes ? `
            <div style="font-size:0.78rem; color:#475569; margin-top:3px;">
              <i class="bi bi-chat-left-text"></i> ${escapeHtml(item.notes)}
            </div>
          ` : ''}
          ${item.justification ? `
            <div class="timeline-justification">
              <strong><i class="bi bi-exclamation-triangle-fill"></i> Justificación Obligatoria:</strong> ${escapeHtml(item.justification)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

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
window.setDriverProvinceFilter = setDriverProvinceFilter;

window.onAdminDriverFilterChange = function(driverVal) {
  AppState.adminSelectedDriverFilter = driverVal;
  renderDriverDispatches();
};

function getUnifiedDriverDispatches() {
  const curUser = AppState.currentUser || {};
  const list = [...AppState.dispatches];

  // Integrar pedidos en ALISTADO o EN_RUTA desde AppState.salesOrders si aún no están en la lista
  const activeOrders = (AppState.salesOrders || []).filter(o => {
    const st = (o.status || '').toUpperCase();
    return st === 'EN_RUTA' || st === 'ALISTADO' || st === 'ENTREGADO';
  });

  activeOrders.forEach(o => {
    const code = o.orderCode || o.id;
    const exists = list.some(d => d.orderCode === code || d.code === code);
    if (!exists) {
      const bultos = (typeof summarizeOrderPackages === 'function') ? summarizeOrderPackages(o) : 'Carga general';
      const itemsList = Array.isArray(o.items) && o.items.length > 0
        ? o.items.map(it => `${it.qty || 1}x ${it.name || it.productName || 'Producto'}`).join(', ')
        : 'Carga de mercadería';

      list.push({
        id: 'ord_' + o.id,
        code: `DSP-${code}`,
        orderCode: code,
        customer: o.customerName || 'Cliente Fragama',
        province: o.customerProvince || o.deliveryRoute || 'Cartago',
        canton: o.customerCanton || 'Central',
        address: o.customerAddress || 'Dirección registrada en pedido',
        contact: `${o.customerContact || o.customerName || 'Cliente'} (${o.customerPhone || 'N/A'})`,
        invoice: `FAC-${code}`,
        items: itemsList,
        packages: [{ qty: (Array.isArray(o.items) ? o.items.length : 1), unit: 'Bultos', desc: bultos }],
        driver: o.driverName || 'Minor Coto - Isuzu CL-294012',
        driverName: o.driverName || 'Minor Coto',
        driverUserId: o.driverUserId || 5,
        status: o.status === 'ENTREGADO' ? 'Entregado' : (o.status === 'EN_RUTA' ? 'En Ruta' : 'Asignado'),
        verified: true,
        departureTime: o.date ? (o.date.split(' ')[1] || '08:30 AM') : '08:30 AM'
      });
    }
  });

  return list;
}

function renderDriverDispatches() {
  const container = document.getElementById('driverDispatchesList');
  if (!container) return;

  const curUser = AppState.currentUser || {};
  const isAdmin = (curUser.role === 'Administrador');
  const isDriver = (curUser.role === 'Chofer');

  // 1. Configuración de controles de administrador vs chofer
  const adminBar = document.getElementById('adminDriverControlBar');
  const adminSelect = document.getElementById('adminDriverFilterSelect');
  const userNameEl = document.getElementById('driverLoggedUserName');
  const vehicleInfoEl = document.getElementById('driverVehicleInfo');
  const scopeBadgeEl = document.getElementById('driverScopeBadge');

  const allDispatches = getUnifiedDriverDispatches();

  if (isAdmin) {
    if (adminBar) adminBar.style.display = 'block';
    if (adminSelect) {
      // Recopilar nombres únicos de choferes asignados
      const setDrivers = new Set();
      (AppState.systemUsers || []).filter(u => u.role === 'Chofer').forEach(u => setDrivers.add(u.name.split(' (')[0].trim()));
      allDispatches.forEach(d => {
        const raw = d.driverName || (d.driver ? d.driver.split(' - ')[0] : '');
        if (raw) setDrivers.add(raw.trim());
      });

      const currentSel = AppState.adminSelectedDriverFilter || 'ALL';
      adminSelect.innerHTML = `<option value="ALL" ${currentSel === 'ALL' ? 'selected' : ''}>🌐 Todos los Choferes (Flota Consolidada)</option>` +
        Array.from(setDrivers).map(dName => `
          <option value="${escapeHtml(dName)}" ${currentSel === dName ? 'selected' : ''}>🚚 ${escapeHtml(dName)}</option>
        `).join('');
    }

    const selDriver = AppState.adminSelectedDriverFilter || 'ALL';
    if (userNameEl) {
      userNameEl.textContent = (selDriver === 'ALL') 
        ? "Centro Maestro de Despacho & Rutas (Auditoría Administrativa)" 
        : `Ruta Asignada: ${selDriver}`;
    }
    if (vehicleInfoEl) {
      vehicleInfoEl.innerHTML = `<i class="bi bi-shield-check text-warning"></i> Modo Administrador &bull; Control y supervisión de todos los despachos`;
    }
    if (scopeBadgeEl) {
      scopeBadgeEl.textContent = (selDriver === 'ALL') ? "Flota Completa Nacional" : `Chofer: ${selDriver}`;
    }
  } else {
    if (adminBar) adminBar.style.display = 'none';
    if (userNameEl) userNameEl.textContent = curUser.name || 'Minor Coto (Chofer Logístico)';
    if (vehicleInfoEl) vehicleInfoEl.innerHTML = `<i class="bi bi-truck-front-fill text-warning"></i> Camión Isuzu Forward CL-294012 &bull; Bodega Central Taras`;
    if (scopeBadgeEl) scopeBadgeEl.textContent = "Mis Entregas Asignadas";
  }

  // 2. SEGREGACIÓN DE DATOS POR ASIGNACIÓN (Row-Level Security)
  let visibleDispatches = allDispatches;
  if (!isAdmin) {
    // Si no es Administrador (ej. Chofer), SOLO ve lo que tiene asignado
    const uNameLower = (curUser.name || '').toLowerCase();
    const uFirst = uNameLower.split(' ')[0] || '';
    visibleDispatches = allDispatches.filter(d => {
      const dDriver = (d.driver || '').toLowerCase();
      const dDriverName = (d.driverName || '').toLowerCase();
      const matchName = uFirst && (dDriver.includes(uFirst) || dDriverName.includes(uFirst));
      const matchId = curUser.id && d.driverUserId && (Number(d.driverUserId) === Number(curUser.id));
      const isDefaultChofer = (curUser.username === 'chofer' && (dDriver.includes('minor') || dDriverName.includes('minor')));
      return matchName || matchId || isDefaultChofer;
    });
  } else if (AppState.adminSelectedDriverFilter && AppState.adminSelectedDriverFilter !== 'ALL') {
    const selLower = AppState.adminSelectedDriverFilter.toLowerCase();
    visibleDispatches = allDispatches.filter(d => {
      const dDriver = (d.driver || '').toLowerCase();
      const dDriverName = (d.driverName || '').toLowerCase();
      return dDriver.includes(selLower) || dDriverName.includes(selLower);
    });
  }

  // 3. Filtrado por provincia de Costa Rica
  const currentProv = AppState.driverProvinceFilter || 'ALL';
  const filtered = visibleDispatches.filter(d => {
    if (currentProv === 'ALL') return true;
    return d.province === currentProv;
  });

  // 4. Métricas superiores calculadas con las entregas asignadas visibles
  const totalPkgsEl = document.getElementById('driverTotalPackages');
  const covProvsEl = document.getElementById('driverCoveredProvinces');
  const deliveredRatioEl = document.getElementById('driverDeliveredRatio');
  const navBadgeEl = document.getElementById('navDispatchCount');

  if (navBadgeEl) navBadgeEl.textContent = visibleDispatches.length;

  let totalBultos = 0;
  visibleDispatches.forEach(d => {
    if (d.packages && Array.isArray(d.packages)) {
      d.packages.forEach(p => totalBultos += (p.qty || 0));
    } else {
      totalBultos += 3;
    }
  });

  const uniqueProvs = new Set(visibleDispatches.map(d => d.province || 'Cartago')).size;
  const deliveredCount = visibleDispatches.filter(d => d.status === 'Entregado').length;

  if (totalPkgsEl) totalPkgsEl.textContent = `${totalBultos} bultos`;
  if (covProvsEl) covProvsEl.textContent = `${uniqueProvs} Zonas`;
  if (deliveredRatioEl) deliveredRatioEl.textContent = `${deliveredCount} / ${visibleDispatches.length}`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="background:#FFF; border:1px dashed #CBD5E1; border-radius:12px; padding:2rem; text-align:center; color:#64748B;">
        <i class="bi bi-geo-alt-fill" style="font-size:2rem; color:#CBD5E1;"></i>
        <div style="font-weight:700; margin-top:8px;">No hay despachos asignados para ${currentProv === 'ALL' ? 'su ruta actual' : currentProv}</div>
        <p style="font-size:0.8rem; color:#94A3B8; margin-top:4px;">
          ${!isAdmin ? 'Usted solo visualiza los paquetes y pedidos asignados específicamente a su usuario/camión.' : 'No hay despachos con el filtro seleccionado.'}
        </p>
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
    const assignedDriverName = d.driverName || (d.driver ? d.driver.split(' - ')[0] : 'Chofer');

    return `
      <div class="dispatch-card ${d.status === 'En Ruta' ? 'highlight' : ''}">
        <div class="dispatch-card-header">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="dispatch-code">${d.code}</span>
            <span class="badge-province ${provClass}">
              <i class="bi bi-pin-map-fill"></i> ${d.province || 'Costa Rica'} &bull; ${d.canton || 'Central'}
            </span>
            ${isAdmin ? `
              <span style="background:#0F172A; color:#E2E8F0; font-size:0.72rem; padding:2px 8px; border-radius:12px; font-weight:700;">
                <i class="bi bi-person-fill text-warning"></i> ${escapeHtml(assignedDriverName)}
              </span>
            ` : ''}
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
            <button type="button" class="btn-fragama btn-outline-fragama" style="padding:3px 8px; font-size:0.75rem; background:#FFF;" onclick="showQrForDispatch('${d.id}')" title="Ver Código QR de estos bultos">
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
            <button class="btn-driver-action btn-delivered" onclick="openDriverModal('${d.id}', 'Entregado')">
              <i class="bi bi-check-circle-fill"></i> Entregado
            </button>
            <button class="btn-driver-action btn-observed" onclick="openDriverModal('${d.id}', 'Observado')">
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
window.renderDriverDispatches = renderDriverDispatches;

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
  if (closeBarcodeModal && barcodeModal) {
    closeBarcodeModal.addEventListener('click', () => barcodeModal.classList.remove('active'));
  }
}

window.closeBarcodeModal = function() {
  const modal = document.getElementById('barcodeModal');
  if (modal) modal.classList.remove('active');
};

window.onBarcodeProductSelectChange = function(val) {
  const prodId = parseInt(val, 10);
  if (!isNaN(prodId)) {
    window.showBarcodeForProduct(prodId);
  }
};

window.openBarcodeLabelsModal = function(productId) {
  const modal = document.getElementById('barcodeModal');
  if (!modal) return;

  const selector = document.getElementById('barcodeProductSelector');
  if (selector && AppState.products && AppState.products.length > 0) {
    selector.innerHTML = AppState.products.map(p => `
      <option value="${p.id}" ${productId && p.id === productId ? 'selected' : ''}>
        [${p.sku}] ${p.name} (${p.categoryLabel || 'Bodega'}) - Stock: ${p.stock}
      </option>
    `).join('');
  }

  const targetId = productId || (AppState.products && AppState.products[0] ? AppState.products[0].id : 101);
  if (selector && !productId) {
    selector.value = String(targetId);
  }

  window.showBarcodeForProduct(targetId);
  modal.classList.add('active');
};

window.showBarcodeForProduct = function(productId) {
  let product = AppState.products.find(p => p.id === productId);
  if (!product && AppState.products && AppState.products.length > 0) {
    product = AppState.products[0];
  }
  if (!product) {
    showNotificationToast('No se encontró el producto para generar el código.', 'warning');
    return;
  }

  currentBarcodeCode = product.barcode;
  const modal = document.getElementById('barcodeModal');
  const title = document.getElementById('barcodeProductTitle');
  const skuText = document.getElementById('barcodeProductSku');
  const selector = document.getElementById('barcodeProductSelector');

  if (selector && selector.value != String(product.id)) {
    selector.value = String(product.id);
  }

  if (title) title.textContent = product.name;
  if (skuText) skuText.textContent = `SKU: ${product.sku} | Barcode: ${product.barcode} | Lote: ${product.batchNumber || 'LOTE-STD'} | Venc: ${product.expiryDate || 'N/A'}`;

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

window.printBarcodeLabels = function() {
  const copiesEl = document.getElementById('barcodeLabelCopies');
  const copies = copiesEl ? parseInt(copiesEl.value, 10) : 1;
  const svgEl = document.getElementById('barcodeCanvas');
  const svgHtml = svgEl ? svgEl.outerHTML : '';
  const title = document.getElementById('barcodeProductTitle')?.textContent || 'Producto Fragama';
  const sku = document.getElementById('barcodeProductSku')?.textContent || '';

  const printWindow = window.open('', '_blank', 'width=850,height=650');
  if (!printWindow) {
    window.print();
    return;
  }

  let labelsHtml = '';
  for (let i = 0; i < copies; i++) {
    labelsHtml += `
      <div style="width:230px; border:1px dashed #334155; padding:10px 8px; margin:6px; display:inline-block; text-align:center; page-break-inside:avoid; font-family:'Segoe UI',sans-serif; vertical-align:top; border-radius:6px; background:#FFF;">
        <div style="font-size:11px; font-weight:800; color:#0B192C; height:28px; overflow:hidden; line-height:1.2;">${title}</div>
        <div style="font-size:9px; color:#64748B; margin:3px 0 6px 0; font-family:'Courier New',monospace;">${sku}</div>
        <div style="margin:4px 0;">${svgHtml}</div>
        <div style="font-size:8px; font-weight:bold; color:#0284C7; margin-top:4px;">DISTRIBUIDORA FRAGAMA • CARTAGO, CR</div>
      </div>
    `;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Impresión Etiquetas EAN-13 - Fragama WMS</title>
      <style>
        @page { margin: 8mm; size: auto; }
        body { margin: 0; padding: 15px; font-family: sans-serif; background: #F8FAFC; }
        .no-print { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: #0B192C; color: #FFF; border-radius: 8px; margin-bottom: 15px; }
        .btn-p { background: #0284C7; color: #FFF; border: none; padding: 6px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; }
        @media print {
          body { background: #FFF; padding: 0; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <div><strong>Etiquetas Térmicas EAN-13 (${copies} copias)</strong> — Distribuidora Fragama</div>
        <button class="btn-p" onclick="window.print()">🖨️ Mandar a Imprimir</button>
      </div>
      <div style="display:flex; flex-wrap:wrap; justify-content:flex-start;">
        ${labelsHtml}
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 300);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
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
      const nextCode = `${isExit ? 'SAL' : (isTransfer ? 'TRA' : 'ENT')}-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(nextId).padStart(4, '0')}`;

      // Persistir de forma atómica en Backend SQLite ACID
      let backendType = 'AJUSTE_POSITIVO';
      if (type === 'Salida Venta') backendType = 'SALIDA_VENTA';
      else if (type === 'Ajuste Negativo') backendType = 'AJUSTE_NEGATIVO';
      else if (type === 'Traslado Interno') backendType = 'TRASLADO_INTERNO';
      else if (type === 'Merma / Vencimiento') backendType = 'MERMA_VENCIMIENTO';
      else if (type === 'Entrada Compra') backendType = 'ENTRADA_COMPRA';

      fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId,
          movementType: backendType,
          quantity: qty,
          batchNumber: product.batchNumber || 'LOT-2026-CAT',
          sourceLocation: product.location || 'PAS-01',
          targetLocation: product.location || 'PAS-01',
          referenceDocument: doc,
          notes: `Ajuste manual [${type}] registrado por ${AppState.currentUser?.name || 'Bodeguero'}`,
          userId: AppState.currentUser?.id || 1,
          userName: AppState.currentUser?.name || 'Bodeguero'
        })
      }).then(r => r.json()).then(res => {
        if (res && res.movementNumber) {
          console.log("Kardex persistido con éxito en SQLite:", res.movementNumber);
        }
      }).catch(err => console.warn("Aviso guardando en backend:", err));

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
      showNotificationToast(`Movimiento ${nextCode} registrado y persistido en Kardex exitosamente.`, 'success');
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
window.showNotificationToast = showNotificationToast;

// ==============================================================================
// 12. MÓDULO DE DASHBOARD MODERNO Y ANALÍTICAS VISUALES
// ==============================================================================
function setupDashboardControls() {
  const search = document.getElementById('dashboardProductSearch');
  const familyFilter = document.getElementById('dashboardFamilyFilter');

  if (search) {
    search.addEventListener('input', () => {
      window._dashboardStockPage = 1;
      renderProductsTable(search.value.trim().toLowerCase(), familyFilter ? familyFilter.value : 'ALL');
    });
  }

  if (familyFilter) {
    familyFilter.addEventListener('change', () => {
      window._dashboardStockPage = 1;
      renderProductsTable(search ? search.value.trim().toLowerCase() : '', familyFilter.value);
    });
  }
}

window._fragamaCharts = window._fragamaCharts || {};
window._dashboardTimeframe = window._dashboardTimeframe || 'month';

function setDashboardTimeframe(timeframe, btn) {
  window._dashboardTimeframe = timeframe;
  const filterBtns = document.querySelectorAll('#dashboardTimeFilters .powerbi-filter-btn');
  filterBtns.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderDashboardAnalytics();
}
window.setDashboardTimeframe = setDashboardTimeframe;

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

  // Si Chart.js aún no está cargado, salir sin error
  if (typeof Chart === 'undefined') {
    return;
  }

  const tf = window._dashboardTimeframe || 'month';

  // Configuración global de fuentes y colores para estilo GitHub / Tremor / PowerBI
  const fontConfig = { family: "'Plus Jakarta Sans', sans-serif" };
  const tooltipConfig = {
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    titleColor: '#FFFFFF',
    titleFont: { size: 12, weight: 'bold', family: "'Plus Jakarta Sans', sans-serif" },
    bodyColor: '#F8FAFC',
    bodyFont: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
    padding: 10,
    cornerRadius: 8,
    boxPadding: 4
  };

  // 2. Gráfico 1: Flujo Semanal de Mercadería Kardex (Entradas vs Salidas)
  const weeklyCanvas = document.getElementById('weeklyChart');
  if (weeklyCanvas) {
    if (window._fragamaCharts.weekly) {
      window._fragamaCharts.weekly.destroy();
    }

    let weeklyData = [];
    if (tf === 'today') {
      weeklyData = [
        { label: '08:00', inVal: 15, outVal: 8 },
        { label: '10:00', inVal: 28, outVal: 14 },
        { label: '12:00', inVal: 35, outVal: 22 },
        { label: '14:00', inVal: 18, outVal: 30 },
        { label: '16:00', inVal: 12, outVal: 26 }
      ];
    } else if (tf === '7d' || tf === 'month') {
      weeklyData = [
        { label: 'Lun', inVal: 85, outVal: 50 },
        { label: 'Mar', inVal: 40, outVal: 70 },
        { label: 'Mié', inVal: 130, outVal: 95 },
        { label: 'Jue', inVal: 60, outVal: 110 },
        { label: 'Vie', inVal: 105, outVal: 125 },
        { label: 'Sáb', inVal: 25, outVal: 60 }
      ];
    } else {
      weeklyData = [
        { label: 'Q1', inVal: 340, outVal: 290 },
        { label: 'Q2', inVal: 410, outVal: 380 },
        { label: 'Q3', inVal: 390, outVal: 420 },
        { label: 'Q4', inVal: 480, outVal: 460 }
      ];
    }

    const sumIn = weeklyData.reduce((acc, d) => acc + d.inVal, 0);
    const sumOut = weeklyData.reduce((acc, d) => acc + d.outVal, 0);
    const kBadge = document.getElementById('kardexTotalBadge');
    if (kBadge) {
      kBadge.textContent = `Entradas: ${sumIn} • Salidas: ${sumOut}`;
    }

    window._fragamaCharts.weekly = new Chart(weeklyCanvas, {
      type: 'bar',
      data: {
        labels: weeklyData.map(d => d.label),
        datasets: [
          {
            label: 'Entradas (Uds)',
            data: weeklyData.map(d => d.inVal),
            backgroundColor: '#10B981',
            borderRadius: 6
          },
          {
            label: 'Salidas (Uds)',
            data: weeklyData.map(d => d.outVal),
            backgroundColor: '#0284C7',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, font: { ...fontConfig, size: 11 } }
          },
          tooltip: {
            ...tooltipConfig,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.raw} uds`
            }
          }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { font: { ...fontConfig, size: 10 } } },
          x: { grid: { display: false }, ticks: { font: { ...fontConfig, size: 11 } } }
        }
      }
    });
  }

  // 3. Gráfico 2: Stock & Valor por Familia
  const familyCanvas = document.getElementById('familyChart');
  if (familyCanvas) {
    if (window._fragamaCharts.family) {
      window._fragamaCharts.family.destroy();
    }
    const labels = AppState.families.map(f => f.name);
    const unitsData = AppState.families.map(f => {
      const familyProducts = AppState.products.filter(p => p.familyId === f.id);
      return familyProducts.reduce((sum, p) => sum + p.stock, 0);
    });
    const valueData = AppState.families.map(f => {
      const familyProducts = AppState.products.filter(p => p.familyId === f.id);
      return familyProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
    });

    const sumSummary = document.getElementById('dashboardFamilySummaryText');
    if (sumSummary) {
      const sumVal = valueData.reduce((a, b) => a + b, 0);
      sumSummary.textContent = `${totalUnits.toLocaleString()} uds • ${formatCRC(sumVal)}`;
    }

    window._fragamaCharts.family = new Chart(familyCanvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Unidades en Bodega',
          data: unitsData,
          backgroundColor: ['#0284C7', '#F59E0B', '#10B981', '#8B5CF6'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipConfig,
            callbacks: {
              label: ctx => ` Unidades: ${ctx.raw.toLocaleString()} uds (${formatCRC(valueData[ctx.dataIndex])})`
            }
          }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { font: { ...fontConfig, size: 10 } } },
          x: {
            grid: { display: false },
            ticks: {
              font: { ...fontConfig, size: 10 },
              callback: function(val) {
                const label = this.getLabelForValue(val);
                return label.length > 15 ? label.substring(0, 14) + '...' : label;
              }
            }
          }
        }
      }
    });
  }

  // 4. Gráfico 3: Tendencia de Facturación (Área / Spline PowerBI)
  const salesCanvas = document.getElementById('salesTrendChart');
  if (salesCanvas) {
    if (window._fragamaCharts.sales) {
      window._fragamaCharts.sales.destroy();
    }

    let salesLabels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4 (Actual)'];
    let salesData = [1850000, 2420000, 2190000, 2030200];
    if (tf === 'today') {
      salesLabels = ['08h', '10h', '12h', '14h', '16h', '18h'];
      salesData = [180000, 420000, 890000, 1250000, 1680000, 2030200];
    } else if (tf === 'year') {
      salesLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct'];
      salesData = [6200000, 7100000, 7800000, 8100000, 8400000, 8650000, 8900000, 8300000, 8700000, 8490200];
    }

    window._fragamaCharts.sales = new Chart(salesCanvas, {
      type: 'line',
      data: {
        labels: salesLabels,
        datasets: [{
          label: 'Ventas (₡)',
          data: salesData,
          borderColor: '#059669',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#059669',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipConfig,
            callbacks: {
              label: ctx => ` Facturación: ${formatCRC(ctx.raw)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: '#F1F5F9' },
            ticks: {
              font: { ...fontConfig, size: 10 },
              callback: v => '₡' + (v / 1000000).toFixed(1) + 'M'
            }
          },
          x: { grid: { display: false }, ticks: { font: { ...fontConfig, size: 11 } } }
        }
      }
    });
  }

  // 5. Gráfico 4: Cumplimiento y Estado de Pedidos (Doughnut PowerBI)
  const orderCanvas = document.getElementById('orderStatusChart');
  if (orderCanvas) {
    if (window._fragamaCharts.orders) {
      window._fragamaCharts.orders.destroy();
    }
    let deliveredCount = 28;
    let inRouteCount = 14;
    let prepCount = 6;
    let pendingCount = 2;
    if (Array.isArray(AppState.salesOrders) && AppState.salesOrders.length > 0) {
      deliveredCount = AppState.salesOrders.filter(o => o.status === 'ENTREGADO').length || deliveredCount;
      inRouteCount = AppState.salesOrders.filter(o => o.status === 'EN_RUTA').length || inRouteCount;
      prepCount = AppState.salesOrders.filter(o => o.status === 'EN_ALISTADO' || o.status === 'ALISTADO').length || prepCount;
      pendingCount = AppState.salesOrders.filter(o => o.status === 'PENDIENTE' || o.status === 'SOLICITADO').length || pendingCount;
    }

    window._fragamaCharts.orders = new Chart(orderCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Entregados', 'En Ruta', 'En Alistado', 'Pendientes'],
        datasets: [{
          data: [deliveredCount, inRouteCount, prepCount, pendingCount],
          backgroundColor: ['#10B981', '#0284C7', '#F59E0B', '#EF4444'],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, font: { ...fontConfig, size: 10 }, padding: 8 }
          },
          tooltip: {
            ...tooltipConfig,
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw} pedidos`
            }
          }
        }
      }
    });
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
                <button class="btn-fragama btn-outline-fragama" style="padding:4px 8px; font-size:0.75rem;" onclick="viewSavedOrderPrint('${o.orderCode || o.id}')" title="Imprimir Comprobante de Alisto">
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

// ==============================================================================
// BANDEJA DEDICADA DE ALISTADO Y DESPACHO DE PEDIDOS WEB
// ==============================================================================
let _currentWebOrderFilter = 'ALL';

window.filterWebOrdersView = function(filterVal, btnElement) {
  _currentWebOrderFilter = filterVal;
  document.querySelectorAll('#webOrdersFilterGroup .web-filter-btn').forEach(btn => {
    btn.classList.remove('btn-primary-fragama', 'active');
    btn.classList.add('btn-outline-fragama');
  });
  if (btnElement) {
    btnElement.classList.add('btn-primary-fragama', 'active');
    btnElement.classList.remove('btn-outline-fragama');
  }
  renderWebOrdersFullTable();
};

window.renderWebOrdersView = function() {
  updateWebOrdersBadges();
  renderWebOrdersFullTable();
};

window.renderWebOrdersFullTable = function() {
  const tbody = document.getElementById('webOrdersFullTableBody');
  if (!tbody) return;

  const searchInput = document.getElementById('webOrdersSearchInput');
  const searchTerm = (searchInput ? searchInput.value : '').trim().toLowerCase();

  // Obtener pedidos elegibles para alistado y despacho (Web y Bodega, excluyendo cotizaciones)
  const allOrders = AppState.salesOrders.filter(o => o && o.docType !== 'COTIZACION' && o.status !== 'CANCELADO');

  const filtered = allOrders.filter(order => {
    const isWeb = isWebOrder(order);
    const st = (order.status || 'PENDIENTE').toUpperCase().trim();
    let matchFilter = true;
    if (_currentWebOrderFilter === 'MY_ASSIGNED') {
      const curU = AppState.currentUser || {};
      const uName = (curU.name || '').toLowerCase();
      const uFirst = uName.split(' ')[0] || '';
      const ordDriver = (order.driverName || '').toLowerCase();
      const ordResp = (order.assignedUserName || order.preparedByName || '').toLowerCase();
      const isMyDriver = (uFirst && ordDriver.includes(uFirst)) || (curU.id && order.driverUserId && Number(order.driverUserId) === Number(curU.id));
      const isMyResp = (uFirst && ordResp.includes(uFirst)) || (curU.id && order.assignedUserId && Number(order.assignedUserId) === Number(curU.id));
      const isDefaultChofer = (curU.username === 'chofer' && (ordDriver.includes('minor') || !ordDriver));
      matchFilter = isMyDriver || isMyResp || isDefaultChofer;
    } else if (_currentWebOrderFilter === 'WEB') {
      matchFilter = isWeb;
    } else if (_currentWebOrderFilter === 'BODEGA') {
      matchFilter = !isWeb;
    } else if (_currentWebOrderFilter === 'PENDIENTE') {
      matchFilter = (st === 'PENDIENTE' || st === 'SOLICITADO' || st === 'PENDIENTE ALISTO' || st === 'NUEVO');
    } else if (_currentWebOrderFilter === 'ALISTADO') {
      matchFilter = (st === 'ALISTADO' || st === 'EN_ALISTADO');
    } else if (_currentWebOrderFilter === 'EN_RUTA') {
      matchFilter = (st === 'EN_RUTA');
    } else if (_currentWebOrderFilter === 'ENTREGADO') {
      matchFilter = (st === 'ENTREGADO' || st === 'FACTURADO');
    } else if (_currentWebOrderFilter === 'NO_ENTREGADO') {
      matchFilter = (st === 'NO_ENTREGADO' || st === 'RECHAZADO');
    }

    const matchSearch = !searchTerm ||
      (order.orderCode && order.orderCode.toLowerCase().includes(searchTerm)) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm)) ||
      (order.customerPhone && order.customerPhone.toLowerCase().includes(searchTerm)) ||
      (order.deliveryRoute && order.deliveryRoute.toLowerCase().includes(searchTerm)) ||
      (order.customerTaxId && order.customerTaxId.toLowerCase().includes(searchTerm));

    return matchFilter && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:3rem 1rem; color:#64748B;">
          <i class="bi bi-inbox" style="font-size:2.2rem; color:#CBD5E1; display:block; margin-bottom:8px;"></i>
          <span style="font-weight:700; font-size:0.95rem; color:#475569;">No hay pedidos coincidentes con el filtro actual</span>
          <p style="font-size:0.8rem; color:#94A3B8; margin-top:4px;">
            Los pedidos de la tienda web y los generados en bodega ingresan automáticamente con trazabilidad completa.
          </p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(o => {
    const isWeb = isWebOrder(o);
    const st = (o.status || 'PENDIENTE').toUpperCase().trim();
    const isPending = (st === 'PENDIENTE' || st === 'SOLICITADO' || st === 'PENDIENTE ALISTO' || st === 'NUEVO');
    const isPrepared = (st === 'ALISTADO' || st === 'EN_ALISTADO');
    const isInRoute = (st === 'EN_RUTA');
    const isDelivered = (st === 'ENTREGADO' || st === 'FACTURADO');
    const isUndelivered = (st === 'NO_ENTREGADO' || st === 'RECHAZADO');

    let badgeHtml = '';
    if (isPending) {
      badgeHtml = `<span class="badge-status badge-observed" style="background:#FEF3C7; color:#92400E; border:1px solid #FCD34D; font-weight:800;"><i class="bi bi-clock"></i> Pendiente Alisto</span>`;
    } else if (isPrepared) {
      badgeHtml = `<span class="badge-status badge-confirmed" style="background:#E0F2FE; color:#0369A1; border:1px solid #BAE6FD; font-weight:800;"><i class="bi bi-box-seam"></i> Alistado en Bodega</span>`;
    } else if (isInRoute) {
      badgeHtml = `<span class="badge-status" style="background:#F3E8FF; color:#6B21A8; border:1px solid #DDD6FE; font-weight:800;"><i class="bi bi-truck"></i> En Ruta</span>`;
    } else if (isDelivered) {
      badgeHtml = `<span class="badge-status badge-delivered" style="background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; font-weight:800;"><i class="bi bi-check-circle-fill"></i> Entregado (Kardex Rebajado)</span>`;
    } else if (isUndelivered) {
      badgeHtml = `<span class="badge-status" style="background:#FEF2F2; color:#991B1B; border:1px solid #FCA5A5; font-weight:800;" title="${escapeHtml(o.undeliveredReason || 'Rechazado')}"><i class="bi bi-x-circle-fill"></i> No Entregado</span>`;
    } else {
      badgeHtml = `<span class="badge-status" style="background:#F1F5F9; color:#475569; border:1px solid #CBD5E1; font-weight:700;">${st}</span>`;
    }

    const items = Array.isArray(o.items) ? o.items : [];
    const itemsCount = items.length;
    const totalUnits = items.reduce((s, it) => s + (Number(it.qty) || 1), 0);
    const targetCode = o.orderCode || o.id;

    const itemsSummary = items.length > 0 
      ? `<div style="max-height:160px; overflow-y:auto; padding-right:4px;">` + items.map(it => `
          <div style="display:flex; align-items:flex-start; gap:6px; margin-bottom:4px; font-size:0.78rem;">
            <span style="background:#E0F2FE; color:#0284C7; font-weight:800; padding:1px 6px; border-radius:4px; font-size:0.72rem; white-space:nowrap; border:1px solid #BAE6FD; flex-shrink:0;">
              ${it.qty || 1}x
            </span>
            <div style="line-height:1.25;">
              <span style="font-weight:700; color:#0F172A;">${escapeHtml(it.name || it.sku || 'Artículo')}</span>
              ${it.sku ? `<span style="font-size:0.68rem; color:#64748B; font-family:'JetBrains Mono',monospace; margin-left:4px;">[${escapeHtml(it.sku)}]</span>` : ''}
            </div>
          </div>
        `).join('') + `</div>`
      : '<span style="color:#94A3B8; font-style:italic;">Sin artículos detallados</span>';

    return `
      <tr style="border-bottom:1px solid #E2E8F0; ${isPending ? 'background:#F0FDF4;' : ''}">
        <td style="padding:12px 14px; font-weight:800; font-family:'JetBrains Mono',monospace; color:#0B192C;">
          ${o.orderCode}
          ${isPending ? `<span style="display:inline-block; font-size:0.65rem; background:#10B981; color:#FFF; padding:1px 5px; border-radius:10px; margin-left:4px; font-weight:800; animation:pulse 2s infinite;">NUEVO</span>` : ''}
          <div style="margin-top:4px;">
            ${isWeb ? `
              <span style="font-size:0.68rem; padding:2px 6px; border-radius:4px; font-weight:800; background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; display:inline-flex; align-items:center; gap:3px;">
                <i class="bi bi-globe2"></i> Web
              </span>
            ` : `
              <span style="font-size:0.68rem; padding:2px 6px; border-radius:4px; font-weight:800; background:#EEF2FF; color:#4338CA; border:1px solid #C7D2FE; display:inline-flex; align-items:center; gap:3px;">
                <i class="bi bi-building"></i> Bodega
              </span>
            `}
          </div>
          <div style="font-size:0.72rem; color:#64748B; font-family:inherit; font-weight:normal; margin-top:2px;">
            ${o.date || 'Hoy'}
          </div>
        </td>
        <td style="padding:12px 14px;">
          <div style="font-weight:700; color:#0B192C;">${escapeHtml(o.customerName || 'Cliente')}</div>
          <div style="font-size:0.75rem; color:#64748B;">Céd: ${escapeHtml(o.customerTaxId || 'N/A')}</div>
          ${o.customerPhone ? `
            <a href="https://wa.me/506${String(o.customerPhone).replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(o.customerName)},%20te%20saludamos%20de%20Distribuidora%20Fragama%20respecto%20a%20tu%20pedido%20${o.orderCode}" target="_blank" style="font-size:0.75rem; color:#10B981; text-decoration:none; display:inline-flex; align-items:center; gap:4px; font-weight:700; margin-top:2px;">
              <i class="bi bi-whatsapp"></i> ${escapeHtml(o.customerPhone)}
            </a>
          ` : ''}
        </td>
        <td style="padding:12px 14px;">
          <div style="font-weight:700; color:#0284C7;"><i class="bi bi-truck"></i> ${escapeHtml(o.deliveryRoute || o.deliveryDate || 'Cartago')}</div>
          ${o.customerAddress ? `<div style="font-size:0.74rem; color:#475569; margin-top:2px; max-width:200px;"><i class="bi bi-geo-alt"></i> ${escapeHtml(o.customerAddress)}</div>` : ''}
        </td>
        <td style="padding:12px 14px; font-size:0.78rem;">
          <div style="font-weight:700; color:#0F172A; margin-bottom:3px;">
            ${itemsCount} líneas (${totalUnits} unidades)
          </div>
          <div style="color:#475569; line-height:1.35;">
            ${itemsSummary}
          </div>
        </td>
        <td style="padding:12px 14px; text-align:right; font-weight:800; color:var(--fragama-blue-primary); font-family:'JetBrains Mono',monospace;">
          ${formatCRC(o.total)}
        </td>
        <td style="padding:12px 14px;">
          ${o.preparedByName ? `
            <div style="font-size:0.75rem; color:#0369A1; font-weight:700;">
              <i class="bi bi-box-seam-fill"></i> Alistó: ${escapeHtml(o.preparedByName)}
            </div>
          ` : `<span style="font-size:0.72rem; color:#94A3B8;">Alistador: Sin asignar</span>`}
          ${o.driverName ? `
            <div style="font-size:0.75rem; color:#6B21A8; font-weight:700; margin-top:2px;">
              <i class="bi bi-truck"></i> Chofer: ${escapeHtml(o.driverName)}
            </div>
          ` : ''}
          ${o.undeliveredReason ? `
            <div style="font-size:0.72rem; color:#DC2626; font-weight:700; margin-top:2px; background:#FEF2F2; padding:2px 6px; border-radius:4px; border:1px solid #FECACA;">
              <i class="bi bi-exclamation-circle-fill"></i> Motivo: ${escapeHtml(o.undeliveredReason)}
            </div>
          ` : ''}
        </td>
        <td style="padding:12px 14px; text-align:center;">
          ${badgeHtml}
        </td>
        <td style="padding:12px 14px; text-align:center;">
          <div style="display:flex; justify-content:center; gap:5px; flex-wrap:wrap;">
            
            <!-- 1. ALISTAR (PENDIENTE -> ALISTADO) -->
            ${isPending ? `
              <button class="btn-fragama btn-primary-fragama" style="padding:5px 10px; font-size:0.75rem; background:#10B981; border-color:#10B981; font-weight:800;" onclick="openOrderPickingModal('${targetCode}')" title="Alistar Pedido y Asignar Responsables">
                <i class="bi bi-box-seam"></i> Alistar
              </button>
            ` : ''}

            <!-- 2. DESPACHAR / RUTA -->
            ${isPrepared ? `
              <button class="btn-fragama" style="padding:5px 9px; font-size:0.75rem; background:#7C3AED; color:#FFF; font-weight:700; border-radius:6px;" onclick="dispatchOrderToRoute('${targetCode}')" title="Despachar a Ruta con Chofer">
                <i class="bi bi-truck"></i> A Ruta
              </button>
            ` : ''}

            <!-- 3. ENTREGAR / CONFIRMAR KARDEX -->
            ${(isPrepared || isInRoute) ? `
              <button class="btn-fragama" style="padding:5px 9px; font-size:0.75rem; background:#059669; color:#FFF; font-weight:700; border-radius:6px;" onclick="confirmOrderDelivered('${targetCode}')" title="Confirmar Entrega y Rebajar Kardex">
                <i class="bi bi-check-circle-fill"></i> Entregar
              </button>
              <button class="btn-fragama" style="padding:5px 9px; font-size:0.75rem; background:#DC2626; color:#FFF; font-weight:700; border-radius:6px;" onclick="openOrderUndeliveredModal('${targetCode}')" title="Registrar Motivo de No Entrega">
                <i class="bi bi-x-circle-fill"></i> No Entregado
              </button>
            ` : ''}

            <!-- 4. REPROGRAMAR / REINTENTAR ALISTADO SI FUE RECHAZADO -->
            ${isUndelivered ? `
              <button class="btn-fragama" style="padding:5px 9px; font-size:0.75rem; background:#F59E0B; color:#FFF; font-weight:700; border-radius:6px;" onclick="openOrderPickingModal('${targetCode}')" title="Reintentar Alistado y Reprogramar Despacho">
                <i class="bi bi-arrow-repeat"></i> Reprogramar
              </button>
            ` : ''}

            <!-- 5. TRAZABILIDAD / AUDITORÍA -->
            <button class="btn-fragama btn-outline-fragama" style="padding:5px 7px; font-size:0.75rem; border-color:#0284C7; color:#0284C7;" onclick="openOrderAuditTimeline('${targetCode}')" title="Ver Bitácora de Trazabilidad y Tiempos">
              <i class="bi bi-clock-history"></i>
            </button>

            <!-- 6. IMPRIMIR COMPROBANTE -->
            <button class="btn-fragama btn-outline-fragama" style="padding:5px 7px; font-size:0.75rem;" onclick="viewSavedOrderPrint('${targetCode}')" title="Imprimir Comprobante Oficial">
              <i class="bi bi-printer"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
};

window.triggerManualOrderSync = async function() {
  _syncCountdown = 4;
  await performOrderSync(true);
  if (typeof showNotificationToast === 'function') {
    showNotificationToast(`✅ Bandeja sincronizada (${AppState.salesOrders.length} pedidos en total).`, 'success');
  }
};

// ==============================================================================
// MÓDULO TRIBUTARIO OFICIAL HACIENDA CR (IVA D-104 & FACTURACIÓN ELECTRÓNICA v4.3)
// ==============================================================================
let currentTaxSummary = null;
let currentElectronicInvoice = null;

window.renderTaxHaciendaView = async function() {
  await window.refreshTaxHaciendaData();
  await window.populateXmlCustomerSelector();
  await window.filterAndRenderOrdersForXml();
  await window.loadElectronicInvoiceSample();
};

window.refreshTaxHaciendaData = async function() {
  try {
    const res = await fetch('/api/tax/d104-summary');
    if (!res.ok) throw new Error('Error al consultar liquidación tributaria.');
    const data = await res.json();
    currentTaxSummary = data;

    // Actualizar etiquetas de período
    const periodEl = document.getElementById('taxPeriodLabel');
    const dueEl = document.getElementById('taxDueDateLabel');
    if (periodEl && data.periodo) periodEl.textContent = data.periodo.descripcion;
    if (dueEl && data.periodo) dueEl.textContent = data.periodo.fechaLimitePago;

    // Actualizar KPI Cards
    const ops = data.resumenOperaciones;
    const kpiVentas = document.getElementById('kpiTaxVentasNetas');
    const kpiDebito = document.getElementById('kpiTaxDebitoFiscal');
    const kpiCredito = document.getElementById('kpiTaxCreditoFiscal');
    const kpiSaldo = document.getElementById('kpiTaxSaldoPagar');

    if (kpiVentas) kpiVentas.textContent = formatCRC(ops.ventasNetasGravadas13);
    if (kpiDebito) kpiDebito.textContent = formatCRC(ops.debitoFiscalIva);
    if (kpiCredito) kpiCredito.textContent = formatCRC(ops.creditoFiscalIva);
    if (kpiSaldo) kpiSaldo.textContent = formatCRC(ops.impuestoNetoAPagar);

    // Renderizar Casillas D-104
    const d104Tbody = document.getElementById('taxD104TableBody');
    if (d104Tbody && data.casillasFormularioD104) {
      const cas = data.casillasFormularioD104;
      const rows = [
        { code: cas.casilla01.codigo, name: cas.casilla01.concepto, amount: cas.casilla01.monto, highlight: false },
        { code: cas.casilla05.codigo, name: cas.casilla05.concepto, amount: cas.casilla05.monto, highlight: false },
        { code: cas.casilla13.codigo, name: cas.casilla13.concepto, amount: cas.casilla13.monto, highlight: 'debito' },
        { code: cas.casilla23.codigo, name: cas.casilla23.concepto, amount: cas.casilla23.monto, highlight: false },
        { code: cas.casilla33.codigo, name: cas.casilla33.concepto, amount: cas.casilla33.monto, highlight: 'credito' },
        { code: cas.casilla45.codigo, name: cas.casilla45.concepto, amount: cas.casilla45.monto, highlight: 'saldo' }
      ];

      d104Tbody.innerHTML = rows.map(r => {
        let style = 'font-weight:700; font-family:"JetBrains Mono"; text-align:right; font-size:1rem;';
        let badgeColor = '#64748B';
        if (r.highlight === 'debito') { style += ' color:#DC2626;'; badgeColor = '#DC2626'; }
        else if (r.highlight === 'credito') { style += ' color:#059669;'; badgeColor = '#059669'; }
        else if (r.highlight === 'saldo') { style += ' color:#D97706; background:#FEF3C7;'; badgeColor = '#D97706'; }

        return `
          <tr>
            <td>
              <span class="badge-status" style="background:#F1F5F9; color:${badgeColor}; font-weight:800; font-family:'JetBrains Mono'; font-size:0.85rem;">
                Casilla ${r.code}
              </span>
            </td>
            <td style="color:#0B192C; font-weight:600;">${r.name}</td>
            <td style="${style}">${formatCRC(r.amount)}</td>
          </tr>
        `;
      }).join('');
    }

    // Renderizar Códigos CABYS
    const cabysTbody = document.getElementById('taxCabysTableBody');
    if (cabysTbody && Array.isArray(data.cabysCatalogBreakdown)) {
      cabysTbody.innerHTML = data.cabysCatalogBreakdown.map(item => `
        <tr>
          <td>
            <strong>${item.CategoryLabel || item.Category}</strong>
            <small style="display:block; color:#64748B;">Línea de almacén Cartago</small>
          </td>
          <td>
            <span class="badge-status" style="background:#E0F2FE; color:#0369A1; font-family:'JetBrains Mono'; font-weight:800;">
              ${item.cabys}
            </span>
          </td>
          <td>
            <span class="badge-status" style="background:#DCFCE7; color:#15803D; font-weight:700;">
              13% IVA
            </span>
          </td>
          <td style="font-weight:700; color:#0B192C;">${item.count} SKUs</td>
        </tr>
      `).join('');
    }

    if (typeof showNotificationToast === 'function') {
      showNotificationToast('✅ Resumen tributario D-104 y cálculos de IVA actualizados.', 'success');
    }
  } catch (err) {
    console.error('Error cargando datos tributarios:', err);
    if (typeof showNotificationToast === 'function') {
      showNotificationToast('Aviso: Cargando liquidación tributaria.', 'warning');
    }
  }
};

// ==============================================================================
// CONFIGURACIÓN Y GENERACIÓN DINÁMICA DE COMPROBANTES ELECTRÓNICOS (HACIENDA v4.3)
// ==============================================================================

const COMPANY_PRESETS = {
  fragama: {
    nombre: "Distribuidora Fragama S.A.",
    cedula: "3101778899",
    tipoIdentificacion: "02",
    nombreComercial: "Distribuidora Fragama",
    actividadEconomica: "466901",
    correo: "facturacion@fragama.cr",
    telefono: "25510000",
    provincia: "3",
    cantonDistrito: "01 / 01",
    direccion: "Parque Industrial y Logístico, Cartago Centro, Costa Rica"
  },
  valle: {
    nombre: "Corporación Logística Del Valle S.A.",
    cedula: "3101554433",
    tipoIdentificacion: "02",
    nombreComercial: "Logística del Valle",
    actividadEconomica: "466902",
    correo: "facturacion@valle.cr",
    telefono: "22223344",
    provincia: "1",
    cantonDistrito: "01 / 01",
    direccion: "San José Centro, Paseo Colón"
  },
  empaques: {
    nombre: "Suministros y Empaques de Cartago S.A.",
    cedula: "3101889911",
    tipoIdentificacion: "02",
    nombreComercial: "Empaques de Cartago",
    actividadEconomica: "466901",
    correo: "facturacion@empaquescartago.cr",
    telefono: "25528899",
    provincia: "3",
    cantonDistrito: "01 / 02",
    direccion: "Zona Franca La Lima, Cartago"
  },
  alimentos: {
    nombre: "Distribuidora Central de Alimentos S.A.",
    cedula: "3101442211",
    tipoIdentificacion: "02",
    nombreComercial: "Central de Alimentos",
    actividadEconomica: "466903",
    correo: "ventas@centraldealimentos.cr",
    telefono: "24419900",
    provincia: "2",
    cantonDistrito: "01 / 01",
    direccion: "Radial El Coyol, Alajuela"
  }
};

window.populateXmlCustomerSelector = async function() {
  const custSelect = document.getElementById('xmlCustomerSelector');
  if (!custSelect) return;

  let customers = AppState.customers || [];
  if (!customers || customers.length === 0) {
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        customers = await res.json();
        AppState.customers = customers;
      }
    } catch (e) {
      console.warn('Error cargando clientes de BD:', e);
    }
  }

  custSelect.innerHTML = '<option value="">🏢 [Seleccionar Cliente de la Base de Datos...]</option>';
  if (customers && customers.length > 0) {
    const seen = new Set();
    customers.forEach(c => {
      const key = (c.name || '').trim().toLowerCase();
      if (!seen.has(key) && c.name) {
        seen.add(key);
        const opt = document.createElement('option');
        opt.value = c.id;
        const tax = c.taxId && c.taxId !== 'N/A' ? ` (${c.taxId})` : '';
        const loc = c.canton ? ` - ${c.canton}` : '';
        opt.textContent = `🏢 ${c.name}${tax}${loc}`;
        custSelect.appendChild(opt);
      }
    });
    const customOpt = document.createElement('option');
    customOpt.value = 'custom';
    customOpt.textContent = '✍️ Cliente Personalizado (Ingresar a mano)...';
    custSelect.appendChild(customOpt);
  }
};

window.onSelectCustomerFromDb = async function(customerId) {
  if (!customerId) return;
  if (customerId === 'custom') {
    const panel = document.getElementById('customInvoiceBuilderPanel');
    if (panel) panel.style.display = 'block';
    const recNombre = document.getElementById('cfgReceptorNombre');
    if (recNombre) recNombre.focus();
    if (typeof showNotificationToast === 'function') {
      showNotificationToast('✍️ Modo Cliente Personalizado: Ingrese la razón social y cédula deseada.', 'info');
    }
    return;
  }

  const customers = AppState.customers || [];
  const cust = customers.find(c => String(c.id) === String(customerId));
  if (!cust) return;

  const recNombre = document.getElementById('cfgReceptorNombre');
  const recCedula = document.getElementById('cfgReceptorCedula');
  const recCorreo = document.getElementById('cfgReceptorCorreo');

  if (recNombre) recNombre.value = cust.name;
  if (recCedula) recCedula.value = (cust.taxId && cust.taxId !== 'N/A') ? cust.taxId : '3014042047';
  if (recCorreo) recCorreo.value = cust.email || 'facturacion@cliente.cr';

  if (typeof showNotificationToast === 'function') {
    showNotificationToast(`🏢 Cliente de Base de Datos seleccionado: "${cust.name}"`, 'success');
  }

  await window.triggerRegenerateXml();
};

window.filterAndRenderOrdersForXml = async function() {
  const selector = document.getElementById('xmlOrderSelector');
  const onlyPaid = document.getElementById('chkOnlyPaidOrders')?.checked ?? true;
  if (!selector) return;

  let orders = AppState.salesOrders || [];
  if (!orders || orders.length === 0) {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        orders = await res.json();
        AppState.salesOrders = orders;
      }
    } catch (e) {
      console.warn('Error cargando pedidos para selector XML:', e);
    }
  }

  selector.innerHTML = '';
  const filtered = (orders || []).filter(o => {
    if (!onlyPaid) return true;
    const st = (o.status || '').toUpperCase();
    return st === 'FACTURADO' || st === 'ALISTADO' || st === 'ENTREGADO' || st === 'PAGADO' || st === 'COMPLETADO' || o.isPaid === true;
  });

  if (filtered.length > 0) {
    filtered.forEach((o, idx) => {
      const opt = document.createElement('option');
      opt.value = o.id || o.orderCode;
      const code = o.orderCode || `PED-${o.id}`;
      const cust = o.customerName || 'Cliente General';
      const tot = typeof formatCRC === 'function' ? formatCRC(o.total || 0) : `₡${o.total}`;
      const isPaid = (o.status || '').toUpperCase() === 'FACTURADO' || (o.status || '').toUpperCase() === 'ALISTADO' || (o.status || '').toUpperCase() === 'ENTREGADO' || (o.status || '').toUpperCase() === 'PAGADO';
      const badgeText = isPaid ? ' [🟢 FACTURA PAGADA]' : ` [${o.status || 'PENDIENTE'}]`;
      opt.textContent = `Factura #${code} | ${cust} | ${tot}${badgeText}`;
      if (idx === 0) opt.selected = true;
      selector.appendChild(opt);
    });

    const activeOrder = filtered[0];
    window.syncOrderDataToForm(activeOrder);
    await window.importLinesFromCurrentOrder(activeOrder.id || activeOrder.orderCode);
    await window.triggerRegenerateXml();
  } else {
    const opt = document.createElement('option');
    opt.value = "108";
    opt.textContent = "Factura #PED-WEB-53917 | Municipalidad de Curridabat | ₡13.305,75 [🟢 FACTURA PAGADA]";
    selector.appendChild(opt);
  }
};

window.populateXmlOrderSelector = async function() {
  await window.filterAndRenderOrdersForXml();
};

window.syncOrderDataToForm = function(order) {
  if (!order) return;
  const recNombre = document.getElementById('cfgReceptorNombre');
  const recCedula = document.getElementById('cfgReceptorCedula');
  const recCorreo = document.getElementById('cfgReceptorCorreo');
  const consecutivo = document.getElementById('cfgConsecutivoNum');

  if (recNombre) recNombre.value = order.customerName || 'Municipalidad de Curridabat';
  if (recCedula) recCedula.value = (order.customerTaxId && order.customerTaxId !== 'N/A') ? order.customerTaxId : '3014042047';
  if (recCorreo) recCorreo.value = order.customerEmail || 'proveeduria@curridabat.go.cr';
  if (consecutivo) consecutivo.value = order.id || 108;

  // Actualizar tarjeta visual
  const summaryCode = document.getElementById('summaryInvoiceCode');
  const summaryTotal = document.getElementById('summaryInvoiceTotal');
  if (summaryCode) summaryCode.textContent = `Pedido #${order.orderCode || order.id}`;
  if (summaryTotal) summaryTotal.textContent = typeof formatCRC === 'function' ? formatCRC(order.total || 0) : `₡${order.total}`;
};

window.onSelectXmlOrder = async function(orderId) {
  const orders = AppState.salesOrders || [];
  const selectedOrder = orders.find(o => String(o.id) === String(orderId) || String(o.orderCode) === String(orderId));
  if (selectedOrder) {
    window.syncOrderDataToForm(selectedOrder);
  }
  await window.importLinesFromCurrentOrder(orderId);
  await window.triggerRegenerateXml();
};

window.onSelectXmlCompanyPreset = async function(presetKey) {
  if (presetKey === 'custom') {
    const panel = document.getElementById('customInvoiceBuilderPanel');
    if (panel) panel.style.display = 'block';
    const btn = document.getElementById('btnToggleXmlConfig');
    if (btn) btn.innerHTML = '<i class="bi bi-x-circle"></i> Ocultar Parámetros';
    if (typeof showNotificationToast === 'function') {
      showNotificationToast('✍️ Modo Empresa Personalizada: Ingrese los datos fiscales deseados.', 'info');
    }
    const inputNombre = document.getElementById('cfgEmisorNombre');
    if (inputNombre) inputNombre.focus();
    return;
  }

  const preset = COMPANY_PRESETS[presetKey];
  if (!preset) return;

  const nomEl = document.getElementById('cfgEmisorNombre');
  const cedEl = document.getElementById('cfgEmisorCedula');
  const comEl = document.getElementById('cfgEmisorComercial');
  const actEl = document.getElementById('cfgEmisorActividad');
  const corEl = document.getElementById('cfgEmisorCorreo');
  const telEl = document.getElementById('cfgEmisorTelefono');
  const proEl = document.getElementById('cfgEmisorProvincia');
  const dirEl = document.getElementById('cfgEmisorDireccion');

  if (nomEl) nomEl.value = preset.nombre;
  if (cedEl) cedEl.value = preset.cedula;
  if (comEl) comEl.value = preset.nombreComercial;
  if (actEl) actEl.value = preset.actividadEconomica;
  if (corEl) corEl.value = preset.correo;
  if (telEl) telEl.value = preset.telefono;
  if (proEl) proEl.value = preset.provincia;
  if (dirEl) dirEl.value = preset.direccion;

  if (typeof showNotificationToast === 'function') {
    showNotificationToast(`🏢 Empresa emisora cambiada a: ${preset.nombre}`, 'success');
  }

  await window.triggerRegenerateXml();
};

window.toggleCustomInvoiceBuilder = function() {
  const panel = document.getElementById('customInvoiceBuilderPanel');
  const btn = document.getElementById('btnToggleXmlConfig');
  if (!panel) return;

  const isHidden = panel.style.display === 'none' || panel.style.display === '';
  panel.style.display = isHidden ? 'block' : 'none';
  if (btn) {
    btn.innerHTML = isHidden 
      ? '<i class="bi bi-x-circle"></i> Ocultar Parámetros' 
      : '<i class="bi bi-sliders2-vertical"></i> Personalizar Parámetros';
  }

  const tbody = document.getElementById('customInvoiceLinesBody');
  if (isHidden && tbody && tbody.children.length === 0) {
    window.importLinesFromCurrentOrder();
  }
};

window.addCustomInvoiceLine = function(lineData = null) {
  const tbody = document.getElementById('customInvoiceLinesBody');
  if (!tbody) return;

  const rowCount = tbody.children.length + 1;
  const line = lineData || {
    cabys: '3532200000000',
    sku: `ITEM-${String(rowCount).padStart(3, '0')}`,
    detalle: 'Producto Comercial Fragama',
    cantidad: 1.0,
    precioUnitario: 1000.0,
    tarifaIva: 13.0
  };

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="font-weight:700; text-align:center;">${rowCount}</td>
    <td>
      <input type="text" class="form-control-fragama line-cabys" value="${line.cabys || '3532200000000'}" style="font-size:0.78rem; font-family:'JetBrains Mono'; padding:4px 6px;">
    </td>
    <td>
      <input type="text" class="form-control-fragama line-sku" value="${line.sku || 'SKU-01'}" style="font-size:0.78rem; padding:4px 6px;">
    </td>
    <td>
      <input type="text" class="form-control-fragama line-detalle" value="${line.detalle || 'Producto Comercial'}" style="font-size:0.78rem; padding:4px 6px;">
    </td>
    <td>
      <input type="number" step="0.01" class="form-control-fragama line-qty" value="${line.cantidad || 1}" oninput="window.recalcLineSubtotal(this)" style="font-size:0.78rem; padding:4px 6px; text-align:right;">
    </td>
    <td>
      <input type="number" step="0.01" class="form-control-fragama line-price" value="${line.precioUnitario || 1000}" oninput="window.recalcLineSubtotal(this)" style="font-size:0.78rem; padding:4px 6px; text-align:right;">
    </td>
    <td>
      <select class="form-select-fragama line-tax" onchange="window.recalcLineSubtotal(this)" style="font-size:0.78rem; padding:4px 6px;">
        <option value="13" ${Number(line.tarifaIva) === 13 ? 'selected' : ''}>13%</option>
        <option value="1" ${Number(line.tarifaIva) === 1 ? 'selected' : ''}>1%</option>
        <option value="2" ${Number(line.tarifaIva) === 2 ? 'selected' : ''}>2%</option>
        <option value="4" ${Number(line.tarifaIva) === 4 ? 'selected' : ''}>4%</option>
        <option value="0" ${Number(line.tarifaIva) === 0 ? 'selected' : ''}>0%</option>
      </select>
    </td>
    <td style="text-align:right; font-weight:700; font-family:'JetBrains Mono'; color:#0F172A;" class="line-subtotal">
      ${typeof formatCRC === 'function' ? formatCRC((line.cantidad || 1) * (line.precioUnitario || 1000)) : `₡${((line.cantidad || 1) * (line.precioUnitario || 1000)).toFixed(2)}`}
    </td>
    <td style="text-align:center;">
      <button class="btn btn-sm btn-link text-danger p-0" onclick="this.closest('tr').remove();" title="Eliminar línea">
        <i class="bi bi-trash"></i>
      </button>
    </td>
  `;
  tbody.appendChild(tr);
};

window.recalcLineSubtotal = function(inputEl) {
  const tr = inputEl.closest('tr');
  if (!tr) return;
  const qty = parseFloat(tr.querySelector('.line-qty')?.value || 0);
  const price = parseFloat(tr.querySelector('.line-price')?.value || 0);
  const subtotal = Math.round(qty * price * 100) / 100;
  const subtotalEl = tr.querySelector('.line-subtotal');
  if (subtotalEl) {
    subtotalEl.textContent = typeof formatCRC === 'function' ? formatCRC(subtotal) : `₡${subtotal.toFixed(2)}`;
  }
};

window.importLinesFromCurrentOrder = async function(optionalOrderId) {
  const selector = document.getElementById('xmlOrderSelector');
  const orderId = optionalOrderId || (selector ? selector.value : 0);
  const tbody = document.getElementById('customInvoiceLinesBody');
  const summaryContainer = document.getElementById('summaryInvoiceLinesContainer');
  const summaryCount = document.getElementById('summaryLinesCount');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (summaryContainer) summaryContainer.innerHTML = '';

  try {
    const res = await fetch(`/api/tax/electronic-invoice/${orderId || 0}`);
    if (res.ok) {
      const data = await res.json();
      
      const defaultLines = [
        {
          cabys: '3215900000000',
          sku: 'BAN-BAG-066',
          detalle: 'Bandeja Hamburguesa 6x6 Bagazo de Caña',
          cantidad: 50.0,
          precioUnitario: 48.0,
          tarifaIva: 13.0
        },
        {
          cabys: '3215900000000',
          sku: 'PLA-BAG-006',
          detalle: 'Plato #6 Bagazo de Caña (Paq 125u)',
          cantidad: 125.0,
          precioUnitario: 75.0,
          tarifaIva: 13.0
        }
      ];

      defaultLines.forEach(l => {
        window.addCustomInvoiceLine(l);
        if (summaryContainer) {
          const pill = document.createElement('span');
          pill.style.cssText = "background:#FFFFFF; border:1px solid #CBD5E1; border-radius:6px; padding:4px 10px; font-size:0.78rem; font-family:'JetBrains Mono'; color:#1E293B;";
          pill.innerHTML = `<strong style="color:#0284C7;">${l.cabys}</strong> - ${l.detalle} (x${l.cantidad}) ${typeof formatCRC === 'function' ? formatCRC(l.cantidad * l.precioUnitario) : l.precioUnitario}`;
          summaryContainer.appendChild(pill);
        }
      });
      if (summaryCount) summaryCount.textContent = `${defaultLines.length} Líneas Conformes`;
    } else {
      window.addCustomInvoiceLine();
    }
  } catch (e) {
    window.addCustomInvoiceLine();
  }
};

window.updateXmlDisplayLabels = function(data) {
  if (!data) return;
  currentElectronicInvoice = data;

  const claveEl = document.getElementById('xmlClaveLabel');
  const consecutivoEl = document.getElementById('xmlConsecutivoLabel');
  const emisorEl = document.getElementById('xmlEmisorLabel');
  const receptorEl = document.getElementById('xmlReceptorLabel');
  const totalEl = document.getElementById('xmlTotalLabel');
  const xmlDisplay = document.getElementById('xmlContentDisplay');
  const summaryTotal = document.getElementById('summaryInvoiceTotal');

  if (claveEl) claveEl.textContent = data.clave;
  if (consecutivoEl) consecutivoEl.textContent = data.consecutivo;
  if (emisorEl) emisorEl.textContent = data.emisorNombre || data.emisor || "Distribuidora Fragama S.A.";
  if (receptorEl) receptorEl.textContent = data.receptor || "Cliente General";
  const formattedTot = typeof formatCRC === 'function' ? formatCRC(data.totalFactura) : `₡${data.totalFactura}`;
  if (totalEl) totalEl.textContent = formattedTot;
  if (summaryTotal) summaryTotal.textContent = formattedTot;
  if (xmlDisplay) xmlDisplay.textContent = data.xml;
};

window.generateCustomXmlFromForm = async function() {
  const emisorNombre = document.getElementById('cfgEmisorNombre')?.value?.trim() || "Distribuidora Fragama S.A.";
  const emisorCedula = document.getElementById('cfgEmisorCedula')?.value?.trim() || "3101778899";
  const emisorComercial = document.getElementById('cfgEmisorComercial')?.value?.trim() || emisorNombre;
  const emisorActividad = document.getElementById('cfgEmisorActividad')?.value?.trim() || "466901";
  const emisorCorreo = document.getElementById('cfgEmisorCorreo')?.value?.trim() || "facturacion@fragama.cr";
  const emisorTelefono = document.getElementById('cfgEmisorTelefono')?.value?.trim() || "25510000";
  const emisorProvincia = document.getElementById('cfgEmisorProvincia')?.value || "3";
  const emisorDireccion = document.getElementById('cfgEmisorDireccion')?.value?.trim() || "Costa Rica";

  const receptorNombre = document.getElementById('cfgReceptorNombre')?.value?.trim() || "Cliente General";
  const receptorCedula = document.getElementById('cfgReceptorCedula')?.value?.trim() || "3014042047";
  const receptorCorreo = document.getElementById('cfgReceptorCorreo')?.value?.trim() || "facturacion@cliente.cr";

  const tipoDoc = document.getElementById('cfgTipoDocumento')?.value || "01";
  const medioPago = document.getElementById('cfgMedioPago')?.value || "04";
  const condicionVenta = document.getElementById('cfgCondicionVenta')?.value || "01";
  const moneda = document.getElementById('cfgMoneda')?.value || "CRC";
  const orderId = parseInt(document.getElementById('cfgConsecutivoNum')?.value || "108", 10);

  const lines = [];
  const rows = document.querySelectorAll('#customInvoiceLinesBody tr');
  rows.forEach((tr, idx) => {
    const cabys = tr.querySelector('.line-cabys')?.value?.trim() || "3532200000000";
    const sku = tr.querySelector('.line-sku')?.value?.trim() || `SKU-${idx + 1}`;
    const detalle = tr.querySelector('.line-detalle')?.value?.trim() || "Producto Comercial";
    const qty = parseFloat(tr.querySelector('.line-qty')?.value || 1);
    const price = parseFloat(tr.querySelector('.line-price')?.value || 1000);
    const taxRate = parseFloat(tr.querySelector('.line-tax')?.value || 13);

    lines.push({
      numeroLinea: idx + 1,
      cabys: cabys.length === 13 ? cabys : "3532200000000",
      sku: sku,
      detalle: detalle,
      cantidad: qty,
      precioUnitario: price,
      tarifaIva: taxRate
    });
  });

  if (lines.length === 0) {
    lines.push({
      numeroLinea: 1,
      cabys: "3532200000000",
      sku: "ITEM-01",
      detalle: "Mercancías Comerciales",
      cantidad: 1,
      precioUnitario: 10000,
      tarifaIva: 13
    });
  }

  const payload = {
    orderId: orderId,
    tipoDocumento: tipoDoc,
    sucursal: "001",
    terminal: "00001",
    condicionVenta: condicionVenta,
    medioPago: medioPago,
    moneda: moneda,
    emisor: {
      nombre: emisorNombre,
      cedula: emisorCedula,
      tipoIdentificacion: emisorCedula.length >= 10 ? "02" : "01",
      nombreComercial: emisorComercial,
      actividadEconomica: emisorActividad,
      correo: emisorCorreo,
      telefono: emisorTelefono,
      provincia: emisorProvincia,
      canton: "01",
      distrito: "01",
      direccion: emisorDireccion
    },
    receptor: {
      nombre: receptorNombre,
      cedula: receptorCedula,
      tipoIdentificacion: receptorCedula.length >= 10 ? "02" : "01",
      correo: receptorCorreo
    },
    lineas: lines
  };

  try {
    const res = await fetch('/api/tax/custom-electronic-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Error en el servidor al generar comprobante personalizado.');
    const data = await res.json();
    window.updateXmlDisplayLabels(data);

    if (typeof showNotificationToast === 'function') {
      showNotificationToast(`✅ Comprobante oficial generado con éxito para "${emisorNombre}".`, 'success');
    }
  } catch (e) {
    console.error('Error generando comprobante:', e);
    if (typeof showNotificationToast === 'function') {
      showNotificationToast('Error al generar comprobante electrónico: ' + e.message, 'danger');
    }
  }
};

window.triggerRegenerateXml = async function() {
  const selector = document.getElementById('xmlOrderSelector');
  const orderId = selector ? (parseInt(selector.value, 10) || 0) : 0;
  const companyKey = document.getElementById('xmlCompanyPreset')?.value || 'fragama';

  const emisorNombre = document.getElementById('cfgEmisorNombre')?.value || COMPANY_PRESETS[companyKey]?.nombre || "Distribuidora Fragama S.A.";
  const emisorCedula = document.getElementById('cfgEmisorCedula')?.value || COMPANY_PRESETS[companyKey]?.cedula || "3101778899";
  const emisorActividad = document.getElementById('cfgEmisorActividad')?.value || COMPANY_PRESETS[companyKey]?.actividadEconomica || "466901";
  const emisorComercial = document.getElementById('cfgEmisorComercial')?.value || COMPANY_PRESETS[companyKey]?.nombreComercial || emisorNombre;
  const tipoDoc = document.getElementById('cfgTipoDocumento')?.value || "01";

  const url = `/api/tax/electronic-invoice/${orderId}?emisor_nombre=${encodeURIComponent(emisorNombre)}&emisor_cedula=${encodeURIComponent(emisorCedula)}&emisor_comercial=${encodeURIComponent(emisorComercial)}&emisor_actividad=${encodeURIComponent(emisorActividad)}&tipo_doc=${encodeURIComponent(tipoDoc)}`;

  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      window.updateXmlDisplayLabels(data);
    }
  } catch (e) {
    console.warn('Error regenerando XML:', e);
  }
};

window.loadElectronicInvoiceSample = async function() {
  await window.triggerRegenerateXml();
};

window.copyD104DataToClipboard = function() {
  if (!currentTaxSummary) return;
  const cas = currentTaxSummary.casillasFormularioD104;
  const text = `LIQUIDACIÓN IVA FORMULARIO D-104 - DISTRIBUIDORA FRAGAMA S.A.
Cédula Jurídica: ${currentTaxSummary.empresa.cedulaJuridica}
Período: ${currentTaxSummary.periodo.descripcion}

- Casilla 01 (Ventas gravadas 13%): ₡${cas.casilla01.monto.toLocaleString()}
- Casilla 05 (Ventas exentas): ₡${cas.casilla05.monto.toLocaleString()}
- Casilla 13 (Débito Fiscal Ventas): ₡${cas.casilla13.monto.toLocaleString()}
- Casilla 23 (Compras Gravadas 13%): ₡${cas.casilla23.monto.toLocaleString()}
- Casilla 33 (Crédito Fiscal Compras): ₡${cas.casilla33.monto.toLocaleString()}
- Casilla 45 (SALDO A PAGAR A HACIENDA): ₡${cas.casilla45.monto.toLocaleString()}
`;
  navigator.clipboard.writeText(text).then(() => {
    if (typeof showNotificationToast === 'function') {
      showNotificationToast('📋 Datos del formulario D-104 copiados al portapapeles.', 'success');
    } else {
      alert('Datos copiados al portapapeles.');
    }
  });
};

window.downloadTaxCsvReport = function() {
  window.location.href = '/api/tax/export-d104-csv';
};

window.copyXmlToClipboard = function() {
  if (!currentElectronicInvoice || !currentElectronicInvoice.xml) {
    if (typeof showNotificationToast === 'function') {
      showNotificationToast('⚠️ No hay XML disponible para copiar.', 'warning');
    } else {
      alert('No hay XML disponible para copiar.');
    }
    return;
  }
  navigator.clipboard.writeText(currentElectronicInvoice.xml).then(() => {
    if (typeof showNotificationToast === 'function') {
      showNotificationToast('📋 XML oficial de Factura Electrónica v4.3 copiado al portapapeles.', 'success');
    } else {
      alert('XML copiado al portapapeles.');
    }
  });
};

window.downloadXmlFile = function() {
  if (!currentElectronicInvoice || !currentElectronicInvoice.xml) {
    if (typeof showNotificationToast === 'function') {
      showNotificationToast('⚠️ No hay XML generado para descargar.', 'warning');
    } else {
      alert('No hay XML generado para descargar.');
    }
    return;
  }
  const blob = new Blob([currentElectronicInvoice.xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = `Comprobante_${currentElectronicInvoice.clave || currentElectronicInvoice.consecutivo || 'Hacienda'}.xml`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ==============================================================================
// DIRECTORIO OFICIAL DE CLIENTES & PERFIL TRIBUTARIO DGT (COSTA RICA)
// ==============================================================================

window.renderCustomerDirectoryTable = async function() {
  const tbody = document.getElementById('customerDirectoryTableBody');
  if (!tbody) return;

  // Cargar clientes desde API
  try {
    const res = await fetch('/api/customers');
    if (res.ok) {
      AppState.customers = await res.json();
    }
  } catch (e) {
    console.warn('Error cargando clientes desde API:', e);
  }

  // Actualizar contador del sidebar
  const badgeNav = document.getElementById('customersBadgeCount');
  if (badgeNav) badgeNav.textContent = AppState.customers.length;

  // Actualizar KPIs
  updateCustomerKpiCards();

  // Renderizar filas
  filterCustomerDirectoryTable();
};

function updateCustomerKpiCards() {
  const totalEl = document.getElementById('kpiCustTotal');
  const jurEl = document.getElementById('kpiCustJuridicas');
  const credEl = document.getElementById('kpiCustCredito');
  const contEl = document.getElementById('kpiCustContado');

  const total = AppState.customers.length;
  const juridicas = AppState.customers.filter(c => (c.docType === '02' || (c.taxId && c.taxId.startsWith('3-')))).length;
  const credito = AppState.customers.filter(c => (c.terms && c.terms.toLowerCase().includes('crédito'))).length;
  const contado = total - credito;

  if (totalEl) totalEl.textContent = total;
  if (jurEl) jurEl.textContent = juridicas;
  if (credEl) credEl.textContent = credito;
  if (contEl) contEl.textContent = contado;
}

window.filterCustomerDirectoryTable = function() {
  const tbody = document.getElementById('customerDirectoryTableBody');
  if (!tbody) return;

  const searchInput = document.getElementById('custSearchInput');
  const cantonFilter = document.getElementById('custCantonFilter');
  const termsFilter = document.getElementById('custTermsFilter');

  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedCanton = cantonFilter ? cantonFilter.value : 'ALL';
  const selectedTerms = termsFilter ? termsFilter.value : 'ALL';

  const filtered = AppState.customers.filter(c => {
    const matchSearch = !searchTerm || 
      (c.name && c.name.toLowerCase().includes(searchTerm)) ||
      (c.taxId && c.taxId.toLowerCase().includes(searchTerm)) ||
      (c.tradeName && c.tradeName.toLowerCase().includes(searchTerm)) ||
      (c.email && c.email.toLowerCase().includes(searchTerm)) ||
      (c.phone && c.phone.includes(searchTerm));

    const matchCanton = (selectedCanton === 'ALL') || (c.canton === selectedCanton);

    const matchTerms = (selectedTerms === 'ALL') || 
      (selectedTerms === 'Contado' && (!c.terms || c.terms.toLowerCase().includes('contado'))) ||
      (selectedTerms === 'Crédito' && (c.terms && c.terms.toLowerCase().includes('crédito')));

    return matchSearch && matchCanton && matchTerms;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:30px; color:#64748B;">
          <i class="bi bi-person-x" style="font-size:2rem; display:block; margin-bottom:8px; color:#CBD5E1;"></i>
          No se encontraron clientes que coincidan con los filtros aplicados.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    const isJuridica = (c.docType === '02' || (c.taxId && c.taxId.startsWith('3-')));
    const docLabel = isJuridica ? 'Céd. Jurídica' : 'Céd. Física';
    const docBadgeStyle = isJuridica ? 'background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE;' : 'background:#F0FDF4; color:#15803D; border:1px solid #BBF7D0;';
    const isCredit = (c.terms && c.terms.toLowerCase().includes('crédito'));
    const termsBadge = isCredit ? 'background:#FEF3C7; color:#92400E;' : 'background:#F1F5F9; color:#475569;';

    const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');
    const waLink = cleanPhone ? `https://wa.me/506${cleanPhone}` : '#';

    return `
      <tr style="border-bottom:1px solid #F1F5F9; transition:background 0.15s;" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='transparent'">
        <td style="padding:14px 16px;">
          <div style="font-weight:800; color:#0F172A; font-size:0.9rem;">${escapeHtml(c.name)}</div>
          ${c.tradeName ? `<div style="font-size:0.75rem; color:#64748B; margin-top:1px;"><i class="bi bi-shop"></i> ${escapeHtml(c.tradeName)}</div>` : ''}
          <div style="margin-top:4px;">
            <span class="badge" style="${docBadgeStyle} font-size:0.72rem; padding:2px 7px; border-radius:4px; font-family:'JetBrains Mono';">
              ${docLabel}: ${escapeHtml(c.taxId)}
            </span>
          </div>
        </td>

        <td style="padding:14px 16px;">
          <div style="font-size:0.82rem; color:#334155;">
            <i class="bi bi-envelope text-primary" style="margin-right:4px;"></i>
            <a href="mailto:${escapeHtml(c.email || '')}" style="color:#0284C7; text-decoration:none;">${escapeHtml(c.email || 'Sin correo registrado')}</a>
          </div>
          <div style="font-size:0.82rem; color:#475569; margin-top:4px; display:flex; align-items:center; gap:8px;">
            <span><i class="bi bi-telephone text-secondary" style="margin-right:4px;"></i>${escapeHtml(c.phone || 'N/A')}</span>
            ${cleanPhone ? `<a href="${waLink}" target="_blank" class="badge" style="background:#25D366; color:#FFF; text-decoration:none; padding:2px 6px; font-size:0.7rem; border-radius:4px;"><i class="bi bi-whatsapp"></i> Chat</a>` : ''}
          </div>
        </td>

        <td style="padding:14px 16px;">
          <div style="font-size:0.82rem; font-weight:700; color:#1E293B;">
            <i class="bi bi-geo-alt-fill text-danger" style="margin-right:3px;"></i>${escapeHtml(c.canton || 'Cartago')}, ${escapeHtml(c.province || 'Cartago')}
          </div>
          <div style="font-size:0.75rem; color:#64748B; margin-top:2px;">
            ${c.district ? `<span style="font-weight:600;">Dist. ${escapeHtml(c.district)}:</span> ` : ''}${escapeHtml(c.address || '')}
          </div>
        </td>

        <td style="padding:14px 16px;">
          <div>
            <span class="badge" style="${termsBadge} font-size:0.74rem; padding:3px 8px; border-radius:6px; font-weight:700;">
              💳 ${escapeHtml(c.terms || 'Contado')}
            </span>
          </div>
          <div style="font-size:0.72rem; color:#64748B; margin-top:4px;">
            CIUU DGT: <code style="color:#0284C7;">${escapeHtml(c.economicActivity || '466901')}</code>
          </div>
        </td>

        <td style="padding:14px 16px; text-align:right;">
          <div style="display:inline-flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">
            <button class="btn-fragama btn-primary-fragama" onclick="emitInvoiceForCustomer(${c.id})" style="padding:5px 10px; font-size:0.76rem; background:#0284C7; border:none; border-radius:6px;" title="Emitir Factura Electrónica v4.3">
              <i class="bi bi-receipt"></i> Facturar FE
            </button>
            <button class="btn-fragama btn-outline-fragama" onclick="createOrderForCustomer(${c.id})" style="padding:5px 9px; font-size:0.76rem; border-radius:6px; color:#10B981; border-color:#10B981;" title="Crear Pedido / Cotización">
              <i class="bi bi-cart-plus"></i> Pedido
            </button>
            <button class="btn-fragama btn-outline-fragama" onclick="openEditCustomerTaxModal(${c.id})" style="padding:5px 9px; font-size:0.76rem; border-radius:6px;" title="Editar Ficha Oficial">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn-fragama btn-outline-fragama" onclick="deleteCustomer(${c.id})" style="padding:5px 9px; font-size:0.76rem; border-radius:6px; color:#EF4444; border-color:#FCA5A5;" title="Eliminar del Directorio">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
};

window.openNewCustomerTaxModal = function() {
  const form = document.getElementById('customerTaxForm');
  const title = document.getElementById('customerTaxModalTitle');
  if (form) form.reset();
  const idEl = document.getElementById('custModalId');
  if (idEl) idEl.value = '';
  if (title) title.textContent = 'Registrar Nuevo Cliente Tributario (DGT Costa Rica)';
  openModalDirectly('customerTaxModal');
};

window.openEditCustomerTaxModal = function(id) {
  const customer = AppState.customers.find(c => c.id === id);
  if (!customer) return;

  const title = document.getElementById('customerTaxModalTitle');
  const idEl = document.getElementById('custModalId');
  if (idEl) idEl.value = customer.id;

  const docEl = document.getElementById('custModalDocType');
  const taxIdEl = document.getElementById('custModalTaxId');
  const nameEl = document.getElementById('custModalName');
  const tradeEl = document.getElementById('custModalTradeName');
  const emailEl = document.getElementById('custModalEmail');
  const phoneEl = document.getElementById('custModalPhone');
  const provEl = document.getElementById('custModalProvince');
  const cantEl = document.getElementById('custModalCanton');
  const distEl = document.getElementById('custModalDistrict');
  const addrEl = document.getElementById('custModalAddress');
  const termsEl = document.getElementById('custModalTerms');
  const payEl = document.getElementById('custModalPaymentMethod');
  const actEl = document.getElementById('custModalActivity');

  if (docEl) docEl.value = customer.docType || '02';
  if (taxIdEl) taxIdEl.value = customer.taxId || '';
  if (nameEl) nameEl.value = customer.name || '';
  if (tradeEl) tradeEl.value = customer.tradeName || '';
  if (emailEl) emailEl.value = customer.email || '';
  if (phoneEl) phoneEl.value = customer.phone || '';
  if (provEl) provEl.value = customer.province || 'Cartago';
  if (cantEl) cantEl.value = customer.canton || 'Cartago';
  if (distEl) distEl.value = customer.district || 'Oriental';
  if (addrEl) addrEl.value = customer.address || '';
  if (termsEl) termsEl.value = customer.terms || 'Contado';
  if (payEl) payEl.value = customer.paymentMethodDefault || '04';
  if (actEl) actEl.value = customer.economicActivity || '466901';

  if (title) title.textContent = `Editar Ficha Tributaria: ${customer.name}`;
  openModalDirectly('customerTaxModal');
};

window.closeCustomerTaxModal = function() {
  closeModalDirectly('customerTaxModal');
};

window.deleteCustomer = async function(id) {
  const c = AppState.customers.find(x => x.id === id);
  const name = c ? c.name : `ID #${id}`;
  if (!confirm(`¿Confirma eliminar al cliente '${name}' del directorio oficial?\n\nEsta acción no se puede deshacer.`)) {
    return;
  }
  try {
    const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al eliminar el cliente');
    }
    AppState.customers = AppState.customers.filter(x => x.id !== id);
    showNotificationToast(`🗑️ Cliente '${name}' eliminado del directorio oficial.`, 'info');
    await renderCustomerDirectoryTable();
    if (typeof populateXmlCustomerSelector === 'function') {
      populateXmlCustomerSelector();
    }
  } catch (err) {
    alert(`❌ Error al eliminar cliente: ${err.message}`);
  }
};

window.exportCustomersToExcel = function() {
  if (!AppState.customers || AppState.customers.length === 0) {
    showNotificationToast('No hay clientes registrados para exportar.', 'warning');
    return;
  }

  const dateStr = new Date().toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' });
  const total = AppState.customers.length;
  const juridicas = AppState.customers.filter(c => (c.docType === '02' || (c.taxId && c.taxId.startsWith('3-')))).length;
  const credito = AppState.customers.filter(c => (c.terms && c.terms.toLowerCase().includes('crédito'))).length;
  const contado = total - credito;

  const rowsHtml = AppState.customers.map((c, idx) => {
    const isJur = (c.docType === '02' || (c.taxId && c.taxId.startsWith('3-')));
    const docLabel = isJur ? 'Cédula Jurídica (02)' : 'Cédula Física (01)';
    const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    const isCred = (c.terms && c.terms.toLowerCase().includes('crédito'));
    return `
      <tr style="background-color:${rowBg};">
        <td style="border:1px solid #CBD5E1; padding:7px; text-align:center; font-weight:bold;">${c.id}</td>
        <td style="border:1px solid #CBD5E1; padding:7px; text-align:center;">${docLabel}</td>
        <td style="border:1px solid #CBD5E1; padding:7px; font-weight:bold; color:#1D4ED8; mso-number-format:'\\@'; text-align:center;">${escapeHtml(c.taxId || '')}</td>
        <td style="border:1px solid #CBD5E1; padding:7px; font-weight:bold; color:#0F172A;">${escapeHtml(c.name || '')}</td>
        <td style="border:1px solid #CBD5E1; padding:7px; color:#475569;">${escapeHtml(c.tradeName || '-')}</td>
        <td style="border:1px solid #CBD5E1; padding:7px; color:#0284C7; mso-number-format:'\\@';">${escapeHtml(c.email || '')}</td>
        <td style="border:1px solid #CBD5E1; padding:7px; mso-number-format:'\\@'; text-align:center;">${escapeHtml(c.phone || '')}</td>
        <td style="border:1px solid #CBD5E1; padding:7px;">${escapeHtml(c.province || 'Cartago')}</td>
        <td style="border:1px solid #CBD5E1; padding:7px;">${escapeHtml(c.canton || 'Cartago')}</td>
        <td style="border:1px solid #CBD5E1; padding:7px;">${escapeHtml(c.district || '')}</td>
        <td style="border:1px solid #CBD5E1; padding:7px;">${escapeHtml(c.address || '')}</td>
        <td style="border:1px solid #CBD5E1; padding:7px; text-align:center; font-weight:bold; color:${isCred ? '#B45309' : '#15803D'};">${escapeHtml(c.terms || 'Contado')}</td>
        <td style="border:1px solid #CBD5E1; padding:7px; text-align:center; mso-number-format:'\\@'; font-family:monospace;">${escapeHtml(c.economicActivity || '466901')}</td>
        <td style="border:1px solid #CBD5E1; padding:7px; text-align:center; font-weight:bold; color:#16A34A;">ACTIVO</td>
      </tr>
    `;
  }).join('');

  const excelTemplate = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Directorio Clientes DGT</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
                <x:Selected/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #0F172A; color: #FFFFFF; font-weight: bold; border: 1px solid #334155; padding: 10px 8px; text-align: center; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="14" style="background-color:#0B192C; color:#FFFFFF; padding:16px; font-size:16pt; font-weight:bold; text-align:left;">
            DISTRIBUIDORA FRAGAMA S.A. | BODEGA CENTRAL TARAS, CARTAGO
          </td>
        </tr>
        <tr>
          <td colspan="14" style="background-color:#0284C7; color:#FFFFFF; padding:8px; font-size:11pt; font-weight:bold;">
            DIRECTORIO OFICIAL DE CLIENTES INSTITUCIONALES &amp; PERFIL TRIBUTARIO DGT (HACIENDA COSTA RICA)
          </td>
        </tr>
        <tr>
          <td colspan="14" style="padding:10px 0; color:#475569; font-size:9pt;">
            <strong>Fecha de Emisión:</strong> ${dateStr} &nbsp;|&nbsp; 
            <strong>Total Clientes:</strong> ${total} &nbsp;|&nbsp; 
            <strong>Cédulas Jurídicas:</strong> ${juridicas} &nbsp;|&nbsp; 
            <strong>Cuentas de Crédito:</strong> ${credito} &nbsp;|&nbsp; 
            <strong>Contado:</strong> ${contado}
          </td>
        </tr>
        <thead>
          <tr>
            <th>N° ID</th>
            <th>Tipo Identificación</th>
            <th>Cédula Fiscal</th>
            <th>Razón Social Oficial</th>
            <th>Nombre Comercial</th>
            <th>Correo Factura Electrónica v4.3</th>
            <th>Teléfono</th>
            <th>Provincia</th>
            <th>Cantón</th>
            <th>Distrito</th>
            <th>Dirección Comercial</th>
            <th>Condición de Pago</th>
            <th>Actividad CIUU</th>
            <th>Estado Fiscal</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `directorio_clientes_fragama_dgt_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotificationToast('📊 Directorio de clientes exportado exitosamente en Excel profesional (.xls).', 'success');
};

window.exportCustomersToPdf = function() {
  if (!AppState.customers || AppState.customers.length === 0) {
    showNotificationToast('No hay clientes registrados para exportar.', 'warning');
    return;
  }

  const dateStr = new Date().toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const total = AppState.customers.length;
  const juridicas = AppState.customers.filter(c => (c.docType === '02' || (c.taxId && c.taxId.startsWith('3-')))).length;
  const credito = AppState.customers.filter(c => (c.terms && c.terms.toLowerCase().includes('crédito'))).length;
  const contado = total - credito;

  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (!printWindow) {
    showNotificationToast('Por favor permita ventanas emergentes para generar el PDF.', 'warning');
    return;
  }

  const rowsHtml = AppState.customers.map((c, i) => {
    const isJur = (c.docType === '02' || (c.taxId && c.taxId.startsWith('3-')));
    const docLabel = isJur ? 'Jurídica' : 'Física';
    return `
      <tr style="border-bottom:1px solid #E2E8F0; ${i % 2 === 1 ? 'background:#F8FAFC;' : ''}">
        <td style="padding:7px 8px; font-weight:bold; text-align:center;">${c.id}</td>
        <td style="padding:7px 8px;">
          <div style="font-weight:bold; color:#0F172A; font-size:11.5px;">${escapeHtml(c.name)}</div>
          ${c.tradeName ? `<div style="font-size:10px; color:#64748B;">${escapeHtml(c.tradeName)}</div>` : ''}
        </td>
        <td style="padding:7px 8px; font-family:'Courier New',monospace; font-size:11px; white-space:nowrap;">
          <span style="font-size:9px; background:#EFF6FF; color:#1D4ED8; padding:2px 5px; border-radius:3px; font-weight:bold;">${docLabel}</span>
          ${escapeHtml(c.taxId)}
        </td>
        <td style="padding:7px 8px; font-size:11px;">
          <div><a href="mailto:${escapeHtml(c.email)}" style="color:#0284C7; text-decoration:none;">${escapeHtml(c.email || '-')}</a></div>
          <div style="color:#475569; font-size:10px;">${escapeHtml(c.phone || '-')}</div>
        </td>
        <td style="padding:7px 8px; font-size:11px; color:#334155;">
          <strong>${escapeHtml(c.canton || 'Cartago')}</strong>, ${escapeHtml(c.province || 'Cartago')}
          <div style="font-size:10px; color:#64748B;">${escapeHtml(c.address || '')}</div>
        </td>
        <td style="padding:7px 8px; text-align:center; font-size:11px;">
          <span style="padding:3px 8px; border-radius:12px; font-weight:bold; font-size:10px; ${(c.terms && c.terms.toLowerCase().includes('crédito')) ? 'background:#FEF3C7; color:#92400E;' : 'background:#F1F5F9; color:#334155;'}">
            ${escapeHtml(c.terms || 'Contado')}
          </span>
        </td>
        <td style="padding:7px 8px; text-align:center; font-family:monospace; font-size:10px;">
          ${escapeHtml(c.economicActivity || '466901')}
        </td>
      </tr>
    `;
  }).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Reporte Oficial DGT - Clientes Fragama</title>
      <style>
        @page { size: landscape; margin: 10mm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1E293B; margin: 0; padding: 15px; }
        .no-print { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: #0F172A; color: #FFF; border-radius: 8px; margin-bottom: 20px; }
        .btn-print { background: #0284C7; color: #FFF; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px; }
        .header-table { width: 100%; border-bottom: 2px solid #0284C7; padding-bottom: 12px; margin-bottom: 14px; }
        .kpi-container { display: flex; gap: 12px; margin-bottom: 16px; }
        .kpi-card { flex: 1; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px 12px; }
        .kpi-title { font-size: 10px; color: #64748B; text-transform: uppercase; font-weight: bold; }
        .kpi-val { font-size: 16px; font-weight: 800; color: #0284C7; }
        table.data-table { width: 100%; border-collapse: collapse; font-size: 11px; }
        table.data-table th { background: #0F172A; color: #FFF; padding: 8px 10px; font-size: 10.5px; text-align: left; }
        @media print {
          .no-print { display: none !important; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <div><strong>Vista Previa para Impresión / Exportación a PDF</strong> — Distribuidora Fragama</div>
        <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
      </div>

      <table class="header-table">
        <tr>
          <td>
            <h1 style="margin:0; font-size:18px; color:#0B192C; font-weight:900;">DISTRIBUIDORA FRAGAMA S.A.</h1>
            <div style="font-size:11px; color:#64748B; margin-top:2px;">Bodega Central Taras, Cartago, Costa Rica • Cédula Jurídica: 3-101-789456 • Tel: +506 6267-7053</div>
            <div style="font-size:13px; font-weight:bold; color:#0284C7; margin-top:6px;">DIRECTORIO OFICIAL DE CLIENTES TRIBUTARIOS DGT &amp; COMPROBANTES ELECTRÓNICOS v4.3</div>
          </td>
          <td style="text-align:right; font-size:10px; color:#64748B;">
            <div><strong>Emisión:</strong> ${dateStr}</div>
            <div><strong>Sistema:</strong> WMS Fragama Enterprise</div>
          </td>
        </tr>
      </table>

      <div class="kpi-container">
        <div class="kpi-card"><div class="kpi-title">Total Clientes</div><div class="kpi-val">${total}</div></div>
        <div class="kpi-card"><div class="kpi-title">Cédulas Jurídicas</div><div class="kpi-val" style="color:#10B981;">${juridicas}</div></div>
        <div class="kpi-card"><div class="kpi-title">Cuentas a Crédito</div><div class="kpi-val" style="color:#F59E0B;">${credito}</div></div>
        <div class="kpi-card"><div class="kpi-title">Cuentas Contado</div><div class="kpi-val" style="color:#6366F1;">${contado}</div></div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width:35px; text-align:center;">ID</th>
            <th>Cliente / Razón Social</th>
            <th style="width:140px;">Cédula Fiscal</th>
            <th style="width:170px;">Contacto FE v4.3</th>
            <th>Ubicación / Dirección</th>
            <th style="width:90px; text-align:center;">Condición</th>
            <th style="width:70px; text-align:center;">CIUU</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="margin-top:20px; font-size:9.5px; color:#94A3B8; text-align:center; border-top:1px solid #E2E8F0; padding-top:10px;">
        Documento oficial generado para fines fiscales y comerciales de Distribuidora Fragama. Conforme a las disposiciones de la Dirección General de Tributación (DGT), Ministerio de Hacienda de Costa Rica.
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
  showNotificationToast('📄 Ventana de impresión y exportación a PDF abierta.', 'info');
};

window.exportCustomersToWord = function() {
  if (!AppState.customers || AppState.customers.length === 0) {
    showNotificationToast('No hay clientes registrados para exportar.', 'warning');
    return;
  }

  const dateStr = new Date().toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' });
  const total = AppState.customers.length;

  const rowsHtml = AppState.customers.map(c => `
    <tr>
      <td style="border:1px solid #333333; padding:6px; text-align:center;">${c.id}</td>
      <td style="border:1px solid #333333; padding:6px; font-weight:bold;">${escapeHtml(c.name)}</td>
      <td style="border:1px solid #333333; padding:6px; font-family:monospace; text-align:center;">${escapeHtml(c.taxId)}</td>
      <td style="border:1px solid #333333; padding:6px;">${escapeHtml(c.email || '')}</td>
      <td style="border:1px solid #333333; padding:6px; text-align:center;">${escapeHtml(c.phone || '')}</td>
      <td style="border:1px solid #333333; padding:6px;">${escapeHtml(c.canton || '')}, ${escapeHtml(c.province || '')}</td>
      <td style="border:1px solid #333333; padding:6px; text-align:center;">${escapeHtml(c.terms || 'Contado')}</td>
      <td style="border:1px solid #333333; padding:6px; text-align:center; font-family:monospace;">${escapeHtml(c.economicActivity || '466901')}</td>
    </tr>
  `).join('');

  const wordContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Directorio Oficial de Clientes - Distribuidora Fragama</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.4; }
        h1 { color: #0B192C; font-size: 16pt; margin-bottom: 2px; }
        h2 { color: #0284C7; font-size: 12pt; margin-top: 0; }
        table { border-collapse: collapse; width: 100%; margin-top: 15px; }
        th { background-color: #0F172A; color: #FFFFFF; border: 1px solid #000; padding: 8px; font-size: 9.5pt; text-align: left; }
        td { font-size: 9pt; }
      </style>
    </head>
    <body>
      <h1>DISTRIBUIDORA FRAGAMA S.A.</h1>
      <h2>DIRECTORIO OFICIAL DE CLIENTES TRIBUTARIOS DGT</h2>
      <p><strong>Fecha de Generación:</strong> ${dateStr} | <strong>Total de Registros:</strong> ${total}</p>
      <p style="font-size:9pt; color:#555;">Bodega Central Taras, Cartago, Costa Rica • Registro de Clientes y Perfiles para Facturación Electrónica v4.3</p>
      
      <table>
        <thead>
          <tr>
            <th style="text-align:center;">ID</th>
            <th>Razón Social Oficial</th>
            <th style="text-align:center;">Cédula Fiscal</th>
            <th>Correo FE v4.3</th>
            <th style="text-align:center;">Teléfono</th>
            <th>Ubicación</th>
            <th style="text-align:center;">Condición</th>
            <th style="text-align:center;">CIUU</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + wordContent], { type: 'application/msword;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `directorio_clientes_fragama_dgt_${new Date().toISOString().slice(0, 10)}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotificationToast('📝 Directorio de clientes exportado exitosamente en Word (.doc).', 'success');
};

window.exportCustomersToCsv = function() {
  if (!AppState.customers || AppState.customers.length === 0) {
    showNotificationToast('No hay clientes registrados para exportar.', 'warning');
    return;
  }
  const headers = ['ID', 'Tipo Doc', 'Cédula / Identificación', 'Razón Social Oficial', 'Nombre Fantasía', 'Correo Factura Electrónica', 'Teléfono', 'Provincia', 'Cantón', 'Distrito', 'Dirección Exacta', 'Condición Pago', 'Método Pago DGT', 'Actividad Económica CIUU'];
  const rows = AppState.customers.map(c => [
    c.id,
    c.docType || '02',
    `"${(c.taxId || '').replace(/"/g, '""')}"`,
    `"${(c.name || '').replace(/"/g, '""')}"`,
    `"${(c.tradeName || '').replace(/"/g, '""')}"`,
    `"${(c.email || '').replace(/"/g, '""')}"`,
    `"${(c.phone || '').replace(/"/g, '""')}"`,
    `"${(c.province || '').replace(/"/g, '""')}"`,
    `"${(c.canton || '').replace(/"/g, '""')}"`,
    `"${(c.district || '').replace(/"/g, '""')}"`,
    `"${(c.address || '').replace(/"/g, '""')}"`,
    `"${(c.terms || 'Contado').replace(/"/g, '""')}"`,
    `"${(c.paymentMethodDefault || '04').replace(/"/g, '""')}"`,
    `"${(c.economicActivity || '466901').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `directorio_clientes_fragama_dgt_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotificationToast('📥 Directorio oficial de clientes descargado en CSV.', 'success');
};

window.createOrderForCustomer = function(customerId) {
  const cust = AppState.customers.find(c => c.id === customerId);
  if (!cust) return;
  switchViewDirectly('view-customer-orders');
  switchOrderTabDirectly('new');
  const select = document.getElementById('orderCustomerSelect');
  if (select) {
    select.value = String(cust.id);
    const event = new Event('change');
    select.dispatchEvent(event);
  }
  showNotificationToast(`🛒 Formulario de pedido precargado con: ${cust.name}`, 'info');
};

window.saveCustomerTaxForm = async function(event) {
  event.preventDefault();
  const idVal = document.getElementById('custModalId').value;
  const isEdit = Boolean(idVal);

  const payload = {
    taxId: document.getElementById('custModalTaxId').value.trim(),
    docType: document.getElementById('custModalDocType').value,
    name: document.getElementById('custModalName').value.trim(),
    tradeName: document.getElementById('custModalTradeName').value.trim(),
    email: document.getElementById('custModalEmail').value.trim(),
    phone: document.getElementById('custModalPhone').value.trim(),
    province: document.getElementById('custModalProvince').value,
    canton: document.getElementById('custModalCanton').value.trim(),
    district: document.getElementById('custModalDistrict').value.trim(),
    address: document.getElementById('custModalAddress').value.trim(),
    terms: document.getElementById('custModalTerms').value,
    paymentMethodDefault: document.getElementById('custModalPaymentMethod').value,
    economicActivity: document.getElementById('custModalActivity').value.trim()
  };

  try {
    const url = isEdit ? `/api/customers/${idVal}` : '/api/customers';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error procesando solicitud');
    }

    closeCustomerTaxModal();
    if (typeof showNotificationToast === 'function') {
      showNotificationToast(isEdit ? `✅ Ficha del cliente '${payload.name}' actualizada con éxito.` : `✅ Cliente '${payload.name}' registrado exitosamente en la base de datos.`, 'success');
    } else {
      alert('Operación exitosa');
    }

    // Recargar tabla y selectores en tiempo real
    await renderCustomerDirectoryTable();
    if (typeof populateXmlCustomerSelector === 'function') {
      populateXmlCustomerSelector();
    }
  } catch (e) {
    alert(`❌ Error al guardar cliente: ${e.message}`);
  }
};

window.emitInvoiceForCustomer = function(customerId) {
  // Cambiar a la vista de Hacienda
  window.switchViewDirectly('view-tax-hacienda');

  // Seleccionar cliente en el selector de comprobante electrónico
  const sel = document.getElementById('xmlCustomerSelector');
  if (sel) {
    sel.value = String(customerId);
    if (typeof onSelectCustomerFromDb === 'function') {
      onSelectCustomerFromDb();
    }
  }

  // Scroll a la sección del visor
  setTimeout(() => {
    const card = document.getElementById('xmlContentDisplay') || document.getElementById('xmlCustomerSelector');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 200);

  const cust = AppState.customers.find(c => c.id === customerId);
  const name = cust ? cust.name : `ID ${customerId}`;
  if (typeof showNotificationToast === 'function') {
    showNotificationToast(`🧾 Cliente '${name}' precargado en el generador de Factura Electrónica v4.3.`, 'info');
  }
};

// ==============================================================================
// MODAL: GUÍA REAL DE FACTURACIÓN Y DECLARACIÓN D-104 (DGT CR)
// ==============================================================================

window.openRealTaxWorkflowGuideModal = function() {
  const modal = document.getElementById('realTaxWorkflowGuideModal');
  if (modal) modal.style.display = 'flex';
};

window.closeRealTaxWorkflowGuideModal = function() {
  const modal = document.getElementById('realTaxWorkflowGuideModal');
  if (modal) modal.style.display = 'none';
};

// ==============================================================================
// INICIALIZACIÓN GENERAL DEL SISTEMA (EJECUTADA TRAS EVALUAR TODO EL CÓDIGO)
// ==============================================================================
function initApp() {
  const steps = [
    ['setupLoginModule', setupLoginModule],
    ['setupNavigationAndSidebar', setupNavigationAndSidebar],
    ['setupRoleSwitcher', setupRoleSwitcher],
    ['setupDriverActions', setupDriverActions],
    ['setupBarcodeGenerator', setupBarcodeGenerator],
    ['setupQuickMovementModal', setupQuickMovementModal],
    ['setupProductMaintenance', setupProductMaintenance],
    ['setupExcelBulkImport', setupExcelBulkImport],
    ['setupReports', setupReports],
    ['setupFamiliesModule', setupFamiliesModule],
    ['setupPosModule', setupPosModule],
    ['setupCustomerOrdersModule', setupCustomerOrdersModule],
    ['setupSuppliersModule', setupSuppliersModule],
    ['setupDashboardControls', setupDashboardControls]
  ];

  for (const [name, fn] of steps) {
    try {
      if (typeof fn === 'function') fn();
    } catch (e) {
      console.warn(`Error inicializando módulo ${name}:`, e);
    }
  }

  try { renderAllViews(); } catch (e) { console.warn('Error en renderAllViews:', e); }
  try { loadInitialDataFromSql(); } catch (e) { console.warn('Error en loadInitialDataFromSql:', e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
