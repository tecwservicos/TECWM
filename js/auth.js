// Authentication Service (Future Firebase Auth Ready)
import { getCurrentUser as getLocalUser, setCurrentUser, getRegisteredUsers, saveRegisteredUser } from './storage.js';
import { CONFIG } from './config.js';

export const Auth = {
  /**
   * Log in user with email and password
   */
  login(email, password) {
    if (CONFIG.firebaseEnabled) {
      // Future Firebase integration
      // return firebaseLogin(email, password);
    }

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
  },

  /**
   * Simulate or use Google Sign-In
   */
  loginGoogle() {
    if (CONFIG.firebaseEnabled) {
      // Future Google Auth Integration
      // const provider = new GoogleAuthProvider();
      // return signInWithPopup(auth, provider);
    }

    const googleUser = {
      fullName: "Victor Craft (Google Account)",
      email: "victorcraft264@gmail.com",
      isPremium: true,
      stats: { views: 82, downloads: 24, favorites: 6 }
    };
    
    setCurrentUser(googleUser);
    return { success: true, user: googleUser };
  },

  /**
   * Register a new user
   */
  register(fullName, email, password, confirmPassword) {
    if (CONFIG.firebaseEnabled) {
      // Future Firebase Auth Integration
      // return createUserWithEmailAndPassword(auth, email, password);
    }

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
  },

  /**
   * Log out current user
   */
  logout() {
    if (CONFIG.firebaseEnabled) {
      // Real firebase logout
    }
    setCurrentUser(null);
    window.location.href = 'login.html';
  },

  /**
   * Trigger password reset
   */
  resetPassword(email) {
    if (CONFIG.firebaseEnabled) {
      // Future Firebase Auth sendPasswordResetEmail
    }

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
  },

  /**
   * Get currently logged-in user
   */
  getCurrentUser() {
    return getLocalUser();
  },

  /**
   * Redirect if not authenticated
   */
  checkAuthAndRedirect() {
    const currentUser = getLocalUser();
    if (!currentUser) {
      window.location.href = 'login.html';
    }
    return currentUser;
  },

  /**
   * Redirect to home if already logged in
   */
  checkGuestState() {
    const currentUser = getLocalUser();
    if (currentUser) {
      window.location.href = 'home.html';
    }
  }
};

// Also export named functions to preserve compatibility with existing modules
export const login = Auth.login;
export const register = Auth.register;
export const simulateGoogleSignIn = Auth.loginGoogle;
export const logout = Auth.logout;
export const forgotPassword = Auth.resetPassword;
export const checkAuthAndRedirect = Auth.checkAuthAndRedirect;
export const checkGuestState = Auth.checkGuestState;
export const getCurrentUser = Auth.getCurrentUser;
