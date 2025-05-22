import { supabase } from '../db/supabase.client';
import type { MessageDTO, PaginatedMessagesDTO } from '../types';
import { z } from 'zod';

// Schemat walidacji dla parametrów zapytania
const paramsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(5),
  sort: z.string().optional().default('sent_at:desc'),
  recipient_id: z.string().optional()
});

export type MessagesQueryParams = z.infer<typeof paramsSchema>;

/**
 * Inicjalizuje przykładowe wiadomości w bazie danych, jeśli ich nie ma
 */
export async function initializeMessages(forceRefresh = false) {
  try {
    // Sprawdź, czy są już wiadomości w bazie
    const { count, error: countError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking messages count:', countError);
      return false;
    }
    
    // Jeśli są już wiadomości i nie wymuszamy odświeżenia, nie dodawaj nowych
    if (count && count > 0 && !forceRefresh) {
      console.log(`Found ${count} existing messages, skipping initialization.`);
      return true;
    }
    
    // Pobierz listę użytkowników, by dodać wiadomości z rzeczywistymi ID
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, nick');
    
    if (usersError || !users || users.length === 0) {
      console.error('Error fetching users or no users found:', usersError);
      return false;
    }
    
    if (users.length < 3) {
      console.error('Potrzeba co najmniej 3 użytkowników do inicjalizacji wiadomości w cyklu');
      // Utwórz dodatkowych użytkowników, jeśli ich brakuje
      const missingCount = 3 - users.length;
      const newUsers = [];
      for (let i = 0; i < missingCount; i++) {
        newUsers.push({
          id: crypto.randomUUID(),
          nick: `Użytkownik ${users.length + i + 1}`,
          email: `user${users.length + i + 1}@example.com`,
          roles: 'pilot'
        });
      }
      
      if (newUsers.length > 0) {
        const { error: insertError } = await supabase
          .from('users')
          .insert(newUsers);
        
        if (insertError) {
          console.error('Error creating additional users:', insertError);
          return false;
        }
        
        console.log(`Utworzono ${newUsers.length} dodatkowych użytkowników`);
        
        // Pobierz zaktualizowaną listę użytkowników
        const { data: updatedUsers, error: updatedError } = await supabase
          .from('users')
          .select('id, nick');
        
        if (updatedError || !updatedUsers) {
          console.error('Error fetching updated users list:', updatedError);
          return false;
        }
        
        users.length = 0;
        users.push(...updatedUsers);
      }
    }
    
    // Znajdź użytkownika "Arek" - to będzie nasz użytkownik A
    const arekUser = users.find(u => u.nick === 'Arek');
    if (!arekUser) {
      console.error('Nie znaleziono użytkownika "Arek". Dodaj go najpierw do bazy danych.');
      return false;
    }
    
    // Wybierz trzech użytkowników do cyklu A -> B -> C -> A
    const userA = arekUser; // Arek
    
    // Wybierz dwóch innych użytkowników jako B i C
    const otherUsers = users.filter(u => u.id !== userA.id).slice(0, 2);
    if (otherUsers.length < 2) {
      console.error('Nie znaleziono wystarczającej liczby użytkowników poza Arkiem');
      return false;
    }
    
    const userB = otherUsers[0];
    const userC = otherUsers[1];
    
    console.log(`Ustawiam cykl wiadomości: ${userA.nick} -> ${userB.nick} -> ${userC.nick} -> ${userA.nick}`);
    
    // Usuń istniejące wiadomości i powiązania
    await supabase.from('message_recipients').delete().neq('message_id', 'dummy');
    await supabase.from('messages').delete().neq('id', 'dummy');
    
    console.log(`Usunięto istniejące wiadomości i powiązania`);
    
    // Przygotuj treści wiadomości dla każdego użytkownika
    const messageTemplates = {
      AtoB: [
        `Hej ${userB.nick}, wysyłam Ci pierwszą wiadomość. Pozdrawiam, ${userA.nick}`,
        `${userB.nick}, oto druga wiadomość do Ciebie od ${userA.nick}. Czekam na Twoją odpowiedź!`
      ],
      BtoC: [
        `Cześć ${userC.nick}, tu ${userB.nick}. Właśnie otrzymałem wiadomość od ${userA.nick} i przekazuję ją dalej.`,
        `${userC.nick}, jeszcze jedna wiadomość dla Ciebie od ${userB.nick}. Przekaż też pozdrowienia dla ${userA.nick}!`
      ],
      CtoA: [
        `${userA.nick}, ${userC.nick} z tej strony. Dostałem informację od ${userB.nick} i przekazuję ją Tobie.`,
        `Witaj ${userA.nick}! To znowu ja, ${userC.nick}. Druga wiadomość w naszym cyklu komunikacyjnym.`
      ]
    };
    
    // Utwórz wiadomości i powiązania
    const allMessages = [];
    const messageRecipients = [];
    
    // A -> B (2 wiadomości)
    for (let i = 0; i < 2; i++) {
      const messageId = crypto.randomUUID();
      allMessages.push({
        id: messageId,
        content: messageTemplates.AtoB[i],
        sender_id: userA.id,
        sent_at: new Date(Date.now() - (6 - i) * 3600000).toISOString() // 6 i 5 godzin temu
      });
      
      messageRecipients.push({
        message_id: messageId,
        recipient_id: userB.id
      });
    }
    
    // B -> C (2 wiadomości)
    for (let i = 0; i < 2; i++) {
      const messageId = crypto.randomUUID();
      allMessages.push({
        id: messageId,
        content: messageTemplates.BtoC[i],
        sender_id: userB.id,
        sent_at: new Date(Date.now() - (4 - i) * 3600000).toISOString() // 4 i 3 godziny temu
      });
      
      messageRecipients.push({
        message_id: messageId,
        recipient_id: userC.id
      });
    }
    
    // C -> A (2 wiadomości)
    for (let i = 0; i < 2; i++) {
      const messageId = crypto.randomUUID();
      allMessages.push({
        id: messageId,
        content: messageTemplates.CtoA[i],
        sender_id: userC.id,
        sent_at: new Date(Date.now() - (2 - i) * 3600000).toISOString() // 2 i 1 godzinę temu
      });
      
      messageRecipients.push({
        message_id: messageId,
        recipient_id: userA.id
      });
    }
    
    // Dodaj wiadomości do bazy danych
    const { error: messagesError } = await supabase
      .from('messages')
      .insert(allMessages);
    
    if (messagesError) {
      console.error('Error creating sample messages:', messagesError);
      return false;
    }
    
    console.log(`Dodano ${allMessages.length} wiadomości do bazy danych`);
    
    // Zapisz powiązania w bazie danych
    const { error: recipientsError } = await supabase
      .from('message_recipients')
      .insert(messageRecipients);
    
    if (recipientsError) {
      console.error('Error creating message recipients:', recipientsError);
      return false;
    }
    
    console.log(`Utworzono ${messageRecipients.length} powiązań wiadomość-odbiorca`);
    console.log(`Schemat komunikacji: ${userA.nick} wysyła do ${userB.nick}, ${userB.nick} wysyła do ${userC.nick}, ${userC.nick} wysyła do ${userA.nick}.`);
    return true;
  } catch (error) {
    console.error('Error in initializeMessages:', error);
    return false;
  }
}

