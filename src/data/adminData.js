// Admin seed data (from assets/js/data.js)
export const users = [
  {name:'Ana Pérez',email:'ana@duocuc.cl',role:'admin',birthdate:'1970-05-10',benefits:['DUOC','>50']},
  {name:'Luis Gómez',email:'luis@example.com',role:'user',birthdate:'1999-09-01',benefits:[]},
  {name:'María Soto',email:'maria@duocuc.cl',role:'user',birthdate:'2003-01-15',benefits:['DUOC']},
  {name:'Carlos Ruiz',email:'carlos@example.com',role:'user',birthdate:'1965-12-20',benefits:['>50']},
  {name:'Admin Demo',email:'admin@example.com',role:'admin',birthdate:'1986-07-07',benefits:['FELICES50']}
];


export const orders = [
  {
    id: 1,
    code: 'PED-0001',
    customerName: 'Juan Pérez',
    name: 'Juan Pérez',
    date: new Date(2024, 0, 15).toISOString(),
    status: 'Preparación',
    items: [
      { name: 'Torta de Chocolate', title: 'Torta de Chocolate', quantity: 1, price: 45000 }
    ],
    total: 45000
  },
  {
    id: 2,
    code: 'PED-0002',
    customerName: 'María González',
    name: 'María González',
    date: new Date(2024, 0, 15).toISOString(),
    status: 'En camino',
    items: [
      { name: 'Torta Tres Leches', title: 'Torta Tres Leches', quantity: 1, price: 42000 },
      { name: 'Pie de Limón', title: 'Pie de Limón', quantity: 2, price: 5000 }
    ],
    total: 52000
  },
  {
    id: 3,
    code: 'PED-0003',
    customerName: 'Pedro Silva',
    name: 'Pedro Silva',
    date: new Date(2024, 0, 14).toISOString(),
    status: 'Entregado',
    items: [
      { name: 'Pastel de Vainilla', title: 'Pastel de Vainilla', quantity: 1, price: 50000 }
    ],
    total: 50000
  },
  {
    id: 4,
    code: 'PED-0004',
    customerName: 'Ana López',
    name: 'Ana López',
    date: new Date().toISOString(),
    status: 'Preparación',
    items: [
      { name: 'Torta Red Velvet', title: 'Torta Red Velvet', quantity: 1, price: 48000 },
      { name: 'Cupcakes', title: 'Cupcakes', quantity: 6, price: 2500 }
    ],
    total: 63000
  },
  {
    id: 5,
    code: 'PED-0005',
    customerName: 'Carlos Martínez',
    name: 'Carlos Martínez',
    date: new Date().toISOString(),
    status: 'En camino',
    items: [
      { name: 'Torta de Zanahoria', title: 'Torta de Zanahoria', quantity: 1, price: 40000 }
    ],
    total: 40000
  }
];
