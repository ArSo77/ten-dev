-- migration file: 20241007120000_create_tables_with_rls.sql
-- purpose: create tables with row level security (rls) and granular policies for users, messages, and message_recipients
--
-- this migration creates the following tables:
--   users: contains columns id (uuid primary key), nick (text not null), email (text nullable), roles (text not null)
--   messages: contains columns id (uuid primary key), content (text not null), sent_at (timestamptz not null), sender_id (uuid not null that references users(id))
--   message_recipients: contains columns message_id (uuid not null that references messages(id)), recipient_id (uuid not null that references users(id)); primary key on (message_id, recipient_id)
--
-- indexes:
--   index on messages.sent_at for recent messages
--   index on messages.sender_id for faster joins with users
--   index on message_recipients.recipient_id for efficient lookup by recipient
--
-- all sql is in lowercase, and rls policies are created separately for each action (select, insert, update, delete) for both anon and authenticated roles

-- create table users
create table if not exists users (
    id uuid primary key not null,
    nick text not null,
    email text,
    roles text not null
);

-- enable row level security on users
alter table users enable row level security;

-- rls policies for users
-- select policies
create policy users_select_anon on users for select to anon using (true);
create policy users_select_authenticated on users for select to authenticated using (true);

-- insert policies
create policy users_insert_anon on users for insert to anon with check (true);
create policy users_insert_authenticated on users for insert to authenticated with check (true);

-- update policies
create policy users_update_anon on users for update to anon using (true) with check (true);
create policy users_update_authenticated on users for update to authenticated using (true) with check (true);

-- delete policies
create policy users_delete_anon on users for delete to anon using (true);
create policy users_delete_authenticated on users for delete to authenticated using (true);

---------------------------------------------------------------------
-- create table messages
create table if not exists messages (
    id uuid primary key not null,
    content text not null,
    sent_at timestamptz not null,
    sender_id uuid not null references users(id)
);

-- create indexes for messages
create index if not exists idx_messages_sent_at on messages(sent_at);
create index if not exists idx_messages_sender_id on messages(sender_id);

-- enable row level security on messages
alter table messages enable row level security;

-- rls policies for messages
-- select policies
create policy messages_select_anon on messages for select to anon using (true);
create policy messages_select_authenticated on messages for select to authenticated using (true);

-- insert policies
create policy messages_insert_anon on messages for insert to anon with check (true);
create policy messages_insert_authenticated on messages for insert to authenticated with check (true);

-- update policies
create policy messages_update_anon on messages for update to anon using (true) with check (true);
create policy messages_update_authenticated on messages for update to authenticated using (true) with check (true);

-- delete policies
create policy messages_delete_anon on messages for delete to anon using (true);
create policy messages_delete_authenticated on messages for delete to authenticated using (true);

---------------------------------------------------------------------
-- create table message_recipients
create table if not exists message_recipients (
    message_id uuid not null references messages(id),
    recipient_id uuid not null references users(id),
    primary key (message_id, recipient_id)
);

-- create index for message_recipients
create index if not exists idx_message_recipients_recipient_id on message_recipients(recipient_id);

-- enable row level security on message_recipients
alter table message_recipients enable row level security;

-- rls policies for message_recipients
-- select policies
create policy message_recipients_select_anon on message_recipients for select to anon using (true);
create policy message_recipients_select_authenticated on message_recipients for select to authenticated using (true);

-- insert policies
create policy message_recipients_insert_anon on message_recipients for insert to anon with check (true);
create policy message_recipients_insert_authenticated on message_recipients for insert to authenticated with check (true);

-- update policies
create policy message_recipients_update_anon on message_recipients for update to anon using (true) with check (true);
create policy message_recipients_update_authenticated on message_recipients for update to authenticated using (true) with check (true);

-- delete policies
create policy message_recipients_delete_anon on message_recipients for delete to anon using (true);
create policy message_recipients_delete_authenticated on message_recipients for delete to authenticated using (true);

-- end of migration file 