/**
 * Pobiera wiadomości z bazy danych z obsługą paginacji i sortowania
 * @param params - Parametry zapytania (strona, limit, sortowanie)
 * @returns Obiekt zawierający wiadomości i metadane paginacji
 */
export async function getMessages(params: MessagesQueryParams): Promise<PaginatedMessagesDTO> {
  try {
    // Walidacja parametrów zapytania
    const { page, limit, sort, recipient_id } = paramsSchema.parse(params);
    const offset = (page - 1) * limit;
    
    // Parsowanie parametru sortowania
    const [sortField, sortOrder] = sort.split(':');
    const ascending = sortOrder === 'asc';
    
    // Upewnij się, że są przykładowe wiadomości
    await initializeMessages();
    
    // Symulacja zalogowanego użytkownika "Arek" - znajdź go w bazie danych
    let loggedInUserId = recipient_id;
    
    if (!loggedInUserId) {
      // Jeśli nie podano recipient_id, spróbuj znaleźć użytkownika "Arek"
      const { data: arekUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('nick', 'Arek')
        .single();
      
      if (!userError && arekUser) {
        loggedInUserId = arekUser.id;
        console.log(`Znaleziono użytkownika "Arek" z ID: ${loggedInUserId}, pobieranie jego wiadomości`);
      } else {
        console.log('Nie znaleziono użytkownika "Arek", pobieranie wszystkich wiadomości');
      }
    }
    
    // Query do pobierania wiadomości
    let messagesQuery = supabase
      .from('messages')
      .select(`
        id, 
        content, 
        sender_id,
        sent_at,
        users!messages_sender_id_fkey (nick)
      `, { count: 'exact' });
    
    // Jeśli określono odbiorcę, pobierz tylko wiadomości dla tego odbiorcy
    if (loggedInUserId) {
      // Pobierz ID wiadomości dla określonego odbiorcy
      const { data: messageRecipients, error: recipientsError } = await supabase
        .from('message_recipients')
        .select('message_id')
        .eq('recipient_id', loggedInUserId);
      
      if (recipientsError) {
        console.error('Error fetching message recipients:', recipientsError);
        throw new Error('Nie można pobrać wiadomości dla tego odbiorcy.');
      }
      
      if (messageRecipients && messageRecipients.length > 0) {
        const messageIds = messageRecipients.map(mr => mr.message_id);
        messagesQuery = messagesQuery.in('id', messageIds);
      } else {
        // Jeśli nie ma wiadomości dla tego odbiorcy, zwróć pustą listę
        return {
          messages: [],
          page,
          limit,
          total: 0,
          pages: 0
        };
      }
    }
    
    // Dodaj sortowanie i paginację
    messagesQuery = messagesQuery
      .order(sortField, { ascending })
      .range(offset, offset + limit - 1);
    
    // Wykonaj zapytanie
    const { data: rawMessages, count, error } = await messagesQuery;
    
    if (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Wystąpił błąd podczas pobierania wiadomości.');
    }
    
    // Transformuj dane do oczekiwanego formatu
    const messages: MessageDTO[] = rawMessages?.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender_id: msg.sender_id,
      sender_nick: msg.users?.nick,
      sent_at: msg.sent_at
    })) || [];
    
    // Oblicz całkowitą liczbę stron
    const total = count || 0;
    const pages = Math.ceil(total / limit);
    
    return {
      messages,
      page,
      limit,
      total,
      pages
    };
  } catch (error) {
    console.error('Error in getMessages:', error);
    throw error;
  }
}

