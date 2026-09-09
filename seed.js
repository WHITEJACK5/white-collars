require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('./models/job');
const Company = require('./models/company');
const User = require('./models/User');

const required = ['MONGODB_URI'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing env: ${missing.join(', ')} — see .env.example`);
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');

    console.log('🌱 Starting database seeding...');

    await Job.deleteMany({});
    await Company.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Cleared existing data');

    try {
      await Company.collection.dropIndexes();
      await User.collection.dropIndexes();
      await Job.collection.dropIndexes();
      console.log('✅ Dropped old indexes');
    } catch {
      console.log('⚠️  No indexes to drop');
    }

    const companies = await Company.insertMany([
      {
        name: 'Google',
        slug: 'google',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
        industry: 'Technology',
        employees: '10,000+',
        description: 'Global technology leader in search, advertising, and cloud services',
        website: 'https://www.google.com',
        featured: true,
        isActive: true
      },
      {
        name: 'Microsoft',
        slug: 'microsoft',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
        industry: 'Technology',
        employees: '10,000+',
        description: 'Leading technology company providing software and services',
        website: 'https://www.microsoft.com',
        featured: true,
        isActive: true
      },
      {
        name: 'Apple',
        slug: 'apple',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
        industry: 'Technology',
        employees: '10,000+',
        description: 'Innovative technology company creating consumer electronics',
        website: 'https://www.apple.com',
        featured: true,
        isActive: true
      },
      {
        name: 'Amazon',
        slug: 'amazon',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        industry: 'E-commerce & Cloud',
        employees: '10,000+',
        description: 'E-commerce and cloud computing giant',
        website: 'https://www.amazon.com',
        featured: true,
        isActive: true
      },
      {
        name: 'Tesla',
        slug: 'tesla',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Tesla_T_symbol.svg',
        industry: 'Automotive',
        employees: '5000-10000',
        description: 'Electric vehicle and clean energy company',
        website: 'https://www.tesla.com',
        featured: true,
        isActive: true
      }
    ]);
    console.log('✅ Created 5 companies');

    // Admin from env — do NOT hardcode credentials
    const adminEmail = process.env.SEED_ADMIN_EMAIL;
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      console.warn('⚠️  SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin creation');
      console.warn('   Set them in .env to create an initial admin user');
    } else {
      if (adminPassword.length < 10) {
        console.warn('⚠️  SEED_ADMIN_PASSWORD is shorter than 10 chars — use a stronger password');
      }
      const adminUser = await User.create({
        name: 'System Admin',
        email: adminEmail.toLowerCase().trim(),
        password: adminPassword, // hashed via User pre-save hook
        userType: 'employer',
        isActive: true,
      });
      console.log(`✅ Created admin user: ${adminUser.email}`);

      const jobs = await Job.insertMany([
        {
          title: 'Senior Software Engineer',
          company: 'Google',
          companyRef: companies[0]._id,
          department: 'Engineering',
          location: 'Bengaluru, India',
          locationType: 'Hybrid',
          description: 'Join Google as a Senior Software Engineer to build innovative products used by billions worldwide.',
          requirements: [
            '5+ years of software development experience',
            'Strong proficiency in Java, Python, or C++',
            'Experience with distributed systems',
            'Bachelor\'s degree in Computer Science or related field'
          ],
          responsibilities: [
            'Design and develop scalable software solutions',
            'Collaborate with cross-functional teams',
            'Mentor junior engineers',
            'Participate in code reviews'
          ],
          category: 'Software Development',
          employmentType: 'Full-time',
          experienceLevel: 'Senior Level',
          salary: { min: 2000000, max: 3500000, currency: 'INR', period: 'Yearly' },
          skills: ['Java', 'Python', 'System Design', 'Cloud Computing'],
          educationRequired: 'Bachelor\'s in Computer Science',
          postedBy: adminUser._id,
          active: true,
          featured: true,
          tags: ['engineering', 'backend', 'cloud']
        },
        {
          title: 'Product Manager',
          company: 'Microsoft',
          companyRef: companies[1]._id,
          department: 'Product',
          location: 'Hyderabad, India',
          locationType: 'Hybrid',
          description: 'Lead product strategy for Microsoft enterprise solutions.',
          requirements: ['3+ years of product management experience', 'Strong analytical skills', 'Enterprise software experience', 'MBA preferred'],
          responsibilities: ['Define product roadmap', 'Collaborate with stakeholders', 'Analyze market trends', 'Drive launches'],
          category: 'Product Management',
          employmentType: 'Full-time',
          experienceLevel: 'Mid Level',
          salary: { min: 1800000, max: 3000000, currency: 'INR', period: 'Yearly' },
          skills: ['Product Strategy', 'Agile', 'Data Analysis'],
          educationRequired: 'MBA or Bachelor\'s',
          postedBy: adminUser._id,
          active: true,
          featured: true,
          tags: ['product', 'strategy']
        },
        {
          title: 'UI/UX Designer',
          company: 'Apple',
          companyRef: companies[2]._id,
          department: 'Design',
          location: 'Remote',
          locationType: 'Remote',
          description: 'Create beautiful user experiences for Apple products.',
          requirements: ['4+ years of UI/UX experience', 'Strong portfolio', 'Figma proficiency', 'iOS guidelines knowledge'],
          responsibilities: ['Design iOS interfaces', 'Create wireframes', 'Conduct research', 'Collaborate with engineering'],
          category: 'Design & UI/UX',
          employmentType: 'Full-time',
          experienceLevel: 'Senior Level',
          salary: { min: 1500000, max: 2500000, currency: 'INR', period: 'Yearly' },
          skills: ['Figma', 'Sketch', 'Prototyping', 'User Research'],
          educationRequired: 'Bachelor\'s in Design',
          postedBy: adminUser._id,
          active: true,
          featured: true,
          tags: ['design', 'ui', 'ux']
        },
        {
          title: 'Data Scientist',
          company: 'Amazon',
          companyRef: companies[3]._id,
          department: 'Data Science',
          location: 'Mumbai, India',
          locationType: 'On-site',
          description: 'Apply ML to solve business problems at Amazon.',
          requirements: ['MS/PhD in CS/Stats', '3+ years data science', 'Python/SQL', 'ML frameworks'],
          responsibilities: ['Build ML models', 'Analyze datasets', 'Present insights', 'Optimize recommendations'],
          category: 'Data & Analytics',
          employmentType: 'Full-time',
          experienceLevel: 'Mid Level',
          salary: { min: 2000000, max: 3200000, currency: 'INR', period: 'Yearly' },
          skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
          educationRequired: 'MS/PhD in quantitative field',
          postedBy: adminUser._id,
          active: true,
          featured: true,
          tags: ['data', 'ml', 'python']
        },
        {
          title: 'Mechanical Engineer',
          company: 'Tesla',
          companyRef: companies[4]._id,
          department: 'Engineering',
          location: 'Pune, India',
          locationType: 'On-site',
          description: 'Design mechanical systems for Tesla vehicles.',
          requirements: ['B.Tech Mechanical', '2+ years automotive', 'CAD proficiency', 'Manufacturing knowledge'],
          responsibilities: ['Design components', 'Stress analysis', 'Manufacturing collab', 'Testing'],
          category: 'Engineering (Core)',
          employmentType: 'Full-time',
          experienceLevel: 'Entry Level',
          salary: { min: 800000, max: 1500000, currency: 'INR', period: 'Yearly' },
          skills: ['CAD', 'Mechanical Design', 'Manufacturing'],
          educationRequired: 'B.Tech Mechanical',
          postedBy: adminUser._id,
          active: true,
          featured: false,
          tags: ['mechanical', 'automotive']
        },
        {
          title: 'Marketing Manager',
          company: 'Google',
          companyRef: companies[0]._id,
          department: 'Marketing',
          location: 'Gurgaon, India',
          locationType: 'Hybrid',
          description: 'Lead marketing for Google enterprise products.',
          requirements: ['5+ years B2B marketing', 'Digital marketing', 'Enterprise software', 'Communication skills'],
          responsibilities: ['Develop strategies', 'Manage campaigns', 'Analyze trends', 'Work with sales'],
          category: 'Marketing & Sales',
          employmentType: 'Full-time',
          experienceLevel: 'Senior Level',
          salary: { min: 1500000, max: 2500000, currency: 'INR', period: 'Yearly' },
          skills: ['Digital Marketing', 'SEO', 'Content Strategy'],
          educationRequired: 'MBA Marketing',
          postedBy: adminUser._id,
          active: true,
          featured: false,
          tags: ['marketing', 'b2b']
        }
      ]);
      console.log(`✅ Created ${jobs.length} jobs`);
    }

    const finalCompanyCount = await Company.countDocuments();
    const finalJobCount = await Job.countDocuments();
    const finalUserCount = await User.countDocuments();
    console.log('\n🎉 Database seeded successfully!');
    console.log(`📊 Companies: ${finalCompanyCount}`);
    console.log(`💼 Jobs: ${finalJobCount}`);
    console.log(`👤 Users: ${finalUserCount}`);
    if (process.env.SEED_ADMIN_EMAIL) {
      console.log(`\n🔐 Admin login: ${process.env.SEED_ADMIN_EMAIL}`);
      console.log('   Password: (from SEED_ADMIN_PASSWORD env var)\n');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
};

seedDatabase();
