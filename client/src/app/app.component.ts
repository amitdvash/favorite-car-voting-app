import { Component, OnInit } from '@angular/core';
import { CarBoxComponent } from './car-box/car-box.component';
import { CommonModule } from '@angular/common';
import { CarService } from './car.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CarBoxComponent, CommonModule, FormsModule], // CommonModule is for the ngFor for example
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit{
  title = 'client';
  filterText : string = '';

  cars: any[] = []; // Holds the cars data for display
  
  showNotification = false; // Default: notification hidden
  
  constructor(private carService: CarService) {}

  ngOnInit() {
    // Call fetchCars to fetch data from the backend
    this.carService.fetchCars();
    
    // Subscribe to the cars$ observable to get real-time updates
    this.carService.cars$.subscribe({
      next: (cars) => {
        this.cars = cars;
      },
      error: (error) => {
        console.error('Error while subscribing to cars$: ', error);
      },
      complete: () => {
        console.log('Subscription to cars$ completed.');
      }
    });
  }

/**
 * Displays a vote notification for 3 seconds.
 * Sets `showNotification` to true, then hides it after 3 seconds.
 */
  showVoteNotification(): void {
    this.showNotification = true; // Show the notification
    setTimeout(() => {
      this.showNotification = false; // Hide after 3 seconds
    }, 3000);
  }

  // Function to track cars by their unique ID making the image to be updated only at start
  // Image will be updated only if the car id is change or the url to the image is changed
  trackByCarId(index: number, car: any): string {
    return car.id; 
  }

  get filteredCars() {
    return this.cars.filter(car => 
      car.name.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }
  
}
