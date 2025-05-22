import { supabase } from '../db/supabase.client';

/**
 * Script to generate 2 messages for each user in the Supabase database
 */
async function generateMessagesForAllUsers() {
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

// Execute the function
generateMessagesForAllUsers()
  .then(success => {
    if (success) {
      console.log('Successfully generated messages for all users!');
    } else {
      console.error('Failed to generate messages for all users.');
    }
  })
  .catch(error => {
    console.error('Error executing generateMessagesForAllUsers:', error);
  }); 