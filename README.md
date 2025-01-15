# **Favorite Car Voting Site - ExplorAds Home Assignment**

This project is a **full-stack voting application** built using **Angular** for the frontend and **Node.js/Express** for the backend, with real-time updates powered by **Socket.IO**. For simplicity, it uses a CSV file to store and update car votes instead of a database.

---
Demo Video

Watch the application in action:

https://github.com/user-attachments/assets/805cdc6d-3b3b-4201-a335-cfb542f6fc0c


---
### **Project Overview**

A responsive web application where users can:

- View a grid of cars with vote counts.
- Click on a car to vote, which updates the votes in real-time across all connected users.
- See dynamic progress bars representing the relative votes for each car.

---

## **Installation**

**Clone the repository:**

```bash
git clone "https://github.com/amitdvash/favorite-car-voting-app.git"
```

**Open the project in your favorite editor**

---

## **Frontend Setup**

1. **Navigate to the frontend directory:**

   ```bash
   cd client
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the frontend locally:**

   ```bash
   ng serve
   ```

---

## **Backend Setup**

1. **Navigate to the backend directory:**

   ```bash
   cd server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the backend locally:**

   ```bash
   node server.js
   ```

   Your server will be running at `http://localhost:3000`.

---

## **API Endpoints**

### **Car Routes (****`/api/cars`****)**

- **GET /api/cars**: Fetch the list of cars with their votes and image paths.

  - **Response Example:**
    ```json
    [
      {
        "id": "1",
        "votes": "60",
        "image_path": "path/to/car1.jpg"
      },
      {
        "id": "2",
        "votes": "30",
        "image_path": "path/to/car2.jpg"
      }
    ]
    ```

- **POST /api/cars/****:id****/vote**: Increment votes for a specific car.

  - **Parameters:**
    - `id` (string): The ID of the car to vote for.
  - **Response Example:**
    ```json
    {
      "message": "Vote updated successfully",
      "cars": [
        {
          "id": "1",
          "votes": "61",
          "image_path": "path/to/car1.jpg"
        },
        {
          "id": "2",
          "votes": "30",
          "image_path": "path/to/car2.jpg"
        }
      ]
    }
    ```

---

## **Usage**

1. **Open the application in your browser:**
   - Frontend: `http://localhost:4200`
2. **Interact with the application:**
   - Click on any car box to cast a vote.
   - Observe real-time updates in votes and progress bars across all connected users.
3. **Resetting Votes**:
   - To reset the vote count for all cars to `0`, simply:
     1. Open the CSV file named `cars.csv`.
     2. Locate it in the directory: `server/public/data/cars.csv`.
     3. Change the `votes` value for each car to `0`.

---

## **Future Improvements**

- Add persistent storage with a database.
- Implement user authentication for personalized voting.
- Enhance UI/UX with animations and additional features.

---

