AirBnb REST API

**Projektbeskrivning**

Detta är en fullstack typescript projekt för en AirBnb med en nische på naturnära & hundvänlig, byggd med MERN (MongoDB, Express, React & Node.js). Den är utformad för att hantera boenden, användare och bokningar, och erbjuder en RESTful API för att interagera med databasen. Backend-lösningen är kopplad till en NoSQL-databas(MongoDB). Frontend-lösningen av projektet är byggd med React och TailwindCSS och utvecklades i Visual Studio Code.

**Funktionalitet**

-- Backend-lösning erbjuder följande funktioner:
* Lista boenden & Lista boenden med filter: Hämta alla boenden eller filtrerade boenden med en GET-förfrågan.
* Enskild boende: Hämta specifik boende med en GET-förfrågan och boendets ID som parameter.
* Lägga till boenden: Lägg till en nytt boende i databsen med en POST-förfrågan.
* Uppdatera boende: Uppdatera en befintlig boende med PUT eller PATCH
* Ta bort boende: Ta bort ett boende från databasen med en DELETE-förfrågan.
* Skapa bokning: Boka ett boende med en POST-förfrågan.
* Bokningshistorik: Inloggade användare kan spara bokningar i databasen, där varje bokning innehåller information om bokningen med en GET-förfrågan.
* Registrera användare: Användare kan registrera sig med en POST-förfrågan och få tillbaka en JSON web Token (JWT).
* Kryptera lösenord: Lösenorder krypteras innan det sparas i databasen.
* Logga in användare: Användare kan logga in och få tillbaka en JWT.
* Hämta och hantera alla användare
* Uppdatera användar roll: Uppdatera en användares roll med PUT-förfrågan.
* Ta bort användare: Ta bort en användare från databasen med en DELETE-förfrågan.

**Installation**

Följ dessa steg för att installera och köra projektet lokalt:
Klona repositoryt:
git clone https://github.com/ditt-användarnamn/ditt-repo-namn.git cd ditt-repo-namn
Skapa en .env-fil i rotmappen(backend) och lägg till dina miljövariabler, inklusive databasanslutning och JWT-hemlighet:
PORT=din_PORT
MONGODB_URI=din_mongodb_uri
ACCESS_TOKEN_SECRET=din_jwt_hemlighet

Kör detta kommando i terminalen för att installera nödvändiga paket:
npm run build
Starta servern:
npm run start eller npm run dev
Servern bör nu vara igång på http://localhost:din_PORT/.
Användning
API:et kan nås via följande endpoints:

-- **Housing**
* POST /api/housings - Skapa boende
* GET /api/housings
* [ e.g - Hämta alla boende/hämta boende baser på filtrering ]
    * GET /api/housings?totalPrice=100-300&nearActivities=hiking
    * GET /api/housings?startDate=2025-12-01&endDate=2025-12-10&maxAdults=2
    * GET /api/housings?location=Lake&petFriendly=true&type=cabin
  
* GET /api/housings/:id - Hämta specifik boende beroende på boendeID
* PUT /api/housings - Uppdatera boende
* PATCH /api/housings - Uppdatera boende
* DELETE /api/housings - Ta bort boende

-- **Booking**
* POST /api/bookings - Skapa bokning
* GET /api/bookings - Hämta alla bokningar
* GET /api/bookings/:id - Hämta specifik boende

-- **User**
* GET /api/auth/login - Logga in
* GET /api/auth/register - Registrera
/ Admin
* GET /api/auth/users - Hämta alla användare
* GET /api/auth/users/:id - Hämta specifik användare
* DELETE /api/auth/users/:id - Ta bort en användare
* PUT /api/auth/users/:id/role - Uppdatera en användares roll

**Teknologier**

Projektet använder följande teknologier:
* Backend: Node.js, Express, Typescript
* Frontend: Typescript, React, Tailwind CSS
* Databas: MongoDB
* Utvecklingsmiljö: Visual Studio Code
