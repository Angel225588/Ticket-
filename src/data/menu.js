// Default menu for Par'Issy
// This can be edited via the Menu page in the app

export const defaultMenu = {
  categories: [
    {
      id: 'entrees',
      name: 'Entrées',
      items: [
        { id: 'e1', name: 'Soupe du Jour', price: 8.50, description: 'Soup of the day' },
        { id: 'e2', name: 'Salade Verte', price: 7.00, description: 'Green salad' },
        { id: 'e3', name: 'Terrine Maison', price: 9.50, description: 'Homemade terrine' },
        { id: 'e4', name: 'Oeuf Mayonnaise', price: 6.50, description: 'Egg with mayonnaise' },
      ],
    },
    {
      id: 'plats',
      name: 'Plats',
      items: [
        { id: 'p1', name: "O'Burger", price: 14.50, description: 'House burger - choice of cooking' },
        { id: 'p2', name: 'Steak Frites', price: 16.00, description: 'Steak with fries' },
        { id: 'p3', name: 'Poulet Rôti', price: 15.00, description: 'Roasted chicken' },
        { id: 'p4', name: 'Poisson du Jour', price: 17.00, description: 'Fish of the day' },
        { id: 'p5', name: 'Entrecôte', price: 22.00, description: 'Ribeye steak' },
      ],
    },
    {
      id: 'accompagnements',
      name: 'Accompagnements',
      items: [
        { id: 'a1', name: 'Frites', price: 4.00, description: 'French fries' },
        { id: 'a2', name: 'Salade', price: 3.50, description: 'Side salad' },
        { id: 'a3', name: 'Légumes du Jour', price: 4.50, description: 'Vegetables of the day' },
        { id: 'a4', name: 'Riz', price: 3.00, description: 'Rice' },
      ],
    },
    {
      id: 'desserts',
      name: 'Desserts',
      items: [
        { id: 'd1', name: 'Crème Brûlée', price: 8.00, description: 'Classic crème brûlée' },
        { id: 'd2', name: 'Tarte du Jour', price: 7.50, description: 'Tart of the day' },
        { id: 'd3', name: 'Mousse au Chocolat', price: 7.00, description: 'Chocolate mousse' },
        { id: 'd4', name: 'Café Gourmand', price: 9.00, description: 'Coffee with mini desserts' },
      ],
    },
    {
      id: 'boissons',
      name: 'Boissons',
      items: [
        { id: 'b1', name: 'Café / Espresso', price: 2.50, description: 'Espresso' },
        { id: 'b2', name: 'Thé', price: 3.00, description: 'Tea' },
        { id: 'b3', name: 'Eau Minérale', price: 3.50, description: 'Mineral water' },
        { id: 'b4', name: 'Coca-Cola', price: 4.00, description: 'Coca-Cola' },
        { id: 'b5', name: 'Jus de Fruits', price: 4.50, description: 'Fruit juice' },
        { id: 'b6', name: 'Vin Rouge (verre)', price: 6.00, description: 'Red wine (glass)' },
        { id: 'b7', name: 'Vin Blanc (verre)', price: 6.00, description: 'White wine (glass)' },
        { id: 'b8', name: 'Bière Pression', price: 5.50, description: 'Draft beer' },
      ],
    },
  ],
};
