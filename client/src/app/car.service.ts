import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client'; // Import Socket.IO


@Injectable({
  providedIn: 'root',
})
export class CarService {
  private cars = new BehaviorSubject<any[]>([]); // Empty array initially
  cars$ = this.cars.asObservable();
  private maxVotes: number = 0

  private socket: Socket; // Socket.IO instance

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:3000'); // Connect to the backend Socket.IO server
    this.setupSocketListeners(); // Initialize Socket.IO listeners
  }

  // Fetch car list from the backend
  fetchCars(): void {
    console.log('Sending the fetchCars request to the backend');
    this.http.get<any[]>('/api/cars').subscribe({
      next: (data) => {
        console.log('API Response:', data); // Debug to check what we get
        this.cars.next(data);
        this.updateMaxVotes(data);
      },
      error: (error) => {
        console.error('API Error:', error); // Log any API errors
      },
      complete: () => {
        console.log('Fetch cars completed.'); // Optional logging
      }
    });
  }

  addVote(carId: number): void {
    console.log('Sending the vote request to the backend');
    this.http.post(`/api/cars/${carId}/vote`, {}).subscribe({
      next: (response) => {
        console.log(`Vote for car ${carId} updated successfully.`, response);
      },
      error: (error) => {
        console.error('Error while voting:', error);
      },
      complete: () => {
        console.log('Vote update completed.');
      }
    });
  }

  private updateMaxVotes(cars: any[]): void {
    this.maxVotes = Math.max(...cars.map((car) => car.votes));
  }
  

  getMaxVotes(): number {
    return this.maxVotes;
  }

  getCarById(carId: number): { id: number; image: string; votes: number } | undefined {
    return this.cars.value.find((car) => car.id === carId);
  }

  // Set up listeners for real-time updates
  // Activates when the system is start working, called in the constractor
  private setupSocketListeners(): void { 
    this.socket.on('updateCars', (updatedCars: any[]) => {
      // Update the BehaviorSubject when receiving updates
      this.cars.next(updatedCars);
      this.updateMaxVotes(updatedCars);
    });  
    this.socket.on('connect', () => {
      console.log('Connected to the Socket.IO server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from the Socket.IO server');
    });    
  }
}
