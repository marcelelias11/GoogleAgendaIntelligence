import { OAuth2Client } from 'google-auth-library';
import { type InsertUser, type User } from '@shared/schema';
import { storage } from '../storage';

// Configuração do cliente OAuth2
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || 'your-client-id',
  process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'
);

// Escopos de acesso necessários
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar'
];

/**
 * Gera a URL de autenticação para o Google
 */
export function getAuthUrl(): string {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'offline' para receber refresh_token
    scope: SCOPES,
    prompt: 'consent', // Forçar o prompt para poder receber um refresh token
  });

  return authUrl;
}

/**
 * Processa o código de autorização do OAuth
 * Obtém tokens de acesso e refresh, e dados do usuário
 */
export async function processAuthCode(code: string): Promise<User | null> {
  try {
    // Trocar o código por tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      console.error('Tokens inválidos retornados pelo Google');
      return null;
    }

    // Configurar as credenciais no cliente
    oauth2Client.setCredentials(tokens);

    // Obter informações do usuário
    const userInfo = await getUserInfo(tokens.access_token);

    if (!userInfo || !userInfo.email) {
      console.error('Não foi possível obter as informações do usuário');
      return null;
    }

    // Verificar se o usuário já existe
    let user = await storage.getUserByEmail(userInfo.email);

    if (!user) {
      // Criar novo usuário
      const newUser: InsertUser = {
        username: userInfo.name || userInfo.email.split('@')[0],
        email: userInfo.email,
        picture: userInfo.picture,
        googleRefreshToken: tokens.refresh_token || null,
        googleAccessToken: tokens.access_token,
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
      };

      user = await storage.createUser(newUser);
    } else {
      // Atualizar tokens do usuário existente
      user = await storage.updateUserTokens(
        user.id,
        tokens.access_token,
        tokens.refresh_token || user.googleRefreshToken || null,
        tokens.expiry_date ? new Date(tokens.expiry_date) : null
      );
    }

    return user;
  } catch (error) {
    console.error('Erro ao processar código de autorização:', error);
    return null;
  }
}

/**
 * Obtém informações do usuário usando o token de acesso
 */
async function getUserInfo(accessToken: string): Promise<{
  email: string;
  name?: string;
  picture?: string;
} | null> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao obter informações do usuário: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      email: data.email,
      name: data.name,
      picture: data.picture
    };
  } catch (error) {
    console.error('Erro ao obter informações do usuário:', error);
    return null;
  }
}

/**
 * Atualiza o token de acesso se necessário
 */
export async function getValidAccessToken(userId: number): Promise<string | null> {
  try {
    const user = await storage.getUser(userId);
    
    if (!user || !user.googleAccessToken) {
      return null;
    }

    // Verificar se o token expirou
    const tokenExpired = user.googleTokenExpiry && 
      new Date() > new Date(user.googleTokenExpiry);

    if (!tokenExpired) {
      return user.googleAccessToken;
    }

    // Se o token expirou, tentar atualizar usando o refresh token
    if (!user.googleRefreshToken) {
      console.error('Refresh token não disponível para atualização');
      return null;
    }

    oauth2Client.setCredentials({
      refresh_token: user.googleRefreshToken
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (!credentials.access_token) {
      throw new Error('Falha ao atualizar o token de acesso');
    }

    // Atualizar tokens no banco de dados
    await storage.updateUserTokens(
      userId,
      credentials.access_token,
      credentials.refresh_token || user.googleRefreshToken,
      credentials.expiry_date ? new Date(credentials.expiry_date) : null
    );

    return credentials.access_token;
  } catch (error) {
    console.error('Erro ao obter token de acesso válido:', error);
    return null;
  }
}