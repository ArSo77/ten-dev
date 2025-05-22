# API Endpoint Implementation Plan: Create a Message

## 1. Przegląd punktu końcowego
Endpoint umożliwia Dyrektorom Wyścigu wysyłanie wiadomości do jednego lub wielu pilotów. Po utworzeniu wiadomości system automatycznie generuje odpowiednie wpisy w tabeli `message_recipients`, ustanawiając relacje między wiadomością a jej odbiorcami.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** `/messages`
- **Parametry:**
  - **Wymagane:** Brak parametrów URL
  - **Opcjonalne:** Brak parametrów URL
- **Request Body:**
  ```json
  {
    "content": "Urgent update: Please check your equipment.",
    "recipient_ids": ["<pilot-uuid-1>", "<pilot-uuid-2>"],
    "sender_id": "<race-director-uuid>"
  }
  ```

## 3. Wykorzystywane typy
- **CreateMessageCommand** - Typ używany do walidacji danych wejściowych i przygotowania danych do zapisania
  ```typescript
  export type CreateMessageCommand = Omit<MessageEntity, 'id' | 'sent_at'> & {
    recipient_ids: string[];
  };
  ```
- **MessageDTO** - Typ zwracany jako odpowiedź API
  ```typescript
  export interface MessageDTO extends MessageEntity {
    recipients?: string[];
    sender_nick?: string;
  }
  ```

## 4. Szczegóły odpowiedzi
- **Struktura odpowiedzi:**
  ```json
  {
    "id": "<message-uuid>",
    "content": "Urgent update: Please check your equipment.",
    "sender_id": "<race-director-uuid>",
    "sent_at": "2023-10-05T12:34:56Z",
    "recipients": ["<pilot-uuid-1>", "<pilot-uuid-2>"]
  }
  ```
- **Kody statusu:**
  - **201 Created** - Pomyślne utworzenie wiadomości
  - **400 Bad Request** - Nieprawidłowe dane wejściowe
  - **401 Unauthorized** - Brak autoryzacji
  - **500 Internal Server Error** - Błąd serwera

## 5. Przepływ danych
1. Kontroler odbiera żądanie POST z danymi wiadomości
2. Dane wejściowe są walidowane przy użyciu schematu Zod
3. Serwis wiadomości tworzy nowy rekord w tabeli `messages`
4. Dla każdego ID odbiorcy, serwis tworzy nowy wpis w tabeli `message_recipients`
5. Serwis pobiera utworzoną wiadomość wraz z listą odbiorców
6. Kontroler zwraca odpowiedź z utworzoną wiadomością i kodem 201

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie:** Endpoint wymaga uwierzytelnienia JWT z Supabase
- **Autoryzacja:** Tylko użytkownicy z rolą "race-director" mogą tworzyć wiadomości
- **Walidacja danych:** 
  - Sprawdzanie czy `content` nie jest pusty
  - Walidacja istnienia wszystkich ID odbiorców w bazie danych
  - Sprawdzanie czy nadawca ma uprawnienia race-director
  - Walidacja poprawności formatu UUID dla `sender_id` i wszystkich `recipient_ids`

## 7. Obsługa błędów
- **Nieprawidłowe dane wejściowe (400):**
  - Brak wymaganego pola `content`
  - Pusta lub nieprawidłowa lista `recipient_ids`
  - Nieprawidłowy format `sender_id`
  - Nieistniejący odbiorcy
- **Nieautoryzowany dostęp (401):**
  - Brak tokenu uwierzytelniającego
  - Wygasły token
  - Użytkownik nie ma roli "race-director"
- **Błąd serwera (500):**
  - Błąd bazy danych podczas zapisywania wiadomości
  - Błąd transakcji podczas tworzenia powiązań z odbiorcami

## 8. Rozważania dotyczące wydajności
- Operacje zapisu do tabel `messages` i `message_recipients` powinny być wykonywane w ramach jednej transakcji
- Dla dużej liczby odbiorców, warto rozważyć wykorzystanie operacji wsadowych (batch operations) przy tworzeniu wpisów w `message_recipients`
- Indeks na kolumnie `recipient_id` w tabeli `message_recipients` zapewni szybkie wyszukiwanie wiadomości

## 9. Etapy wdrożenia

1. **Przygotowanie schematu walidacji Zod**
   ```typescript
   // src/api/messages/validation.ts
   import { z } from 'zod';
   
   export const createMessageSchema = z.object({
     content: z.string().min(1, 'Content cannot be empty'),
     recipient_ids: z.array(z.string().uuid()).min(1, 'At least one recipient is required'),
     sender_id: z.string().uuid()
   });
   ```

