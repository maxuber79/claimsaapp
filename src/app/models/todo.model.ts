export interface Todo {
  id?: string; // Firestore lo genera, pero útil para trackear
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date; // Angular trabaja con Date, Firestore lo convierte a Timestamp
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | undefined;
  tags?: string[];
  updatedAt?: Date;
}
// Nota: Firestore maneja los tipos de datos de manera diferente, por lo que al guardar y recuperar
// los datos, es posible que necesites convertir entre Date y Firestore Timestamp.