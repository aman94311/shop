// ============================================================
//  scripts/seedProducts.js — Seed all catalog products to MongoDB
//  Run: node scripts/seedProducts.js
//  Abhi Sanitary and Hardware
// ============================================================

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product = require("../models/Product");

const products = [
  // PAINTS
  { category: "paints", name: "Asian Paints Tractor Emulsion", price: "₹2,850", unit: "20L Bucket", description: "Interior wall finish, washable", tag: "Best Seller" },
  { category: "paints", name: "Asian Paints Tractor Emulsion", price: "₹760", unit: "4L Tin", description: "Interior wall finish, washable", tag: null },
  { category: "paints", name: "Asian Paints Apex Exterior", price: "₹1,950", unit: "10L Bucket", description: "Weatherproof exterior emulsion", tag: "Popular" },
  { category: "paints", name: "Asian Paints Apex Exterior", price: "₹3,750", unit: "20L Bucket", description: "Weatherproof exterior emulsion", tag: null },
  { category: "paints", name: "Asian Paints Royale Luxury Emulsion", price: "₹1,420", unit: "4L Tin", description: "Premium interior sheen finish", tag: "Premium" },
  { category: "paints", name: "Asian Paints Royale Luxury Emulsion", price: "₹5,480", unit: "20L Bucket", description: "Premium interior sheen finish", tag: null },
  { category: "paints", name: "Asian Paints ACE Exterior Emulsion", price: "₹990", unit: "10L", description: "Economy weatherproof exterior", tag: "Economy" },
  { category: "paints", name: "Asian Paints Wall Primer", price: "₹1,850", unit: "20L", description: "Interior alkali-resistant primer", tag: null },
  { category: "paints", name: "Asian Paints Exterior Wall Putty", price: "₹620", unit: "20 Kg Bag", description: "Smooth base coat for exterior", tag: null },
  { category: "paints", name: "Asian Paints Interior Wall Putty", price: "₹580", unit: "20 Kg Bag", description: "Smooth base coat for interior", tag: null },
  { category: "paints", name: "Asian Paints Wood Primer (Oil Based)", price: "₹320", unit: "1L Tin", description: "For wood & metal surfaces", tag: null },
  { category: "paints", name: "Asian Paints Enamel Paint (White)", price: "₹280", unit: "1L Tin", description: "Gloss finish, wood & metal", tag: null },
  { category: "paints", name: "Asian Paints Royale Glitz (Ultra Sheen)", price: "₹1,850", unit: "4L Tin", description: "Ultra-premium luxury interior finish with Teflon protector", tag: "Premium" },
  { category: "paints", name: "Asian Paints Apex Ultima Exterior", price: "₹5,200", unit: "20L Bucket", description: "Advanced dust-proof & anti-algal exterior paint", tag: "Best Seller" },
  { category: "paints", name: "Asian Paints Tractor Emulsion White", price: "₹240", unit: "1L Tin", description: "Interior wall paint, smooth matte finish", tag: null },
  { category: "paints", name: "Asian Paints Metal Primer (Red Oxide)", price: "₹290", unit: "1L Tin", description: "Anti-rust primer for steel and iron surfaces", tag: null },
  { category: "paints", name: "Asian Paints Damp Proof Waterproofing", price: "₹4,250", unit: "20L Bucket", description: "Elastomeric waterproofing coating for roofs & terraces", tag: "Popular" },
  { category: "paints", name: "Asian Paints Wall Primer (Water Based)", price: "₹1,650", unit: "20L Bucket", description: "Decoprime interior wall primer for masonry", tag: null },
  { category: "paints", name: "Asian Paints Apex Exterior White", price: "₹680", unit: "4L Tin", description: "Weatherproof protective exterior paint", tag: null },
  { category: "paints", name: "Asian Paints TruCare Acrylic Wall Putty", price: "₹190", unit: "5 Kg Tub", description: "Ready-to-use white paste putty for interior walls", tag: null },
  // SANITARY
  { category: "sanitary", name: "CPVC Pipe ½\" (Hot & Cold)", price: "₹220", unit: "6 Meter Length", description: "For hot & cold water lines", tag: "Best Seller" },
  { category: "sanitary", name: "CPVC Pipe ¾\" (Hot & Cold)", price: "₹320", unit: "6 Meter Length", description: "For hot & cold water lines", tag: null },
  { category: "sanitary", name: "CPVC Pipe 1\" (Hot & Cold)", price: "₹450", unit: "6 Meter Length", description: "For hot & cold water lines", tag: null },
  { category: "sanitary", name: "CPVC Elbow 90° — ½\"", price: "₹12", unit: "Per Piece", description: "Hot & cold fitting", tag: null },
  { category: "sanitary", name: "CPVC Elbow 90° — ¾\"", price: "₹18", unit: "Per Piece", description: "Hot & cold fitting", tag: null },
  { category: "sanitary", name: "CPVC Tee — ½\"", price: "₹15", unit: "Per Piece", description: "Equal tee connector", tag: null },
  { category: "sanitary", name: "CPVC Tee — ¾\"", price: "₹24", unit: "Per Piece", description: "Equal tee connector", tag: null },
  { category: "sanitary", name: "CPVC Ball Valve — ½\"", price: "₹85", unit: "Per Piece", description: "Full-bore CPVC stop valve", tag: null },
  { category: "sanitary", name: "CPVC Ball Valve — ¾\"", price: "₹130", unit: "Per Piece", description: "Full-bore CPVC stop valve", tag: null },
  { category: "sanitary", name: "PVC SWR Pipe 4\" (110mm)", price: "₹380", unit: "3 Meter Length", description: "Soil & waste drainage", tag: "Popular" },
  { category: "sanitary", name: "PVC SWR Pipe 3\" (75mm)", price: "₹240", unit: "3 Meter Length", description: "Soil & waste drainage", tag: null },
  { category: "sanitary", name: "PVC SWR Bend 4\" — 90°", price: "₹95", unit: "Per Piece", description: "Drainage bend fitting", tag: null },
  { category: "sanitary", name: "PVC SWR Tee Junction 4\"", price: "₹110", unit: "Per Piece", description: "Drainage tee fitting", tag: null },
  { category: "sanitary", name: "CPVC Solvent Cement (Adhesive)", price: "₹120", unit: "100ml Tin", description: "For CPVC pipe joints", tag: null },
  { category: "sanitary", name: "Teflon Thread Seal Tape (PTFE)", price: "₹15", unit: "Per Roll", description: "For threaded pipe joints", tag: null },
  { category: "sanitary", name: "GI Pipe ½\" (Medium Grade)", price: "₹185", unit: "Per Meter", description: "Galvanized iron water pipe", tag: null },
  { category: "sanitary", name: "Flush Tank Complete Set", price: "₹850", unit: "Per Set", description: "Wall-mounted PVC flush tank", tag: null },
  { category: "sanitary", name: "Health Faucet / Bidet Sprayer", price: "₹350", unit: "Per Set", description: "ABS chrome finish", tag: null },
  { category: "sanitary", name: "PVC Connection Pipe 24\" (Braided)", price: "₹85", unit: "Per Piece", description: "Stainless steel braided flexible hose for geysers & basins", tag: null },
  { category: "sanitary", name: "Jaguar Type Brass Bib Cock (Tap)", price: "₹450", unit: "Per Piece", description: "Chrome plated brass tap for bathroom & kitchen", tag: "Premium" },
  // HARDWARE
  { category: "hardware", name: "M-Seal Epoxy Compound", price: "₹65", unit: "50g Pack", description: "Instant pipe leak repair", tag: "Best Seller" },
  { category: "hardware", name: "Fevicol SH Synthetic Resin", price: "₹180", unit: "500g Pack", description: "Carpenter's wood adhesive", tag: null },
  { category: "hardware", name: "PVC Solvent Cement (Pidilite)", price: "₹110", unit: "250ml Tin", description: "Fast-set PVC pipe adhesive", tag: null },
  { category: "hardware", name: "Hacksaw Blade (12\")", price: "₹25", unit: "Per Piece", description: "24 TPI bi-metal blade", tag: null },
  { category: "hardware", name: "GI Wire (16 Gauge)", price: "₹75", unit: "Per Kg", description: "Binding & construction wire", tag: null },
  { category: "hardware", name: "Sand Paper (120 Grit)", price: "₹8", unit: "Per Sheet", description: "Aluminium oxide abrasive", tag: null },
  { category: "hardware", name: "Caulking Compound / Silicone Sealant", price: "₹150", unit: "300ml Cartridge", description: "Waterproof white silicone", tag: "Popular" },
  { category: "hardware", name: "Anchor Fasteners / Wall Plugs", price: "₹5", unit: "Per Piece", description: "Nylon expansion anchor 6mm", tag: null },
  { category: "hardware", name: "MS Nut & Bolt Set (M8 x 50mm)", price: "₹12", unit: "Per Set", description: "With washer & nut", tag: null },
  { category: "hardware", name: "Plumber's Wrench / Pipe Wrench 14\"", price: "₹380", unit: "Per Piece", description: "Heavy duty cast iron", tag: null },
  { category: "hardware", name: "Brush — Paint Brush 2\"", price: "₹45", unit: "Per Piece", description: "Pure bristle paint brush", tag: null },
  { category: "hardware", name: "Paint Roller 9\" Set", price: "₹120", unit: "Per Set", description: "With tray and roller sleeve", tag: null },
  { category: "hardware", name: "Waterproofing Chemical (Dr. Fixit)", price: "₹550", unit: "1L Can", description: "Integral waterproofing compound", tag: "Popular" },
  { category: "hardware", name: "Cement Slurry Waterproof Coating", price: "₹1,200", unit: "4 Kg Kit", description: "Two-component terrace coating", tag: null },
  { category: "hardware", name: "Double Sided Foam Tape (1\" Width)", price: "₹45", unit: "Per Roll", description: "Strong mounting foam tape for mirrors & boards", tag: null },
  { category: "hardware", name: "Steel Wood Screws Set (Box of 100)", price: "₹180", unit: "Per Box", description: "Premium countersunk zinc plated screws 1.5 inch", tag: null },
  { category: "hardware", name: "Fevikwik Instant Adhesive", price: "₹5", unit: "Per Piece", description: "One-drop instant super glue 1g", tag: "Best Seller" },
  { category: "hardware", name: "Self-Drilling Metal Screws (100 Pcs)", price: "₹220", unit: "Per Box", description: "Hex head screws for roofing sheet attachment", tag: null },
  { category: "hardware", name: "WD-40 Multi-Use Rust Spray", price: "₹120", unit: "100ml Can", description: "Lubricates, removes rust, protects metal parts", tag: "Popular" },
  { category: "hardware", name: "Teflon Washer Set (100 Pcs)", price: "₹60", unit: "Per Box", description: "Assorted sizes for preventing pipe fitting leaks", tag: null },
];

const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅  MongoDB connected");

    // ── Seed Admin User ──
    const adminUsername = "aman";
    const rawPassword = "ABHI";
    const existingAdmin = await User.findOne({ username: adminUsername });
    
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(rawPassword, salt);
      await User.create({
        username: adminUsername,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`👤  Seeded default admin user: ${adminUsername.toUpperCase()} / ${rawPassword}`);
    } else {
      console.log(`👤  Admin user "${adminUsername}" already exists.`);
    }

    // ── Seed Products ──
    const existing = await Product.countDocuments();
    if (existing > 0) {
      console.log(`ℹ️   ${existing} products already exist. Skipping product seed.`);
      console.log("    To re-seed products, run: node scripts/seedProducts.js --force");
      if (!process.argv.includes("--force")) {
        process.exit(0);
      }
      await Product.deleteMany({});
      console.log("🗑️   Existing products cleared.");
    }

    const inserted = await Product.insertMany(products);
    console.log(`✅  ${inserted.length} products seeded successfully!`);
    process.exit(0);
  } catch (err) {
    console.error("❌  Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