2. **Implementacja serwisu wiadomości**
   ```typescript
   // src/api/messages/messages.service.ts
   import { supabase } from '../../db/supabase.client';
   import type { CreateMessageCommand, MessageDTO } from '../../types';
   
   export class MessagesService {
     async createMessage(command: CreateMessageCommand): Promise<MessageDTO> {
       // Rozpoczęcie transakcji
       const { data: message, error: messageError } = await supabase
         .from('messages')
         .insert({
           content: command.content,
           sender_id: command.sender_id,
           sent_at: new Date().toISOString()
         })
         .select()
         .single();
   
       if (messageError) throw new Error(`Error creating message: ${messageError.message}`);
   
       // Tworzenie wpisów dla odbiorców
       const recipientEntries = command.recipient_ids.map(recipient_id => ({
         message_id: message.id,
         recipient_id
       }));
   
       const { error: recipientsError } = await supabase
         .from('message_recipients')
         .insert(recipientEntries);
   
       if (recipientsError) {
         // W przypadku błędu, spróbuj usunąć utworzoną wiadomość
         await supabase.from('messages').delete().eq('id', message.id);
         throw new Error(`Error assigning recipients: ${recipientsError.message}`);
       }
   
       // Zwracanie pełnego DTO z listą odbiorców
       return {
         ...message,
         recipients: command.recipient_ids
       };
     }
   }
   ```

3. **Implementacja kontrolera**
   ```typescript
   // src/api/messages/messages.controller.ts
   import { Request, Response } from 'express';
   import { MessagesService } from './messages.service';
   import { createMessageSchema } from './validation';
   import { supabase } from '../../db/supabase.client';
   import type { CreateMessageCommand } from '../../types';
   
   export class MessagesController {
     private messagesService = new MessagesService();
   
     async createMessage(req: Request, res: Response) {
       try {
         // Walidacja danych wejściowych
         const validationResult = createMessageSchema.safeParse(req.body);
         if (!validationResult.success) {
           return res.status(400).json({ 
             error: 'Invalid input', 
             details: validationResult.error.format() 
           });
         }
   
         const command = validationResult.data as CreateMessageCommand;
   
         // Sprawdzenie czy nadawca ma rolę race-director
         const { data: sender, error: senderError } = await supabase
           .from('users')
           .select('roles')
           .eq('id', command.sender_id)
           .single();
   
         if (senderError || !sender) {
           return res.status(400).json({ error: 'Invalid sender ID' });
         }
   
         if (!sender.roles.includes('race-director')) {
           return res.status(401).json({ error: 'Only race directors can send messages' });
         }
   
         // Sprawdzenie czy wszyscy odbiorcy istnieją
         const { data: recipients, error: recipientsError } = await supabase
           .from('users')
           .select('id')
           .in('id', command.recipient_ids);
   
         if (recipientsError) {
           return res.status(500).json({ error: 'Error verifying recipients' });
         }
   
         if (recipients.length !== command.recipient_ids.length) {
           return res.status(400).json({ error: 'One or more recipients do not exist' });
         }
   
         // Tworzenie wiadomości
         const message = await this.messagesService.createMessage(command);
   
         // Zwracanie odpowiedzi
         return res.status(201).json(message);
       } catch (error) {
         console.error('Error creating message:', error);
         return res.status(500).json({ error: 'Internal server error' });
       }
     }
   }
   ```

4. **Rejestracja endpointu w routerze**
   ```typescript
   // src/api/messages/messages.routes.ts
   import { Router } from 'express';
   import { MessagesController } from './messages.controller';
   import { authMiddleware } from '../../middleware/auth';
   
   const messagesRouter = Router();
   const messagesController = new MessagesController();
   
   messagesRouter.post(
     '/',
     authMiddleware, // Middleware sprawdzające JWT token
     (req, res) => messagesController.createMessage(req, res)
   );
   
   export { messagesRouter };
   ```

5. **Integracja z głównym routerem aplikacji**
   ```typescript
   // src/api/index.ts
   import { Router } from 'express';
   import { messagesRouter } from './messages/messages.routes';
   
   const apiRouter = Router();
   
   apiRouter.use('/messages', messagesRouter);
   
   export { apiRouter };
   ```

6. **Utworzenie middleware do autoryzacji**
   ```typescript
   // src/middleware/auth.ts
   import { Request, Response, NextFunction } from 'express';
   import { supabase } from '../db/supabase.client';
   
   export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
     // Pobranie tokenu z nagłówka Authorization
     const authHeader = req.headers.authorization;
     if (!authHeader || !authHeader.startsWith('Bearer ')) {
       return res.status(401).json({ error: 'Missing or invalid authorization token' });
     }
   
     const token = authHeader.split(' ')[1];
     
     try {
       // Weryfikacja tokenu przez Supabase
       const { data: { user }, error } = await supabase.auth.getUser(token);
       
       if (error || !user) {
         return res.status(401).json({ error: 'Invalid or expired token' });
       }
       
       // Dodanie informacji o użytkowniku do obiektu request
       req.user = user;
       next();
     } catch (error) {
       console.error('Auth middleware error:', error);
       return res.status(500).json({ error: 'Internal server error' });
     }
   }
   ```

7. **Testowanie endpointu**
   - Przygotowanie testów jednostkowych dla walidacji
   - Przygotowanie testów integracyjnych dla całego przepływu
   - Testowanie scenariuszy błędów i brzegowych przypadków
