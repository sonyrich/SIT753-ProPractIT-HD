const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

let users = [];

const UserModel = {
  findByEmail: (email) => users.find(u => u.email === email) || null,
  findById: (id) => users.find(u => u.id === id) || null,

  create: async (data) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = {
      id: uuidv4(),
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role || 'user',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    const { password, ...safeUser } = user;
    return safeUser;
  },

  validatePassword: async (plainText, hashed) => bcrypt.compare(plainText, hashed),

  _reset: () => { users = []; },
  _count: () => users.length
};

module.exports = UserModel;