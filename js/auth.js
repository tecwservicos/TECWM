import { getCurrentUser, setCurrentUser, getRegisteredUsers, saveRegisteredUser } from './storage.js';

// Login User
export function login(email, password) {
  if (!email || !password) {
    return { success: false, message: "Por favor, preencha todos os campos." };
  }
  
  // Seed admin/demo user if list is empty
  const users = getRegisteredUsers();
  if (users.length === 0) {
    const demoUser = {
      fullName: "Técnico Master",
      email: "demo@tecw.com.br",
      password: "password123",
      isPremium: true,
      stats: { views: 124, downloads: 48, favorites: 12 }
    };
    saveRegisteredUser(demoUser);
    users.push(demoUser);
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  
  if (user) {
    setCurrentUser(user);
    return { success: true, user };
  } else {
    return { success: false, message: "E-mail ou senha incorretos." };
  }
}

// Register User
export function register(fullName, email, password, confirmPassword) {
  if (!fullName || !email || !password || !confirmPassword) {
    return { success: false, message: "Todos os campos são obrigatórios." };
  }
  
  if (password !== confirmPassword) {
    return { success: false, message: "As senhas não coincidem." };
  }
  
  if (password.length < 6) {
    return { success: false, message: "A senha deve ter no mínimo 6 caracteres." };
  }

  const users = getRegisteredUsers();
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (exists) {
    return { success: false, message: "Este e-mail já está cadastrado no sistema." };
  }

  const newUser = {
    fullName,
    email,
    password,
    isPremium: false,
    stats: { views: 0, downloads: 0, favorites: 0 }
  };

  saveRegisteredUser(newUser);
  setCurrentUser(newUser);
  
  return { success: true, user: newUser };
}

// Reset password request
export function forgotPassword(email) {
  if (!email) {
    return { success: false, message: "Informe seu e-mail cadastrado." };
  }
  
  const users = getRegisteredUsers();
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (exists) {
    return { success: true, message: "Link de redefinição enviado com sucesso para o e-mail informado!" };
  } else {
    return { success: false, message: "E-mail não encontrado na base de dados." };
  }
}

// Google Sign In Simulation
export function simulateGoogleSignIn() {
  const googleUser = {
    fullName: "Victor Craft (Google Account)",
    email: "victorcraft264@gmail.com",
    isPremium: true,
    stats: { views: 82, downloads: 24, favorites: 6 }
  };
  
  setCurrentUser(googleUser);
  return { success: true, user: googleUser };
}

// Check logged status and redirect if needed
export function checkAuthAndRedirect() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
  }
  return currentUser;
}

export function checkGuestState() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    window.location.href = 'home.html';
  }
}

// Logout
export function logout() {
  setCurrentUser(null);
  window.location.href = 'login.html';
}
