// Admin seed data (from assets/js/data.js)
export const users = [
  {name:'Ana Pérez',email:'ana@duoc.cl',role:'admin',birthdate:'1970-05-10',benefits:['DUOC','>50']},
  {name:'Luis Gómez',email:'luis@example.com',role:'user',birthdate:'1999-09-01',benefits:[]},
  {name:'María Soto',email:'maria@duoc.cl',role:'user',birthdate:'2003-01-15',benefits:['DUOC']},
  {name:'Carlos Ruiz',email:'carlos@example.com',role:'user',birthdate:'1965-12-20',benefits:['>50']},
  {name:'Admin Demo',email:'admin@example.com',role:'admin',birthdate:'1986-07-07',benefits:['FELICES50']}
];


export const orders = [
  {code:'PED-0001',status:'Preparación',items:[{code:'TC001',qty:1}],total:45000},
  {code:'PED-0002',status:'En reparto',items:[{code:'TT002',qty:1},{code:'PI001',qty:2}],total:52000},
  {code:'PED-0003',status:'Entregado',items:[{code:'PV001',qty:1}],total:50000}
];
