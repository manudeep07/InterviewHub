import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  // 1. Clear existing data
  await prisma.comment.deleteMany({});
  await prisma.upvote.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.round.deleteMany({});
  await prisma.experience.deleteMany({});
  await prisma.jobRole.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Existing data cleared.');

  // 2. Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@interviewhub.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const users = await Promise.all([
    prisma.user.create({ data: { name: 'John Doe', email: 'john@example.com', password: hashedPassword } }),
    prisma.user.create({ data: { name: 'Jane Smith', email: 'jane@example.com', password: hashedPassword } }),
    prisma.user.create({ data: { name: 'Alice Johnson', email: 'alice@example.com', password: hashedPassword } }),
    prisma.user.create({ data: { name: 'Bob Wilson', email: 'bob@example.com', password: hashedPassword } }),
  ]);

  console.log('Users created.');

  // 3. Create Companies
  const companiesData = [
    { name: 'Google', website: 'https://google.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', description: 'Search engine and advertising company.' },
    { name: 'Amazon', website: 'https://amazon.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', description: 'E-commerce and cloud computing giant.' },
    { name: 'Microsoft', website: 'https://microsoft.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', description: 'Global technology corporation.' },
    { name: 'Morgan Stanley', website: 'https://morganstanley.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Morgan_Stanley_Logo.svg', description: 'Global investment bank.' },
    { name: 'Atlassian', website: 'https://atlassian.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Atlassian_logo.svg', description: 'Software company that builds tools like Jira and Confluence.' },
    { name: 'Adobe', website: 'https://adobe.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo_and_wordmark.svg', description: 'Creative software products leader.' },
    { name: 'Uber', website: 'https://uber.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg', description: 'Global mobility service provider.' },
    { name: 'Flipkart', website: 'https://flipkart.com', logo: 'https://upload.wikimedia.org/wikipedia/en/2/28/Flipkart_logo.png', description: 'Indian e-commerce company.' },
  ];

  const companies = await Promise.all(
    companiesData.map(data => prisma.company.create({ data }))
  );

  console.log('Companies created.');

  // 4. Create Job Roles
  const roles = ['SDE Intern', 'SWE', 'Frontend Engineer', 'Backend Engineer', 'Analyst'];
  
  const createdRoles = [];
  for (const company of companies) {
    for (const roleName of roles) {
      const role = await prisma.jobRole.create({
        data: {
          roleName,
          companyId: company.id,
        },
      });
      createdRoles.push(role);
    }
  }

  console.log('Job roles created.');

  // 5. Create Interview Experiences
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const results = ['Selected', 'Rejected', 'Waitlisted'];

  const sampleExperiences = [
    {
      overallDifficulty: 'Hard',
      result: 'Selected',
      userIndex: 0,
      roleName: 'SWE',
      companyName: 'Google',
      rounds: [
        {
          roundType: 'Online Assessment',
          title: 'OA - Coding Challenge',
          questions: ['Minimum spanning tree application', 'Dynamic programming on trees'],
          topics: ['Graphs', 'DP'],
          difficulty: 'Hard',
        },
        {
          roundType: 'Technical',
          title: 'Technical Round 1 - DSA',
          questions: ['Implement a Least Recently Used (LRU) Cache', 'Find median of two sorted arrays'],
          topics: ['Linked List', 'Binary Search'],
          difficulty: 'Hard',
        },
        {
          roundType: 'HR',
          title: 'HR Round',
          questions: ['Why Google?', 'Tell me about a time you had a conflict with a teammate.'],
          topics: ['Behavioral'],
          difficulty: 'Easy',
        }
      ]
    },
    {
      overallDifficulty: 'Medium',
      result: 'Selected',
      userIndex: 1,
      roleName: 'SDE Intern',
      companyName: 'Amazon',
      rounds: [
        {
          roundType: 'Online Assessment',
          title: 'Amazon OA',
          questions: ['Two Sum Variation', 'Robot Bounded in Circle'],
          topics: ['Arrays', 'Logic'],
          difficulty: 'Medium',
        },
        {
          roundType: 'Technical',
          title: 'Final Interview',
          questions: ['System Design of a URL shortener', 'Explain Amazon Leadership Principles'],
          topics: ['System Design', 'Behavioral'],
          difficulty: 'Medium',
        }
      ]
    },
    {
      overallDifficulty: 'Medium',
      result: 'Rejected',
      userIndex: 2,
      roleName: 'Backend Engineer',
      companyName: 'Uber',
      rounds: [
        {
          roundType: 'Technical',
          title: 'Machine Coding',
          questions: ['Design a Rate Limiter', 'Multi-threading in Java'],
          topics: ['Design Patterns', 'Concurrency'],
          difficulty: 'Hard',
        }
      ]
    },
    {
      overallDifficulty: 'Easy',
      result: 'Selected',
      userIndex: 3,
      roleName: 'Analyst',
      companyName: 'Morgan Stanley',
      rounds: [
        {
          roundType: 'Technical',
          title: 'SQL & Quant',
          questions: ['Calculate moving average in SQL', 'Probability of getting 3 heads in 5 tosses'],
          topics: ['SQL', 'Probability'],
          difficulty: 'Easy',
        },
        {
          roundType: 'HR',
          title: 'Managerial Round',
          questions: ['What do you know about Morgan Stanley?', 'Walk me through your resume.'],
          topics: ['Resume', 'Behavioral'],
          difficulty: 'Easy',
        }
      ]
    }
  ];

  for (const exp of sampleExperiences) {
    const user = users[exp.userIndex];
    const company = companies.find(c => c.name === exp.companyName);
    const role = createdRoles.find(r => r.roleName === exp.roleName && r.companyId === company.id);

    await prisma.experience.create({
      data: {
        overallDifficulty: exp.overallDifficulty,
        result: exp.result,
        userId: user.id,
        jobRoleId: role.id,
        rounds: {
          create: exp.rounds
        },
        comments: {
          create: [
            { content: 'Great experience! Thanks for sharing.', userId: users[(exp.userIndex + 1) % users.length].id },
            { content: 'Can you provide more details about the second technical round?', userId: users[(exp.userIndex + 2) % users.length].id }
          ]
        },
        upvotes: {
          create: [
            { userId: users[(exp.userIndex + 1) % users.length].id },
            { userId: users[(exp.userIndex + 3) % users.length].id }
          ]
        }
      }
    });
  }

  console.log('Interview experiences created.');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
