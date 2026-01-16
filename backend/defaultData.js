require('dotenv').config();
const { connectDB } = require('./database/connection');
const { Product } = require('./models');
const productsData = require('./constant/productsData');

async function seedDatabase() {
  try {
    // Connect to database
    await connectDB();
    
    console.log("Starting database seeding...");
    
    // Clear cart items first (foreign key constraint)
    const { Cart } = require('./models');
    await Cart.destroy({ where: {} });
    console.log("Cleared cart items");
    
    // Disable foreign key checks, truncate, then re-enable
    const { sequelize } = require('./database/connection');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('TRUNCATE TABLE products');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log("Cleared existing products");
    
    // Insert all products from productsData
    await Product.bulkCreate(productsData);
    console.log("Products inserted successfully!");
    
    console.log(`Total products seeded: ${productsData.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();