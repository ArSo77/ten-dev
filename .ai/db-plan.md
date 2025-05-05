# Schemat bazy danych - PostgreSQL

## 1. Tabele

### Users
- **id**: UUID, PRIMARY KEY, NOT NULL
- **nick**: TEXT, NOT NULL
- **email**: TEXT, nullable
- **roles**: TEXT, NOT NULL

### Messages
- **id**: UUID, PRIMARY KEY, NOT NULL
- **content**: TEXT, NOT NULL
- **sent_at**: TIMESTAMPTZ, NOT NULL
- **sender_id**: UUID, NOT NULL, REFERENCES Users(id)

### Message_Recipients
- **message_id**: UUID, NOT NULL, REFERENCES Messages(id)
- **recipient_id**: UUID, NOT NULL, REFERENCES Users(id)
- **Primary Key**: (message_id, recipient_id)

## 2. Relacje

- Każdy rekord w `Messages` odnosi się do użytkownika (nadawcy) w tabeli `Users` poprzez `sender_id` (relacja jeden-do-wielu).
- Relacja wiele-do-wielu między wiadomościami a odbiorcami jest modelowana przez tabelę `Message_Recipients`.

## 3. Indeksy

- Indeks na kolumnie `Messages.sent_at` dla optymalizacji wyszukiwania ostatnich wiadomości.
- Indeks na kolumnie `Messages.sender_id` wspierający zapytania łączące z tabelą `Users`.
- Indeks na kolumnie `Message_Recipients.recipient_id` dla szybkiego wyszukiwania wiadomości przypisanych do danego odbiorcy.

## 4. Ograniczenia i zasady

- Wszystkie pola (poza `Users.email`) są oznaczone jako NOT NULL.
- Użycie UUID jako identyfikatora we wszystkich tabelach.
- W tabeli `Message_Recipients` zastosowano klucz kompozytowy (message_id, recipient_id) aby zapobiec duplikowaniu wpisów.
- Żaden mechanizm RLS (Row Level Security) nie został wdrożony na tym etapie MVP.

## 5. Uwagi dodatkowe

- Schemat został zaprojektowany z myślą o wydajności i skalowalności, umożliwiając szybkie wyszukiwanie wiadomości oraz zachowanie integralności danych dzięki kluczom obcym i ograniczeniom NOT NULL.
- Indeksowanie kluczowych kolumn wspiera efektywne filtrowanie i sortowanie danych, co jest istotne przy prototypowaniu MVP. 