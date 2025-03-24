import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const books = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    price: 9.99,
    description: 'A story of decadence and excess.',
    coverImage: 'https://picsum.photos/200/300',
  },
  {
    title: '1984',
    author: 'George Orwell',
    price: 12.99,
    description: 'A dystopian social science fiction novel.',
    coverImage: 'https://picsum.photos/200/300',
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    price: 14.99,
    description: 'A story of racial injustice and loss of innocence.',
    coverImage: 'https://picsum.photos/200/300',
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    price: 11.99,
    description: 'A classic tale of love and social class.',
    coverImage: 'https://picsum.photos/200/300',
  },
  {
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    price: 13.99,
    description: 'A story of teenage alienation and identity.',
    coverImage: 'https://picsum.photos/200/300',
  },
  {
    title: 'Lord of the Flies',
    author: 'William Golding',
    price: 10.99,
    description: 'A dark tale of human nature and civilization.',
    coverImage: 'https://picsum.photos/200/300',
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    price: 15.99,
    description: 'An epic fantasy adventure.',
    coverImage: 'https://picsum.photos/200/300',
  },
  {
    title: 'Brave New World',
    author: 'Aldous Huxley',
    price: 12.99,
    description: 'A dystopian vision of a controlled society.',
    coverImage: 'https://picsum.photos/200/300',
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    price: 11.99,
    description: 'A philosophical journey of self-discovery.',
    coverImage: 'https://picsum.photos/200/300',
  },
  {
    title: 'One Hundred Years of Solitude',
    author: 'Gabriel García Márquez',
    price: 16.99,
    description: 'A masterpiece of magical realism.',
    coverImage: 'https://picsum.photos/200/300',
  },
  {
    title: 'The Road',
    author: 'Cormac McCarthy',
    price: 13.99,
    description: 'A post-apocalyptic tale of survival.',
    coverImage: 'https://picsum.photos/200/300',
  },
  {
    title: 'Slaughterhouse-Five',
    author: 'Kurt Vonnegut',
    price: 12.99,
    description: 'A satirical novel about war and time travel.',
    coverImage: 'https://picsum.photos/200/300',
  },
];

async function main() {
  // Clear existing books
  await prisma.book.deleteMany();

  // Create new books
  for (const book of books) {
    await prisma.book.create({
      data: book,
    });
  }

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: '$2a$10$K6O.11L0XGQxVHMhwq9kGOGz1kG1H5NI5AUQyAg.GWUhA/VUreNxO' // hashed version of 'password123'
    },
  });

  console.log('Database has been seeded with books');
  console.log('Created test user:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 