/**
 * Pobiera listę wszystkich użytkowników do filtrowania wiadomości
 * @returns Lista użytkowników
 */
export async function getMessageUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, nick, email');
    
    if (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
    
    console.log(`Retrieved ${data?.length || 0} users for message filtering.`);
    return data || [];
  } catch (error) {
    console.error('Error in getMessageUsers:', error);
    throw error;
  }
}

/**
 * Generates 2 messages for each user in the database
 * @returns Success status
 */
export async function generateMessagesForAllUsers() {
  try {
    console.log('Starting message generation process...');
    
    // Step 1: Get all users from the database
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, nick');
    
    if (usersError || !users || users.length === 0) {
      console.error('Error fetching users or no users found:', usersError);
      return false;
    }
    
    console.log(`Found ${users.length} users to generate messages for`);
    
    // Step 2: For each user, generate 2 messages
    const allMessages = [];
    const messageRecipients = [];
    
    for (const user of users) {
      // Get other users to be recipients (everyone except the current user)
      const recipients = users.filter(u => u.id !== user.id);
      
      // If there are no other users, skip this user
      if (recipients.length === 0) {
        console.log(`No other users found for user ${user.nick}, skipping...`);
        continue;
      }
      
      // Generate 2 messages for this user
      for (let i = 0; i < 2; i++) {
        // Create a random delay between messages (0-24 hours ago)
        const randomHoursAgo = Math.floor(Math.random() * 24);
        const messageTime = new Date(Date.now() - randomHoursAgo * 3600000);
        
        // Select a random recipient for this message
        const randomRecipient = recipients[Math.floor(Math.random() * recipients.length)];
        
        // Create message content
        const content = `Wiadomość #${i+1} od ${user.nick} do ${randomRecipient.nick}: ${getRandomMessageContent()}`;
        
        // Create message with UUID
        const messageId = crypto.randomUUID();
        allMessages.push({
          id: messageId,
          content,
          sender_id: user.id,
          sent_at: messageTime.toISOString()
        });
        
        // Create message recipient connection
        messageRecipients.push({
          message_id: messageId,
          recipient_id: randomRecipient.id
        });
      }
    }
    
    console.log(`Generated ${allMessages.length} messages with recipients`);
    
    // Step 3: Delete existing messages and message_recipients if needed
    const { error: deleteRecipientsError } = await supabase
      .from('message_recipients')
      .delete()
      .neq('message_id', 'dummy');
    
    if (deleteRecipientsError) {
      console.error('Error deleting existing message recipients:', deleteRecipientsError);
      return false;
    }
    
    const { error: deleteMessagesError } = await supabase
      .from('messages')
      .delete()
      .neq('id', 'dummy');
    
    if (deleteMessagesError) {
      console.error('Error deleting existing messages:', deleteMessagesError);
      return false;
    }
    
    console.log('Deleted existing messages and recipient connections');
    
    // Step 4: Insert all new messages
    const { error: insertMessagesError } = await supabase
      .from('messages')
      .insert(allMessages);
    
    if (insertMessagesError) {
      console.error('Error inserting messages:', insertMessagesError);
      return false;
    }
    
    console.log(`Successfully inserted ${allMessages.length} messages`);
    
    // Step 5: Insert all message recipient connections
    const { error: insertRecipientsError } = await supabase
      .from('message_recipients')
      .insert(messageRecipients);
    
    if (insertRecipientsError) {
      console.error('Error inserting message recipients:', insertRecipientsError);
      return false;
    }
    
    console.log(`Successfully inserted ${messageRecipients.length} message recipient connections`);
    
    return true;
  } catch (error) {
    console.error('Error in generateMessagesForAllUsers:', error);
    return false;
  }
}

/**
 * Returns a random message content for demo purposes
 */
function getRandomMessageContent(): string {
  const messages = [
    "Dzień dobry! Jak się masz dzisiaj?",
    "Mam nadzieję, że wszystko u Ciebie w porządku.",
    "Chciałbym zaprosić Cię na spotkanie w przyszłym tygodniu.",
    "Czy możesz przesłać mi najnowsze dane dotyczące projektu?",
    "Dziękuję za wczorajszą pomoc!",
    "Pamiętasz o naszym jutrzejszym spotkaniu?",
    "Właśnie zakończyłem pracę nad nowym modułem.",
    "Potrzebuję Twojej opinii na temat mojego rozwiązania.",
    "Udało mi się rozwiązać ten problem, o którym rozmawialiśmy.",
    "Możemy przełożyć naszą rozmowę na później?"
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
} 