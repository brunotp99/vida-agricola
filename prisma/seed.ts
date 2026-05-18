import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  // ── Categories ──────────────────────────────────────────────────────────────
  const categoryData = [
    {
      name: "Animal Feed",
      slug: "animal-feed",
      description: "Premium quality feed for all your livestock",
      imageUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400",
      icon: "Wheat",
      featured: true,
      sortOrder: 1,
      children: [
        { name: "Poultry Feed", slug: "poultry-feed", sortOrder: 1 },
        { name: "Cattle Feed", slug: "cattle-feed", sortOrder: 2 },
        { name: "Pig Feed", slug: "pig-feed", sortOrder: 3 },
        { name: "Horse Feed", slug: "horse-feed", sortOrder: 4 },
        { name: "Fish Feed", slug: "fish-feed", sortOrder: 5 },
        { name: "Organic Feed", slug: "organic-feed", sortOrder: 6 },
      ],
    },
    {
      name: "Farm Equipment",
      slug: "farm-equipment",
      description: "Essential equipment for modern farming",
      imageUrl: "https://images.unsplash.com/photo-1589923188651-268a9765e432?w=400",
      icon: "Tractor",
      featured: true,
      sortOrder: 2,
      children: [
        { name: "Feeders", slug: "feeders", sortOrder: 1 },
        { name: "Drinkers", slug: "drinkers", sortOrder: 2 },
        { name: "Incubators", slug: "incubators", sortOrder: 3 },
        { name: "Generators", slug: "generators", sortOrder: 4 },
        { name: "Water Pumps", slug: "water-pumps", sortOrder: 5 },
        { name: "Sprayers", slug: "sprayers", sortOrder: 6 },
      ],
    },
    {
      name: "Veterinary & Health",
      slug: "veterinary-health",
      description: "Healthcare products for animal wellness",
      imageUrl: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=400",
      icon: "Heart",
      featured: true,
      sortOrder: 3,
      children: [
        { name: "Vaccines", slug: "vaccines", sortOrder: 1 },
        { name: "Vitamins", slug: "vitamins", sortOrder: 2 },
        { name: "Antibiotics", slug: "antibiotics", sortOrder: 3 },
        { name: "Supplements", slug: "supplements", sortOrder: 4 },
        { name: "Hygiene Products", slug: "hygiene", sortOrder: 5 },
      ],
    },
    {
      name: "Clothing & Safety",
      slug: "clothing-safety",
      description: "Protective gear for farm workers",
      imageUrl: "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=400",
      icon: "HardHat",
      featured: false,
      sortOrder: 4,
      children: [
        { name: "Boots", slug: "boots", sortOrder: 1 },
        { name: "Gloves", slug: "gloves", sortOrder: 2 },
        { name: "Jackets", slug: "jackets", sortOrder: 3 },
        { name: "Waterproof Clothing", slug: "waterproof", sortOrder: 4 },
        { name: "Protective Equipment", slug: "protective", sortOrder: 5 },
      ],
    },
    {
      name: "Agriculture",
      slug: "agriculture",
      description: "Seeds, fertilizers, and cultivation supplies",
      imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
      icon: "Leaf",
      featured: true,
      sortOrder: 5,
      children: [
        { name: "Seeds", slug: "seeds", sortOrder: 1 },
        { name: "Fertilizers", slug: "fertilizers", sortOrder: 2 },
        { name: "Irrigation", slug: "irrigation", sortOrder: 3 },
        { name: "Fencing", slug: "fencing", sortOrder: 4 },
        { name: "Hand Tools", slug: "hand-tools", sortOrder: 5 },
      ],
    },
    {
      name: "Poultry Equipment",
      slug: "poultry-equipment",
      description: "Specialized equipment for poultry farming",
      imageUrl: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400",
      icon: "Bird",
      featured: false,
      sortOrder: 6,
      children: [
        { name: "Egg Incubators", slug: "egg-incubators", sortOrder: 1 },
        { name: "Brooders", slug: "brooders", sortOrder: 2 },
        { name: "Poultry Cages", slug: "poultry-cages", sortOrder: 3 },
        { name: "Egg Trays", slug: "egg-trays", sortOrder: 4 },
        { name: "Lighting Systems", slug: "lighting", sortOrder: 5 },
      ],
    },
  ]

  for (const cat of categoryData) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        icon: cat.icon,
        featured: cat.featured,
        sortOrder: cat.sortOrder,
      },
    })
    for (const child of cat.children) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: {},
        create: {
          name: child.name,
          slug: child.slug,
          sortOrder: child.sortOrder,
          parentId: parent.id,
        },
      })
    }
  }
  console.log("✅ Categories seeded")

  // ── Brands ──────────────────────────────────────────────────────────────────
  const brandsData = [
    {
      name: "Purina",
      slug: "purina",
      logoUrl: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100",
      featured: true,
    },
    {
      name: "Cargill",
      slug: "cargill",
      logoUrl: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100",
      featured: true,
    },
    {
      name: "Nutrena",
      slug: "nutrena",
      logoUrl: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100",
    },
    {
      name: "Land O'Lakes",
      slug: "land-o-lakes",
      logoUrl: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100",
    },
    {
      name: "John Deere",
      slug: "john-deere",
      logoUrl: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100",
      featured: true,
    },
    {
      name: "Stihl",
      slug: "stihl",
      logoUrl: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100",
    },
    {
      name: "Agri-Fab",
      slug: "agri-fab",
      logoUrl: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100",
    },
    {
      name: "Farm Innovators",
      slug: "farm-innovators",
      logoUrl: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100",
    },
  ]

  for (const brand of brandsData) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    })
  }
  console.log("✅ Brands seeded")

  // ── Helper: look up category/brand by slug ──────────────────────────────────
  const catMap = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.slug, c.id]))
  const brandMap = Object.fromEntries((await prisma.brand.findMany()).map((b) => [b.name, b.id]))

  // ── Products ─────────────────────────────────────────────────────────────────
  const productsData = [
    {
      slug: "premium-layer-chicken-feed-25kg",
      name: "Premium Layer Chicken Feed 25kg",
      description:
        "High-quality layer feed formulated for optimal egg production. Contains essential vitamins, minerals, and proteins for healthy laying hens. Promotes strong eggshells and consistent laying patterns.",
      sku: "PLF-25KG-001",
      price: 32.99,
      compareAtPrice: 38.99,
      categorySlug: "animal-feed",
      brandName: "Purina",
      featured: true,
      bestSeller: true,
      status: "active" as const,
      images: [
        "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600",
        "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600",
      ],
      tags: ["poultry", "layer feed", "chicken", "organic"],
      specs: {
        "Protein Content": "16%",
        "Fat Content": "3.5%",
        "Fiber Content": "5%",
        Calcium: "3.8%",
      },
    },
    {
      slug: "organic-cattle-feed-mix-50kg",
      name: "Organic Cattle Feed Mix 50kg",
      description:
        "Premium organic cattle feed blend with natural grains and supplements. Promotes healthy weight gain and milk production. Free from artificial additives and growth hormones.",
      sku: "OCF-50KG-002",
      price: 54.99,
      categorySlug: "animal-feed",
      brandName: "Cargill",
      featured: true,
      status: "active" as const,
      images: ["https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600"],
      tags: ["cattle", "organic", "dairy", "beef"],
      specs: {
        "Protein Content": "14%",
        "Fat Content": "4%",
        "Fiber Content": "12%",
        Energy: "2.8 MCal/kg",
      },
    },
    {
      slug: "starter-chick-feed-10kg",
      name: "Starter Chick Feed 10kg",
      description:
        "Specially formulated starter feed for chicks up to 6 weeks old. High protein content for rapid growth and strong development. Contains essential amino acids and vitamins.",
      sku: "SCF-10KG-003",
      price: 18.99,
      compareAtPrice: 22.99,
      categorySlug: "animal-feed",
      brandName: "Nutrena",
      newArrival: true,
      bestSeller: true,
      status: "active" as const,
      images: ["https://images.unsplash.com/photo-1569428034239-f9565e32e224?w=600"],
      tags: ["chicks", "starter", "poultry", "growth"],
      specs: {
        "Protein Content": "20%",
        "Fat Content": "3%",
        "Fiber Content": "4%",
        Medication: "Coccidiostat included",
      },
    },
    {
      slug: "automatic-egg-incubator-120-eggs",
      name: "Automatic Egg Incubator 120 Eggs",
      description:
        "Professional-grade automatic egg incubator with digital temperature and humidity control. Features automatic egg turning, LED display, and alarm system. Perfect for small to medium poultry farms.",
      sku: "AEI-120-004",
      price: 189.99,
      compareAtPrice: 229.99,
      categorySlug: "farm-equipment",
      brandName: "Farm Innovators",
      featured: true,
      flashDeal: true,
      status: "active" as const,
      images: ["https://images.unsplash.com/photo-1569428034239-f9565e32e224?w=600"],
      tags: ["incubator", "eggs", "automatic", "poultry"],
      specs: {
        Capacity: "120 eggs",
        "Temperature Range": "30-40°C",
        "Humidity Range": "40-75%",
        Power: "80W",
        Voltage: "220V",
      },
    },
    {
      slug: "heavy-duty-water-pump-1-5hp",
      name: "Heavy Duty Water Pump 1.5HP",
      description:
        "Industrial-grade water pump for farm irrigation and water supply systems. High flow rate with durable construction. Suitable for deep wells and long-distance water transfer.",
      sku: "WP-15HP-005",
      price: 249.99,
      categorySlug: "farm-equipment",
      brandName: "John Deere",
      status: "active" as const,
      images: ["https://images.unsplash.com/photo-1589923188651-268a9765e432?w=600"],
      tags: ["pump", "water", "irrigation", "heavy-duty"],
      specs: {
        Power: "1.5 HP",
        "Flow Rate": "200 L/min",
        "Max Head": "45m",
        "Inlet/Outlet": "2 inch",
      },
    },
    {
      slug: "automatic-chicken-feeder-20kg",
      name: "Automatic Chicken Feeder 20kg Capacity",
      description:
        "Large capacity automatic chicken feeder with rain cover and anti-waste design. Gravity-fed system ensures constant feed availability. Durable galvanized steel construction.",
      sku: "ACF-20KG-006",
      price: 45.99,
      categorySlug: "farm-equipment",
      brandName: "Agri-Fab",
      bestSeller: true,
      status: "active" as const,
      images: ["https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600"],
      tags: ["feeder", "chicken", "automatic", "galvanized"],
      specs: {
        Capacity: "20kg",
        Material: "Galvanized Steel",
        Dimensions: "45 x 35 x 60 cm",
        "Suitable For": "Up to 30 chickens",
      },
    },
    {
      slug: "poultry-vitamin-complex-500ml",
      name: "Poultry Vitamin Complex 500ml",
      description:
        "Comprehensive vitamin supplement for poultry. Contains vitamins A, D3, E, K3, and B-complex. Improves immunity, growth rate, and egg production. Easy water-soluble formula.",
      sku: "PVC-500ML-007",
      price: 24.99,
      compareAtPrice: 29.99,
      categorySlug: "veterinary-health",
      brandName: "Land O'Lakes",
      featured: true,
      newArrival: true,
      status: "active" as const,
      images: ["https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=600"],
      tags: ["vitamins", "poultry", "supplements", "immunity"],
      specs: {
        Volume: "500ml",
        Dosage: "1ml per liter of water",
        "Shelf Life": "24 months",
        Storage: "Cool, dry place",
      },
    },
    {
      slug: "livestock-calcium-supplement-5kg",
      name: "Livestock Calcium Supplement 5kg",
      description:
        "Premium calcium supplement for dairy cattle and laying hens. Prevents calcium deficiency, improves milk production and eggshell quality. Easy to mix with regular feed.",
      sku: "LCS-5KG-008",
      price: 19.99,
      categorySlug: "veterinary-health",
      brandName: "Cargill",
      status: "active" as const,
      images: ["https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=600"],
      tags: ["calcium", "supplements", "dairy", "poultry"],
      specs: {
        "Calcium Content": "38%",
        Phosphorus: "0.02%",
        Dosage: "20-30g per animal/day",
        Form: "Fine powder",
      },
    },
    {
      slug: "professional-rubber-farm-boots",
      name: "Professional Rubber Farm Boots",
      description:
        "Durable rubber farm boots with steel toe protection. Waterproof, chemical-resistant, and easy to clean. Comfortable cushioned insole for all-day wear. Available in various sizes.",
      sku: "RFB-PRO-009",
      price: 59.99,
      compareAtPrice: 74.99,
      categorySlug: "clothing-safety",
      brandName: "Stihl",
      featured: true,
      bestSeller: true,
      status: "active" as const,
      images: ["https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=600"],
      tags: ["boots", "safety", "waterproof", "steel-toe"],
      specs: {
        Material: "Natural Rubber",
        "Toe Protection": "Steel Toe",
        Height: "38cm",
        Sole: "Slip-resistant",
      },
    },
    {
      slug: "heavy-duty-leather-work-gloves",
      name: "Heavy Duty Leather Work Gloves",
      description:
        "Premium cowhide leather work gloves for farm and construction work. Reinforced palm and fingertips for extended durability. Breathable design with adjustable wrist strap.",
      sku: "LWG-HD-010",
      price: 18.99,
      categorySlug: "clothing-safety",
      brandName: "Stihl",
      newArrival: true,
      status: "active" as const,
      images: ["https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=600"],
      tags: ["gloves", "leather", "work", "protective"],
      specs: {
        Material: "Cowhide Leather",
        Lining: "Cotton",
        Cuff: "Adjustable strap",
        "Size Range": "M, L, XL",
      },
    },
    {
      slug: "hybrid-tomato-seeds-pack",
      name: "Hybrid Tomato Seeds Pack",
      description:
        "High-yield hybrid tomato seeds with disease resistance. Produces large, flavorful tomatoes in 70-80 days. Suitable for both open field and greenhouse cultivation.",
      sku: "HTS-50G-011",
      price: 8.99,
      categorySlug: "agriculture",
      brandName: "Agri-Fab",
      status: "active" as const,
      images: ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600"],
      tags: ["seeds", "tomato", "hybrid", "vegetable"],
      specs: {
        "Seed Count": "Approx. 500 seeds",
        "Germination Rate": "95%+",
        "Days to Maturity": "70-80 days",
        "Fruit Size": "150-200g",
      },
    },
    {
      slug: "organic-npk-fertilizer-25kg",
      name: "Organic NPK Fertilizer 25kg",
      description:
        "Balanced organic NPK fertilizer for all crops. Slow-release formula provides sustained nutrition throughout the growing season. Improves soil structure and promotes healthy root development.",
      sku: "ONF-25KG-012",
      price: 34.99,
      compareAtPrice: 42.99,
      categorySlug: "agriculture",
      brandName: "Cargill",
      flashDeal: true,
      status: "active" as const,
      images: ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600"],
      tags: ["fertilizer", "organic", "NPK", "soil"],
      specs: {
        "N-P-K Ratio": "10-10-10",
        "Organic Matter": "40%",
        "Application Rate": "200-300g per m²",
        "Suitable For": "All crops",
      },
    },
  ]

  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        sku: p.sku,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        categoryId: catMap[p.categorySlug] ?? null,
        brandId: brandMap[p.brandName] ?? null,
        featured: p.featured ?? false,
        newArrival: p.newArrival ?? false,
        bestSeller: p.bestSeller ?? false,
        flashDeal: p.flashDeal ?? false,
        status: p.status,
      },
    })

    // images
    const existingImages = await prisma.productImage.count({ where: { productId: product.id } })
    if (existingImages === 0) {
      await prisma.productImage.createMany({
        data: p.images.map((url, i) => ({ productId: product.id, url, sortOrder: i })),
      })
    }

    // tags
    for (const tag of p.tags) {
      await prisma.productTag.upsert({
        where: { productId_tag: { productId: product.id, tag } },
        update: {},
        create: { productId: product.id, tag },
      })
    }

    // specifications
    for (const [key, value] of Object.entries(p.specs)) {
      const existing = await prisma.specification.findFirst({
        where: { productId: product.id, key },
      })
      if (!existing) {
        await prisma.specification.create({ data: { productId: product.id, key, value } })
      }
    }
  }
  console.log("✅ Products seeded")

  // ── Coupons ──────────────────────────────────────────────────────────────────
  const coupons = [
    { code: "WELCOME15", type: "percentage" as const, value: 15, maxUses: null },
    { code: "FARM10", type: "percentage" as const, value: 10, minOrderAmount: 50, maxUses: 100 },
    { code: "SUMMER25", type: "fixed" as const, value: 25, minOrderAmount: 100, maxUses: 50 },
    { code: "POULTRY5", type: "fixed" as const, value: 5, minOrderAmount: 30, maxUses: null },
    { code: "NEWUSER20", type: "percentage" as const, value: 20, maxUses: 1 },
  ]

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrderAmount: coupon.minOrderAmount ?? null,
        maxUses: coupon.maxUses ?? null,
        active: true,
      },
    })
  }
  console.log("✅ Coupons seeded")

  // ── Admin User ───────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (adminEmail && adminPassword) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: "Admin",
        role: "admin",
        emailVerified: true,
      },
    })
    console.log("✅ Admin user seeded:", adminEmail)
  } else {
    console.log("⚠️  ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user")
  }

  // ── Test Customer ────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "customer@test.com" },
    update: {},
    create: {
      email: "customer@test.com",
      name: "Test Customer",
      role: "customer",
      emailVerified: true,
    },
  })
  console.log("✅ Test customer seeded")

  const productCount = await prisma.product.count()
  console.log(`\n🎉 Seed complete. Products in DB: ${productCount}`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
