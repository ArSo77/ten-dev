# Dokument wymagań produktu (PRD) - FPV Race Communication
## 1. Przegląd produktu
Przedmiotem tego projektu jest webowa aplikacja komunikacyjna dedykowana do zawodów dronów FPV. Aplikacja umożliwia Race Directorom przesyłanie szybkich, indywidualnych komunikatów do pilotów poprzez przeglądarkę internetową na urządzeniach mobilnych oraz stacjonarnych. System jest oparty na cyklicznym odpytywaniu bazy danych co 5 sekund, co pozwala na terminowe dostarczanie powiadomień. Aplikacja obejmuje dwa rodzaje kont użytkowników: Race Director (nadawca) i Pilot (odbiorca) oraz oferuje responsywny design zapewniający poprawne wyświetlanie na różnych rozmiarach ekranów.

## 2. Problem użytkownika
Race Directorzy podczas zawodów FPV Race mają trudności z szybkim i skutecznym przekazywaniem pilnym, indywidualnych komunikatów do pilotów. Tradycyjna komunikacja głosowa jest nieefektywna, co prowadzi do opóźnień i niejasności. Brakuje dedykowanego narzędzia webowego umożliwiającego wysyłanie szybkich i targetowanych wiadomości, co utrudnia zarządzanie wydarzeniem i wpływa na bezpieczeństwo oraz efektywność zawodów.

## 3. Wymagania funkcjonalne
- System kont użytkowników: dwa typy kont – Race Director i Pilot.
- Panel Race Directora:
  - Wyświetlanie pełnej listy pilotów.
  - Możliwość wyboru jednego lub wielu pilotów (pilot wybrany jest podświetlony na zielono, nie wybrany pozostaje szary).
  - Pole tekstowe do wpisania krótkiej wiadomości.
  - Przycisk wysyłania komunikatu do wybranych pilotów.
  - Funkcje zarządzania użytkownikami: dodawanie i usuwanie kont pilota.
- Panel Pilota:
  - Możliwość logowania się do systemu.
  - Wyświetlanie najnowszych powiadomień (maksymalnie 5, posortowanych od najnowszych do najstarszych).
- Mechanizm powiadomień:
  - Cykliczne odpytywanie bazy danych co 5 sekund w celu pobierania nowych komunikatów.

## 4. Granice produktu
MVP nie obejmuje:
- Aplikacji PWA z funkcjami instalacji i trybem offline.
- Powiadomień push na poziomie systemu operacyjnego (np. Android/iOS).
- Dwukierunkowej komunikacji – piloci nie mogą odpowiadać na otrzymane komunikaty.
- Potwierdzeń odczytu wiadomości.
- Zaawansowanego zarządzania wydarzeniami (tworzenie harmonogramów, przypisywanie do grup startowych).
- Wysyłania wiadomości innych niż tekstowe (np. obrazy, pliki).
- Ról innych niż Race Director i Pilot (np. Sędzia, Obsługa Techniczna).
- Publicznego kanału ogłoszeń dla wszystkich uczestników lub widzów.
- Rozbudowanej historii wiadomości z funkcjami wyszukiwania i filtrowania.
- Natywnych aplikacji mobilnych (Android/iOS).

## 5. Historyjki użytkowników
- ID: US-001
  Tytuł: Logowanie Race Directora
  Opis: Jako Race Director chcę zalogować się do systemu, aby uzyskać dostęp do panelu zarządzania komunikacją z pilotami.
  Kryteria akceptacji:
    - Użytkownik podaje poprawne dane logowania.
    - System autoryzuje użytkownika i przekierowuje do panelu Race Directora.

- ID: US-002
  Tytuł: Wyświetlanie listy pilotów przez Race Directora
  Opis: Jako Race Director chcę widzieć pełną listę pilotów przypisanych do wydarzenia, aby móc wybierać odpowiednich odbiorców dla moich komunikatów.
  Kryteria akceptacji:
    - Lista pilotów jest wyświetlana w panelu Race Directora.
    - Każdy pilot posiada wizualne oznaczenie statusu (wybrany – zielony, nie wybrany – szary).

