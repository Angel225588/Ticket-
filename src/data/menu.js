// Par'Issy actual menu - extracted from POS system
// Prices set to 0 where unknown - update via Menu page in the app
// LGCF = La Grande Carte Formule items

export const defaultMenu = {
  categories: [
    {
      id: 'entrees',
      name: 'Entrées',
      items: [
        { id: 'e1', name: 'Daurade Ceviche', price: 0, description: '' },
        { id: 'e2', name: 'Foie Gras', price: 0, description: '' },
        { id: 'e3', name: 'Inspiration du Jour', price: 0, description: '' },
        { id: 'e4', name: 'LGCF Carpaccio Rosbeef', price: 0, description: '' },
        { id: 'e5', name: 'LGCF Guacamole', price: 0, description: '' },
        { id: 'e6', name: 'LGCF Oeuf Parfait', price: 0, description: '' },
        { id: 'e7', name: 'LGCF Salade César', price: 0, description: '' },
        { id: 'e8', name: 'LGCF Saumon Gravlax', price: 0, description: '' },
        { id: 'e9', name: 'LGCF Soupe Artichaut Truffe', price: 0, description: '' },
        { id: 'e10', name: 'Oeuf Parfait', price: 0, description: '' },
        { id: 'e11', name: 'Poulpe Carpaccio', price: 0, description: '' },
        { id: 'e12', name: 'Soupe de Saison', price: 0, description: '' },
      ],
    },
    {
      id: 'plats',
      name: 'Plats',
      items: [
        { id: 'p1', name: 'Agneau Méchoui', price: 0, description: '' },
        { id: 'p2', name: 'Belle Pièce de Boeuf', price: 0, description: '' },
        { id: 'p3', name: 'Cocotte de Légumes', price: 0, description: '' },
        { id: 'p4', name: 'LGCF Cassolette Poisson', price: 0, description: '' },
        { id: 'p5', name: 'LGCF Croque Monsieur', price: 0, description: '' },
        { id: 'p6', name: 'LGCF Paleron Boeuf Confit', price: 0, description: '' },
        { id: 'p7', name: 'LGCF Pavé Saumon', price: 0, description: '' },
        { id: 'p8', name: 'LGCF Pièce Boeuf Béarnaise', price: 0, description: '' },
        { id: 'p9', name: 'LGCF Suprême Volaille', price: 0, description: '' },
        { id: 'p10', name: 'Plat du Jour', price: 0, description: '' },
        { id: 'p11', name: 'Poke Bowl Signature', price: 0, description: '' },
        { id: 'p12', name: 'Poulet Fermier Bio', price: 0, description: '' },
        { id: 'p13', name: 'Saumon Mi Cuit', price: 0, description: '' },
        { id: 'p14', name: 'Thon Façon Rossini', price: 0, description: '' },
      ],
    },
    {
      id: 'garnitures',
      name: 'Garnitures',
      items: [
        { id: 'g1', name: 'Frites', price: 0, description: '' },
        { id: 'g2', name: 'Mesclun de Jeunes Pousses', price: 0, description: '' },
        { id: 'g3', name: 'Poêlée Forestière', price: 0, description: '' },
        { id: 'g4', name: 'Purée de Pomme de Terre Beurre Noisette', price: 0, description: '' },
        { id: 'g5', name: 'Riz Chauffé Fines Herbes Atlas', price: 0, description: '' },
      ],
    },
    {
      id: 'desserts',
      name: 'Desserts',
      items: [
        // Placeholder - send screenshot of Desserts tab to fill in
        { id: 'd1', name: '(Send Desserts screenshot)', price: 0, description: 'Tap Edit to add your desserts' },
      ],
    },
    {
      id: 'snacks',
      name: 'Snacks',
      items: [
        // Placeholder - send screenshot of Snacks tab to fill in
        { id: 's1', name: '(Send Snacks screenshot)', price: 0, description: 'Tap Edit to add your snacks' },
      ],
    },
    {
      id: 'boissons',
      name: 'Boissons',
      items: [
        // Placeholder - send screenshot of drinks to fill in
        { id: 'b1', name: 'Café / Espresso', price: 0, description: '' },
        { id: 'b2', name: 'Thé', price: 0, description: '' },
        { id: 'b3', name: 'Eau Minérale', price: 0, description: '' },
      ],
    },
  ],
};
