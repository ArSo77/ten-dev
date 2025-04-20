# Dokument wymagań produktu (PRD) - FPV Race Communicator

## 1. Przegląd produktu
Aplikacja webowa o nazwie FPV Race Communicator ma na celu ułatwić komunikację pomiędzy Race Directorem a pilotami podczas zawodów dronów FPV. System umożliwia Race Directorom zarządzanie listą pilotów oraz szybką wysyłkę wiadomości, które są natychmiast widoczne na urządzeniach mobilnych i stacjonarnych pilotów.

## 2. Problem użytkownika
Podczas zawodów FPV Race Race Directorzy mają trudności z szybkim i indywidualnym przekazywaniem pilnych komunikatów do pilotów. Komunikacja głosowa okazuje się niewystarczająca, co utrudnia natychmiastowe reagowanie w sytuacjach wymagających pilnych instrukcji.

## 3. Wymagania funkcjonalne
- System kont użytkowników z dwoma rolami: Race Director i Pilot
- Możliwość logowania dla obu ról
- Zarządzanie listą pilotów przez Race Directora:
  - Dodawanie pilotów z danymi: Nick, imię, nazwisko
  - Usuwanie pilotów przy potwierdzaniu operacji
  - Lista pilotów uporządkowana według kolejności dodania
- Interfejs wysyłania wiadomości:
  - Pole tekstowe do wprowadzania krótkich wiadomości
  - Możliwość wyboru jednego lub wielu pilotów do wysłania komunikatu
- System powiadomień w aplikacji:
  - Natychmiastowe wyświetlanie wiadomości (baner, alert) na stronie pilota
  - Wyświetlanie ostatniej wiadomości wraz z czasem wysłania
- Responsywny interfejs dla urządzeń mobilnych i stacjonarnych

## 4. Granice produktu
- Brak aplikacji PWA (brak funkcji instalacji i trybu offline)
- Brak powiadomień push na poziomie systemu operacyjnego (Android/iOS)
- Brak dwukierunkowej komunikacji (piloci nie mogą odpowiadać na wiadomości)
- Brak zaawansowanego zarządzania wydarzeniami (harmonogramy, grupy startowe)
- Brak wysyłania wiadomości innych niż tekstowe (obrazy, pliki)
- Brak dodatkowych ról poza Race Directorem i Pilotem

## 5. Historyjki użytkowników

US-001
Tytuł: Logowanie Race Directora
Opis: Jako Race Director chcę móc zalogować się do systemu, aby uzyskać dostęp do funkcjonalności zarządzania pilotami oraz wysyłania wiadomości.
Kryteria akceptacji:
- System umożliwia logowanie przy użyciu poprawnych danych uwierzytelniających.
- W przypadku błędnych danych system wyświetla stosowny komunikat o błędzie.

US-002
Tytuł: Logowanie Pilota
Opis: Jako Pilot chcę móc zalogować się do aplikacji, aby odbierać wiadomości od Race Directora.
Kryteria akceptacji:
- System umożliwia logowanie pilota przy użyciu poprawnych danych.
- W przypadku nieprawidłowych danych wyświetlany jest odpowiedni komunikat o błędzie.

US-003
Tytuł: Dodanie Pilota do listy
Opis: Jako Race Director chcę móc dodać nowego pilota, aby uwzględnić go w systemie komunikacyjnym.
Kryteria akceptacji:
- Pilot zostaje dodany z danymi: Nick, imię, nazwisko.
- Nowy pilot pojawia się na liście w kolejności dodania.
- System potwierdza operację dodania.

US-004
Tytuł: Usunięcie Pilota z listy
Opis: Jako Race Director chcę móc usunąć pilota z listy po potwierdzeniu operacji, aby utrzymać aktualność listy uczestników.
Kryteria akceptacji:
- Po wybraniu opcji usunięcia pojawia się komunikat z prośbą o potwierdzenie operacji.
- Pilot zostaje usunięty z listy po potwierdzeniu.
- System informuje o pomyślnym usunięciu pilota.

US-005
Tytuł: Wysyłanie wiadomości do pilotów
Opis: Jako Race Director chcę móc wysłać krótką wiadomość tekstową do jednego lub wielu pilotów, aby szybko przekazać im istotne informacje.
Kryteria akceptacji:
- Interfejs umożliwia wybór jednego lub wielu pilotów.
- Po wysłaniu wiadomości system wyświetla potwierdzenie operacji.
- Pilot otrzymuje powiadomienie z treścią wiadomości w ciągu kilku sekund.

US-006
Tytuł: Odbiór wiadomości przez Pilota
Opis: Jako Pilot chcę widzieć ostatnią wiadomość oraz datę i godzinę jej wysłania, aby być na bieżąco z komunikatami.
Kryteria akceptacji:
- Po wysłaniu wiadomości interfejs pilota aktualizuje się, wyświetlając najnowszy komunikat.
- Wyświetlany jest prawidłowy czas wysłania wiadomości.

US-007
Tytuł: Bezpieczny dostęp i autoryzacja
Opis: Jako użytkownik chcę mieć pewność, że dostęp do funkcji aplikacji jest zabezpieczony, a każda rola ma dostęp tylko do swoich uprawnień, aby chronić dane i komunikację.
Kryteria akceptacji:
- System obsługuje mechanizm uwierzytelniania przy logowaniu.
- Dostęp do funkcji Race Directora oraz Pilota jest ograniczony do uprawnionych użytkowników.
- W przypadku próby nieautoryzowanego dostępu system wyświetla odpowiedni komunikat o braku uprawnień.

## 6. Metryki sukcesu
- Race Director wysyła minimum 90% indywidualnych komunikatów do pilotów zamiast korzystania z tradycyjnych metod komunikacji.
- Co najmniej 85% pilotów uczestniczących w zawodach uzyskuje dostęp do aplikacji i aktywnie z niej korysta w kluczowych momentach.
- Ponad 98% wysłanych wiadomości generuje widoczne powiadomienie na stronie pilota w ciągu kilku sekund.
- W ankiecie po testach co najmniej 70% Race Directora ocenia aplikację jako znaczące usprawnienie komunikacji podczas zawodów. 