- ID: US-003
  Tytuł: Wybór pilotów do wysłania wiadomości
  Opis: Jako Race Director chcę móc zaznaczyć jednego lub wielu pilotów, aby wysłać im komunikat tekstowy.
  Kryteria akceptacji:
    - System umożliwia zaznaczanie wielu pilotów jednocześnie.
    - Wybrani piloci są podświetlani na zielono, a zmiana wyboru jest intuicyjna (odznaczenie powoduje powrót do stanu szarego).

- ID: US-004
  Tytuł: Wysyłanie komunikatu przez Race Directora
  Opis: Jako Race Director chcę wpisać komunikat w polu tekstowym i wysłać go do wybranych pilotów, aby przekazać pilne informacje podczas zawodów.
  Kryteria akceptacji:
    - Istnieje pole tekstowe do wpisania wiadomości.
    - Po kliknięciu przycisku wysyłania, komunikat jest przesyłany do wszystkich wybranych pilotów.
    - System potwierdza wysłanie wiadomości, a komunikat jest widoczny w historii powiadomień.

- ID: US-005
  Tytuł: Logowanie Pilota
  Opis: Jako Pilot chcę zalogować się do systemu, aby uzyskać dostęp do interfejsu wyświetlania powiadomień.
  Kryteria akceptacji:
    - Pilot wprowadza poprawne dane logowania.
    - System weryfikuje dane i przekierowuje pilota do panelu, gdzie wyświetlane są powiadomienia.

- ID: US-006
  Tytuł: Odbieranie powiadomień przez Pilota
  Opis: Jako Pilot chcę widzieć powiadomienia o nowych komunikatach, aby być na bieżąco z informacjami od Race Directora.
  Kryteria akceptacji:
    - Powiadomienia są wyświetlane w panelu Pilota, ograniczone do 5 najnowszych komunikatów.
    - Komunikaty są posortowane od najnowszych do najstarszych.
    - Nowe powiadomienia pojawiają się w interfejsie w ciągu kilku sekund (dzięki cyklicznemu odpytywaniu co 5 sekund).

- ID: US-007
  Tytuł: Zarządzanie kontami pilotów
  Opis: Jako Race Director chcę mieć możliwość dodawania i usuwania kont pilota, aby skutecznie zarządzać listą uczestników wydarzenia.
  Kryteria akceptacji:
    - Istnieje interfejs umożliwiający dodawanie nowych kont pilota.
    - Race Director może usunąć konto pilota, a zmiana jest natychmiast widoczna w liście użytkowników.

- ID: US-008
  Tytuł: Bezpieczny dostęp do systemu
  Opis: Jako użytkownik chcę, aby dostęp do systemu był zabezpieczony, co gwarantuje ochronę danych i odpowiednią autoryzację na podstawie ról (Race Director lub Pilot).
  Kryteria akceptacji:
    - Formularze logowania są zabezpieczone przed atakami (np. SQL Injection, brute force).
    - System stosuje standardy autoryzacji (np. tokeny sesyjne) i weryfikuje uprawnienia użytkownika.
    - Użytkownik z odpowiednią rolą widzi właściwy interfejs (Race Director lub Pilot).

## 6. Metryki sukcesu
- Co najmniej 90% komunikatów wysłanych przez Race Directora zostaje poprawnie dostarczonych do pilotów.
- Co najmniej 85% pilotów aktywnie korzysta z aplikacji (ma otwartą kartę przeglądarki) podczas kluczowych momentów zawodów.
- Nowe powiadomienia pojawiają się w czasie nie dłuższym niż 5 sekund dzięki cyklicznemu odpytywaniu bazy danych.
- W ankietach po testach, przynajmniej 70% Race Directorów ocenia system jako znaczące usprawnienie komunikacji podczas zawodów.
- System wykazuje stabilność i niezawodność przy jednoczesnym zarządzaniu komunikatami i kontami użytkowników. 