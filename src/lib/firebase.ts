import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import { Agendamento, StatusAgendamento } from '../types';

// Check for Firebase credentials in environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'sua_key' &&
    !firebaseConfig.apiKey.includes('sua_key')
);

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    dbInstance = getFirestore(app);
  } catch (error) {
    console.warn('Erro ao inicializar Firebase SDK, fallback ativo:', error);
  }
}

export const db = dbInstance;

// LocalStorage Persistence Key for fallback
const LOCAL_STORAGE_KEY = 'agendamentos_devclub_db';

// Pre-populate initial sample appointments if empty
const sampleAgendamentos: Agendamento[] = [
  {
    id: 'sample-1',
    nome: 'Carlos Eduardo Santos',
    telefone: '(73) 9 9988-1122',
    servico: 'Combo Corte + Barba',
    preco: 55,
    duracao: '50 min',
    data: new Date().toISOString().split('T')[0],
    horario: '10:00',
    status: 'Confirmado',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    nome: 'Fernanda Oliveira',
    telefone: '(73) 9 8811-3344',
    servico: 'Manicure & Pedicure',
    preco: 30,
    duracao: '40 min',
    data: new Date().toISOString().split('T')[0],
    horario: '14:00',
    status: 'Agendado',
    created_at: new Date().toISOString(),
  },
];

function getLocalAgendamentos(): Agendamento[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sampleAgendamentos));
      return sampleAgendamentos;
    }
    return JSON.parse(raw);
  } catch {
    return sampleAgendamentos;
  }
}

function saveLocalAgendamentos(data: Agendamento[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Erro ao salvar no localStorage:', err);
  }
}

// Data service combining Firebase Firestore and robust local fallback
export const agendamentoService = {
  /**
   * Buscar horários ocupados para uma determinada data
   */
  async buscarHorariosOcupados(data: string): Promise<string[]> {
    if (dbInstance) {
      try {
        const q = query(
          collection(dbInstance, 'agendamentos'),
          where('data', '==', data)
        );
        const snapshot = await getDocs(q);
        const ocupados = snapshot.docs
          .map((docSnap) => docSnap.data().horario as string)
          .filter((h) => Boolean(h));
        return ocupados;
      } catch (err) {
        console.warn('Firestore query falhou ou offline, usando fallback local:', err);
      }
    }

    // Fallback Local
    const localData = getLocalAgendamentos();
    return localData
      .filter((a) => a.data === data && a.status !== 'Cancelado')
      .map((a) => a.horario);
  },

  /**
   * Verificar se determinado horário já está ocupado em uma data
   */
  async estaOcupado(data: string, horario: string): Promise<boolean> {
    if (dbInstance) {
      try {
        const q = query(
          collection(dbInstance, 'agendamentos'),
          where('data', '==', data),
          where('horario', '==', horario)
        );
        const snapshot = await getDocs(q);
        // filtrar apenas status que não sejam 'Cancelado' se existir
        const ativos = snapshot.docs.filter(
          (docSnap) => docSnap.data().status !== 'Cancelado'
        );
        return ativos.length > 0;
      } catch (err) {
        console.warn('Firestore query falhou, usando fallback local:', err);
      }
    }

    const localData = getLocalAgendamentos();
    return localData.some(
      (a) => a.data === data && a.horario === horario && a.status !== 'Cancelado'
    );
  },

  /**
   * Criar novo agendamento
   */
  async criarAgendamento(
    dados: Omit<Agendamento, 'id' | 'status' | 'created_at'>
  ): Promise<Agendamento> {
    const novoAgendamento: Agendamento = {
      ...dados,
      id: '',
      status: 'Agendado',
      created_at: new Date().toISOString(),
    };

    // Verificar duplicação antes de salvar
    const ocupado = await this.estaOcupado(dados.data, dados.horario);
    if (ocupado) {
      throw new Error('Horário já ocupado para esta data!');
    }

    if (dbInstance) {
      try {
        const docRef = await addDoc(collection(dbInstance, 'agendamentos'), {
          ...dados,
          status: 'Agendado',
          created_at: new Date().toISOString(),
        });
        novoAgendamento.id = docRef.id;

        // Sync mirror to localStorage
        const local = getLocalAgendamentos();
        saveLocalAgendamentos([novoAgendamento, ...local]);
        return novoAgendamento;
      } catch (err) {
        console.warn('Erro ao salvar no Firestore, salvando no local:', err);
      }
    }

    // Local Fallback
    novoAgendamento.id = 'ag-' + Date.now();
    const local = getLocalAgendamentos();
    saveLocalAgendamentos([novoAgendamento, ...local]);
    return novoAgendamento;
  },

  /**
   * Listar todos os agendamentos (com filtro opcional por data)
   */
  async listarAgendamentos(filtroData?: string): Promise<Agendamento[]> {
    if (dbInstance) {
      try {
        let q;
        if (filtroData) {
          q = query(
            collection(dbInstance, 'agendamentos'),
            where('data', '==', filtroData),
            orderBy('horario', 'asc')
          );
        } else {
          q = query(collection(dbInstance, 'agendamentos'), orderBy('data', 'desc'));
        }
        const snapshot = await getDocs(q);
        const lista: Agendamento[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Agendamento, 'id'>),
        }));
        return lista;
      } catch (err) {
        console.warn('Erro ao buscar do Firestore, fallback para local:', err);
      }
    }

    // Local Fallback
    let list = getLocalAgendamentos();
    if (filtroData) {
      list = list.filter((a) => a.data === filtroData);
    }
    // Ordenar por data e horário
    return list.sort((a, b) => {
      const dateTimeA = `${a.data} ${a.horario}`;
      const dateTimeB = `${b.data} ${b.horario}`;
      return dateTimeB.localeCompare(dateTimeA);
    });
  },

  /**
   * Atualizar status do agendamento
   */
  async atualizarStatus(id: string, novoStatus: StatusAgendamento): Promise<void> {
    if (dbInstance) {
      try {
        const docRef = doc(dbInstance, 'agendamentos', id);
        await updateDoc(docRef, { status: novoStatus });
      } catch (err) {
        console.warn('Erro ao atualizar no Firestore:', err);
      }
    }

    // Local Update
    const local = getLocalAgendamentos();
    const index = local.findIndex((a) => a.id === id);
    if (index !== -1) {
      local[index].status = novoStatus;
      saveLocalAgendamentos(local);
    }
  },

  /**
   * Atualizar dados completos do agendamento (Editar / Reagendar)
   */
  async atualizarAgendamento(id: string, dadosAtualizados: Partial<Agendamento>): Promise<void> {
    if (dbInstance) {
      try {
        const docRef = doc(dbInstance, 'agendamentos', id);
        await updateDoc(docRef, dadosAtualizados);
      } catch (err) {
        console.warn('Erro ao atualizar agendamento no Firestore:', err);
      }
    }

    // Local Update
    const local = getLocalAgendamentos();
    const index = local.findIndex((a) => a.id === id);
    if (index !== -1) {
      local[index] = { ...local[index], ...dadosAtualizados };
      saveLocalAgendamentos(local);
    }
  },

  /**
   * Excluir agendamento
   */
  async excluirAgendamento(id: string): Promise<void> {
    if (dbInstance) {
      try {
        const docRef = doc(dbInstance, 'agendamentos', id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('Erro ao deletar no Firestore:', err);
      }
    }

    // Local Delete
    const local = getLocalAgendamentos();
    const filtrados = local.filter((a) => a.id !== id);
    saveLocalAgendamentos(filtrados);
  },
};
